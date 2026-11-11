import { Link, useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  LogOut,
  ShieldCheck,
  Landmark,
  Crown,
  Menu,
  Home,
  Phone,
  Info,
  HelpCircle,
  Mail,
  ChevronDown,
  Users,
  UserCog,
  Building2,
  BarChart3,
  AlertOctagon,
  MessageSquareHeart,
  FileBarChart,
  Settings,
} from "lucide-react";
import { useAuth, useMyRoles } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, type ComponentType, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

type AdminSubItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { roles, isCoordinator, isSuperAdmin } = useMyRoles();
  const router = useRouter();
  const qc = useQueryClient();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const primaryRole = isSuperAdmin
    ? t("Super Admin", "సూపర్ అడ్మిన్")
    : isCoordinator
      ? t((roles.find((r) => r.endsWith("_coordinator")) ?? "").replace(/_/g, " "), "సమన్వయకర్త")
      : t("Citizen", "పౌరుడు");

  // Admin "Dashboard" link target is /admin so admin always lands on Admin Dashboard.
  const dashboardTo = isSuperAdmin ? "/admin" : isCoordinator ? "/coordinator" : "/dashboard";
  const portalLabel = isSuperAdmin
    ? t("Admin Portal", "అడ్మిన్ పోర్టల్")
    : isCoordinator
      ? t("Coordinator Portal", "సమన్వయకర్త పోర్టల్")
      : t("Citizen Portal", "పౌర పోర్టల్");

  const adminSubItems: AdminSubItem[] = [
    { to: "/admin", label: t("Admin Dashboard", "అడ్మిన్ డాష్‌బోర్డ్"), icon: LayoutDashboard },
    { to: "/admin/citizens", label: t("Citizens", "పౌరులు"), icon: Users },
    { to: "/admin/coordinators", label: t("Coordinators", "సమన్వయకర్తలు"), icon: UserCog },
    { to: "/admin/complaints", label: t("All Complaints", "అన్ని ఫిర్యాదులు"), icon: ListChecks },
    { to: "/admin/departments", label: t("Departments", "శాఖలు"), icon: Building2 },
    { to: "/admin/escalations", label: t("Escalations", "ఎస్కలేషన్‌లు"), icon: AlertOctagon },
    { to: "/admin/analytics", label: t("Analytics", "విశ్లేషణలు"), icon: BarChart3 },
    { to: "/admin/feedback", label: t("Feedback", "అభిప్రాయం"), icon: MessageSquareHeart },
    { to: "/admin/reports", label: t("Reports", "నివేదికలు"), icon: FileBarChart },
    { to: "/admin/users", label: t("User Roles", "వినియోగదారు పాత్రలు"), icon: Users },
    { to: "/admin/settings", label: t("Settings", "సెట్టింగ్‌లు"), icon: Settings },
  ];

  // Role-based desktop nav (horizontal bar)
  const desktopNav = (
    <>
      <NavLink to={dashboardTo} icon={<LayoutDashboard className="h-4 w-4" />}>
        {t("Dashboard")}
      </NavLink>
      <NavLink to="/complaints" icon={<ListChecks className="h-4 w-4" />}>
        {t("Complaints")}
      </NavLink>
      {!isCoordinator && (
        <NavLink to="/complaints/new" icon={<FilePlus2 className="h-4 w-4" />}>
          {t("Raise Grievance")}
        </NavLink>
      )}
      {isCoordinator && !isSuperAdmin && (
        <NavLink to="/coordinator" icon={<ShieldCheck className="h-4 w-4" />}>
          {t("Coordinator Desk")}
        </NavLink>
      )}
      {isSuperAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-testid="admin-menu"
              className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                pathname.startsWith("/admin")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/85"
              }`}
            >
              <Crown className="h-4 w-4" />
              {t("Admin")}
              <ChevronDown className="h-3 w-3 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>{t("Admin Tools", "అడ్మిన్ టూల్స్")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {adminSubItems.map((item) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem asChild key={item.to}>
                  <Link to={item.to} className="cursor-pointer">
                    <Icon className="mr-2 h-4 w-4" /> {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  // Role-based mobile nav (vertical list in Sheet)
  const mobileNav = (
    <>
      <MobileNavLink to={dashboardTo} icon={<LayoutDashboard className="h-4 w-4" />}>
        {t("Dashboard")}
      </MobileNavLink>
      <MobileNavLink to="/complaints" icon={<ListChecks className="h-4 w-4" />}>
        {t("Complaints")}
      </MobileNavLink>
      {!isCoordinator && (
        <MobileNavLink to="/complaints/new" icon={<FilePlus2 className="h-4 w-4" />}>
          {t("Raise Grievance")}
        </MobileNavLink>
      )}
      {isCoordinator && !isSuperAdmin && (
        <MobileNavLink to="/coordinator" icon={<ShieldCheck className="h-4 w-4" />}>
          {t("Coordinator Desk")}
        </MobileNavLink>
      )}
      {isSuperAdmin && (
        <>
          <div className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            {t("Admin", "అడ్మిన్")}
          </div>
          {adminSubItems.map((item) => {
            const Icon = item.icon;
            return (
              <MobileNavLink key={item.to} to={item.to} icon={<Icon className="h-4 w-4" />}>
                {item.label}
              </MobileNavLink>
            );
          })}
        </>
      )}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background w-full max-w-full overflow-x-hidden">
      <header className="sticky top-0 z-40 shadow-sm w-full max-w-full">
        {/* Government utility strip — CPGRAMS style */}
        <div className="bg-[color:var(--topstrip)] text-sidebar-foreground/90 text-[12px] w-full">
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 truncate sm:gap-3">
              <span className="font-telugu truncate text-[12px] font-semibold leading-none sm:text-[13px]">
                పుట్టగుంట పంచాయతీ
              </span>
              <span className="hidden h-3.5 w-px bg-sidebar-foreground/30 sm:inline-block" />
              <span className="hidden truncate sm:inline">Public Grievances &amp; Pensions</span>
            </div>
            <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
              <TopLink to="/" icon={<Home className="h-3.5 w-3.5" />}>
                {t("Home", "హోమ్")}
              </TopLink>
              <TopLink to="/contact" icon={<Mail className="h-3.5 w-3.5" />}>
                {t("Contact Us", "సంప్రదించండి")}
              </TopLink>
              <TopLink to="/about" icon={<Info className="h-3.5 w-3.5" />}>
                {t("About Us", "మా గురించి")}
              </TopLink>
              <TopLink to="/faq" icon={<HelpCircle className="h-3.5 w-3.5" />}>
                {t("FAQ/Help", "సహాయం")}
              </TopLink>
              <span className="hidden sm:inline-block mx-1 h-3.5 w-px bg-sidebar-foreground/30" />
              <div className="items-center overflow-hidden rounded-sm border border-sidebar-foreground/30 inline-flex shadow-xs">
                <button
                  type="button"
                  onClick={() => setLang("te")}
                  className={`font-telugu px-2 py-0.5 text-[11px] leading-tight transition-colors cursor-pointer ${lang === "te" ? "bg-sidebar-foreground text-sidebar font-semibold" : "hover:bg-sidebar-accent text-sidebar-foreground/80"}`}
                  aria-pressed={lang === "te"}
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 text-[11px] font-semibold leading-tight transition-colors cursor-pointer ${lang === "en" ? "bg-sidebar-foreground text-sidebar font-semibold" : "hover:bg-sidebar-accent text-sidebar-foreground/80"}`}
                  aria-pressed={lang === "en"}
                >
                  English
                </button>
              </div>
            </nav>
          </div>
        </div>
        {/* Branding section */}
        <div className="border-b border-sidebar-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-3 py-3 sm:px-6 sm:py-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-sm bg-sidebar text-sidebar-primary-foreground ring-1 ring-sidebar-border sm:h-14 sm:w-14">
              <Landmark className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
              <div className="min-w-0 leading-tight">
                <div className="font-telugu truncate text-[15px] font-bold text-foreground sm:text-[17px]">
                  పుట్టగుంట పంచాయతీ
                </div>
                <div className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[12px]">
                  Puttagunta Panchayat
                </div>
              </div>
              <div className="hidden min-w-0 text-right leading-tight sm:block">
                <div className="truncate text-[15px] font-bold text-primary sm:text-[17px]">
                  Grama Seva Connect
                </div>
                <div className="truncate text-[11px] font-medium text-muted-foreground sm:text-[12px]">
                  Public Grievances &amp; Pensions
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main bar */}
        <div className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
          <div className="mx-auto grid h-14 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:gap-6 sm:px-6 md:grid-cols-[auto_1fr_auto]">
            <Link
              to={dashboardTo}
              className="flex min-w-0 items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-sidebar-foreground/90 sm:text-[13px]"
            >
              {isSuperAdmin ? (
                <Crown className="h-4 w-4 shrink-0 text-yellow-300" />
              ) : (
                <ShieldCheck className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{portalLabel}</span>
            </Link>
            <nav className="hidden items-center gap-0.5 md:flex">{desktopNav}</nav>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 md:flex">
                <Avatar className="h-8 w-8 border border-sidebar-border">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[11px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left text-[11px] leading-tight lg:block">
                  <div className="truncate font-medium max-w-[160px]">{user?.email}</div>
                  <div className="mt-0.5 inline-flex items-center rounded-sm bg-sidebar-primary/20 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground">
                    {primaryRole}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                aria-label="Sign out"
                data-testid="header-signout"
                className="hidden md:inline-flex h-8 px-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4 md:mr-1.5" />
                <span className="hidden lg:inline">{t("Sign out", "నిష్క్రమించండి")}</span>
              </Button>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    data-testid="header-menu-toggle"
                    className="md:hidden h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[290px] p-0 flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border"
                >
                  <SheetHeader className="border-b border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
                    <SheetTitle className="text-left text-sm text-sidebar-foreground">
                      {portalLabel}
                    </SheetTitle>
                    <div className="flex items-center gap-2 pt-1">
                      <Avatar className="h-9 w-9 border border-sidebar-border">
                        <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium">{user?.email}</div>
                        <Badge
                          variant="outline"
                          className="mt-1 capitalize border-sidebar-foreground/30 text-sidebar-foreground bg-sidebar-primary/20 text-[10px]"
                        >
                          {primaryRole}
                        </Badge>
                      </div>
                    </div>
                  </SheetHeader>
                  <nav
                    className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3"
                    onClick={() => setOpen(false)}
                  >
                    {mobileNav}
                  </nav>
                  <div className="border-t border-sidebar-border p-3">
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={signOut}
                        className="w-full justify-center bg-transparent border-sidebar-foreground/30 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> {t("Sign out")}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-3 py-4 sm:px-6 sm:py-6 pb-20 md:pb-6 overflow-x-hidden"
      >
        {children}
      </main>
      <SiteFooter />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-sidebar-border bg-sidebar/95 px-2 text-sidebar-foreground backdrop-blur supports-[backdrop-filter]:bg-sidebar/90 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <Link
          to={dashboardTo}
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname === dashboardTo
              ? "text-sidebar-primary-foreground font-bold"
              : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
          }`}
        >
          {isSuperAdmin ? (
            <Crown className="h-5 w-5" />
          ) : isCoordinator ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <LayoutDashboard className="h-5 w-5" />
          )}
          <span>{t("Home", "హోమ్")}</span>
        </Link>

        <Link
          to="/complaints"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname.startsWith("/complaints") && pathname !== "/complaints/new"
              ? "text-sidebar-primary-foreground font-bold"
              : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
          }`}
        >
          <ListChecks className="h-5 w-5" />
          <span>{t("Complaints", "ఫిర్యాదులు")}</span>
        </Link>

        {/* Action button in center */}
        {!isCoordinator ? (
          <Link
            to="/complaints/new"
            className="flex flex-col items-center -mt-5 touch-manipulation"
            aria-label={t("Raise Grievance", "ఫిర్యాదు చేయండి")}
          >
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-sidebar transition-transform active:scale-95">
              <FilePlus2 className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-sidebar-primary-foreground mt-0.5">
              {t("New", "కొత్తది")}
            </span>
          </Link>
        ) : (
          <Link
            to="/transparency"
            className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
              pathname.startsWith("/transparency")
                ? "text-sidebar-primary-foreground font-bold"
                : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>{t("Stats", "గణాంకాలు")}</span>
          </Link>
        )}

        <Link
          to="/contact"
          className={`flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium transition touch-manipulation ${
            pathname.startsWith("/contact")
              ? "text-sidebar-primary-foreground font-bold"
              : "text-sidebar-foreground/75 hover:text-sidebar-foreground"
          }`}
        >
          <Phone className="h-5 w-5" />
          <span>{t("Help", "సహాయం")}</span>
        </Link>

        {/* Menu Drawer Toggle */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-sidebar-foreground/75 hover:text-sidebar-foreground transition touch-manipulation cursor-pointer"
        >
          <Menu className="h-5 w-5" />
          <span>{t("Menu", "మెనూ")}</span>
        </button>
      </nav>
    </div>
  );
}

function TopLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="hidden sm:inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11.5px] font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground sm:text-[12px]"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-3 py-6 text-[12.5px] sm:grid-cols-3 sm:px-6 sm:py-8">
        <div>
          <div className="font-telugu text-[15px] font-bold">పుట్టగుంట పంచాయతీ</div>
          <div className="text-[13px] font-semibold uppercase tracking-wider text-sidebar-foreground/80">
            Puttagunta Panchayat
          </div>
          <div className="mt-2 text-[13px] font-semibold text-sidebar-primary-foreground">
            Grama Seva Connect
          </div>
          <div className="text-sidebar-foreground/70">Public Grievances &amp; Pensions</div>
        </div>
        <div className="space-y-1 leading-relaxed">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
            Contact
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> Phone: +91-XXXXXXXXXX
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5" /> Email: contact@puttagunta.gov.in
          </div>
          <div>Address: Puttagunta Panchayat</div>
        </div>
        <div className="space-y-1 leading-relaxed sm:text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
            Portal Info
          </div>
          <div>Version 1.0.0</div>
          <div>Last Updated: 20 June 2026</div>
          <div>Visitors: 12,438</div>
        </div>
      </div>
      <div className="border-t border-sidebar-border bg-[color:var(--topstrip)] py-2.5 text-center text-[11.5px] text-sidebar-foreground/85">
        © {year} Puttagunta Panchayat. All Rights Reserved.
      </div>
    </footer>
  );
}

function NavLink({ to, icon, children }: { to: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[13px] font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:relative md:after:pointer-events-none md:after:absolute md:after:inset-x-2 md:after:-bottom-px md:after:h-[2px] md:after:bg-transparent"
      activeProps={{
        className:
          "inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-[13px] font-semibold bg-sidebar-accent text-sidebar-accent-foreground md:relative md:after:pointer-events-none md:after:absolute md:after:inset-x-2 md:after:-bottom-px md:after:h-[2px] md:after:bg-sidebar-primary",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      activeProps={{
        className:
          "inline-flex items-center gap-2 rounded-sm px-3 py-2.5 text-sm font-semibold bg-sidebar-accent text-sidebar-accent-foreground",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
