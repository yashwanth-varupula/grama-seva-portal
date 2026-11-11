import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Bell, Palette, Globe2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [emailNotif, setEmailNotif] = useState(true);
  const [escalationNotif, setEscalationNotif] = useState(true);
  const [slaDays, setSlaDays] = useState(7);

  useEffect(() => {
    try {
      const t = localStorage.getItem("gs.theme") as "light" | "dark" | null;
      if (t) setTheme(t);
      const en = localStorage.getItem("gs.notif.email");
      if (en !== null) setEmailNotif(en === "true");
      const ee = localStorage.getItem("gs.notif.escalation");
      if (ee !== null) setEscalationNotif(ee === "true");
      const sd = localStorage.getItem("gs.sla");
      if (sd) setSlaDays(Number(sd));
    } catch (err) {
      // localStorage may throw in private browsing or SSR — safe to ignore; defaults apply.
      console.warn("Could not read settings from localStorage", err);
    }
  }, []);

  function save() {
    try {
      if (theme === "light" || theme === "dark") {
        localStorage.setItem("gs.theme", theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      } else {
        localStorage.removeItem("gs.theme");
      }
      localStorage.setItem("gs.notif.email", String(emailNotif));
      localStorage.setItem("gs.notif.escalation", String(escalationNotif));
      localStorage.setItem("gs.sla", String(slaDays));
      toast.success(t("Settings saved", "సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి"));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{t("Settings")}</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {t("Customize your admin experience.", "మీ అడ్మిన్ అనుభవాన్ని కస్టమైజ్ చేయండి.")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" /> {t("Profile")}
          </CardTitle>
          <CardDescription>{t("Signed in as", "లాగిన్ అయ్యారు")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("Email")}</Label>
            <Input value={user?.email ?? ""} disabled readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>{t("Role")}</Label>
            <Input value={t("Super Admin")} disabled readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" /> {t("Appearance", "అలంకరణ")}
          </CardTitle>
          <CardDescription>{t("Theme and language.", "థీమ్ మరియు భాష.")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("Theme", "థీమ్")}</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("Light", "లైట్")}</SelectItem>
                <SelectItem value="dark">{t("Dark", "డార్క్")}</SelectItem>
                <SelectItem value="system">{t("System", "సిస్టమ్")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" /> {t("Language", "భాష")}
            </Label>
            <Select value={lang} onValueChange={(v) => setLang(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> {t("Notifications")}
          </CardTitle>
          <CardDescription>
            {t("Choose which alerts you want.", "మీకు ఏ హెచ్చరికలు కావాలో ఎంచుకోండి.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">
                {t("Email notifications", "ఇమెయిల్ నోటిఫికేషన్‌లు")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("Get summaries by email.", "ఇమెయిల్ ద్వారా సారాంశాలను పొందండి.")}
              </p>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">{t("Escalation alerts", "ఎస్కలేషన్ హెచ్చరికలు")}</Label>
              <p className="text-xs text-muted-foreground">
                {t(
                  "Notify when complaints breach SLA.",
                  "ఫిర్యాదులు SLA ఉల్లంఘించినప్పుడు తెలియజేయండి.",
                )}
              </p>
            </div>
            <Switch checked={escalationNotif} onCheckedChange={setEscalationNotif} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Escalation rule", "ఎస్కలేషన్ నియమం")}</CardTitle>
          <CardDescription>
            {t(
              "Auto-escalate complaints unresolved beyond this many days.",
              "ఇన్ని రోజుల తర్వాత పరిష్కరించని ఫిర్యాదులను స్వయంచాలకంగా ఎస్కలేట్ చేయండి.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("SLA in days", "SLA రోజులు")}</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={slaDays}
              onChange={(e) => setSlaDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
              data-testid="settings-sla-input"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} data-testid="settings-save">
          <Save className="mr-2 h-4 w-4" /> {t("Save", "సేవ్ చేయండి")}
        </Button>
      </div>
    </div>
  );
}
