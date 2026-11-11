import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Complaint } from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  component: Feedback,
});

function Feedback() {
  const { t, tCategory } = useLanguage();
  const { data: complaints = [] } = useQuery({
    queryKey: ["admin-all-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .not("rating", "is", null)
        .order("feedback_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const avg = (arr: Complaint[]) =>
    arr.length ? arr.reduce((s, c) => s + (c.rating ?? 0), 0) / arr.length : 0;
  const overall = avg(complaints);

  const byDept = ["welfare", "development", "regulation"].map((cat) => ({
    name: tCategory(cat),
    rating: Number(avg(complaints.filter((c) => c.category === cat)).toFixed(2)),
    count: complaints.filter((c) => c.category === cat).length,
  }));

  // Monthly trend
  const now = new Date();
  const trend: { month: string; rating: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const sub = complaints.filter((c) => {
      if (c.rating == null) return false;
      const t = c.feedback_at ?? c.updated_at;
      if (!t) return false;
      const x = new Date(t);
      return x >= d && x < next;
    });
    trend.push({
      month: d.toLocaleString(undefined, { month: "short" }),
      rating: Number(avg(sub).toFixed(2)),
    });
  }

  // Memoise the comment list so React doesn't re-run filter+slice on unrelated re-renders.
  const recentComments = useMemo(
    () => complaints.filter((c) => c.feedback).slice(0, 20),
    [complaints],
  );
  const hasAnyWrittenFeedback = useMemo(() => complaints.some((c) => c.feedback), [complaints]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("Citizen Feedback")}</h1>
        <p className="text-sm text-muted-foreground">
          {complaints.length} {t("rated complaints.", "రేటింగ్ ఇవ్వబడిన ఫిర్యాదులు.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">{t("Average Rating")}</div>
            <div className="mt-1 flex items-center gap-2 text-3xl font-semibold">
              <Star className="h-6 w-6 fill-warning text-warning" />
              {overall.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        {byDept.map((d) => (
          <Card key={d.name}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{d.name}</div>
              <div className="mt-1 text-3xl font-semibold">{d.rating || "—"}</div>
              <div className="text-xs text-muted-foreground">
                {d.count} {t("ratings", "రేటింగ్‌లు")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("Feedback Trend")}</CardTitle>
          <CardDescription>{t("Average satisfaction over last 6 months.")}</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#1E88E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Recent Comments")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentComments.map((c) => (
            <div key={c.id} className="rounded-md border p-3">
              <div className="mb-1 flex items-center gap-2 text-xs">
                <code className="rounded bg-muted px-1.5 py-0.5">{c.complaint_code}</code>
                <span className="text-muted-foreground">{tCategory(c.category)}</span>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => i).map((i) => (
                    <Star
                      key={`star-${i}`}
                      className={`h-3.5 w-3.5 ${i < (c.rating ?? 0) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm">{c.feedback}</p>
            </div>
          ))}
          {!hasAnyWrittenFeedback && (
            <div className="text-sm text-muted-foreground">{t("No written feedback yet.")}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
