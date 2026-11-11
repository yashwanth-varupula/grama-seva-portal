import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRoles, useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { type Complaint, type Category, COORDINATOR_ROLE } from "@/lib/complaints";
import {
  Inbox,
  AlertOctagon,
  CheckCircle2,
  Clock4,
  Wrench,
  ListChecks,
  Search,
  Calendar,
  TrendingUp,
  ArrowRight,
  Activity,
  FileText,
  Target,
  Award,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/coordinator")({
  head: () => ({ meta: [{ title: "Coordinator — Gram Seva Portal" }] }),
  component: CoordPage,
});

function CoordPage() {
  const { user } = useAuth();
  const { roles, isAdmin, loading } = useMyRoles();
  const { t, tCategory, tStatus, formatDate } = useLanguage();
  const [search, setSearch] = useState("");

  const myCats = (Object.keys(COORDINATOR_ROLE) as Category[]).filter(
    (cat) => isAdmin || roles.includes(COORDINATOR_ROLE[cat]),
  );

  const { data: all = [] } = useQuery({
    queryKey: ["coord-queue", myCats.join(",")],
    enabled: !loading,
    queryFn: async () => {
      let q = supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (!isAdmin) q = q.in("category", myCats);
      const { data, error } = await q;
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (c) =>
        !q ||
        (c.title + " " + c.complaint_code + " " + (c.location ?? "")).toLowerCase().includes(q),
    );
  }, [all, search]);

  const incoming = filtered.filter((c) => ["submitted", "reopened"].includes(c.status));
  const assigned = filtered.filter((c) => ["assigned", "in_review"].includes(c.status));
  const wip = filtered.filter((c) => c.status === "work_in_progress");
  const resolvedToday = filtered.filter((c) => {
    if (!c.resolved_at) return false;
    const d = new Date(c.resolved_at);
    const t0 = new Date();
    t0.setHours(0, 0, 0, 0);
    return d >= t0;
  });
  const escalated = filtered.filter((c) => c.status === "escalated");
  const resolvedAll = filtered.filter((c) => ["resolved", "closed"].includes(c.status));

  // Performance: this month vs last month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthResolved = resolvedAll.filter(
    (c) => c.resolved_at && new Date(c.resolved_at) >= monthStart,
  ).length;
  const prevMonthResolved = resolvedAll.filter(
    (c) =>
      c.resolved_at &&
      new Date(c.resolved_at) >= prevMonthStart &&
      new Date(c.resolved_at) < monthStart,
  ).length;

  // Today's work — combine incoming + assigned + wip
  const today = [...incoming, ...assigned, ...wip].slice(0, 6);
  const recent = [...filtered]
    .sort((a, b) => (b.updated_at ?? b.created_at).localeCompare(a.updated_at ?? a.created_at))
    .slice(0, 6);

  const total = filtered.length;
  const resolutionRate = total ? Math.round((resolvedAll.length / total) * 100) : 0;
  const avgResDays = (() => {
    const sub = resolvedAll.filter((c) => c.resolved_at);
    if (!sub.length) return 0;
    return (
      Math.round(
        (sub.reduce(
          (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
          0,
        ) /
          sub.length /
          86400000) *
          10,
      ) / 10
    );
  })();

  const categoryGradients: Record<string, string> = {
    welfare: "from-blue-600 to-blue-800",
    development: "from-amber-500 to-orange-700",
    regulation: "from-emerald-600 to-teal-800",
  };
  const myCatLabel = isAdmin
    ? t("All Departments", "అన్ని శాఖలు")
    : myCats.map((c) => tCategory(c)).join(" • ");

  if (!loading && myCats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("Coordinator access required", "సమన్వయకర్త యాక్సెస్ అవసరం")}</CardTitle>
          <CardDescription>
            {t(
              "Your account doesn't have a coordinator role assigned yet. Ask an administrator to grant Welfare, Development, or Regulation coordinator access.",
              "మీ ఖాతాకు ఇంకా సమన్వయకర్త పాత్ర కేటాయించబడలేదు. సంక్షేమ, అభివృద్ధి లేదా నియంత్రణ సమన్వయకర్త యాక్సెస్ ఇవ్వమని నిర్వాహకుడిని అడగండి.",
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero */}
      <div
        className={`overflow-hidden rounded-md border bg-gradient-to-br ${categoryGradients[myCats[0] ?? "welfare"] ?? "from-slate-600 to-slate-800"} p-4 text-white shadow-sm sm:p-6`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/80">
              <Wrench className="h-3.5 w-3.5" /> {myCatLabel}
            </div>
            <h1 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {t("Coordinator Operations", "సమన్వయకర్త కార్యకలాపాలు")}
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              {user?.email} — {total} {t("complaints in your queue", "మీ క్యూలో ఫిర్యాదులు")}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search code, title, location…")}
              data-testid="coord-search"
              className="h-10 border-white/20 bg-white/10 pl-8 text-base text-white placeholder:text-white/60 focus-visible:ring-white/30 sm:h-9 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <OpsCard label={t("Incoming")} value={incoming.length} icon={Inbox} tone="info" />
        <OpsCard label={t("Assigned")} value={assigned.length} icon={ListChecks} tone="info" />
        <OpsCard label={t("In Progress")} value={wip.length} icon={Wrench} tone="warning" />
        <OpsCard
          label={t("Resolved")}
          value={resolvedAll.length}
          icon={CheckCircle2}
          tone="success"
        />
        <OpsCard
          label={t("Escalated")}
          value={escalated.length}
          icon={AlertOctagon}
          tone="destructive"
        />
        <OpsCard
          label={t("Today")}
          value={resolvedToday.length}
          icon={Calendar}
          sub={t("resolved today", "ఈరోజు పరిష్కరించబడింది")}
        />
      </div>

      {/* Two-col main */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Today's Work */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b py-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> {t("Today's Work", "నేటి పని")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t("Open items needing your attention.", "మీ దృష్టి అవసరమైన ఓపెన్ ఐటెమ్‌లు.")}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {today.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {today.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {t("All caught up! 🎉", "అన్నీ పూర్తి అయ్యాయి!")}
              </div>
            ) : (
              <ul className="divide-y">
                {today.map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="block px-4 py-3 hover:bg-muted/40"
                      data-testid={`coord-work-${c.id}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <code className="rounded bg-muted px-1.5 py-px font-mono">
                              {c.complaint_code}
                            </code>
                            <span>{tCategory(c.category)}</span>
                            <span>·</span>
                            <span>{formatDate(c.created_at)}</span>
                          </div>
                          <div className="mt-1 truncate text-sm font-medium">{c.title}</div>
                          {c.location && (
                            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              📍 {c.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-end text-[11px] text-primary">
                        {t("Open & Act", "తెరిచి చర్య తీసుకోండి")}{" "}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Performance + Recent activity */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Award className="h-3.5 w-3.5" /> {t("Performance", "పనితీరు")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("Resolution Rate")}</span>
                  <span className="font-semibold tabular-nums">{resolutionRate}%</span>
                </div>
                <Progress value={resolutionRate} className="mt-1.5 h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("Avg Days", "సగటు రోజులు")}
                  </div>
                  <div className="mt-0.5 text-lg font-semibold tabular-nums">{avgResDays}d</div>
                </div>
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("This Month")}
                  </div>
                  <div className="mt-0.5 inline-flex items-baseline gap-1">
                    <span className="text-lg font-semibold tabular-nums">{monthResolved}</span>
                    {monthResolved !== prevMonthResolved && (
                      <span
                        className={`text-[10px] ${monthResolved >= prevMonthResolved ? "text-success" : "text-destructive"}`}
                      >
                        {monthResolved >= prevMonthResolved ? "↑" : "↓"}
                        {prevMonthResolved
                          ? Math.abs(
                              Math.round(
                                ((monthResolved - prevMonthResolved) / prevMonthResolved) * 100,
                              ),
                            )
                          : "—"}
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b py-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> {t("Recent Activity")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recent.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("Nothing yet.", "ఇంకా ఏమీ లేదు.")}
                </div>
              ) : (
                <ul className="divide-y">
                  {recent.map((c) => (
                    <li key={c.id}>
                      <Link
                        to="/complaints/$id"
                        params={{ id: c.id }}
                        className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/40"
                      >
                        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{c.title}</div>
                          <div className="truncate text-[10px] text-muted-foreground">
                            {tStatus(c.status as any)} · {formatDate(c.updated_at ?? c.created_at)}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Queue sections — incoming / WIP / escalated full lists */}
      <QueueSection
        title={t("Incoming Complaints", "ఇన్‌కమింగ్ ఫిర్యాదులు")}
        items={incoming}
        icon={Inbox}
        tone="info"
      />
      <QueueSection
        title={t("Assigned Complaints", "కేటాయించబడిన ఫిర్యాదులు")}
        items={assigned}
        icon={ListChecks}
        tone="info"
      />
      <QueueSection
        title={t("In Progress", "పురోగతిలో")}
        items={wip}
        icon={Wrench}
        tone="warning"
      />
      <QueueSection
        title={t("Escalated", "ఎస్కలేట్ చేయబడింది")}
        items={escalated}
        icon={AlertOctagon}
        tone="destructive"
      />
      <QueueSection
        title={t("Resolved", "పరిష్కరించబడింది")}
        items={resolvedAll.slice(0, 10)}
        icon={CheckCircle2}
        tone="success"
      />

      {/* Action note */}
      <Card className="border-info/40 bg-info/5">
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-info" />
          <div>
            <div className="font-medium">
              {t("Actions available per complaint", "ప్రతి ఫిర్యాదుకు అందుబాటులో ఉన్న చర్యలు")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Open any complaint to Accept, Reject, Update Status, Add Notes, Upload Proof, Resolve, or Escalate.",
                "ఏదైనా ఫిర్యాదును తెరిచి అంగీకరించండి, తిరస్కరించండి, స్థితిని నవీకరించండి, గమనికలు జోడించండి, రుజువు అప్‌లోడ్ చేయండి, పరిష్కరించండి లేదా ఎస్కలేట్ చేయండి.",
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OpsCard({
  label,
  value,
  icon: Icon,
  tone,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "info" | "success" | "warning" | "destructive";
  sub?: string;
}) {
  const cls =
    tone === "destructive"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : tone === "warning"
        ? "border-warning/40 bg-warning/10 text-warning-foreground"
        : tone === "success"
          ? "border-success/30 bg-success/5 text-success"
          : tone === "info"
            ? "border-info/30 bg-info/5 text-info"
            : "border-border bg-card text-foreground";
  return (
    <div className={`flex items-center justify-between rounded-md border px-3 py-2.5 ${cls}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        {sub && <div className="mt-0.5 truncate text-[10px] opacity-80">{sub}</div>}
      </div>
      <div className="ml-2 shrink-0 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function QueueSection({
  title,
  items,
  icon: Icon,
  tone,
}: {
  title: string;
  items: Complaint[];
  icon: React.ComponentType<{ className?: string }>;
  tone: "info" | "warning" | "destructive" | "success";
}) {
  const { t, tCategory, formatDate } = useLanguage();
  if (items.length === 0) return null;
  const toneCls =
    tone === "destructive"
      ? "text-destructive bg-destructive/10"
      : tone === "warning"
        ? "text-warning-foreground bg-warning/15"
        : tone === "success"
          ? "text-success bg-success/10"
          : "text-info bg-info/10";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <span className={`grid h-6 w-6 place-items-center rounded-sm ${toneCls}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title}
        </CardTitle>
        <Badge variant="outline">{items.length}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile cards */}
        <div className="grid gap-2 p-3 md:hidden">
          {items.map((c) => (
            <Link
              key={c.id}
              to="/complaints/$id"
              params={{ id: c.id }}
              className="rounded-md border p-3 transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-muted-foreground">
                    <code className="rounded bg-muted px-1.5 py-px font-mono font-medium text-primary">
                      {c.complaint_code}
                    </code>{" "}
                    · {tCategory(c.category)}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm font-semibold">{c.title}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {formatDate(c.created_at)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">{t("Code")}</th>
                <th>{t("Title")}</th>
                <th className="hidden lg:table-cell">{t("Category")}</th>
                <th>{t("Priority")}</th>
                <th>{t("Status")}</th>
                <th className="hidden lg:table-cell">{t("Date")}</th>
                <th className="pr-3 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/40">
                  <td className="p-3">
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="font-mono text-[11px] text-primary hover:underline"
                    >
                      {c.complaint_code}
                    </Link>
                  </td>
                  <td className="font-medium">
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="line-clamp-1 hover:underline"
                    >
                      {c.title}
                    </Link>
                  </td>
                  <td className="hidden text-muted-foreground lg:table-cell">
                    {tCategory(c.category)}
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="pr-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/complaints/$id" params={{ id: c.id }}>
                        {t("Open")}
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
