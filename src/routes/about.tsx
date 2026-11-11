import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Phone,
  GraduationCap,
  HardHat,
  ScrollText,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Landmark,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Village & Ward Secretariat Gram Seva" },
      {
        name: "description",
        content:
          "Learn about Puttagunta Village & Ward Secretariat, our citizen charter, department coordinators, and public grievance resolution mission.",
      },
    ],
  }),
  component: AboutPage,
});

export default function AboutPage() {
  const { t } = useLanguage();

  const citizenCharter = [
    {
      category: t("Welfare", "సంక్షేమం"),
      service: t("Pensions & Ration Card Corrections", "పింఛన్లు & రేషన్ కార్డు సవరణలు"),
      sla: "3 - 7 Days",
      officer: "Welfare Coordinator",
    },
    {
      category: t("Development", "అభివృద్ధి"),
      service: t("Drinking Water Supply & Pipe Repair", "తాగునీటి సరఫరా & పైపులైన్ మరమ్మతులు"),
      sla: "24 - 48 Hours",
      officer: "Engineering Assistant",
    },
    {
      category: t("Development", "అభివృద్ధి"),
      service: t("Streetlight Outages & Replacement", "వీధి దీపాల మరమ్మతులు & మార్పిడి"),
      sla: "24 - 48 Hours",
      officer: "Engineering Assistant",
    },
    {
      category: t("Development", "అభివృద్ధి"),
      service: t("Drainage Clearance & Sanitation", "డ్రైనేజీ పూడికతీత & పారిశుధ్యం"),
      sla: "24 Hours",
      officer: "Sanitation Coordinator",
    },
    {
      category: t("Regulation", "నియంత్రణ"),
      service: t("Caste, Income & Residence Certificates", "కుల, ఆదాయ & నివాస ధృవపత్రాలు"),
      sla: "3 - 5 Days",
      officer: "Village Revenue Officer (VRO)",
    },
    {
      category: t("Regulation", "నియంత్రణ"),
      service: t("Birth & Death Registration", "జనన & మరణ ధృవీకరణ పత్రాలు"),
      sla: "7 Days",
      officer: "Panchayat Secretary",
    },
  ];

  return (
    <PublicShell>
      {/* Hero Section */}
      <section
        className="text-white py-14 sm:py-20"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur mb-4">
            <Landmark className="h-4 w-4 text-amber-300" />
            {t("Village & Ward Secretariat System", "గ్రామ & వార్డు సచివాలయ వ్యవస్థ")}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t("About Grama Seva Portal", "గ్రామ సేవ పోర్టల్ గురించి")}
          </h1>
          <p className="mt-4 text-primary-foreground/85 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {t(
              "Bridging governance to citizen doorsteps. Empowering the people of Puttagunta Grama Panchayat with transparent, responsive, and time-bound public services.",
              "పాలనను పౌరుల ముంగిటకు చేర్చడం. పారదర్శక, జవాబుదారీ మరియు సమయపాలనతో కూడిన ప్రజా సేవలతో పుట్టగుంట గ్రామ ప్రజలకు సాధికారత కల్పించడం.",
            )}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Mission & Vision */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary mb-2">
                <Target className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{t("Our Mission", "మా లక్ష్యం")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "To deliver every government service and resolve every citizen grievance at the grassroots level within defined SLAs. By employing specialized department coordinators across Welfare, Development, and Regulation, the Secretariat ensures direct accountability.",
                "ప్రభుత్వ సేవలను మరియు పౌరుల ప్రతి ఫిర్యాదును నిర్దేశిత గడువులోపు పరిష్కరించడం. సంక్షేమం, అభివృద్ధి మరియు నియంత్రణ విభాగాలలో ప్రత్యేక సమన్వయకర్తల ద్వారా నేరుగా జవాబుదారీతనం కల్పించడం.",
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                <Eye className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{t("Our Vision", "మా దార్శనికత")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              {t(
                "A digitally empowered, fully transparent village community where every citizen's voice is heard, complaints are tracked publicly, and corruption or delay is eliminated through public oversight and real-time analytics.",
                "డిజిటల్ సాధికారత కలిగిన, పూర్తి పారదర్శక గ్రామీణ సమాజం — ఇక్కడ ప్రతి పౌరుడి గొంతు వినబడుతుంది, ఫిర్యాదులు బహిరంగంగా ట్రాక్ చేయబడతాయి, మరియు ప్రజా పర్యవేక్షణ ద్వారా జాప్యం నిర్మూలించబడుతుంది.",
              )}
            </CardContent>
          </Card>
        </div>

        {/* Citizen Charter & SLA Commitments */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("Citizen Charter & SLA Commitments", "పౌర సేవల పత్రం & గడువుల ప్రమాణాలు")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Mandatory timeframes established by the Government of Andhra Pradesh for village grievance redressal.",
                "ఆంధ్రప్రదేశ్ ప్రభుత్వం నిర్దేశించిన గ్రామ సచివాలయ సేవల గడువులు.",
              )}
            </p>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase font-semibold text-muted-foreground border-b">
                  <tr>
                    <th className="p-3.5 sm:px-6">{t("Department", "శాఖ")}</th>
                    <th className="p-3.5 sm:px-6">
                      {t("Service / Grievance Type", "సేవ / ఫిర్యాదు రకం")}
                    </th>
                    <th className="p-3.5 sm:px-6">{t("Maximum SLA", "గరిష్ట గడువు")}</th>
                    <th className="p-3.5 sm:px-6">
                      {t("Responsible Official", "బాధ్యతాయుత అధికారి")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {citizenCharter.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="p-3.5 sm:px-6 font-semibold text-primary">{item.category}</td>
                      <td className="p-3.5 sm:px-6">{item.service}</td>
                      <td className="p-3.5 sm:px-6 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {item.sla}
                      </td>
                      <td className="p-3.5 sm:px-6 text-muted-foreground">{item.officer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("Our Core Principles", "మా మూల సూత్రాలు")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: t("Accountability", "జవాబుదారీతనం"),
                desc: t(
                  "Every grievance has a dedicated owner and timestamped trail.",
                  "ప్రతి ఫిర్యాదుకు ఒక బాధ్యతాయుత అధికారి ఉంటారు.",
                ),
              },
              {
                title: t("Open Transparency", "బహిరంగ పారదర్శకత"),
                desc: t(
                  "Aggregated status and resolution metrics visible to all citizens.",
                  "మొత్తం గణాంకాలు అందరికీ బహిరంగంగా కనిపిస్తాయి.",
                ),
              },
              {
                title: t("Speed & Responsiveness", "వేగవంతమైన స్పందన"),
                desc: t(
                  "Auto-escalation rules when issues exceed 7 days without resolution.",
                  "7 రోజులు దాటిన సమస్యలకు స్వయంచాలక ఎస్కలేషన్.",
                ),
              },
              {
                title: t("Citizen Feedback", "పౌరుల అభిప్రాయం"),
                desc: t(
                  "Direct 5-star ratings and written feedback directly reviewable by Admins.",
                  "పౌరుల రేటింగ్‌లను అడ్మిన్లు నిరంతరం సమీక్షిస్తారు.",
                ),
              },
              {
                title: t("Bilingual Accessibility", "ద్విభాషా సౌలభ్యం"),
                desc: t(
                  "Full Telugu and English native support across all modules.",
                  "తెలుగు మరియు ఆంగ్లంలో సులభమైన ఉపయోగం.",
                ),
              },
              {
                title: t("Direct Digital Tracking", "ప్రత్యక్ష డిజిటల్ ట్రాకింగ్"),
                desc: t(
                  "Track complaint status instantly with just a code, without logging in.",
                  "లాగిన్ అవసరం లేకుండా కోడ్ ద్వారా నేరుగా ట్రాక్ చేయవచ్చు.",
                ),
              },
            ].map((v, i) => (
              <Card key={i} className="border-border/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{v.title}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border bg-muted/40 p-8 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-bold">
            {t("Have a grievance or service request?", "ఫిర్యాదు లేదా సేవ విజ్ఞప్తి ఉందా?")}
          </h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-lg mx-auto">
            {t(
              "Log into the citizen portal to register a complaint and track it through every stage.",
              "ఫిర్యాదు నమోదు చేయడానికి మరియు ప్రతి దశను ట్రాక్ చేయడానికి పౌర పోర్టల్‌లోకి లాగిన్ చేయండి.",
            )}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild>
              <Link to="/auth">{t("Raise a complaint", "ఫిర్యాదు చేయండి")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">{t("Contact Us", "సంప్రదించండి")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
