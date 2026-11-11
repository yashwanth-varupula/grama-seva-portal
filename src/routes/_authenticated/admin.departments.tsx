import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listUsers } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HeartHandshake,
  HardHat,
  ScrollText,
  Users,
  CheckCircle2,
  AlertOctagon,
  ListChecks,
} from "lucide-react";
import type { Complaint } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export const Route = createFileRoute("/_authenticated/admin/departments")({
  component: DepartmentsPage,
});

const DEPARTMENTS = [
  {
    key: "welfare",
    role: "welfare_coordinator" as AppRole,
    icon: HeartHandshake,
    accent: "from-blue-500 to-blue-700",
    description: "Pensions, ration cards, scholarships, and social schemes.",
  },
  {
    key: "development",
    role: "development_coordinator" as AppRole,
    icon: HardHat,
    accent: "from-amber-500 to-orange-600",
    description: "Roads, drainage, sanitation, water supply, public works.",
  },
  {
    key: "regulation",
    role: "regulation_coordinator" as AppRole,
    icon: ScrollText,
    accent: "from-emerald-500 to-teal-700",
    description: "Certificates, licenses, permits, and approvals.",
  },
];

function DepartmentsPage() {
  const { t, tCategory } = useLanguage();
  const fetchUsers = useServerFn(listUsers);

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({}),
  });
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

  const stats = useMemo(() => {
    const m: Record<
      string,
      { total: number; resolved: number; pending: number; escalated: number; avgDays: number }
    > = {};
    DEPARTMENTS.forEach((d) => {
      const list = complaints.filter((c) => c.category === d.key);
      const resolved = list.filter((c) => c.resolved_at);
      const avg = resolved.length
        ? resolved.reduce(
            (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
            0,
          ) /
          resolved.length /
          86400000
        : 0;
      m[d.key] = {
        total: list.length,
        resolved: list.filter((c) => ["resolved", "closed"].includes(c.status)).length,
        pending: list.filter((c) =>
          ["submitted", "assigned", "in_review", "work_in_progress"].includes(c.status),
        ).length,
        escalated: list.filter((c) => c.status === "escalated").length,
        avgDays: Math.round(avg * 10) / 10,
      };
    });
    return m;
  }, [complaints]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("Departments")}</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {t(
            "Manage the three departments and their assigned coordinators.",
            "మూడు శాఖలను మరియు వారికి కేటాయించబడిన సమన్వయకర్తలను నిర్వహించండి.",
          )}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => {
          const Icon = d.icon;
          const coords = users.filter((u) => u.roles.includes(d.role));
          const s = stats[d.key];
          return (
            <Card key={d.key} data-testid={`department-card-${d.key}`} className="overflow-hidden">
              <div className={`bg-gradient-to-br ${d.accent} p-5 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 ring-1 ring-white/30">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wider opacity-80">
                      {t("Department")}
                    </div>
                    <div className="text-lg font-semibold">{tCategory(d.key)}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/90">{d.description}</p>
              </div>

              <CardContent className="space-y-3 p-4">
                <div className="grid grid-cols-2 gap-2">
                  <Stat
                    label={t("Total")}
                    value={s.total}
                    icon={<ListChecks className="h-3.5 w-3.5" />}
                  />
                  <Stat
                    label={t("Pending")}
                    value={s.pending}
                    icon={<Users className="h-3.5 w-3.5" />}
                    tone="info"
                  />
                  <Stat
                    label={t("Resolved")}
                    value={s.resolved}
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    tone="success"
                  />
                  <Stat
                    label={t("Escalated")}
                    value={s.escalated}
                    icon={<AlertOctagon className="h-3.5 w-3.5" />}
                    tone="destructive"
                  />
                </div>
                <div className="rounded-md border bg-muted/30 p-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("Avg Resolution")}
                  </div>
                  <div className="text-base font-semibold">
                    {s.avgDays || "—"} {t("days", "రోజులు")}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("Coordinators")}
                    </div>
                    <Badge variant="secondary">{coords.length}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {coords.length === 0 ? (
                      <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        {t("No coordinator assigned", "సమన్వయకర్త లేరు")}
                      </div>
                    ) : (
                      coords.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {u.full_name || u.email}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {u.email}
                            </div>
                          </div>
                          {u.is_active ? (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-success/40 text-success"
                            >
                              {t("Active")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="shrink-0 border-destructive/40 text-destructive"
                            >
                              {t("Suspended")}
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-3">
                    <Link
                      to="/admin/coordinators"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {t("Manage coordinators", "సమన్వయకర్తలను నిర్వహించండి")} →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
  tone?: "info" | "success" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "info"
        ? "text-info"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-md border p-2">
      <div
        className={`flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider ${cls}`}
      >
        {icon} {label}
      </div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${cls}`}>{value}</div>
    </div>
  );
}
