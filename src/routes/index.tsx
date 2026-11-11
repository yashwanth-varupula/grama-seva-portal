import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  ShieldCheck,
  FilePlus2,
  HeartHandshake,
  HardHat,
  ScrollText,
  ArrowRight,
  Landmark,
  Clock,
  BarChart3,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Phone,
  Sparkles,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Complaint } from "@/lib/complaints";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gram Seva Portal — Village & Ward Secretariat Complaints" },
      {
        name: "description",
        content:
          "Official citizen grievance portal for Village & Ward Secretariat Puttagunta. Submit, track, and resolve welfare, development, and regulation complaints.",
      },
    ],
  }),
  component: Index,
});

export default function Index() {
  const { t, tCategory, tStatus, formatDate } = useLanguage();
  const [trackCode, setTrackCode] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<Complaint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = trackCode.trim().toUpperCase();
    if (!code) {
      return toast.error(
        t(
          "Please enter a complaint code (e.g. WEL-001 or DEV-002)",
          "దయచేసి ఫిర్యాదు సంఖ్యను నమోదు చేయండి (ఉదా: WEL-001 లేదా DEV-002)",
        ),
      );
    }

    setTrackLoading(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .ilike("complaint_code", code)
        .maybeSingle();

      setTrackLoading(false);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (!data) {
        toast.error(
          t(
            `No grievance found with code "${code}". Please verify and retype.`,
            `"${code}" సంఖ్యతో ఎటువంటి ఫిర్యాదు కనుగొనబడలేదు. దయచేసి సరిచూసుకోండి.`,
          ),
        );
        return;
      }

      setTrackResult(data as Complaint);
      setDialogOpen(true);
    } catch (err: any) {
      setTrackLoading(false);
      toast.error(err.message || "Failed to search grievance");
    }
  };

  return (
    <PublicShell>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden text-primary-foreground py-16 sm:py-24"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Heading, Subhead, Tracker */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  {t(
                    "Puttagunta Grama Panchayat · Andhra Pradesh",
                    "పుట్టగుంట గ్రామ పంచాయతీ · ఆంధ్రప్రదేశ్",
                  )}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {t("Your voice. Tracked. Resolved.", "మీ సమస్య. నమోదు. పరిష్కారం.")}
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-primary-foreground/85 leading-relaxed">
                {t(
                  "A single unified digital window to raise welfare, public works, and regulation grievances with your Village Secretariat — assigned directly to official ward coordinators with transparent, real-time SLA tracking.",
                  "మీ గ్రామ సచివాలయంతో సంక్షేమం, ప్రజా పనులు, మరియు నియంత్రణ సమస్యలను నివేదించడానికి ఏకైక డిజిటల్ వేదిక — పారదర్శక ట్రాకింగ్‌తో సంబంధిత సమన్వయకర్తలకు నేరుగా కేటాయించబడుతుంది.",
                )}
              </p>

              {/* Direct Grievance Tracker Box */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-xl">
                <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-white/90">
                  <Search className="h-3.5 w-3.5 text-amber-300" />
                  {t("Instant Grievance Status Tracker", "తక్షణ ఫిర్యాదు స్థితి ట్రాకర్")}
                </div>
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      placeholder={t(
                        "Enter Complaint Code (e.g. WEL-001, DEV-002)",
                        "ఫిర్యాదు సంఖ్య (ఉదా: WEL-001, DEV-002)",
                      )}
                      className="bg-white text-slate-900 placeholder:text-slate-500 font-mono font-medium border-0 shadow-inner h-11 text-base sm:text-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={trackLoading}
                    className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-semibold h-11 px-6 shadow-md w-full sm:w-auto"
                  >
                    {trackLoading
                      ? t("Searching…", "శోధిస్తోంది…")
                      : t("Track Status", "స్థితి చూడండి")}
                  </Button>
                </form>
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                  <span>{t("Sample codes to test:", "పరీక్షించడానికి ఉదాహరణలు:")}</span>
                  <button
                    type="button"
                    onClick={() => setTrackCode("WEL-001")}
                    className="underline hover:text-white font-mono"
                  >
                    WEL-001
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTrackCode("DEV-002")}
                    className="underline hover:text-white font-mono"
                  >
                    DEV-002
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setTrackCode("REG-003")}
                    className="underline hover:text-white font-mono"
                  >
                    REG-003
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow font-semibold h-12"
                >
                  <Link to="/auth">
                    <FilePlus2 className="mr-2 h-5 w-5" />
                    {t("Raise a Complaint", "ఫిర్యాదు నమోదు చేయండి")}
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 bg-white/10 text-white hover:bg-white/20 h-12"
                >
                  <Link to="/transparency">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {t("View Public Dashboard", "పారదర్శకత డాష్‌బోర్డ్")}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Key Portal Metrics */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 self-center">
              <StatCard
                icon={<BarChart3 className="h-5 w-5 text-sky-300" />}
                label={t("Departments", "విభాగాలు")}
                value="3"
                desc={t("Welfare, Works, Regulation", "సంక్షేమం, పనులు, నియంత్రణ")}
              />
              <StatCard
                icon={<Clock className="h-5 w-5 text-amber-300" />}
                label={t("Avg. Resolution SLA", "సగటు పరిష్కార SLA")}
                value="7 Days"
                desc={t("Targeted citizen delivery", "నిర్దిష్ట కాలపరిమితి")}
              />
              <StatCard
                icon={<Landmark className="h-5 w-5 text-emerald-300" />}
                label={t("Secretariat Wards", "సచివాలయ వార్డులు")}
                value="10 Wards"
                desc={t("Puttagunta Panchayat", "పుట్టగుంట పంచాయతీ పరిధి")}
              />
              <StatCard
                icon={<CheckCircle2 className="h-5 w-5 text-purple-300" />}
                label={t("Full Transparency", "పూర్తి పారదర్శకత")}
                value="100%"
                desc={t("Real-time public record", "ప్రజా డాష్‌బోర్డ్ రికార్డు")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("Three Core Secretariat Departments", "మూడు ముఖ్య సచివాలయ విభాగాలు")}
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              {t(
                "Every grievance is routed directly to the designated coordinator based on category, ensuring swift accountability.",
                "ప్రతి ఫిర్యాదు సంబంధిత విభాగానికి చెందిన సమన్వయకర్తకు నేరుగా కేటాయించబడుతుంది, త్వరిత పరిష్కారం లభిస్తుంది.",
              )}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Welfare */}
            <Card className="border-border/80 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  <HeartHandshake className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t("Welfare & Social Schemes", "సంక్షేమ & సామాజిక పథకాలు")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Coordinator Desk: Welfare Assistant", "సమన్వయకర్త: సంక్షేమ సహాయకుడు")}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>YSR Pension Kanuka / Social Pensions</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Ration Card issuance and corrections</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Student scholarships &amp; educational aid</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Housing assistance &amp; welfare verification</span>
                  </li>
                </ul>
                <div className="pt-2 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth">
                      {t("Raise Welfare Grievance", "సంక్షేమ ఫిర్యాదు చేయండి")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Development */}
            <Card className="border-border/80 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  <HardHat className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t("Development & Public Works", "అభివృద్ధి & ప్రజా పనులు")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "Coordinator Desk: Engineering Assistant",
                      "సమన్వయకర్త: ఇంజనీరింగ్ సహాయకుడు",
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Drinking water supply pipeline repairs</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Street light maintenance &amp; outages</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Drainage blockages &amp; sanitation cleanup</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Village road and pathway infrastructure</span>
                  </li>
                </ul>
                <div className="pt-2 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth">
                      {t("Report Public Works Issue", "పనుల సమస్యను నివేదించండి")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Regulation */}
            <Card className="border-border/80 shadow-sm hover:shadow-md transition">
              <CardContent className="p-6 space-y-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <ScrollText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {t("Regulation, Certificates & Revenue", "నియంత్రణ, ధృవపత్రాలు & రెవెన్యూ")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "Coordinator Desk: Village Revenue Officer (VRO)",
                      "సమన్వయకర్త: గ్రామ రెవెన్యూ అధికారి",
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Caste, Income &amp; Residence certificates</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Birth &amp; Death registration approvals</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Building permissions and NOC issuance</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5 text-primary" />
                    <span>Trade licenses and revenue documentation</span>
                  </li>
                </ul>
                <div className="pt-2 border-t">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/auth">{t("Request Certificate Query", "ధృవపత్రాల విజ్ఞప్తి")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How Grievance Redressal Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("How Grama Seva Works for Citizens", "గ్రామ సేవ ఎలా పనిచేస్తుంది")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "Transparent 4-step process from filing to resolution",
                "నమోదు నుండి పరిష్కారం వరకు 4 దశల ప్రక్రియ",
              )}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ProcessStep
              step="1"
              title={t("Submit Grievance", "ఫిర్యాదు సమర్పించండి")}
              desc={t(
                "Register online or visit the Secretariat desk. You get a unique tracking code instantly.",
                "ఆన్‌లైన్ ద్వారా లేదా సచివాలయంలో నమోదు చేయండి. తక్షణమే ట్రాకింగ్ కోడ్ లభిస్తుంది.",
              )}
            />
            <ProcessStep
              step="2"
              title={t("Coordinator Assignment", "సమన్వయకర్త కేటాయింపు")}
              desc={t(
                "Auto-routed to the department coordinator for your ward (Welfare, Works, or Regulation).",
                "మీ వార్డుకు చెందిన సంబంధిత శాఖ సమన్వయకర్తకు స్వయంచాలకంగా పంపబడుతుంది.",
              )}
            />
            <ProcessStep
              step="3"
              title={t("Field Verification & Work", "క్షేత్ర పరిశీలన & పనులు")}
              desc={t(
                "Officials review on ground. Transparent messages and status updates appear in your timeline.",
                "అధికారులు క్షేత్రస్థాయిలో పరిశీలించి పనులు పూర్తి చేస్తారు, ప్రతి అప్‌డేట్ కనిపిస్తుంది.",
              )}
            />
            <ProcessStep
              step="4"
              title={t("Resolution & Citizen Rating", "పరిష్కారం & పౌరుల రేటింగ్")}
              desc={t(
                "Grievance marked resolved. Citizen rates the service quality from 1 to 5 stars.",
                "సమస్య పరిష్కరించబడిన తర్వాత, పౌరులు నాణ్యతను 1 నుండి 5 నక్షత్రాలతో రేట్ చేస్తారు.",
              )}
            />
          </div>
        </div>
      </section>

      {/* Secretariat Contact Banner */}
      <section className="border-t bg-slate-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">
              {t("Need help or have questions?", "సహాయం కావాలా లేదా సందేహాలు ఉన్నాయా?")}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {t(
                "Visit Puttagunta Village Secretariat or contact coordinators directly.",
                "పుట్టగుంట గ్రామ సచివాలయాన్ని సందర్శించండి లేదా నేరుగా అధికారులను సంప్రదించండి.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white/10"
            >
              <Link to="/faq">{t("Read FAQs", "ప్రశ్నలు & సమాధానాలు")}</Link>
            </Button>
            <Button asChild className="bg-primary text-white hover:bg-primary/90">
              <Link to="/contact">{t("Contact Us", "సంప్రదించండి")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Instant Tracker Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-sm font-bold text-primary">
                {trackResult?.complaint_code}
              </code>
              <Badge variant="outline" className="capitalize">
                {trackResult && tCategory(trackResult.category)}
              </Badge>
            </div>
            <DialogTitle className="text-xl mt-2">{trackResult?.title}</DialogTitle>
            <DialogDescription>
              {t("Official Secretariat Grievance Record", "అధికారిక సచివాలయ ఫిర్యాదు రికార్డు")}
            </DialogDescription>
          </DialogHeader>

          {trackResult && (
            <div className="space-y-4 text-sm mt-2">
              <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    {t("Current Status", "ప్రస్తుత స్థితి")}
                  </span>
                  <StatusBadge status={trackResult.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    {t("Priority", "ప్రాధాన్యత")}
                  </span>
                  <PriorityBadge priority={trackResult.priority} />
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  {t("Description", "వివరణ")}
                </span>
                <p className="mt-1 text-foreground leading-relaxed whitespace-pre-wrap text-sm bg-muted/10 p-3 rounded border">
                  {trackResult.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                <div>
                  <span className="text-muted-foreground">{t("Ward / Area", "వార్డు")}:</span>
                  <p className="font-semibold">{trackResult.ward || "Puttagunta"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("Submitted on", "నమోదైన తేదీ")}:</span>
                  <p className="font-semibold">{formatDate(trackResult.created_at)}</p>
                </div>
                {trackResult.resolved_at && (
                  <div className="col-span-2 text-emerald-600 font-semibold">
                    ✓ {t("Resolved on", "పరిష్కరించబడిన తేదీ")}:{" "}
                    {formatDate(trackResult.resolved_at)}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                  {t("Close", "మూసివేయండి")}
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">
                    {t("Log in for full details", "పూర్తి వివరాల కోసం లాగిన్ చేయండి")}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs text-white/80">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</div>
      <div className="text-[11px] text-white/70 mt-0.5">{desc}</div>
    </div>
  );
}

function ProcessStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="relative rounded-xl border border-border/70 p-6 bg-card shadow-sm hover:shadow transition">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm mb-4">
        {step}
      </div>
      <h3 className="font-bold text-base mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
