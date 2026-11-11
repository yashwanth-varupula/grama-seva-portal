import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  CATEGORIES,
  PRIORITIES,
  suggestCategory,
  type Category,
  type Priority,
} from "@/lib/complaints";
import { Loader2, Sparkles, Paperclip, X, CheckCircle, FileText, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/complaints/new")({
  head: () => ({ meta: [{ title: "Raise a complaint — Gram Seva Portal" }] }),
  component: NewComplaint,
});

export default function NewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tCategory, tPriority } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("welfare");
  const [priority, setPriority] = useState<Priority>("medium");
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState("Ward 1");
  const [phone, setPhone] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const suggestion = suggestCategory(title + " " + description);

  const templates = [
    {
      label: t("Drinking Water Leakage", "తాగునీటి పైపులైన్ లీకేజీ"),
      category: "development" as Category,
      priority: "high" as Priority,
      title: "Drinking water pipeline leak on Main Road",
      desc: "Drinking water pipeline is leaking continuously near the transformer, leading to low water pressure in households and water stagnation on the road.",
      loc: "Near Transformer, Main Road",
    },
    {
      label: t("Streetlight Not Working", "వీధి దీపం వెలగడం లేదు"),
      category: "development" as Category,
      priority: "medium" as Priority,
      title: "Streetlights not functioning on North Street",
      desc: "Two streetlights on North Street have been non-functional for the past 4 days, causing safety concerns for women and elderly walking at night.",
      loc: "North Street, Pole #14 & #15",
    },
    {
      label: t("Pension Disbursement Issue", "పింఛన్ పంపిణీ సమస్య"),
      category: "welfare" as Category,
      priority: "high" as Priority,
      title: "Old age pension disbursement verification pending",
      desc: "Biometric authentication failed during volunteer visit for monthly pension. Requesting coordinator visit or iris scan verification.",
      loc: "House No 2-45, Ward 4",
    },
    {
      label: t("Drainage Clearance", "డ్రైనేజీ పూడికతీత అవసరం"),
      category: "development" as Category,
      priority: "medium" as Priority,
      title: "Clogged drainage canal causing overflow",
      desc: "Open drain canal is blocked with silt and plastic debris, causing foul smell and overflow during rain. Sanitation team clearance required.",
      loc: "Ramalayam Street",
    },
    {
      label: t("Caste / Income Certificate Delay", "కుల / ఆదాయ ధృవపత్రం ఆలస్యం"),
      category: "regulation" as Category,
      priority: "medium" as Priority,
      title: "Application for Income Certificate pending past SLA",
      desc: "Applied for income certificate for scholarship purposes 10 days ago. Application number #AP-INC-89421. Requesting VRO endorsement.",
      loc: "Village Secretariat Puttagunta",
    },
  ];

  const applyTemplate = (tmpl: (typeof templates)[0]) => {
    setTitle(tmpl.title);
    setDescription(tmpl.desc);
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
    setLocation(tmpl.loc);
    toast.info(t("Template applied! You can customize details below.", "నమూనా వర్తింపజేయబడింది!"));
  };

  const handleSimulateAttachment = () => {
    if (attachments.length >= 3) {
      return toast.warning(t("Maximum 3 attachments allowed.", "గరిష్టంగా 3 ఫైళ్లు మాత్రమే."));
    }
    const sampleNames = ["site_photo.jpg", "ration_card_copy.pdf", "secretariat_receipt.png"];
    const nextFile = sampleNames[attachments.length % sampleNames.length];
    setAttachments([...attachments, nextFile]);
    toast.success(`${t("Attached", "జతచేయబడింది")}: ${nextFile}`);
  };

  const removeAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (title.trim().length < 5)
      return toast.error(t("Title is too short", "శీర్షిక చాలా చిన్నది"));
    if (description.trim().length < 10)
      return toast.error(
        t("Please describe the issue (10+ chars)", "దయచేసి సమస్యను వివరించండి (10+ అక్షరాలు)"),
      );
    setBusy(true);
    const payload = {
      citizen_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      location: location.trim() || null,
      ward: ward.trim() || null,
      contact_phone: phone.trim() || null,
      status: "submitted" as const,
      complaint_code: "",
    };
    const { data, error } = await supabase
      .from("complaints")
      .insert(payload)
      .select("id, complaint_code")
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("Complaint submitted", "ఫిర్యాదు సమర్పించబడింది") + `: ${data.complaint_code}`);
    navigate({ to: "/complaints/$id", params: { id: data.id } });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("Raise a Grievance", "ఫిర్యాదు నమోదు చేయండి")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t(
            "It will be auto-assigned to your Ward Department Coordinator with strict SLA tracking.",
            "ఇది సంబంధిత వార్డు శాఖ సమన్వయకర్తకు గడువు ట్రాకింగ్‌తో స్వయంచాలకంగా కేటాయించబడుతుంది.",
          )}
        </p>
      </div>

      {/* Quick Templates Bar */}
      <Card className="border-border/80 bg-muted/20">
        <CardContent className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Zap className="h-4 w-4" />
            <span>
              {t(
                "Quick Issue Presets (Click to autofill):",
                "త్వరిత సమస్యల నమూనాలు (ఆటోఫిల్ చేయడానికి క్లిక్ చేయండి):",
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {templates.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="shrink-0 rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition shadow-xs cursor-pointer touch-manipulation"
              >
                + {tmpl.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t("Complaint Details", "ఫిర్యాదు వివరాలు")}</CardTitle>
          <CardDescription>
            {t(
              "Provide clear information to help our coordinators resolve it quickly.",
              "త్వరిత పరిష్కారం కోసం స్పష్టమైన సమాచారాన్ని అందించండి.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                {t("Grievance Title", "ఫిర్యాదు శీర్షిక")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(
                  "e.g. Drinking water pipeline leak near Temple Street",
                  "ఉదా: గుడి వీధిలో తాగునీటి పైపులైన్ లీకేజీ",
                )}
                required
                maxLength={200}
                lang="te"
                className="text-base sm:text-sm h-11 sm:h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description">
                {t("Detailed Description", "వివరణాత్మక వివరణ")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "Explain the issue clearly, mentioning any specific landmarks, impact on residents, or how long it has been unresolved…",
                  "సమస్యను వివరంగా వివరించండి, ఎంతకాలంగా ఈ సమస్య ఉంది మరియు ప్రభావిత ప్రాంతాన్ని పేర్కొనండి…",
                )}
                required
                rows={5}
                maxLength={2000}
                lang="te"
                className="text-base sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                {t(
                  "You can type in Telugu or English.",
                  "మీరు తెలుగు లేదా ఇంగ్లీష్‌లో టైప్ చేయవచ్చు.",
                )}
              </p>
              {suggestion && suggestion !== category && (
                <button
                  type="button"
                  onClick={() => setCategory(suggestion)}
                  className="inline-flex items-center gap-1.5 text-xs text-info hover:underline cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />{" "}
                  {t("Suggested category", "సూచించబడిన విభాగం")}: {tCategory(suggestion)} —{" "}
                  {t("apply", "వర్తింపజేయండి")}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div className="space-y-1.5">
                <Label>{t("Department Category", "శాఖ విభాగం")}</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {tCategory(c.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label>{t("Priority Level", "ప్రాధాన్యత స్థాయి")}</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
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
              </div>

              {/* Ward Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="ward">{t("Ward / Secretariat Area", "వార్డు పరిధి")}</Label>
                <Select value={ward} onValueChange={setWard}>
                  <SelectTrigger id="ward">
                    <SelectValue placeholder="Select Ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => `Ward ${i + 1}`).map((w) => (
                      <SelectItem key={w} value={w}>
                        {w} (Puttagunta)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  {t("Contact Phone for Updates", "సంప్రదింపు ఫోన్ నంబర్")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  maxLength={20}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="location">
                  {t("Specific Location / Landmark", "నిర్దిష్ట ప్రదేశం / ల్యాండ్‌మార్క్")}
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t(
                    "e.g. Near Water Tank, Beside Primary School, Pole #12",
                    "ఉదా: నీళ్ల ట్యాంకు దగ్గర, ప్రాథమిక పాఠశాల పక్కన",
                  )}
                  maxLength={200}
                  lang="te"
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4" />
                    {t("Photos / Supporting Documents", "ఫోటోలు / సహాయక పత్రాలు")}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {t(
                      "Attach photos of on-ground issue or application receipts (optional).",
                      "సమస్య ఫోటోలు లేదా దరఖాస్తు కాపీలు జతచేయండి (ఐచ్ఛికం).",
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSimulateAttachment}
                  className="text-xs"
                >
                  + {t("Add Attachment", "ఫైల్ జతచేయండి")}
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => history.back()}
                className="h-11 sm:h-10"
              >
                {t("Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="w-full sm:w-auto min-w-[140px] h-11 sm:h-10 font-semibold"
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("Submit Grievance", "ఫిర్యాదు సమర్పించండి")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
