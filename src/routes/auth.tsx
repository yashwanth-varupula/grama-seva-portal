import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Landmark,
  Loader2,
  ArrowLeft,
  Globe2,
  ShieldAlert,
  UserCheck,
  Crown,
  HardHat,
  HeartHandshake,
  ScrollText,
  User,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/use-language";
import type { AppRole } from "@/lib/complaints";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Gram Seva Portal" },
      { name: "description", content: "Sign in or create a citizen account on Gram Seva Portal." },
    ],
  }),
  component: AuthPage,
});

export default function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const roles = (roleData ?? []).map((r) => r.role as AppRole);
      if (roles.includes("super_admin")) {
        navigate({ to: "/admin", replace: true });
      } else if (roles.some((r) => r.endsWith("_coordinator"))) {
        navigate({ to: "/coordinator", replace: true });
      } else {
        navigate({ to: "/dashboard", replace: true });
      }
    });
  }, [navigate]);

  async function handleLogin(userEmail: string, userPass: string) {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPass,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("Welcome back", "తిరిగి స్వాగతం"));

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
    const roles = (roleData ?? []).map((r) => r.role as AppRole);
    const isCoordinator = roles.some((r) => r.endsWith("_coordinator"));
    const isSuperAdmin = roles.includes("super_admin");

    if (isSuperAdmin) {
      window.location.href = "/admin";
    } else if (isCoordinator) {
      window.location.href = "/coordinator";
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: String(f.get("email")),
      password: String(f.get("password")),
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: String(f.get("full_name") ?? "") },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(
      t(
        "Account created. You can sign in now.",
        "ఖాతా సృష్టించబడింది. మీరు ఇప్పుడు లాగిన్ అవ్వవచ్చు.",
      ),
    );
  }

  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setBusy(false);
      toast.error(t("Google sign-in failed", "Google లాగిన్ విఫలమైంది"));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  const quickLogins = [
    {
      role: t("Super Admin", "సూపర్ అడ్మిన్"),
      email: "yashwanthvarupula@gmail.com",
      pass: "yashwanth56",
      icon: Crown,
      badgeCls:
        "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300",
    },
    {
      role: t("Welfare Coordinator", "సంక్షేమ సమన్వయకర్త"),
      email: "welfare.coord@grameseva.local",
      pass: "DemoPass!234",
      icon: HeartHandshake,
      badgeCls: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      role: t("Development Coordinator", "అభివృద్ధి సమన్వయకర్త"),
      email: "dev.coord@grameseva.local",
      pass: "DemoPass!234",
      icon: HardHat,
      badgeCls:
        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      role: t("Regulation Coordinator", "నియంత్రణ సమన్వయకర్త"),
      email: "reg.coord@grameseva.local",
      pass: "DemoPass!234",
      icon: ScrollText,
      badgeCls:
        "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      role: t("Citizen (Likitha)", "పౌరురాలు (లిఖిత)"),
      email: "peddireddylikitha321@gmail.com",
      pass: "yashwanth",
      icon: User,
      badgeCls: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300",
    },
    {
      role: t("Citizen (Asha Devi)", "పౌరురాలు (ఆశా దేవి)"),
      email: "asha.devi@grameseva.local",
      pass: "DemoPass!234",
      icon: User,
      badgeCls:
        "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
    },
  ];

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Left Hero Panel */}
      <div
        className="relative hidden flex-col justify-between p-10 text-primary-foreground lg:flex"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-white/10 backdrop-blur">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-tight">
              {t("Gram Seva Portal", "గ్రామ సేవ పోర్టల్")}
            </div>
            <div className="text-xs text-primary-foreground/75">
              {t("Puttagunta Village Secretariat", "పుట్టగుంట గ్రామ సచివాలయం")}
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            {t("A single window to your secretariat.", "మీ సచివాలయానికి ఒకే విండో.")}
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/80 leading-relaxed">
            {t(
              "Raise welfare, public works, or regulation complaints and track them through every status — from submitted to field verification and resolution.",
              "సంక్షేమ, అభివృద్ధి, లేదా నియంత్రణ ఫిర్యాదులను నమోదు చేసి, సమర్పణ నుండి క్షేత్ర పరిశీలన మరియు పరిష్కారం వరకు ప్రతి స్థితిని ట్రాక్ చేయండి.",
            )}
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur text-xs">
              <div className="font-bold text-base">100%</div>
              <div className="text-white/70">Tracking Accuracy</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3 backdrop-blur text-xs">
              <div className="font-bold text-base">7 Days</div>
              <div className="text-white/70">Standard SLA Target</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-primary-foreground/60">
          <div>
            {t("Government of Andhra Pradesh")} · {t("Citizen-first governance", "పౌర-ప్రథమ పాలన")}
          </div>
          <Link to="/" className="underline hover:text-white">
            ← {t("Back to Home", "హోమ్‌కు తిరిగి వెళ్ళండి")}
          </Link>
        </div>
      </div>

      {/* Right Login / Register Card */}
      <div className="flex flex-col justify-between p-4 sm:p-8">
        {/* Top Navbar with Back and Language Switcher */}
        <div className="flex items-center justify-between pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("Back to Home", "హోమ్ పేజీకి")}
          </Link>

          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium hover:bg-muted transition cursor-pointer"
          >
            <Globe2 className="h-3.5 w-3.5 text-primary" />
            <span>{lang === "en" ? "తెలుగు" : "English"}</span>
          </button>
        </div>

        {/* Center Card */}
        <div className="mx-auto w-full max-w-md my-auto space-y-4">
          <Card className="shadow-md border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">
                {t("Welcome to Gram Seva", "గ్రామ సేవకు స్వాగతం")}
              </CardTitle>
              <CardDescription>
                {t(
                  "Sign in to access your citizen dashboard, or create an account.",
                  "మీ పౌర డాష్‌బోర్డ్‌ను యాక్సెస్ చేయడానికి లాగిన్ చేయండి.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="signin">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t("Sign in")}</TabsTrigger>
                  <TabsTrigger value="signup">{t("Register")}</TabsTrigger>
                </TabsList>

                {/* Sign In Tab */}
                <TabsContent value="signin">
                  <form onSubmit={signIn} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email">{t("Email")}</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-password">{t("Password")}</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full font-semibold" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("Sign in")}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="signup">
                  <form onSubmit={signUp} className="space-y-4 pt-4">
                    <Field
                      name="full_name"
                      label={t("Full name", "పూర్తి పేరు")}
                      type="text"
                      required
                    />
                    <Field name="email" label={t("Email")} type="email" required />
                    <Field
                      name="password"
                      label={t("Password")}
                      type="password"
                      required
                      minLength={6}
                    />
                    <Button type="submit" className="w-full font-semibold" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("Create account")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="my-3 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> {t("OR", "లేదా")}{" "}
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button onClick={google} variant="outline" className="w-full text-xs" disabled={busy}>
                {t("Continue with Google")}
              </Button>

              {/* 1-Click Quick Demo Login Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    {t("1-Click Demo Logins (Testing & Review)", "1-క్లిక్ డెమో లాగిన్‌లు")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {quickLogins.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.email}
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEmail(item.email);
                          setPassword(item.pass);
                          handleLogin(item.email, item.pass);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition hover:opacity-90 disabled:opacity-50 cursor-pointer ${item.badgeCls}`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <div className="truncate">
                          <div className="font-bold truncate">{item.role}</div>
                          <div className="text-[10px] opacity-80 truncate">{item.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-xs text-muted-foreground py-2">
          © {new Date().getFullYear()} Gram Seva · Puttagunta Village Secretariat
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  ...rest
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}
