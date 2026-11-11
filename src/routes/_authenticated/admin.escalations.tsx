import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { runEscalation } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Play, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { COORDINATOR_ROLE, type Complaint } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/escalations")({
  component: Escalations,
});

function Escalations() {
  const qc = useQueryClient();
  const { t, tCategory, formatDateTime } = useLanguage();
  const escalate = useServerFn(runEscalation);

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

  const escalatedList = complaints.filter((c) => c.status === "escalated");
  const atRisk = complaints.filter((c) => {
    if (["resolved", "closed", "rejected", "escalated"].includes(c.status)) return false;
    const age = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return age > 5; // 5+ days, not yet escalated
  });

  const runMut = useMutation({
    mutationFn: () => escalate({ data: { days: 7 } }),
    onSuccess: (r: any) => {
      toast.success(
        `${r.escalated} ${t("complaints escalated", "ఫిర్యాదులు ఎస్కలేట్ చేయబడ్డాయి")}`,
      );
      qc.invalidateQueries({ queryKey: ["admin-all-complaints"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Escalation Management")}</h1>
          <p className="text-sm text-muted-foreground">
            {t(
              "Rule: Complaints unresolved > 7 days are auto-escalated.",
              "నియమం: 7 రోజులకు మించి పరిష్కరించని ఫిర్యాదులు స్వయంచాలకంగా ఎస్కలేట్ చేయబడతాయి.",
            )}
          </p>
        </div>
        <Button onClick={() => runMut.mutate()} disabled={runMut.isPending}>
          <Play className="mr-2 h-4 w-4" /> {t("Run escalation now")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{t("Escalated")}</div>
            <div className="mt-1 text-3xl font-semibold text-destructive">
              {escalatedList.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{t("At Risk (5+ days)")}</div>
            <div className="mt-1 text-3xl font-semibold text-warning">{atRisk.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{t("Rule Threshold")}</div>
            <div className="mt-1 text-3xl font-semibold">{t("7 days", "7 రోజులు")}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Escalated Complaints")}</CardTitle>
          <CardDescription>
            {t("Require immediate attention.", "తక్షణ దృష్టి అవసరం.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">{t("Complaint")}</th>
                  <th>{t("Department")}</th>
                  <th>{t("Escalated")}</th>
                  <th>{t("Coordinator")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {escalatedList.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-destructive bg-destructive/10 text-destructive"
                        >
                          <AlertOctagon className="mr-1 h-3 w-3" />
                          ESC
                        </Badge>
                        <Link
                          to="/complaints/$id"
                          params={{ id: c.id }}
                          className="font-medium hover:underline"
                        >
                          {c.title}
                        </Link>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{c.complaint_code}</div>
                    </td>
                    <td>{tCategory(c.category)}</td>
                    <td className="text-xs">
                      {c.escalated_at ? formatDateTime(c.escalated_at) : "—"}
                    </td>
                    <td className="text-xs text-muted-foreground">
                      {COORDINATOR_ROLE[c.category].replace("_", " ")}
                    </td>
                    <td>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/complaints/$id" params={{ id: c.id }}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {escalatedList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                      {t("No escalated complaints.")} 🎉
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
