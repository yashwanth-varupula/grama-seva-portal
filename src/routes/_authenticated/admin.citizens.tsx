import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listUsers, setUserActive, resetUserPassword, type AdminUser } from "@/lib/admin.functions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { KeyRound, UserCheck, UserX, Search, Eye, ListChecks } from "lucide-react";
import type { Complaint } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/citizens")({
  component: CitizensPage,
});

function CitizensPage() {
  const qc = useQueryClient();
  const { t, formatDate } = useLanguage();
  const fetchUsers = useServerFn(listUsers);
  const setActive = useServerFn(setUserActive);
  const resetPwd = useServerFn(resetUserPassword);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

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

  const citizens = users.filter(
    (u) =>
      u.roles.includes("citizen") &&
      !u.roles.some((r) => r === "super_admin" || r.endsWith("_coordinator")),
  );

  const complaintsByUser = useMemo(() => {
    const m = new Map<string, Complaint[]>();
    complaints.forEach((c) => {
      const arr = m.get(c.citizen_id) ?? [];
      arr.push(c);
      m.set(c.citizen_id, arr);
    });
    return m;
  }, [complaints]);

  const wards = useMemo(
    () => Array.from(new Set(citizens.map((c) => c.ward).filter(Boolean))) as string[],
    [citizens],
  );

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

  const filtered = citizens.filter((u) => {
    const matchesSearch =
      !search ||
      [u.email, u.full_name, u.phone, u.ward].some((f) =>
        f?.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.is_active) ||
      (statusFilter === "suspended" && !u.is_active);
    const matchesWard = wardFilter === "all" || u.ward === wardFilter;
    return matchesSearch && matchesStatus && matchesWard;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("Citizen Management")}
        </h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {filtered.length} {t("of")} {citizens.length} {t("citizens", "పౌరులు")}.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("Filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder={t("Search name, email, ward…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="citizens-search"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger data-testid="citizens-status-filter">
              <SelectValue placeholder={t("Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All statuses")}</SelectItem>
              <SelectItem value="active">{t("Active")}</SelectItem>
              <SelectItem value="suspended">{t("Suspended")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={wardFilter} onValueChange={setWardFilter}>
            <SelectTrigger data-testid="citizens-ward-filter">
              <SelectValue placeholder={t("Ward")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All wards", "అన్ని వార్డులు")}</SelectItem>
              {wards.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
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
          const cnt = complaintsByUser.get(u.id)?.length ?? 0;
          return (
            <Card key={u.id} data-testid={`citizen-card-${u.id}`}>
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
                  <div className="inline-flex items-center gap-1 text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" /> {cnt} {t("complaints", "ఫిర్యాదులు")}
                  </div>
                  <div className="text-muted-foreground">{formatDate(u.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(u)}
                    data-testid={`citizen-view-${u.id}`}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" /> {t("View")}
                  </Button>
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
                      {t("Suspend", "నిలిపివేయండి")}
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
              <table className="w-full text-sm" data-testid="citizens-table">
                <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">{t("User")}</th>
                    <th>{t("Ward")}</th>
                    <th>{t("Complaints")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Joined")}</th>
                    <th className="pr-4 text-right">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const cnt = complaintsByUser.get(u.id)?.length ?? 0;
                    return (
                      <tr key={u.id} className="border-t">
                        <td className="p-3">
                          <div className="font-medium">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </td>
                        <td className="text-sm">{u.ward || "—"}</td>
                        <td className="text-sm font-medium">{cnt}</td>
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
                              onClick={() => setSelected(u)}
                              title={t("View")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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
                                title={t("Suspend", "నిలిపివేయండి")}
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

      {/* View profile dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.full_name || selected?.email}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{t("Ward")}</div>
                  <div>{selected.ward || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("Phone", "ఫోన్")}</div>
                  <div>{selected.phone || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("Joined")}</div>
                  <div>{formatDate(selected.created_at)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("Status")}</div>
                  <div>{selected.is_active ? t("Active") : t("Suspended")}</div>
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("Complaint history", "ఫిర్యాదుల చరిత్ర")}
                </div>
                <div className="rounded-md border divide-y max-h-72 overflow-y-auto">
                  {(complaintsByUser.get(selected.id) ?? []).map((c) => (
                    <Link
                      key={c.id}
                      to="/complaints/$id"
                      params={{ id: c.id }}
                      className="flex items-center justify-between gap-2 p-3 text-sm hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground">
                          <code className="rounded bg-muted px-1 py-0.5 mr-1">
                            {c.complaint_code}
                          </code>
                          {c.category} • {formatDate(c.created_at)}
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </Link>
                  ))}
                  {(complaintsByUser.get(selected.id) ?? []).length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t("No complaints raised yet.", "ఇంకా ఫిర్యాదులు లేవు.")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
