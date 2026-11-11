import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import {
  CATEGORIES,
  STATUS_LABEL,
  type Complaint,
  type Category,
  type Status,
} from "@/lib/complaints";
import { useLanguage } from "@/hooks/use-language";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = "complaints" | "department" | "coordinator" | "feedback";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: Reports,
});

function Reports() {
  const { t, tCategory, tStatus } = useLanguage();
  const [type, setType] = useState<ReportType>("complaints");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [stat, setStat] = useState<Status | "all">("all");

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

  const filtered = complaints.filter((c) => {
    if (from && new Date(c.created_at) < new Date(from)) return false;
    if (to && new Date(c.created_at) > new Date(to)) return false;
    if (cat !== "all" && c.category !== cat) return false;
    if (stat !== "all" && c.status !== stat) return false;
    return true;
  });

  const rows = buildRows(type, filtered);

  function exportCsv() {
    const csv = [
      rows.headers.join(","),
      ...rows.data.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Gram Seva Portal — ${rows.title}`, 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated ${new Date().toLocaleString()} · ${rows.data.length} rows`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [rows.headers],
      body: rows.data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 76, 129] },
    });
    doc.save(`${type}-report.pdf`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("Reports")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Generate and export operational reports.")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Configure")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Select value={type} onValueChange={(v) => setType(v as ReportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complaints">
                {t("Complaint Report", "ఫిర్యాదు నివేదిక")}
              </SelectItem>
              <SelectItem value="department">{t("Department Report", "శాఖ నివేదిక")}</SelectItem>
              <SelectItem value="coordinator">
                {t("Coordinator Report", "సమన్వయకర్త నివేదిక")}
              </SelectItem>
              <SelectItem value="feedback">{t("Citizen Feedback")}</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={t("From")}
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={t("To")}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{rows.title}</CardTitle>
            <CardDescription>
              {rows.data.length} {t("rows", "వరుసలు")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
            <Button size="sm" onClick={exportPdf}>
              <FileText className="mr-1 h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  {rows.headers.map((h) => (
                    <th key={h} className="p-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.data.slice(0, 50).map((r, i) => {
                  const rowKey = `${String(r[0] ?? "row")}-${i}`;
                  return (
                    <tr key={rowKey} className="border-t">
                      {r.map((v, j) => (
                        <td key={`${rowKey}-${rows.headers[j] ?? j}`} className="p-3">
                          {String(v ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.data.length > 50 && (
              <div className="p-3 text-center text-xs text-muted-foreground">
                {t(
                  "Preview limited to 50 rows. Export to see all.",
                  "ప్రివ్యూ 50 వరుసలకు పరిమితం. అన్నీ చూడడానికి ఎగుమతి చేయండి.",
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function buildRows(
  type: ReportType,
  complaints: Complaint[],
): { title: string; headers: string[]; data: (string | number)[][] } {
  if (type === "complaints") {
    return {
      title: "Complaint Report",
      headers: ["Code", "Title", "Category", "Priority", "Status", "Created", "Resolved"],
      data: complaints.map((c) => [
        c.complaint_code,
        c.title,
        c.category,
        c.priority,
        c.status,
        new Date(c.created_at).toLocaleDateString(),
        c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : "—",
      ]),
    };
  }
  if (type === "department") {
    const cats = ["welfare", "development", "regulation"];
    return {
      title: "Department Report",
      headers: ["Department", "Total", "Resolved", "Escalated", "Avg Days"],
      data: cats.map((cat) => {
        const list = complaints.filter((c) => c.category === cat);
        const resolved = list.filter((c) => c.resolved_at);
        const avg = resolved.length
          ? resolved.reduce(
              (s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()),
              0,
            ) /
            resolved.length /
            86400000
          : 0;
        return [
          cat,
          list.length,
          resolved.length,
          list.filter((c) => c.status === "escalated").length,
          avg.toFixed(1),
        ];
      }),
    };
  }
  if (type === "coordinator") {
    const cats = ["welfare", "development", "regulation"];
    return {
      title: "Coordinator Report",
      headers: ["Coordinator", "Assigned", "Resolved", "In Progress", "Pending"],
      data: cats.map((cat) => {
        const list = complaints.filter((c) => c.category === cat);
        return [
          `${cat[0].toUpperCase()}${cat.slice(1)} Coordinator`,
          list.length,
          list.filter((c) => ["resolved", "closed"].includes(c.status)).length,
          list.filter((c) => c.status === "work_in_progress").length,
          list.filter((c) => ["submitted", "assigned"].includes(c.status)).length,
        ];
      }),
    };
  }
  // feedback
  const rated = complaints.filter((c) => c.rating != null);
  return {
    title: "Citizen Feedback Report",
    headers: ["Code", "Department", "Rating", "Comment", "Date"],
    data: rated.map((c) => [
      c.complaint_code,
      c.category,
      c.rating ?? 0,
      c.feedback ?? "",
      c.feedback_at ? new Date(c.feedback_at).toLocaleDateString() : "—",
    ]),
  };
}
