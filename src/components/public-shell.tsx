import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Landmark,
  Phone,
  Mail,
  Clock,
  Globe2,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  MapPin,
  Home,
  BarChart3,
  FilePlus2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useAuth, useMyRoles } from "@/hooks/use-auth";

export function PublicShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();
  const { isCoordinator, isSuperAdmin } = useMyRoles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const portalTo = user
    ? isSuperAdmin
      ? "/admin"
      : isCoordinator
        ? "/coordinator"
        : "/dashboard"
    : "/auth";

  const portalText = user
    ? isSuperAdmin
      ? t("Admin Portal", "అడ్మిన్ పోర్టల్")
      : isCoordinator
        ? t("Coordinator Desk", "సమన్వయ డెస్క్")
        : t("Citizen Portal", "పౌర పోర్టల్")
    : t("Sign in", "లాగిన్");

  const navLinks = [
    { to: "/", label: t("Home", "హోమ్") },
    { to: "/about", label: t("About Us", "మా గురించి") },
    { to: "/transparency", label: t("Transparency", "పారదర్శకత") },
    { to: "/faq", label: t("FAQ / Help", "సహాయం / ప్రశ్నలు") },
    { to: "/contact", label: t("Contact Us", "సంప్రదించండి") },
  ];

  const toggleLanguage = () => {
    setLang(lang === "en" ? "te" : "en");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground w-full max-w-full overflow-x-hidden">
      {/* Top Government Utility Bar */}
      <div className="bg-[color:var(--topstrip)] text-sidebar-foreground/90 text-xs py-1.5 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-telugu font-semibold tracking-wide text-xs sm:text-[13px] text-amber-300 truncate">
              పుట్టగుంట గ్రామ పంచాయతీ
            </span>
            <span className="hidden h-3.5 w-px bg-white/20 sm:inline-block" />
            <span className="hidden text-sidebar-foreground/80 sm:inline truncate">
              Government of Andhra Pradesh · Village & Ward Secretariat
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="tel:1902"
              className="flex items-center gap-1 text-sidebar-foreground/90 hover:text-white transition-colors"
              title="Toll-Free Grievance Helpline"
            >
              <Phone className="h-3 w-3 text-emerald-400" />
              <span className="font-bold">1902</span>
              <span className="hidden md:inline text-[11px] text-sidebar-foreground/70">
                ({t("Toll Free", "టోల్ ఫ్రీ")})
              </span>
            </a>

            <span className="h-3 w-px bg-white/20" />

            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 rounded bg-white/15 px-2 py-0.5 text-xs font-semibold text-white transition hover:bg-white/25 cursor-pointer touch-manipulation min-h-[28px]"
              aria-label="Switch Language"
            >
              <Globe2 className="h-3 w-3 text-sky-300" />
              <span>{lang === "en" ? "తెలుగు" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm sm:text-lg font-bold tracking-tight text-foreground truncate">
                {t("Gram Seva Portal", "గ్రామ సేవ పోర్టల్")}
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-muted-foreground truncate">
                {t("Puttagunta Secretariat", "పుట్టగుంట గ్రామ సచివాలయం")}
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              size="sm"
              variant={user ? "default" : "outline"}
              className="hidden sm:inline-flex"
            >
              <Link to={portalTo}>{portalText}</Link>
            </Button>

            {!user && (
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link to="/auth">{t("Raise Grievance", "ఫిర్యాదు చేయండి")}</Link>
              </Button>
            )}

            {/* Mobile Portal / Sign In Quick Button */}
            <Button asChild size="sm" variant="outline" className="sm:hidden h-8 px-2.5 text-xs">
              <Link to={portalTo}>{portalText}</Link>
            </Button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:text-foreground lg:hidden cursor-pointer touch-manipulation"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b bg-background px-4 py-4 lg:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="pt-3 border-t flex flex-col gap-2">
                <Button asChild size="sm" variant="outline" className="w-full justify-center h-10">
                  <Link to={portalTo} onClick={() => setMobileMenuOpen(false)}>
                    {portalText}
                  </Link>
                </Button>
                {!user && (
                  <Button asChild size="sm" className="w-full justify-center h-10">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      {t("Raise Grievance", "ఫిర్యాదు చేయండి")}
                    </Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Page Content - with bottom padding on mobile for the bottom bar */}
      <main className="flex-1 pb-20 sm:pb-0 w-full max-w-full min-w-0 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Phone-First UX) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname === "/"
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>{t("Home", "హోమ్")}</span>
        </Link>

        <Link
          to="/transparency"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname.startsWith("/transparency")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>{t("Stats", "గణాంకాలు")}</span>
        </Link>

        {/* Center Elevated Action: Raise Grievance */}
        <Link
          to="/auth"
          className="flex flex-col items-center -mt-5 touch-manipulation"
          aria-label={t("Raise a complaint", "ఫిర్యాదు చేయండి")}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95">
            <FilePlus2 className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold text-primary mt-0.5">{t("File", "ఫిర్యాదు")}</span>
        </Link>

        <Link
          to="/faq"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname.startsWith("/faq")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle className="h-5 w-5" />
          <span>{t("FAQ", "సహాయం")}</span>
        </Link>

        <Link
          to="/contact"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname.startsWith("/contact")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Phone className="h-5 w-5" />
          <span>{t("Contact", "సంప్రదించండి")}</span>
        </Link>
      </nav>

      {/* Global Comprehensive Footer */}
      <footer className="border-t bg-slate-900 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Column 1: Secretariat Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="grid h-8 w-8 place-items-center rounded bg-primary text-white">
                  <Landmark className="h-4 w-4" />
                </div>
                <span className="font-semibold">{t("Gram Seva Portal", "గ్రామ సేవ పోర్టల్")}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                {t(
                  "Puttagunta Village & Ward Secretariat digital public grievance platform. Bridging citizens and coordinators for accountable resolution.",
                  "పుట్టగుంట గ్రామ & వార్డు సచివాలయ డిజిటల్ పౌర ఫిర్యాదుల వేదిక. జవాబుదారీ పరిష్కారాల కోసం పౌరులు మరియు సమన్వయకర్తలను అనుసంధానిస్తుంది.",
                )}
              </p>
              <div className="pt-2 text-xs text-slate-400">
                <p className="font-semibold text-slate-200">
                  {t("Working Hours:", "కార్యాలయ వేళలు:")}
                </p>
                <p>Monday - Saturday: 9:00 AM - 5:00 PM</p>
              </div>
            </div>

            {/* Column 2: Departments */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                {t("Departments", "విభాగాలు")}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/transparency" className="hover:text-white transition-colors">
                    {t(
                      "Welfare Services (Pensions & Schemes)",
                      "సంక్షేమ సేవలు (పింఛన్లు & పథకాలు)",
                    )}
                  </Link>
                </li>
                <li>
                  <Link to="/transparency" className="hover:text-white transition-colors">
                    {t(
                      "Development & Works (Water & Sanitation)",
                      "అభివృద్ధి & పనులు (నీరు & పారిశుధ్యం)",
                    )}
                  </Link>
                </li>
                <li>
                  <Link to="/transparency" className="hover:text-white transition-colors">
                    {t("Regulation & Permits (Certificates)", "నియంత్రణ & అనుమతులు (ధృవపత్రాలు)")}
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    {t("Citizen Charter & SLAs", "పౌర సేవ పత్రం & గడువులు")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                {t("Quick Links", "ముఖ్యమైన లింకులు")}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    {t("Track Grievance Status", "ఫిర్యాదు స్థితిని తనిఖీ చేయండి")}
                  </Link>
                </li>
                <li>
                  <Link to="/transparency" className="hover:text-white transition-colors">
                    {t("Public Transparency Dashboard", "ప్రజా పారదర్శకత డాష్‌బోర్డ్")}
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-white transition-colors">
                    {t("Frequently Asked Questions", "తరచుగా అడిగే ప్రశ్నలు")}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    {t("Contact Village Secretariat", "సచివాలయాన్ని సంప్రదించండి")}
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="hover:text-white transition-colors">
                    {t("Official Staff & Citizen Login", "అధికారులు & పౌరుల లాగిన్")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Emergency Helplines */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                {t("Emergency & Helplines", "అత్యవసర హెల్ప్‌లైన్లు")}
              </h3>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">1902</span>
                    <p className="text-[11px]">CM Office Grievance Toll-Free</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">112</span>
                    <p className="text-[11px]">National Emergency Response</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Puttagunta Grama Panchayat, Andhra Pradesh</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>support@gramseva.in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} {t("Gram Seva Portal", "గ్రామ సేవ పోర్టల్")} —{" "}
              {t("Village & Ward Secretariat Department", "గ్రామ & వార్డు సచివాలయాల శాఖ")}.
            </div>
            <div className="flex items-center gap-4">
              <span>
                {t(
                  "Built for transparent, citizen-first governance.",
                  "పారదర్శక, పౌర-ప్రథమ పాలన కోసం నిర్మించబడింది.",
                )}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
