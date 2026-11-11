import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  listUsers,
  setUserActive,
  setUserRole,
  resetUserPassword,
  type AdminUser,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { KeyRound, UserCheck, UserX, Search, Activity, CheckCircle2, Clock4 } from "lucide-react";
import type { Complaint } from "@/lib/complaints";
import type { Database } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/use-language";

type AppRole = Database["public"]["Enums"]["app_role"];

export const Route = createFileRoute("/_authenticated/admin/coordinators")({
  component: CoordinatorsPage,
});

const COORD_ROLES: AppRole[] = [
  "welfare_coordinator",
  "development_coordinator",
  "regulation_coordinator",
];
const ROLE_TO_CATEGORY: Record<string, string> = {
  welfare_coordinator: "welfare",
  development_coordinator: "development",
  regulation_coordinator: "regulation",
};

function CoordinatorsPage() {
  const qc = useQueryClient();
  const { t, formatDate, tCategory } = useLanguage();
  const fetchUsers = useServerFn(listUsers);
  const setActive = useServerFn(setUserActive);
  const setRole = useServerFn(setUserRole);
  const resetPwd = useServerFn(resetUserPassword);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<AppRole | "all">("all");

  const { data: users = [], isLoading } = useQuery({
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

  const coordinators = users.filter((u) => u.roles.some((r) => COORD_ROLES.includes(r as AppRole)));

  // workload by department category (since coordinators are per category)
  const statsByCategory = useMemo(() => {
    const s: Record<
      string,
      { total: number; pending: number; resolved: number; inProgress: number }
    > = {
      welfare: { total: 0, pending: 0, resolved: 0, inProgress: 0 },
      development: { total: 0, pending: 0, resolved: 0, inProgress: 0 },
      regulation: { total: 0, pending: 0, resolved: 0, inProgress: 0 },
    };
    complaints.forEach((c) => {
      const dept = s[c.category];
      if (!dept) return;
      dept.total++;
      if (["resolved", "closed"].includes(c.status)) dept.resolved++;
      else if (c.status === "work_in_progress") dept.inProgress++;
      else if (["submitted", "assigned", "in_review"].includes(c.status)) dept.pending++;
    });
    return s;
  }, [complaints]);

  const filtered = coordinators.filter((u) => {
    const matchesSearch =
      !search ||
      [u.email, u.full_name, u.phone, u.ward].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesDept = deptFilter === "all" || u.roles.includes(deptFilter);
    return matchesSearch && matchesDept;
  });

  const activeMut = useMutation({
    mutationFn: (v: { userId: string; active: boolean }) => setActive({ data: v }),
    onSuccess: () => {
      toast.success(t("Account updated", "ఖాతా నవీకరించబడింది"));
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: AppRole }) => setRole({ data: v }),
    onSuccess: () => {
      toast.success(t("Transferred", "బదిలీ చేయబడింది"));
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const pwdMut = useMutation({
    mutationFn: (email: string) => resetPwd({ data: { email } }),
    onSuccess: () =>
      toast.success(t("Password reset email triggered", "పాస్‌వర్డ్ రీసెట్ ఇమెయిల్ పంపబడింది")),
    onError: (e: any) => toast.error(e.message),
  });

  function getPrimaryRole(u: AdminUser): AppRole | undefined {
    return u.roles.find((r) => COORD_ROLES.includes(r as AppRole)) as AppRole | undefined;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t("Coordinator Management")}
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {coordinators.length} {t("coordinators across departments", "శాఖల్లో సమన్వయకర్తలు")}.
          </p>
        </div>
      </div>

      {/* Workload overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        {(["welfare", "development", "regulation"] as const).map((cat) => (
          <Card key={cat}>
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {tCategory(cat)}
              </div>
              <div className="mt-1 text-2xl font-semibold">{statsByCategory[cat].total}</div>
              <div className="mt-2 flex gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1 text-info">
                  <Clock4 className="h-3 w-3" /> {statsByCategory[cat].pending}{" "}
                  {t("pending", "పెండింగ్")}
                </span>
                <span className="inline-flex items-center gap-1 text-warning">
                  <Activity className="h-3 w-3" /> {statsByCategory[cat].inProgress}
                </span>
                <span className="inline-flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-3 w-3" /> {statsByCategory[cat].resolved}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("Filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t("Search name, email, ward…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="coordinators-search"
            />
          </div>
          <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder={t("Department")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All departments")}</SelectItem>
              {COORD_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {tCategory(ROLE_TO_CATEGORY[r])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {isLoading && <div className="text-sm text-muted-foreground">{t("Loading…")}</div>}
        {!isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {t("No users match.")}
            </CardContent>
          </Card>
        )}
        {filtered.map((u) => {
          const role = getPrimaryRole(u);
          const cat = role ? ROLE_TO_CATEGORY[role] : "";
          const cnt = cat ? (statsByCategory[cat]?.total ?? 0) : 0;
          return (
            <Card key={u.id} data-testid={`coordinator-card-${u.id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{u.full_name || "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                    {u.ward && (
                      <div className="text-xs text-muted-foreground">
                        {t("Ward")}: {u.ward}
                      </div>
                    )}
                  </div>
                  {u.is_active ? (
                    <Badge variant="outline" className="shrink-0 border-success/40 text-success">
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
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="secondary">{role ? tCategory(cat) : "—"}</Badge>
                  <div className="text-muted-foreground">
                    {cnt} {t("complaints", "ఫిర్యాదులు")}
                  </div>
                </div>
                {role && (
                  <Select
                    value={role}
                    onValueChange={(v) => roleMut.mutate({ userId: u.id, role: v as AppRole })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COORD_ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {tCategory(ROLE_TO_CATEGORY[r])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => u.email && pwdMut.mutate(u.email)}
                    disabled={!u.email}
                  >
                    <KeyRound className="mr-1 h-3.5 w-3.5" /> {t("Reset")}
                  </Button>
                  {u.is_active ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => activeMut.mutate({ userId: u.id, active: false })}
                    >
                      <UserX className="mr-1 h-3.5 w-3.5 text-destructive" />{" "}
                      {t("Deactivate", "నిష్క్రియం")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => activeMut.mutate({ userId: u.id, active: true })}
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5 text-success" />{" "}
                      {t("Activate", "క్రియాశీలం")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">{t("Loading…")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="coordinators-table">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">{t("User")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Workload")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Joined")}</th>
                    <th className="pr-4 text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const role = getPrimaryRole(u);
                    const cat = role ? ROLE_TO_CATEGORY[role] : "";
                    const stat = cat ? statsByCategory[cat] : null;
                    return (
                      <tr key={u.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                          {u.ward && (
                            <div className="text-xs text-muted-foreground">
                              {t("Ward")}: {u.ward}
                            </div>
                          )}
                        </td>
                        <td>
                          {role && (
                            <Select
                              value={role}
                              onValueChange={(v) =>
                                roleMut.mutate({ userId: u.id, role: v as AppRole })
                              }
                            >
                              <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COORD_ROLES.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {tCategory(ROLE_TO_CATEGORY[r])}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </td>
                        <td>
                          {stat ? (
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span>
                                {stat.total} {t("total", "మొత్తం")}
                              </span>
                              <span className="text-success">
                                {stat.resolved} {t("resolved", "పరిష్కరించబడింది")}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>
                          {u.is_active ? (
                            <Badge variant="outline" className="border-success/40 text-success">
                              {t("Active")}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-destructive/40 text-destructive"
                            >
                              {t("Suspended")}
                            </Badge>
                          )}
                        </td>
                        <td className="text-xs text-muted-foreground">
                          {formatDate(u.created_at)}
                        </td>
                        <td className="pr-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => u.email && pwdMut.mutate(u.email)}
                              disabled={!u.email}
                              title={t("Reset password", "పాస్‌వర్డ్ రీసెట్")}
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            {u.is_active ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => activeMut.mutate({ userId: u.id, active: false })}
                                title={t("Deactivate", "నిష్క్రియం")}
                              >
                                <UserX className="h-4 w-4 text-destructive" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => activeMut.mutate({ userId: u.id, active: true })}
                                title={t("Activate", "క్రియాశీలం")}
                              >
                                <UserCheck className="h-4 w-4 text-success" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                        {t("No users match.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {t(
          "Tip: To add a new coordinator, go to User Roles and change a citizen's role to a coordinator type.",
          "చిట్కా: కొత్త సమన్వయకర్తను జోడించడానికి, User Roles కు వెళ్లి పౌరుని పాత్రను సమన్వయకర్తగా మార్చండి.",
        )}
      </p>
    </div>
  );
}
