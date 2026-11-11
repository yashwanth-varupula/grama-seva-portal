import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/complaints";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  rolesLoading: boolean;
  isCitizen: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);

/** Single global subscription + single role fetch, shared across the tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setRolesLoading(false);
      return;
    }
    let cancelled = false;
    setRolesLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (cancelled) return;

        if (error) {
          console.error("Role fetch error:", error);
          setRoles([]);
          setRolesLoading(false);
          return;
        }

        const fetchedRoles = (data ?? []).map((r) => r.role as AppRole);

        setRoles(fetchedRoles);
        setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<AuthCtx>(() => {
    const isSuperAdmin = roles.includes("super_admin");
    return {
      user,
      session,
      loading,
      roles,
      rolesLoading,
      isCitizen:
        roles.includes("citizen") &&
        !roles.includes("super_admin") &&
        !roles.some((r) => r.endsWith("_coordinator")),
      isSuperAdmin,
      isAdmin: isSuperAdmin,
      isCoordinator: roles.some((r) => r.endsWith("_coordinator")),
    };
  }, [user, session, loading, roles, rolesLoading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useCtx(): AuthCtx {
  const v = useContext(Ctx);
  if (v) return v;
  // Fallback for any caller rendered outside the provider (should not happen)
  return {
    user: null,
    session: null,
    loading: true,
    roles: [],
    rolesLoading: true,
    isCitizen: true,
    isSuperAdmin: false,
    isAdmin: false,
    isCoordinator: false,
  };
}

export function useAuth() {
  const c = useCtx();
  return { user: c.user, session: c.session, loading: c.loading };
}

export function useMyRoles() {
  const c = useCtx();
  return {
    roles: c.roles,
    loading: c.rolesLoading,
    isCitizen: c.isCitizen,
    isSuperAdmin: c.isSuperAdmin,
    isAdmin: c.isAdmin,
    isCoordinator: c.isCoordinator,
  };
}
