import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Trophy, Timer, Activity } from "lucide-react";
import type { Complaint } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { t, tCategory } = useLanguage();
  const { data: complaints = [] } = useQuery({
    queryKey: ["admin-all-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const cats = ["welfare", "development", "regulation"] as const;

  // Department performance: resolution rate + avg days
  const deptPerf = useMemo(
    () =>
      cats.map((cat) => {
        const list = complaints.filter((c) => c.category === cat);
        const resolved = list.filter((c) => ["resolved", "closed"].includes(c.status));
        const rate = list.length ? Math.round((resolved.length / list.length) * 100) : 0;
        const resolvedWithTime = list.filter((c) => c.resolved_at);
        const avgDays = resolvedWithTime.length
          ? resolvedWithTime.reduce(
              (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
              0,
            ) /
            resolvedWithTime.length /
            86400000
          : 0;
        return {
          name: tCategory(cat),
          total: list.length,
          resolved: resolved.length,
          rate,
          avgDays: Math.round(avgDays * 10) / 10,
        };
      }),
    [complaints, tCategory],
  );

  // Coordinator ranking (by resolved count per category)
  const ranking = useMemo(
    () => [...deptPerf].sort((a, b) => b.rate - a.rate).map((d, i) => ({ ...d, rank: i + 1 })),
    [deptPerf],
  );

  // Last 6 months trend
  const now = new Date();
  const monthly = useMemo(() => {
    const data: { month: string; new: number; resolved: number; escalated: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      data.push({
        month: d.toLocaleString(undefined, { month: "short" }),
        new: complaints.filter((c) => {
          const x = new Date(c.created_at);
          return x >= d && x < next;
        }).length,
        resolved: complaints.filter(
          (c) => c.resolved_at && new Date(c.resolved_at) >= d && new Date(c.resolved_at) < next,
        ).length,
        escalated: complaints.filter(
          (c) => c.escalated_at && new Date(c.escalated_at) >= d && new Date(c.escalated_at) < next,
        ).length,
      });
    }
    return data;
  }, [complaints]);

  // Resolution time by month
  const resolutionTrend = useMemo(() => {
    const data: { month: string; avgDays: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const sub = complaints.filter(
        (c) => c.resolved_at && new Date(c.resolved_at) >= d && new Date(c.resolved_at) < next,
      );
      const avg = sub.length
        ? sub.reduce(
            (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
            0,
          ) /
          sub.length /
          86400000
        : 0;
      data.push({
        month: d.toLocaleString(undefined, { month: "short" }),
        avgDays: Math.round(avg * 10) / 10,
      });
    }
    return data;
  }, [complaints]);

  const overallRate = complaints.length
    ? Math.round(
        (complaints.filter((c) => ["resolved", "closed"].includes(c.status)).length /
          complaints.length) *
          100,
      )
    : 0;
  const totalResolved = complaints.filter((c) => ["resolved", "closed"].includes(c.status)).length;
  const avgAllDays = useMemo(() => {
    const sub = complaints.filter((c) => c.resolved_at);
    return sub.length
      ? Math.round(
          (sub.reduce(
            (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
            0,
          ) /
            sub.length /
            86400000) *
            10,
        ) / 10
      : 0;
  }, [complaints]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("Analytics")}</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {t(
            "Deep-dive operational analytics across the portal.",
            "పోర్టల్ అంతటా లోతైన కార్యాచరణ విశ్లేషణలు.",
          )}
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t("Resolution Rate")}
          value={`${overallRate}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
        <KpiCard
          label={t("Resolved")}
          value={totalResolved}
          icon={<Activity className="h-4 w-4" />}
          tone="info"
        />
        <KpiCard
          label={t("Avg Resolution")}
          value={`${avgAllDays}d`}
          icon={<Timer className="h-4 w-4" />}
        />
        <KpiCard
          label={t("Top Department", "ఉత్తమ శాఖ")}
          value={ranking[0]?.name ?? "—"}
          icon={<Trophy className="h-4 w-4" />}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("Complaint Trends")}</CardTitle>
            <CardDescription>
              {t("Last 6 months — new, resolved, escalated.", "గత 6 నెలలు.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="new"
                  stackId="1"
                  stroke="#1E88E5"
                  fill="#1E88E5"
                  fillOpacity={0.25}
                  name={t("New")}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  name={t("Resolved")}
                />
                <Area
                  type="monotone"
                  dataKey="escalated"
                  stackId="3"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.25}
                  name={t("Escalated")}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("Department Performance")}</CardTitle>
            <CardDescription>{t("Resolution rate by department.")}</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerf}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} unit="%" />
                <Tooltip />
                <Bar
                  dataKey="rate"
                  fill="#0F4C81"
                  radius={[6, 6, 0, 0]}
                  name={t("Resolution Rate")}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Average Resolution Time Trend")}</CardTitle>
          <CardDescription>{t("Lower is better.", "తక్కువ మంచిది.")}</CardDescription>
        </CardHeader>
        <CardContent className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resolutionTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} unit="d" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="avgDays"
                stroke="#0F4C81"
                strokeWidth={2}
                name={t("Avg Days", "సగటు రోజులు")}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Department Ranking")}</CardTitle>
          <CardDescription>
            {t("Ranked by resolution rate.", "పరిష్కార రేటు ఆధారంగా.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">{t("Rank", "ర్యాంక్")}</th>
                  <th>{t("Department")}</th>
                  <th>{t("Total")}</th>
                  <th>{t("Resolved")}</th>
                  <th>{t("Rate", "రేటు")}</th>
                  <th>{t("Avg Days", "సగటు రోజులు")}</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.name} className="border-t">
                    <td className="p-3 font-semibold">
                      {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"} #{r.rank}
                    </td>
                    <td className="font-medium">{r.name}</td>
                    <td>{r.total}</td>
                    <td>{r.resolved}</td>
                    <td className="font-medium">{r.rate}%</td>
                    <td>{r.avgDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: "success" | "info" | "warning" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "info"
        ? "text-info"
        : tone === "warning"
          ? "text-warning"
          : tone === "destructive"
            ? "text-destructive"
            : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className={cls}>{icon}</span>
        </div>
        <div className={`mt-1.5 text-2xl font-semibold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
