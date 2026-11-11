import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listUsers } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  ListChecks,
  Activity,
  Clock4,
  CheckCircle2,
  AlertOctagon,
  Timer,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  UserCog,
  Building2,
  ArrowRight,
  Crown,
  Plus,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  Bell,
} from "lucide-react";
import { STATUS_LABEL, type Complaint } from "@/lib/complaints";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const CATEGORY_COLORS: Record<string, string> = {
  welfare: "#0F4C81",
  development: "#1E88E5",
  regulation: "#26A69A",
};

function AdminDashboard() {
  const { t, tCategory, tStatus, formatDate } = useLanguage();
  const fetchUsers = useServerFn(listUsers);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({}),
  });

  const citizens = users.filter(
    (u) =>
      u.roles.includes("citizen") &&
      !u.roles.some((r) => r === "super_admin" || r.endsWith("_coordinator")),
  );
  const coordinators = users.filter((u) => u.roles.some((r) => r.endsWith("_coordinator")));
  const activeCoordinators = coordinators.filter((u) => u.is_active);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonth = complaints.filter((c) => new Date(c.created_at) >= monthStart);
  const prevMonth = complaints.filter((c) => {
    const d = new Date(c.created_at);
    return d >= prevMonthStart && d < monthStart;
  });

  const growth = (a: number, b: number) =>
    b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100);

  const total = complaints.length;
  const pending = complaints.filter((c) =>
    ["submitted", "assigned", "in_review", "work_in_progress"].includes(c.status),
  ).length;
  const resolved = complaints.filter((c) => ["resolved", "closed"].includes(c.status)).length;
  const escalated = complaints.filter((c) => c.status === "escalated").length;

  const resolvedComplaints = complaints.filter((c) => c.resolved_at);
  const avgResolution = resolvedComplaints.length
    ? resolvedComplaints.reduce(
        (acc, c) => acc + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
        0,
      ) /
      resolvedComplaints.length /
      (1000 * 60 * 60 * 24)
    : 0;

  const rated = complaints.filter((c) => c.rating != null);
  const avgRating = rated.length
    ? rated.reduce((s, c) => s + (c.rating ?? 0), 0) / rated.length
    : 0;

  const byCategory = ["welfare", "development", "regulation"].map((cat) => ({
    name: tCategory(cat),
    key: cat,
    value: complaints.filter((c) => c.category === cat).length,
  }));

  const byStatus = (Object.keys(STATUS_LABEL) as Array<keyof typeof STATUS_LABEL>)
    .filter((s) => s !== "draft")
    .map((s) => ({ name: tStatus(s), value: complaints.filter((c) => c.status === s).length }));

  // Monthly trends (last 6 months)
  const monthly: { month: string; new: number; resolved: number; escalated: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    monthly.push({
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

  // Recent activity timeline
  const recentActivity = [...complaints]
    .sort((a, b) => (b.updated_at ?? b.created_at).localeCompare(a.updated_at ?? a.created_at))
    .slice(0, 8);

  const recentComplaints = [...complaints].slice(0, 6);

  return (
    <div className="space-y-5 sm:space-y-6 min-w-0 w-full max-w-full overflow-hidden">
      {/* Hero */}
      <div className="overflow-hidden rounded-md border bg-gradient-to-br from-[#0F4C81] via-[#0F3F6F] to-[#062543] p-4 text-white shadow-sm sm:p-6 min-w-0 w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-yellow-300">
              <Crown className="h-3.5 w-3.5 shrink-0" />
              {t("Government of India", "భారత ప్రభుత్వం")}
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {t("Admin Dashboard", "అడ్మిన్ డాష్‌బోర్డ్")}
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              {t("Operational overview across all departments.", "అన్ని శాఖలలో కార్యాచరణ అవలోకనం.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-yellow-400 text-[#062543] hover:bg-yellow-300">
              <Link to="/complaints/new">
                <Plus className="mr-1 h-3.5 w-3.5" /> {t("Raise Grievance")}
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link to="/admin/analytics">
                <BarChart3 className="mr-1 h-3.5 w-3.5" /> {t("Analytics")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-2.5 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 min-w-0">
        <Kpi
          label={t("Total Complaints")}
          value={total}
          icon={<ListChecks className="h-4 w-4" />}
          growth={growth(thisMonth.length, prevMonth.length)}
        />
        <Kpi
          label={t("Pending")}
          value={pending}
          icon={<Clock4 className="h-4 w-4" />}
          tone="warning"
        />
        <Kpi
          label={t("Resolved")}
          value={resolved}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success"
        />
        <Kpi
          label={t("Escalated")}
          value={escalated}
          icon={<AlertOctagon className="h-4 w-4" />}
          tone="destructive"
        />
        <Kpi
          label={t("Citizens", "పౌరులు")}
          value={citizens.length}
          icon={<Users className="h-4 w-4" />}
          tone="info"
        />
        <Kpi
          label={t("Coordinators", "సమన్వయకర్తలు")}
          value={`${activeCoordinators.length}/${coordinators.length}`}
          icon={<UserCog className="h-4 w-4" />}
          tone="info"
        />
        <Kpi label={t("Departments")} value={3} icon={<Building2 className="h-4 w-4" />} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("Quick Actions", "త్వరిత చర్యలు")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <QuickAction
              to="/admin/citizens"
              icon={Users}
              label={t("Manage Citizens", "పౌరులను నిర్వహించండి")}
            />
            <QuickAction to="/admin/coordinators" icon={UserCog} label={t("Coordinators")} />
            <QuickAction to="/admin/complaints" icon={ListChecks} label={t("Complaints")} />
            <QuickAction
              to="/admin/escalations"
              icon={AlertOctagon}
              label={t("Escalations")}
              tone="destructive"
            />
            <QuickAction to="/admin/reports" icon={FileText} label={t("Reports")} />
            <QuickAction to="/admin/settings" icon={SettingsIcon} label={t("Settings")} />
          </div>
        </CardContent>
      </Card>

      {/* Mini stats row */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t("Avg Resolution")}
          value={`${avgResolution.toFixed(1)}d`}
          icon={<Timer className="h-5 w-5" />}
          subtitle={t("Across all departments", "అన్ని శాఖలలో")}
        />
        <StatCard
          label={t("Satisfaction")}
          value={`${avgRating.toFixed(2)} / 5`}
          icon={<Star className="h-5 w-5" />}
          subtitle={`${rated.length} ${t("rated")}`}
          tone="success"
        />
        <StatCard
          label={t("This Month")}
          value={`${thisMonth.length}`}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle={`${growth(thisMonth.length, prevMonth.length)}% ${t("vs last month", "గత నెల కంటే")}`}
        />
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">
          {t("Loading analytics…", "విశ్లేషణలు లోడ్ అవుతున్నాయి…")}
        </div>
      )}

      {/* Recent Complaints + Department Stats side by side */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b py-3">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Recent Complaints", "ఇటీవలి ఫిర్యాదులు")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("Latest submissions across all departments.", "అన్ని శాఖలలో తాజా సమర్పణలు.")}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7">
              <Link to="/admin/complaints" className="text-xs">
                {t("View all")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentComplaints.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("No complaints yet.", "ఇంకా ఫిర్యాదులు లేవు.")}
              </div>
            ) : (
              <ul className="divide-y">
                {recentComplaints.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <code className="rounded-sm bg-muted px-1.5 py-px font-mono">
                            {c.complaint_code}
                          </code>
                          <span className="hidden sm:inline">{tCategory(c.category)}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">{formatDate(c.created_at)}</span>
                        </div>
                        <div className="mt-0.5 truncate text-sm font-medium">{c.title}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="hidden sm:inline">
                          <PriorityBadge priority={c.priority} />
                        </span>
                        <StatusBadge status={c.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("Department Statistics", "శాఖ గణాంకాలు")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {byCategory.map((d) => {
              const list = complaints.filter((c) => c.category === d.key);
              const dResolved = list.filter((c) =>
                ["resolved", "closed"].includes(c.status),
              ).length;
              const dPending = list.length - dResolved;
              const rate = list.length ? Math.round((dResolved / list.length) * 100) : 0;
              return (
                <Link
                  key={d.key}
                  to="/admin/departments"
                  className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/40"
                >
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-sm text-white"
                    style={{ background: CATEGORY_COLORS[d.key] }}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold">{d.name}</div>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {rate}%
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span>
                        {d.value} {t("total", "మొత్తం")}
                      </span>
                      <span className="text-success">
                        {dResolved} {t("done", "పూర్తి")}
                      </span>
                      <span className="text-warning">
                        {dPending} {t("open", "ఓపెన్")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 min-w-0">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("Department-wise Complaints")}</CardTitle>
            <CardDescription>{t("Distribution across departments.")}</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-72 min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {byCategory.map((d) => (
                    <Cell key={d.key} fill={CATEGORY_COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{t("Monthly Trends")}</CardTitle>
            <CardDescription>{t("Last 6 months.")}</CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-72 min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" fontSize={10} />
                <YAxis allowDecimals={false} fontSize={10} width={28} />
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
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>{t("Complaint Status Distribution")}</CardTitle>
        </CardHeader>
        <CardContent className="h-64 sm:h-72 min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                angle={-25}
                textAnchor="end"
                height={65}
                fontSize={10}
                interval={0}
              />
              <YAxis allowDecimals={false} fontSize={10} width={28} />
              <Tooltip />
              <Bar dataKey="value" fill="#1E88E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="border-b py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Bell className="h-3.5 w-3.5" /> {t("Recent Activity", "ఇటీవలి కార్యకలాపం")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentActivity.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("No activity yet.", "ఇంకా కార్యకలాపం లేదు.")}
            </div>
          ) : (
            <ul className="divide-y">
              {recentActivity.map((c) => {
                const updatedAt = c.updated_at ?? c.created_at;
                const isResolved = ["resolved", "closed"].includes(c.status);
                const isEscalated = c.status === "escalated";
                const iconCls = isResolved
                  ? "bg-success/15 text-success"
                  : isEscalated
                    ? "bg-destructive/15 text-destructive"
                    : "bg-info/15 text-info";
                const Icon = isResolved ? CheckCircle2 : isEscalated ? AlertOctagon : Activity;
                return (
                  <li key={c.id}>
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-muted/40"
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${iconCls}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{c.title}</span>{" "}
                          <span className="text-muted-foreground">
                            — {tStatus(c.status as any)}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <code className="rounded bg-muted px-1.5 py-px font-mono">
                            {c.complaint_code}
                          </code>
                          <span>{tCategory(c.category)}</span>
                          <span>·</span>
                          <span>{formatDate(updatedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
  growth,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: "info" | "success" | "warning" | "destructive";
  growth?: number;
}) {
  const { t } = useLanguage();
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning-foreground"
        : tone === "destructive"
          ? "text-destructive"
          : tone === "info"
            ? "text-info"
            : "text-foreground";
  return (
    <Card
      data-testid={`kpi-${String(label).toLowerCase().replace(/\s+/g, "-")}`}
      className="min-w-0 overflow-hidden"
    >
      <CardContent className="p-2.5 sm:p-4 min-w-0">
        <div className="flex items-center justify-between gap-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
          <span className="truncate min-w-0">{label}</span>
          <span className={`shrink-0 ${toneCls}`}>{icon}</span>
        </div>
        <div className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${toneCls}`}>
          {value}
        </div>
        {growth !== undefined && (
          <div
            className={`mt-1 flex items-center gap-1 text-[10px] truncate ${
              growth >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {growth >= 0 ? (
              <TrendingUp className="h-3 w-3 shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">
              {Math.abs(growth)}% {t("vs last month", "గత నెల కంటే")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtitle,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  tone?: "success" | "info";
}) {
  const cls =
    tone === "success"
      ? "from-emerald-500/15 to-emerald-500/5 text-emerald-700"
      : tone === "info"
        ? "from-blue-500/15 to-blue-500/5 text-blue-700"
        : "from-slate-500/15 to-slate-500/5 text-slate-700";
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent
        className={`flex items-center gap-3 bg-gradient-to-br ${cls} p-3 sm:p-4 min-w-0`}
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-background/70">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </div>
          <div className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">{value}</div>
          {subtitle && (
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  tone,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "destructive" | "info";
}) {
  const cls =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive hover:bg-destructive/15 border-destructive/20"
      : tone === "info"
        ? "bg-info/10 text-info hover:bg-info/15 border-info/20"
        : "bg-muted hover:bg-muted/80 border-border";
  return (
    <Link
      to={to as any}
      className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors min-w-0 overflow-hidden ${cls}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate min-w-0">{label}</span>
    </Link>
  );
}
