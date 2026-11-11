import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  STATUS_LABEL,
  PRIORITIES,
  CATEGORIES,
  type Complaint,
  type Priority,
  type Status,
  type Category,
} from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";
import { ExternalLink, AlertOctagon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/complaints")({
  component: AdminComplaints,
});

function AdminComplaints() {
  const qc = useQueryClient();
  const { t, tCategory, tStatus, tPriority, formatDate } = useLanguage();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [prio, setPrio] = useState<Priority | "all">("all");
  const [stat, setStat] = useState<Status | "all">("all");
  const [fromDate, setFromDate] = useState("");

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

  const updateMut = useMutation({
    mutationFn: async (v: { id: string; patch: Partial<Complaint> }) => {
      const { error } = await supabase.from("complaints").update(v.patch).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("Updated"));
      qc.invalidateQueries({ queryKey: ["admin-all-complaints"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = complaints.filter((c) => {
    if (
      search &&
      !`${c.title} ${c.description} ${c.complaint_code}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
      return false;
    if (cat !== "all" && c.category !== cat) return false;
    if (prio !== "all" && c.priority !== prio) return false;
    if (stat !== "all" && c.status !== stat) return false;
    if (fromDate && new Date(c.created_at) < new Date(fromDate)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("Complaint Management")}</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} {t("of", "నుండి")} {complaints.length} {t("complaints", "ఫిర్యాదులు")}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Filters")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder={t("Search…")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={cat} onValueChange={(v) => setCat(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All departments")}</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {tCategory(c.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={prio} onValueChange={(v) => setPrio(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All priorities")}</SelectItem>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {tPriority(p.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stat} onValueChange={(v) => setStat(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All statuses")}</SelectItem>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {tStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {/* Mobile cards */}
          <div className="grid gap-3 p-3 md:hidden">
            {filtered.map((c) => (
              <div key={c.id} className="rounded-md border p-3 space-y-2.5">
                <div>
                  <div className="text-xs text-muted-foreground">
                    <code className="rounded bg-muted px-1.5 py-0.5">{c.complaint_code}</code> ·{" "}
                    {tCategory(c.category)}
                  </div>
                  <Link
                    to="/complaints/$id"
                    params={{ id: c.id }}
                    className="mt-1 block font-medium hover:underline"
                  >
                    {c.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">{formatDate(c.created_at)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
                <Select
                  value={c.priority}
                  onValueChange={(v) =>
                    updateMut.mutate({ id: c.id, patch: { priority: v as Priority } })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {tPriority(p.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1.5">
                  {c.status !== "escalated" && c.status !== "closed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateMut.mutate({
                          id: c.id,
                          patch: { status: "escalated", escalated_at: new Date().toISOString() },
                        })
                      }
                    >
                      <AlertOctagon className="mr-1 h-3.5 w-3.5" /> {t("Escalate")}
                    </Button>
                  )}
                  {c.status === "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateMut.mutate({ id: c.id, patch: { status: "closed" } })}
                    >
                      {t("Close")}
                    </Button>
                  )}
                  {(c.status === "closed" || c.status === "resolved") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateMut.mutate({
                          id: c.id,
                          patch: { status: "reopened", resolved_at: null },
                        })
                      }
                    >
                      {t("Reopen")}
                    </Button>
                  )}
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/complaints/$id" params={{ id: c.id }}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
                {t("No complaints match.")}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">{t("Complaint")}</th>
                  <th>{t("Priority")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t align-top">
                    <td className="p-3">
                      <div className="text-xs text-muted-foreground">
                        <code className="rounded bg-muted px-1.5 py-0.5">{c.complaint_code}</code> ·{" "}
                        {tCategory(c.category)}
                      </div>
                      <Link
                        to="/complaints/$id"
                        params={{ id: c.id }}
                        className="font-medium hover:underline"
                      >
                        {c.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </div>
                    </td>
                    <td>
                      <Select
                        value={c.priority}
                        onValueChange={(v) =>
                          updateMut.mutate({ id: c.id, patch: { priority: v as Priority } })
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {tPriority(p.value)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5">
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {c.status !== "escalated" && c.status !== "closed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateMut.mutate({
                                id: c.id,
                                patch: {
                                  status: "escalated",
                                  escalated_at: new Date().toISOString(),
                                },
                              })
                            }
                          >
                            <AlertOctagon className="mr-1 h-3.5 w-3.5" /> {t("Escalate")}
                          </Button>
                        )}
                        {c.status === "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateMut.mutate({ id: c.id, patch: { status: "closed" } })
                            }
                          >
                            {t("Close")}
                          </Button>
                        )}
                        {(c.status === "closed" || c.status === "resolved") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateMut.mutate({
                                id: c.id,
                                patch: { status: "reopened", resolved_at: null },
                              })
                            }
                          >
                            {t("Reopen")}
                          </Button>
                        )}
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/complaints/$id" params={{ id: c.id }}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                      {t("No complaints match.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
