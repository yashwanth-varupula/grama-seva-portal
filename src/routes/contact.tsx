import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Send,
  CheckCircle2,
  User,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Gram Seva Portal" },
      {
        name: "description",
        content:
          "Contact the Village Secretariat Puttagunta officials, welfare coordinators, engineering assistants, and public grievance desks.",
      },
    ],
  }),
  component: ContactPage,
});

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ward, setWard] = useState("Ward 1");
  const [department, setDepartment] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return toast.error(t("Please enter your name", "దయచేసి మీ పేరును నమోదు చేయండి"));
    }
    if (!phone.trim() || phone.trim().length < 10) {
      return toast.error(
        t(
          "Please enter a valid 10-digit mobile number",
          "దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి",
        ),
      );
    }
    if (!message.trim() || message.trim().length < 10) {
      return toast.error(
        t(
          "Please describe your inquiry or feedback (minimum 10 characters)",
          "దయచేసి మీ విచారణ లేదా సందేశాన్ని వివరించండి (కనీసం 10 అక్షరాలు)",
        ),
      );
    }

    setBusy(true);
    setTimeout(() => {
      const ticketId = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedTicket(ticketId);
      setBusy(false);
      toast.success(
        t(
          `Message dispatched! Reference ID: ${ticketId}`,
          `సందేశం పంపబడింది! సూచన సంఖ్య: ${ticketId}`,
        ),
      );
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 600);
  };

  const officials = [
    {
      role: t("Panchayat Secretary (Administration)", "పంచాయతీ కార్యదర్శి (పరిపాలన)"),
      name: "Sri K. Venkateswarlu",
      phone: "+91 98765 43210",
      email: "sec.puttagunta@gramseva.in",
      hours: "9:30 AM - 5:00 PM",
    },
    {
      role: t("Welfare & Education Coordinator", "సంక్షేమ & విద్య సమన్వయకర్త"),
      name: "Smt. M. Padmavathi",
      phone: "+91 98765 43211",
      email: "welfare.coord@grameseva.local",
      hours: "10:00 AM - 4:30 PM",
    },
    {
      role: t("Engineering & Public Works Assistant", "ఇంజనీరింగ్ & ప్రజా పనుల సహాయకుడు"),
      name: "Sri B. Rajesh",
      phone: "+91 98765 43212",
      email: "dev.coord@grameseva.local",
      hours: "9:00 AM - 5:00 PM",
    },
    {
      role: t("Village Revenue Officer (VRO)", "గ్రామ రెవెన్యూ అధికారి (VRO)"),
      name: "Sri N. Srinivasa Rao",
      phone: "+91 98765 43213",
      email: "reg.coord@grameseva.local",
      hours: "10:00 AM - 5:00 PM",
    },
  ];

  return (
    <PublicShell>
      {/* Hero Banner */}
      <section
        className="text-white py-14 sm:py-18"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium backdrop-blur mb-4">
            <Building2 className="h-3.5 w-3.5 text-amber-300" />
            {t("Village Secretariat Puttagunta", "పుట్టగుంట గ్రామ సచివాలయం")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t("Contact Us & Secretariat Helpdesk", "మమ్మల్ని సంప్రదించండి & సచివాలయ సహాయ కేంద్రం")}
          </h1>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto text-base sm:text-lg">
            {t(
              "Have a query, feedback, or need official assistance? Connect directly with village coordinators or visit our office.",
              "ఏదైనా సందేహం, విజ్ఞప్తి లేదా అధికారిక సహాయం కావాలా? గ్రామ సమన్వయకర్తలను నేరుగా సంప్రదించండి లేదా మా కార్యాలయాన్ని సందర్శించండి.",
            )}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card className="shadow-md border-border/80">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t("Send a Message / General Inquiry", "సందేశం పంపండి / సాధారణ విచారణ")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "For formal grievances, please use the Grievance Portal to receive an official tracking number.",
                    "అధికారిక ఫిర్యాదుల కోసం, ట్రాకింగ్ నంబర్ పొందడానికి దయచేసి ఫిర్యాదు పోర్టల్‌ను ఉపయోగించండి.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submittedTicket && (
                  <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm">
                          {t("Inquiry Dispatched Successfully!", "మీ విచారణ విజయవంతంగా పంపబడింది!")}
                        </h4>
                        <p className="text-xs mt-1">
                          {t(
                            `Reference ID: ${submittedTicket}. Our Secretariat desk will respond within 24 working hours.`,
                            `సూచన సంఖ్య: ${submittedTicket}. మా సచివాలయ డెస్క్ 24 పని గంటలలోపు స్పందిస్తుంది.`,
                          )}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSubmittedTicket(null)}
                          className="mt-3 text-xs bg-white text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-100"
                        >
                          {t("Send another message", "మరొక సందేశం పంపండి")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name">
                        {t("Full Name", "పూర్తి పేరు")} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("e.g. Ramesh Kumar", "ఉదా: రమేష్ కుమార్")}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="contact-phone">
                        {t("Mobile Number", "మొబైల్ సంఖ్య")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-ward">{t("Ward / Area", "వార్డు / ప్రాంతం")}</Label>
                      <Select value={ward} onValueChange={setWard}>
                        <SelectTrigger id="contact-ward">
                          <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => `Ward ${i + 1}`).map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="contact-dept">{t("Department", "శాఖ")}</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger id="contact-dept">
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            {t("General Inquiry / Administration", "సాధారణ విచారణ / పరిపాలన")}
                          </SelectItem>
                          <SelectItem value="welfare">
                            {t("Welfare & Pensions Desk", "సంక్షేమం & పింఛన్ల డెస్క్")}
                          </SelectItem>
                          <SelectItem value="development">
                            {t("Development, Water & Works", "అభివృద్ధి, నీరు & పనులు")}
                          </SelectItem>
                          <SelectItem value="regulation">
                            {t(
                              "Regulation, Certificates & Revenue",
                              "నియంత్రణ, ధృవపత్రాలు & రెవెన్యూ",
                            )}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-subject">{t("Subject", "విషయం")}</Label>
                    <Input
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={t("Brief reason for contact", "సంప్రదించడానికి సంక్షిప్త కారణం")}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contact-message">
                      {t("Your Message / Inquiry", "మీ సందేశం / విచారణ")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t(
                        "Please describe your inquiry, question, or feedback in detail…",
                        "దయచేసి మీ విచారణ, ప్రశ్న లేదా అభిప్రాయాన్ని వివరంగా తెలియజేయండి…",
                      )}
                      required
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={busy}
                      className="w-full sm:w-auto min-w-[160px]"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {busy ? t("Sending…", "పంపుతోంది…") : t("Submit Message", "సందేశం పంపండి")}
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link to="/auth">
                        {t("File Official Grievance", "అధికారిక ఫిర్యాదు నమోదు చేయండి")}
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Office Location, Hours & Emergency */}
          <div className="lg:col-span-5 space-y-6">
            {/* Office Info Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-rose-600" />
                  {t("Secretariat Location & Hours", "సచివాలయ స్థానం & పనివేళలు")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("Official Office Address", "కార్యాలయ చిరునామా")}
                  </div>
                  <p className="mt-1 font-medium text-foreground leading-relaxed">
                    Village &amp; Ward Secretariat,
                    <br />
                    Grama Panchayat Bhavan, Main Road,
                    <br />
                    Puttagunta, Andhra Pradesh — 521301
                  </p>
                </div>

                <div className="border-t pt-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("Working Timings", "పని వేళలు")}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Monday - Saturday: 9:00 AM - 5:00 PM</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Closed on Sundays &amp; Gazetted Holidays)
                  </p>
                </div>

                <div className="border-t pt-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("Helpdesk Email", "హెల్ప్‌డెస్క్ ఇమెయిల్")}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-primary font-medium">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:support@gramseva.in" className="hover:underline">
                      support@gramseva.in
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency & Government Helplines */}
            <Card className="shadow-sm border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  {t("Official 24/7 Helplines", "అధికారిక 24/7 హెల్ప్‌లైన్లు")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border">
                  <div>
                    <div className="font-semibold text-foreground">1902</div>
                    <div className="text-muted-foreground">
                      Chief Minister Office Public Grievances
                    </div>
                  </div>
                  <a href="tel:1902" className="text-xs font-semibold text-primary hover:underline">
                    Call
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border">
                  <div>
                    <div className="font-semibold text-foreground">112</div>
                    <div className="text-muted-foreground">
                      National Emergency All-in-One Helpline
                    </div>
                  </div>
                  <a href="tel:112" className="text-xs font-semibold text-primary hover:underline">
                    Call
                  </a>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border">
                  <div>
                    <div className="font-semibold text-foreground">104 / 108</div>
                    <div className="text-muted-foreground">
                      Free Medical Health &amp; Ambulance Services
                    </div>
                  </div>
                  <a href="tel:108" className="text-xs font-semibold text-primary hover:underline">
                    Call
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Directory of Secretariat Key Officials */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {t(
                "Secretariat Officers & Coordinators Directory",
                "సచివాలయ అధికారుల & సమన్వయకర్తల డైరెక్టరీ",
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t(
                "Direct contact points for department-level grievances and administrative coordination in Puttagunta.",
                "పుట్టగుంటలోని శాఖల వారీగా ఫిర్యాదులు మరియు పరిపాలనా సమన్వయానికి సంప్రదించవలసిన ముఖ్య అధికారులు.",
              )}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {officials.map((officer) => (
              <Card key={officer.role} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{officer.name}</h3>
                    <p className="text-xs font-medium text-primary mt-0.5">{officer.role}</p>
                  </div>
                  <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      <a href={`tel:${officer.phone}`} className="hover:underline">
                        {officer.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-sky-600" />
                      <span className="truncate">{officer.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>{officer.hours}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
