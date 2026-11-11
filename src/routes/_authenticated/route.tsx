import { createFileRoute, Outlet, redirect, useRouter, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Defensive: any unexpected error here would surface as "This page didn't load".
    // Always fall back to redirecting to /auth so the user can recover.
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        throw redirect({ to: "/auth" });
      }
      return { user: data.user };
    } catch (e: any) {
      // `redirect()` throws a tagged error TanStack recognises — re-throw it as-is.
      if (e && typeof e === "object" && "isRedirect" in e) throw e;
      // Anything else (network error, corrupt token) -> push to /auth.
      throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
  errorComponent: AuthenticatedError,
});

function AuthenticatedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AuthenticatedError({ error, reset }: { error: any; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "authenticated_route_error_component" });
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
    <div className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message?.includes("network") || error?.message?.includes("fetch")
            ? "We couldn't reach the server. Check your connection and try again."
            : "Your session may have expired. Try refreshing or signing in again."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            size="sm"
          >
            Try again
          </Button>
          <Button variant="outline" size="sm" onClick={signOutAndRetry}>
            Sign out & retry
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
