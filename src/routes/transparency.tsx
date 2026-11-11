import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Landmark, ListChecks, CheckCircle2, AlertOctagon, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { PublicShell } from "@/components/public-shell";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Public Transparency Portal — Gram Seva" },
      {
        name: "description",
        content:
          "Public dashboard showing aggregated complaint statistics and resolution performance across departments.",
      },
    ],
  }),
  component: Transparency,
});

const COLORS: Record<string, string> = {
  welfare: "#0F4C81",
  development: "#1E88E5",
  regulation: "#26A69A",
};

function Transparency() {
  const { t, tStatus, tCategory } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_stats");
      if (error) throw error;
      return data as any;
    },
  });

  const stats = data ?? {};
  const byCategory = Object.entries(stats.by_category ?? {}).map(([k, v]) => ({
    name: tCategory(k),
    key: k,
    value: v as number,
  }));
  const byStatus = Object.entries(stats.by_status ?? {}).map(([k, v]) => ({
    name: tStatus(k),
    value: v as number,
  }));
  const monthly = (stats.monthly ?? []).map((m: any) => ({ ...m, label: m.month?.slice(5) }));
  const resolutionRate = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0;

  return (
    <PublicShell>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("Public Transparency Dashboard")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("Aggregated, anonymised statistics — no personal data is shown.")}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">
            {t("Loading public statistics…", "పబ్లిక్ గణాంకాలు లోడ్ అవుతున్నాయి…")}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat
                label={t("Total Complaints")}
                value={stats.total ?? 0}
                icon={<ListChecks className="h-4 w-4" />}
              />
              <Stat
                label={t("Resolved")}
                value={stats.resolved ?? 0}
                icon={<CheckCircle2 className="h-4 w-4" />}
                tone="success"
              />
              <Stat
                label={t("Resolution Rate")}
                value={`${resolutionRate}%`}
                icon={<CheckCircle2 className="h-4 w-4" />}
                tone="success"
              />
              <Stat
                label={t("Escalated")}
                value={stats.escalated ?? 0}
                icon={<AlertOctagon className="h-4 w-4" />}
                tone="destructive"
              />
              <Stat
                label={t("Avg Satisfaction")}
                value={`${stats.avg_rating ?? 0} / 5`}
                icon={<Star className="h-4 w-4" />}
                tone="warning"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Department Statistics")}</CardTitle>
                  <CardDescription>
                    {t("Complaint volume by department.", "శాఖల వారీగా ఫిర్యాదుల పరిమాణం.")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={90}
                      >
                        {byCategory.map((d) => (
                          <Cell key={d.key} fill={COLORS[d.key] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Status Distribution")}</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byStatus}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        angle={-15}
                        textAnchor="end"
                        height={60}
                        fontSize={11}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1E88E5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("Monthly Trends")}</CardTitle>
                <CardDescription>
                  {t(
                    "New, resolved, and escalated over the last 12 months.",
                    "గత 12 నెలల్లో కొత్త, పరిష్కరించబడిన మరియు ఎస్కలేట్ చేయబడిన.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="new"
                      stroke="#1E88E5"
                      strokeWidth={2}
                      name={t("New")}
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10b981"
                      strokeWidth={2}
                      name={t("Resolved")}
                    />
                    <Line
                      type="monotone"
                      dataKey="escalated"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name={t("Escalated")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-5 text-xs text-muted-foreground">
                <strong>{t("Privacy", "గోప్యత")}:</strong>{" "}
                {t(
                  "This dashboard shows only aggregated statistics. Citizen names, contact details, locations, and personal information are never disclosed.",
                  "ఈ డాష్‌బోర్డ్ సమగ్ర గణాంకాలను మాత్రమే చూపుతుంది. పౌరుల పేర్లు, సంప్రదింపు వివరాలు, ప్రదేశాలు మరియు వ్యక్తిగత సమాచారం ఎప్పుడూ బహిర్గతం చేయబడవు.",
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PublicShell>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: "success" | "warning" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          <span className={cls}>{icon}</span>
        </div>
        <div className={`mt-2 text-2xl font-semibold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
