import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useMyRoles } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { COORDINATOR_ROLE, VALID_TRANSITIONS, type Complaint, type Status } from "@/lib/complaints";
import {
  ArrowLeft,
  Send,
  Star,
  AlertOctagon,
  Download,
  CheckCircle2,
  Clock,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint — Gram Seva Portal" }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { roles, isSuperAdmin } = useMyRoles();
  const qc = useQueryClient();
  const { t, tStatus, tCategory, formatDateTime } = useLanguage();

  const { data: c } = useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Complaint;
    },
  });
  const { data: updates = [] } = useQuery({
    queryKey: ["complaint-updates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_updates")
        .select("*")
        .eq("complaint_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [msg, setMsg] = useState("");
  const [newStatus, setNewStatus] = useState<Status | "">("");

  if (!c) return <div className="text-sm text-muted-foreground">Loading…</div>;

  const canManage = isSuperAdmin || roles.includes(COORDINATOR_ROLE[c.category]);
  const isOwner = c.citizen_id === user?.id;
  const canRate = isOwner && ["resolved", "closed"].includes(c.status);
  const hasRated = c.rating != null;
  const validNext = VALID_TRANSITIONS[c.status] ?? [];

  async function sendMessage() {
    if (!msg.trim() || !user) return;
    const { error } = await supabase.from("complaint_updates").insert({
      complaint_id: id,
      author_id: user.id,
      kind: "message",
      message: msg.trim(),
    });
    if (error) return toast.error(error.message);
    setMsg("");
    qc.invalidateQueries({ queryKey: ["complaint-updates", id] });
  }

  async function updateStatus() {
    if (!newStatus || !user || !c) return;
    if (!validNext.includes(newStatus))
      return toast.error(t("Invalid status transition", "చెల్లని స్థితి మార్పు"));
    const { error } = await supabase
      .from("complaints")
      .update({
        status: newStatus,
        resolved_at: newStatus === "resolved" ? new Date().toISOString() : c.resolved_at,
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("complaint_updates").insert({
      complaint_id: id,
      author_id: user.id,
      kind: "status_change",
      old_status: c.status,
      new_status: newStatus,
      message: null,
    });
    toast.success(t("Status updated", "స్థితి నవీకరించబడింది"));
    setNewStatus("");
    qc.invalidateQueries({ queryKey: ["complaint", id] });
    qc.invalidateQueries({ queryKey: ["complaint-updates", id] });
  }

  async function escalateNow() {
    if (!user || !c) return;
    const { error } = await supabase
      .from("complaints")
      .update({ status: "escalated", escalated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("complaint_updates").insert({
      complaint_id: id,
      author_id: user.id,
      kind: "status_change",
      old_status: c.status,
      new_status: "escalated",
      message: "Escalated for higher attention.",
    });
    toast.success(t("Complaint escalated", "ఫిర్యాదు ఎస్కలేట్ చేయబడింది"));
    qc.invalidateQueries({ queryKey: ["complaint", id] });
    qc.invalidateQueries({ queryKey: ["complaint-updates", id] });
  }

  function downloadReceipt() {
    if (!c) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 76, 129);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("GRAMA SEVA — VILLAGE & WARD SECRETARIAT", 14, 11);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Puttagunta Grama Panchayat, Andhra Pradesh · Official Grievance Acknowledgment Slip",
      14,
      18,
    );

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL GRIEVANCE ACKNOWLEDGMENT", 14, 36);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      `Generated: ${new Date().toLocaleString()} · Tracking ID: ${c.complaint_code || id}`,
      14,
      42,
    );

    autoTable(doc, {
      startY: 48,
      head: [["Attribute", "Grievance Record Value"]],
      body: [
        ["Tracking Code", c.complaint_code || id.slice(0, 8).toUpperCase()],
        ["Grievance Title", c.title],
        ["Department Category", c.category.toUpperCase()],
        [
          "Assigned Branch",
          c.category === "welfare"
            ? "Welfare & Social Pensions"
            : c.category === "development"
              ? "Public Works, Water & Sanitation"
              : "Regulation, Certificates & Revenue",
        ],
        ["Priority Level", c.priority.toUpperCase()],
        ["Current Stage / Status", c.status.toUpperCase().replace(/_/g, " ")],
        ["Ward / Jurisdiction", c.ward || "Ward 1, Puttagunta"],
        ["Specific Location", c.location || "Puttagunta Panchayat"],
        ["Contact Mobile", c.contact_phone || "Not provided"],
        ["Date of Submission", new Date(c.created_at).toLocaleString()],
        ["Resolution SLA", "Within 7 Working Days"],
      ],
      theme: "striped",
      headStyles: { fillColor: [15, 76, 129], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 135;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 76, 129);
    doc.text("Citizen Grievance Description:", 14, finalY + 10);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    const splitDesc = doc.splitTextToSize(c.description, 180);
    doc.text(splitDesc, 14, finalY + 16);

    const sealY = finalY + 16 + splitDesc.length * 4.5 + 12;
    doc.setDrawColor(210);
    doc.line(14, sealY, 196, sealY);
    doc.setFontSize(7.5);
    doc.setTextColor(120);
    doc.text(
      "Official computer-generated acknowledgment issued by Puttagunta Village Secretariat Grama Seva Portal.",
      14,
      sealY + 6,
    );
    doc.text(
      "For physical verification or inquiries, quote this Complaint Tracking Code at the Secretariat desk or call 1902.",
      14,
      sealY + 11,
    );

    doc.save(`Grievance-Receipt-${c.complaint_code || "GramSeva"}.pdf`);
    toast.success(
      t("Official Receipt downloaded as PDF!", "అధికారిక రసీదు PDF డౌన్‌లోడ్ చేయబడింది!"),
    );
  }

  const isResolved = ["resolved", "closed"].includes(c.status);
  const isWip = c.status === "work_in_progress";
  const isInReview = ["assigned", "in_review"].includes(c.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link to="/complaints">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t("Back to complaints")}
          </Link>
        </Button>
        <Button
          onClick={downloadReceipt}
          variant="outline"
          size="sm"
          className="gap-2 w-full sm:w-auto h-10 sm:h-9"
        >
          <Download className="h-4 w-4 text-primary" />
          <span>{t("Download Official Receipt (PDF)", "అధికారిక రసీదు (PDF)")}</span>
        </Button>
      </div>

      {/* Visual Resolution Progress Stepper (Mobile-Friendly) */}
      <Card className="border-border/80 bg-muted/20">
        <CardContent className="p-3 sm:p-5">
          <div className="text-[11px] sm:text-xs font-semibold uppercase text-muted-foreground mb-2.5">
            {t("Resolution Journey", "పరిష్కార ప్రయాణం")}
          </div>
          <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-emerald-600 text-white font-bold text-xs sm:text-sm mb-1 shadow-xs">
                ✓
              </div>
              <span className="font-semibold text-[10px] sm:text-xs text-foreground line-clamp-1">
                {t("Submitted", "సమర్పించబడింది")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                {formatDateTime(c.created_at).split(",")[0]}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full font-bold text-xs sm:text-sm mb-1 shadow-xs ${
                  isInReview || isWip || isResolved
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground border"
                }`}
              >
                {isInReview || isWip || isResolved ? "✓" : "2"}
              </div>
              <span className="font-semibold text-[10px] sm:text-xs text-foreground line-clamp-1">
                {t("Assigned", "సమీక్షలో")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                {t("Coordinator", "సమన్వయకర్త")}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full font-bold text-xs sm:text-sm mb-1 shadow-xs ${
                  isWip || isResolved
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground border"
                }`}
              >
                {isWip || isResolved ? "✓" : "3"}
              </div>
              <span className="font-semibold text-[10px] sm:text-xs text-foreground line-clamp-1">
                {t("Field Work", "పనిలో ఉంది")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                {t("Action", "క్షేత్ర పరిశీలన")}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full font-bold text-xs sm:text-sm mb-1 shadow-xs ${
                  isResolved
                    ? "bg-emerald-600 text-white"
                    : c.status === "escalated"
                      ? "bg-destructive text-white"
                      : "bg-muted text-muted-foreground border"
                }`}
              >
                {isResolved ? "✓" : c.status === "escalated" ? "!" : "4"}
              </div>
              <span className="font-semibold text-[10px] sm:text-xs text-foreground line-clamp-1">
                {c.status === "escalated"
                  ? t("Escalated", "ఎస్కలేట్")
                  : t("Resolved", "పరిష్కరించబడింది")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                {c.resolved_at
                  ? formatDateTime(c.resolved_at).split(",")[0]
                  : t("SLA: 7d", "గడువు 7 రోజులు")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">
              <code className="rounded bg-muted px-1.5 py-0.5">{c.complaint_code}</code> ·{" "}
              <span>{tCategory(c.category)}</span>
            </div>
            <CardTitle className="mt-1">{c.title}</CardTitle>
          </div>
          <div className="flex shrink-0 gap-2">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm">{c.description}</p>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <Info label={t("Ward / Village")} value={c.ward} />
            <Info label={t("Location")} value={c.location} />
            <Info label={t("Contact")} value={c.contact_phone} />
            <Info label={t("Submitted")} value={formatDateTime(c.created_at)} />
            <Info label={t("Last update")} value={formatDateTime(c.updated_at)} />
            {c.resolved_at && <Info label={t("Resolved")} value={formatDateTime(c.resolved_at)} />}
          </div>
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Coordinator actions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Status)}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder={t("Change status to…")} />
              </SelectTrigger>
              <SelectContent>
                {validNext.length === 0 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {t("No further transitions")}
                  </div>
                )}
                {validNext.map((s) => (
                  <SelectItem key={s} value={s}>
                    {tStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={updateStatus} disabled={!newStatus} className="w-full sm:w-auto">
              {t("Update status")}
            </Button>
            {c.status !== "escalated" && !["resolved", "closed", "rejected"].includes(c.status) && (
              <Button
                variant="outline"
                onClick={escalateNow}
                className="w-full sm:w-auto sm:ml-auto"
              >
                <AlertOctagon className="mr-2 h-4 w-4" />
                {t("Escalate")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {canRate && (
        <FeedbackBlock
          complaintId={id}
          currentRating={c.rating}
          currentFeedback={c.feedback}
          locked={hasRated}
          onSaved={() => qc.invalidateQueries({ queryKey: ["complaint", id] })}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Activity & messages")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {updates.length === 0 && (
              <li className="text-sm text-muted-foreground">{t("No activity yet.")}</li>
            )}
            {updates.map((u) => (
              <li key={u.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium uppercase">{u.kind.replace("_", " ")}</span>
                  <span>· {formatDateTime(u.created_at)}</span>
                </div>
                {u.kind === "status_change" ? (
                  <div>
                    {t("Status changed from", "స్థితి మారింది")}{" "}
                    <b>{u.old_status && tStatus(u.old_status)}</b> {t("to", "నుండి")}{" "}
                    <b>{u.new_status && tStatus(u.new_status)}</b>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{u.message}</div>
                )}
              </li>
            ))}
          </ul>
          {(canManage || isOwner) && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder={t("Write a message…")}
                rows={2}
                className="flex-1"
                lang="te"
              />
              <Button onClick={sendMessage} disabled={!msg.trim()} className="sm:self-end">
                <Send className="mr-2 h-4 w-4 sm:mr-0" />
                <span className="sm:hidden">{t("Send")}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}

function FeedbackBlock({
  complaintId,
  currentRating,
  currentFeedback,
  locked,
  onSaved,
}: {
  complaintId: string;
  currentRating: number | null;
  currentFeedback: string | null;
  locked: boolean;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(currentRating ?? 0);
  const [text, setText] = useState(currentFeedback ?? "");
  const [busy, setBusy] = useState(false);
  const { t } = useLanguage();

  async function save() {
    if (locked) return;
    if (!rating)
      return toast.error(t("Please pick a star rating", "దయచేసి ఒక నక్షత్ర రేటింగ్ ఎంచుకోండి"));
    setBusy(true);
    const { error } = await supabase
      .from("complaints")
      .update({ rating, feedback: text, feedback_at: new Date().toISOString() })
      .eq("id", complaintId);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("Thank you for your feedback!", "మీ అభిప్రాయానికి ధన్యవాదాలు!"));
    onSaved();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {locked ? t("Your feedback") : t("Rate this resolution")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => i).map((i) => (
            <button
              key={`star-${i}`}
              type="button"
              disabled={locked}
              onClick={() => setRating(i + 1)}
              className="p-1 disabled:cursor-not-allowed"
            >
              <Star
                className={`h-7 w-7 transition ${i < rating ? "fill-warning text-warning" : "text-muted-foreground/40 hover:text-warning"}`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating ? `${rating}/5` : t("Tap a star")}
          </span>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={locked}
          placeholder={t("Share your experience (optional)…")}
          rows={3}
          lang="te"
        />
        {locked ? (
          <div className="text-xs text-muted-foreground">
            {t(
              "Feedback already submitted — thank you. Contact your coordinator if anything changes.",
              "అభిప్రాయం ఇప్పటికే సమర్పించబడింది — ధన్యవాదాలు. ఏదైనా మారితే మీ సమన్వయకర్తను సంప్రదించండి.",
            )}
          </div>
        ) : (
          <Button onClick={save} disabled={busy}>
            {t("Submit feedback")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
