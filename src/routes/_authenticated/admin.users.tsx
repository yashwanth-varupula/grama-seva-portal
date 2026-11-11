import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listUsers,
  setUserRole,
  setUserActive,
  resetUserPassword,
  seedDemoData,
} from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KeyRound, UserCheck, UserX, Search, Sparkles, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/use-language";

type AppRole = Database["public"]["Enums"]["app_role"];

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const qc = useQueryClient();
  const { t, formatDate } = useLanguage();
  const ROLE_LABEL: Record<AppRole, string> = {
    citizen: t("Citizen"),
    welfare_coordinator: t("Welfare Coordinator"),
    development_coordinator: t("Development Coordinator"),
    regulation_coordinator: t("Regulation Coordinator"),
    super_admin: t("Super Admin"),
  };
  const fetchUsers = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const setActive = useServerFn(setUserActive);
  const resetPwd = useServerFn(resetUserPassword);
  const seed = useServerFn(seedDemoData);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers({}),
  });

  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: AppRole }) => setRole({ data: v }),
    onSuccess: () => {
      toast.success(t("Role updated", "పాత్ర నవీకరించబడింది"));
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const activeMut = useMutation({
    mutationFn: (v: { userId: string; active: boolean }) => setActive({ data: v }),
    onSuccess: () => {
      toast.success(t("Account updated", "ఖాతా నవీకరించబడింది"));
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
  const seedMut = useMutation({
    mutationFn: () => seed({}),
    onSuccess: (r: any) => {
      toast.success(
        r.note ??
          `${t("Seeded", "జోడించబడింది")} ${r.created} ${t("demo complaints", "డెమో ఫిర్యాదులు")}`,
      );
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      [u.email, u.full_name, u.phone, u.ward].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("User Management")}</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} {t("accounts in total.", "మొత్తం ఖాతాలు.")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedMut.mutate()}
          disabled={seedMut.isPending}
        >
          {seedMut.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {t("Seed demo data")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Filters")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("Search name, email, ward…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All roles")}</SelectItem>
              {Object.entries(ROLE_LABEL).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">
              {t("Loading users…", "వినియోగదారులు లోడ్ అవుతున్నారు…")}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-3 p-3 md:hidden">
                {filtered.map((u) => {
                  const primaryRole = (u.roles[0] ?? "citizen") as AppRole;
                  return (
                    <div key={u.id} className="rounded-md border p-3 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-medium">{u.full_name || "—"}</div>
                          <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                          {u.ward && (
                            <div className="text-xs text-muted-foreground">
                              {t("Ward")}: {u.ward}
                            </div>
                          )}
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
                      <Select
                        value={primaryRole}
                        onValueChange={(v) => roleMut.mutate({ userId: u.id, role: v as AppRole })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABEL).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{formatDate(u.created_at)}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => u.email && pwdMut.mutate(u.email)}
                            disabled={!u.email}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          {u.is_active ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => activeMut.mutate({ userId: u.id, active: false })}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => activeMut.mutate({ userId: u.id, active: true })}
                            >
                              <UserCheck className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
                    {t("No users match.")}
                  </div>
                )}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-3">{t("User")}</th>
                      <th>{t("Role")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Joined")}</th>
                      <th className="text-right pr-4">{t("Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => {
                      const primaryRole = (u.roles[0] ?? "citizen") as AppRole;
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
                            <Select
                              value={primaryRole}
                              onValueChange={(v) =>
                                roleMut.mutate({ userId: u.id, role: v as AppRole })
                              }
                            >
                              <SelectTrigger className="h-8 w-[200px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ROLE_LABEL).map(([k, v]) => (
                                  <SelectItem key={k} value={k}>
                                    {v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                              {u.is_active ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => activeMut.mutate({ userId: u.id, active: false })}
                                >
                                  <UserX className="h-4 w-4 text-destructive" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => activeMut.mutate({ userId: u.id, active: true })}
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
                        <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                          {t("No users match.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
