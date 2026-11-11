import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  HelpCircle,
  ShieldCheck,
  FileText,
  Phone,
  UserRound,
  Search,
  ChevronDown,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ & Help Center — Gram Seva Portal" },
      {
        name: "description",
        content:
          "Frequently asked questions about filing grievances, tracking status, coordinator duties, and village secretariat services.",
      },
    ],
  }),
  component: FAQPage,
});

export default function FAQPage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const faqs = [
    {
      category: "complaints",
      q: t("How do I raise a complaint online?", "ఆన్‌లైన్‌లో ఫిర్యాదు ఎలా నమోదు చేయాలి?"),
      a: t(
        "Click on 'Sign In / Register' to log into your citizen account. Then select 'Raise Grievance', choose the category (Welfare, Development, or Regulation), provide details and location, and submit. You will instantly receive a complaint tracking code (e.g. WEL-001).",
        "'లాగిన్ / నమోదు' పై క్లిక్ చేసి మీ ఖాతాలోకి ప్రవేశించండి. తర్వాత 'ఫిర్యాదు చేయండి' పై క్లిక్ చేసి, సంబంధిత విభాగాన్ని ఎంచుకుని వివరాలు అందించండి. వెంటనే మీకు ఒక ట్రాకింగ్ కోడ్ (ఉదా: WEL-001) వస్తుంది.",
      ),
    },
    {
      category: "tracking",
      q: t(
        "Can I track a complaint without logging in?",
        "లాగిన్ అవ్వకుండా ఫిర్యాదును ట్రాక్ చేయవచ్చా?",
      ),
      a: t(
        "Yes! On the Home page, enter your complaint code (e.g. DEV-002) in the Instant Grievance Tracker box and click 'Track Status'. You will immediately see its real-time stage, department, and resolution timeline.",
        "అవును! హోమ్ పేజీలోని 'తక్షణ ఫిర్యాదు ట్రాకర్' బాక్స్‌లో మీ ఫిర్యాదు సంఖ్య (ఉదా: DEV-002) నమోదు చేసి 'స్థితి చూడండి' పై క్లిక్ చేయండి. పూర్తి వివరాలు కనిపిస్తాయి.",
      ),
    },
    {
      category: "sla",
      q: t("What is the resolution timeframe (SLA)?", "ఫిర్యాదు పరిష్కార గడువు (SLA) ఎంత?"),
      a: t(
        "Urgent drinking water and sanitation issues are addressed within 24-48 hours. Social welfare and certificates are resolved within 3 to 7 working days. If any complaint remains unresolved past 7 days, it is automatically escalated to Super Admin.",
        "తాగునీరు మరియు పారిశుధ్య సమస్యలు 24-48 గంటల్లో పరిష్కరించబడతాయి. సంక్షేమ పథకాలు మరియు ధృవపత్రాలు 3 నుండి 7 పని దినాల్లో పరిష్కరిస్తారు. 7 రోజులు దాటితే ఆటోమేటిక్‌గా ఉన్నతాధికారులకు ఎస్కలేట్ అవుతుంది.",
      ),
    },
    {
      category: "coordinators",
      q: t("Who handles my grievance?", "నా ఫిర్యాదును ఎవరు పరిష్కరిస్తారు?"),
      a: t(
        "Complaints are routed to dedicated coordinators based on category: Welfare issues go to the Welfare Assistant, public works go to the Engineering Assistant, and certificate/revenue issues go to the Village Revenue Officer (VRO).",
        "సంబంధిత విభాగానికి చెందిన సమన్వయకర్తలు పరిష్కరిస్తారు: సంక్షేమ సమస్యలను సంక్షేమ సహాయకుడు, ప్రజా పనులను ఇంజనీరింగ్ అసిస్టెంట్, మరియు ధృవపత్రాల సమస్యలను VRO పరిశీలిస్తారు.",
      ),
    },
    {
      category: "feedback",
      q: t("Can I rate the resolution quality?", "పరిష్కారం తర్వాత రేటింగ్ ఇవ్వవచ్చా?"),
      a: t(
        "Yes. Once your complaint is marked 'Resolved', you can give a 1-to-5 star rating and optional comments. This feedback directly influences coordinator performance reviews.",
        "అవును. ఫిర్యాదు 'పరిష్కరించబడింది' అని మారిన తర్వాత, మీరు 1 నుండి 5 నక్షత్రాల రేటింగ్ మరియు అభిప్రాయాన్ని నమోదు చేయవచ్చు.",
      ),
    },
    {
      category: "complaints",
      q: t("What documents are needed to file a complaint?", "ఫిర్యాదు చేయడానికి ఏ పత్రాలు అవసరం?"),
      a: t(
        "No complex documentation is mandatory for initial filing. You only need to describe the issue and provide your location/ward and contact number. If supporting photos or documents are relevant, you may mention them in the description or messages.",
        "ప్రాథమిక నమోదుకు క్లిష్టమైన పత్రాలు అవసరం లేదు. సమస్య వివరణ, మీ వార్డు మరియు ఫోన్ నంబర్ సరిపోతాయి.",
      ),
    },
    {
      category: "sla",
      q: t(
        "What happens if my complaint is delayed or rejected?",
        "ఫిర్యాదు ఆలస్యమైతే లేదా తిరస్కరించబడితే ఏమి చేయాలి?",
      ),
      a: t(
        "If unresolved after 7 days, the system marks it as Escalated. If a complaint is rejected, the coordinator must provide a clear reason in the timeline. You can reopen the complaint or message the coordinator directly from the complaint page.",
        "7 రోజులు దాటితే సిస్టమ్ స్వయంచాలకంగా ఎస్కలేట్ చేస్తుంది. తిరస్కరించబడితే సమన్వయకర్త స్పష్టమైన కారణం తెలపాలి. మీరు ఫిర్యాదు పేజీ నుండి నేరుగా సందేశం పంపవచ్చు.",
      ),
    },
    {
      category: "coordinators",
      q: t("Where is the Secretariat office located?", "సచివాలయ కార్యాలయం ఎక్కడ ఉంది?"),
      a: t(
        "Village Secretariat Bhavan, Main Road, Puttagunta Panchayat, Andhra Pradesh. Office hours are Monday through Saturday, 9:00 AM to 5:00 PM.",
        "గ్రామ సచివాలయ భవనం, మెయిన్ రోడ్, పుట్టగుంట పంచాయతీ. పని వేళలు సోమవారం నుండి శనివారం వరకు ఉదయం 9:00 నుండి సాయంత్రం 5:00 వరకు.",
      ),
    },
  ];

  const categories = [
    { key: "all", label: t("All Questions", "అన్ని ప్రశ్నలు") },
    { key: "complaints", label: t("Filing Grievances", "ఫిర్యాదుల నమోదు") },
    { key: "tracking", label: t("Tracking & Status", "ట్రాకింగ్ & స్థితి") },
    { key: "sla", label: t("SLAs & Escalation", "గడువులు & ఎస్కలేషన్") },
    { key: "coordinators", label: t("Coordinators & Office", "సమన్వయకర్తలు & కార్యాలయం") },
    { key: "feedback", label: t("Feedback & Ratings", "అభిప్రాయం & రేటింగ్‌లు") },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchSearch =
      !searchTerm || (faq.q + " " + faq.a).toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <PublicShell>
      {/* Hero Section */}
      <section
        className="text-white py-14 sm:py-20"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur mb-4">
            <HelpCircle className="h-4 w-4 text-amber-300" />
            {t("Knowledge Base & Helpdesk", "సహాయ కేంద్రం & సమాచార నిధి")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t("Frequently Asked Questions", "తరచుగా అడిగే ప్రశ్నలు")}
          </h1>
          <p className="mt-4 text-primary-foreground/85 max-w-2xl mx-auto text-base sm:text-lg">
            {t(
              "Find quick answers about filing complaints, SLAs, secretariats, and coordinator support.",
              "ఫిర్యాదుల నమోదు, గడువులు, సచివాలయ సేవలు మరియు అధికారుల వివరాలపై శీఘ్ర సమాధానాలు.",
            )}
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t(
                  "Search keywords (e.g. tracking, pensions, water, SLA)…",
                  "శోధించండి (ఉదా: ట్రాకింగ్, పింఛన్, నీరు, SLA)…",
                )}
                className="pl-10 h-11 bg-white text-slate-900 placeholder:text-slate-500 border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat.key
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-card">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">
              {t("No matching questions found", "ఎటువంటి ప్రశ్నలు కనుగొనబడలేదు")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Try adjusting your search terms or select another category.",
                "శోధన పదాలను మార్చండి లేదా మరొక వర్గాన్ని ఎంచుకోండి.",
              )}
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-xl px-5 py-1 bg-card shadow-sm hover:shadow transition"
              >
                <AccordionTrigger className="text-left font-semibold text-base py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {index + 1}
                    </span>
                    <span>{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-9 pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Helpdesk Contact Banner */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">
              {t("Still have questions?", "ఇంకా సందేహాలు ఉన్నాయా?")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(
                "Our village secretariat helpdesk is available to assist you.",
                "మా గ్రామ సచివాలయ సహాయ కేంద్రం మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది.",
              )}
            </p>
          </div>
          <Button asChild>
            <Link to="/contact">{t("Contact Helpdesk", "హెల్ప్‌డెస్క్‌ని సంప్రదించండి")}</Link>
          </Button>
        </div>
      </div>
    </PublicShell>
  );
}
