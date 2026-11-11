import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useMyRoles } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  ArrowRight,
  FilePlus2,
  HeartHandshake,
  HardHat,
  ScrollText,
  ListChecks,
  CheckCircle2,
  Clock4,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import type { Complaint, Category } from "@/lib/complaints";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Gram Seva Portal" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { isCoordinator, isSuperAdmin, loading: rolesLoading } = useMyRoles();
  const navigate = useNavigate();
  const { t, tCategory, formatDate } = useLanguage();

  // Auto-redirect by role: admin → /admin, coordinator → /coordinator. Citizens stay here.
  useEffect(() => {
    if (rolesLoading) return;
    if (isSuperAdmin) {
      navigate({ to: "/admin", replace: true });
    } else if (isCoordinator) {
      navigate({ to: "/coordinator", replace: true });
    }
  }, [rolesLoading, isSuperAdmin, isCoordinator, navigate]);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["my-complaints", user?.id],
    enabled: !!user && !rolesLoading && !isSuperAdmin && !isCoordinator,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  // While redirecting, show a tiny loader so we don't flash the citizen UI.
  if (rolesLoading || isSuperAdmin || isCoordinator) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <div className="text-sm text-muted-foreground">{t("Loading…")}</div>
      </div>
    );
  }

  const mine = complaints.filter((c) => c.citizen_id === user?.id);
  const open = mine.filter((c) => !["resolved", "closed", "rejected"].includes(c.status));
  const resolved = mine.filter((c) => ["resolved", "closed"].includes(c.status));
  const byCat = (cat: Category) => mine.filter((c) => c.category === cat).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("Citizen Dashboard")}
          </div>
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
            {t("Grievance Overview")}
          </h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/complaints/new">
              <FilePlus2 className="mr-1.5 h-4 w-4" />
              {t("Raise Grievance")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Stat
          label={t("Total")}
          value={mine.length}
          icon={<ListChecks className="h-3.5 w-3.5" />}
        />
        <Stat
          label={t("Open")}
          value={open.length}
          icon={<Clock4 className="h-3.5 w-3.5" />}
          tone="info"
        />
        <Stat
          label={t("Resolved")}
          value={resolved.length}
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          tone="success"
        />
        <Stat
          label={t("This Year")}
          value={
            mine.filter((c) => new Date(c.created_at).getFullYear() === new Date().getFullYear())
              .length
          }
          icon={<ListChecks className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b py-3">
            <div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Recent Grievances")}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                {t(
                  "Your last submissions and their progress.",
                  "మీ చివరి సమర్పణలు మరియు వాటి పురోగతి.",
                )}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-7">
              <Link to="/complaints" className="text-xs">
                {t("View all")} <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">{t("Loading…")}</div>
            ) : mine.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="divide-y">
                {mine.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 sm:py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                          <code className="rounded-sm bg-muted px-1.5 py-px font-mono font-medium text-primary">
                            {c.complaint_code}
                          </code>
                          <span>·</span>
                          <span>{tCategory(c.category)}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline">{formatDate(c.created_at)}</span>
                        </div>
                        <div className="mt-1 truncate text-sm font-medium">{c.title}</div>
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

        <div className="space-y-3">
          <Card>
            <CardHeader className="border-b py-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("Departments")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DeptRow
                title={t("Welfare")}
                desc={t("Pensions, ration, scholarships")}
                count={byCat("welfare")}
                icon={<HeartHandshake className="h-4 w-4" />}
              />
              <DeptRow
                title={t("Development")}
                desc={t("Roads, drainage, public works")}
                count={byCat("development")}
                icon={<HardHat className="h-4 w-4" />}
              />
              <DeptRow
                title={t("Regulation")}
                desc={t("Certificates, permits, approvals")}
                count={byCat("regulation")}
                icon={<ScrollText className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {/* Quick Helpline card for mobile users */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-4 w-4" />
                {t("Secretariat Helpline", "సచివాలయ సహాయ కేంద్రం")}
              </div>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Need urgent assistance with your grievance?",
                  "మీ ఫిర్యాదుపై అత్యవసర సహాయం కావాలా?",
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="tel:1902"
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/30 bg-background px-2.5 py-2 text-xs font-medium text-foreground hover:bg-accent"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-primary" />
                  <span>{t("Call 1902", "1902 కి కాల్")}</span>
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-primary px-2.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <span>{t("Directory", "డైరెక్టరీ")}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "info" | "success";
}) {
  const toneCls =
    tone === "success" ? "text-success" : tone === "info" ? "text-info" : "text-foreground";
  return (
    <Card className="rounded-sm">
      <CardContent className="px-3 py-2.5">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>{label}</span>
          <span className={toneCls}>{icon}</span>
        </div>
        <div className={`mt-1 text-2xl font-semibold tabular-nums ${toneCls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function DeptRow({
  title,
  desc,
  count,
  icon,
}: {
  title: string;
  desc: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <div className="text-lg font-semibold tabular-nums">{count}</div>
    </div>
  );
}

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <p className="text-sm text-muted-foreground">{t("You haven't raised any complaints yet.")}</p>
      <Button asChild className="mt-4">
        <Link to="/complaints/new">
          <FilePlus2 className="mr-2 h-4 w-4" />
          {t("Raise your first complaint")}
        </Link>
      </Button>
    </div>
  );
}
