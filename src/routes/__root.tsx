import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";

function NotFoundComponent() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("Page not found")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "The page you're looking for doesn't exist or has been moved.",
            "మీరు వెతుకుతున్న పేజీ లేదు లేదా తరలించబడింది.",
          )}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("Go home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { t } = useLanguage();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  async function signOutAndRetry() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Token may already be invalid; we're about to clear local state anyway.
      console.warn("signOut failed during error-recovery", err);
    }
    try {
      // Clear any stale Supabase tokens that may be triggering the failure.
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith("sb-") || k.startsWith("supabase.")) localStorage.removeItem(k);
      }
    } catch (err) {
      // localStorage may be unavailable in private browsing; recovery still continues.
      console.warn("localStorage cleanup failed during error-recovery", err);
    }
    window.location.href = "/auth";
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("This page didn't load", "ఈ పేజీ లోడ్ కాలేదు")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "Something went wrong on our end. You can try refreshing or head back home.",
            "మా వైపు ఏదో తప్పు జరిగింది. మీరు రిఫ్రెష్ చేయవచ్చు లేదా హోమ్‌కు తిరిగి వెళ్ళవచ్చు.",
          )}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("Try again")}
          </button>
          <button
            onClick={signOutAndRetry}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("Sign out & retry", "సైన్ అవుట్ చేసి మళ్లీ ప్రయత్నించండి")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("Go home")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gram Seva Portal — Village & Ward Secretariat Complaints" },
      {
        name: "description",
        content:
          "Citizen grievance management for Village & Ward Secretariats. Raise welfare, development, and regulation complaints and track them to resolution.",
      },
      { property: "og:title", content: "Gram Seva Portal" },
      {
        property: "og:description",
        content:
          "Raise and track village & ward secretariat complaints across welfare, development, and regulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden max-w-full">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden max-w-full min-h-dvh">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Outlet />
          <Toaster richColors position="top-right" />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
