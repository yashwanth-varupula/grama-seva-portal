import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

async function ensureSuperAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super admin only");
}

export type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  ward: string | null;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  roles: AppRole[];
  banned_until: string | null;
};

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    console.log("AUTH USERS:", authData.users);
    if (authErr) throw new Error(authErr.message);
    const ids = authData.users.map((u) => u.id);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").in("id", ids),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
    ]);

    console.log("AUTH USERS:", authData.users);
    console.log("PROFILES:", profiles);
    console.log("ROLES:", roles);

    const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const roleMap = new Map<string, AppRole[]>();
    (roles ?? []).forEach((r) => {
      const list = roleMap.get(r.user_id) ?? [];
      list.push(r.role as AppRole);
      roleMap.set(r.user_id, list);
    });
    const users: AdminUser[] = authData.users.map((u) => {
      const p = profMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? null,
        full_name: p?.full_name ?? null,
        phone: p?.phone ?? null,
        ward: p?.ward ?? null,
        is_active: p?.is_active ?? true,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        roles: roleMap.get(u.id) ?? [],
        banned_until: (u as any).banned_until ?? null,
      };
    });
    return users.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { userId: string; role: AppRole }) => d)
  .handler(async ({ data, context }) => {
    await ensureSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Replace all roles with the chosen one (single-role model in this portal)
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { userId: string; active: boolean }) => d)
  .handler(async ({ data, context }) => {
    await ensureSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ is_active: data.active }).eq("id", data.userId);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "8760h",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { email: string }) => d)
  .handler(async ({ data, context }) => {
    await ensureSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
    });
    if (error) throw new Error(error.message);
    return { actionLink: link.properties?.action_link ?? null };
  });

export const runEscalation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { days?: number }) => d)
  .handler(async ({ data, context }) => {
    const { data: n, error } = await context.supabase.rpc("escalate_overdue", {
      _days: data.days ?? 7,
    });
    if (error) throw new Error(error.message);
    return { escalated: n as number };
  });

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    type Persona = { email: string; name: string; ward: string; role: AppRole };
    const personas: Persona[] = [
      {
        email: "welfare.coord@grameseva.local",
        name: "Welfare Coordinator",
        ward: "Ward 4",
        role: "welfare_coordinator",
      },
      {
        email: "dev.coord@grameseva.local",
        name: "Development Coordinator",
        ward: "Ward 7",
        role: "development_coordinator",
      },
      {
        email: "reg.coord@grameseva.local",
        name: "Regulation Coordinator",
        ward: "Ward 2",
        role: "regulation_coordinator",
      },
      { email: "asha.devi@grameseva.local", name: "Asha Devi", ward: "Ward 4", role: "citizen" },
      { email: "ravi.kumar@grameseva.local", name: "Ravi Kumar", ward: "Ward 7", role: "citizen" },
      { email: "meena.iyer@grameseva.local", name: "Meena Iyer", ward: "Ward 2", role: "citizen" },
      { email: "suresh.rao@grameseva.local", name: "Suresh Rao", ward: "Ward 5", role: "citizen" },
      { email: "lakshmi.s@grameseva.local", name: "Lakshmi S", ward: "Ward 3", role: "citizen" },
    ];

    const ids: Record<string, string> = {};
    for (const p of personas) {
      // Look up by email; create if missing.
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const found = existing.users.find((u) => u.email === p.email);
      let id = found?.id;
      if (!id) {
        // Demo seed password for synthetic test users created by the "Seed demo data" button.
        // Not a production secret — these accounts exist only on demo environments and the password
        // is documented in test_credentials.md. The env var lets ops override it per environment.
        const demoPassword = process.env.DEMO_SEED_PASSWORD ?? "DemoPass!234";
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: p.email,
          password: demoPassword,
          email_confirm: true,
          user_metadata: { full_name: p.name },
        });
        if (error) throw new Error(`createUser ${p.email}: ${error.message}`);
        id = created.user!.id;
      }
      ids[p.email] = id!;
      await supabaseAdmin
        .from("profiles")
        .upsert({ id, full_name: p.name, ward: p.ward, is_active: true });
      await supabaseAdmin.from("user_roles").delete().eq("user_id", id);
      await supabaseAdmin.from("user_roles").insert({ user_id: id, role: p.role });
    }

    // Skip complaint seeding if already seeded (check marker).
    const { count } = await supabaseAdmin
      .from("complaints")
      .select("id", { count: "exact", head: true })
      .like("complaint_code", "CMP-%");
    if ((count ?? 0) >= 12) return { ok: true, created: 0, note: "Demo data already present" };

    const day = 86400000;
    const now = Date.now();
    const complaints = [
      {
        citizen: "asha.devi@grameseva.local",
        category: "welfare",
        priority: "high",
        title: "Widow pension not credited for 3 months",
        description:
          "I have not received my widow pension since the last quarter despite repeated visits to the office.",
        ward: "Ward 4",
        status: "work_in_progress",
        daysAgo: 11,
      },
      {
        citizen: "ravi.kumar@grameseva.local",
        category: "development",
        priority: "critical",
        title: "Major pothole on Main Bazaar Road",
        description:
          "A large pothole has caused two accidents in the last week. Urgent repair required before monsoon.",
        ward: "Ward 7",
        status: "resolved",
        daysAgo: 18,
        rating: 5,
        feedback: "Repaired within a week. Excellent response from the team.",
      },
      {
        citizen: "meena.iyer@grameseva.local",
        category: "regulation",
        priority: "medium",
        title: "Income certificate pending for 20 days",
        description:
          "Applied for income certificate online; still showing under verification. Need it for my daughter's scholarship.",
        ward: "Ward 2",
        status: "in_review",
        daysAgo: 6,
      },
      {
        citizen: "suresh.rao@grameseva.local",
        category: "development",
        priority: "high",
        title: "Street light non-functional",
        description:
          "Street light pole 14B near community hall has been off for 2 weeks. Area is unsafe at night.",
        ward: "Ward 5",
        status: "assigned",
        daysAgo: 3,
      },
      {
        citizen: "lakshmi.s@grameseva.local",
        category: "welfare",
        priority: "medium",
        title: "Ration card not updated after family addition",
        description: "Added new family member 3 months ago. Card still shows old entries.",
        ward: "Ward 3",
        status: "submitted",
        daysAgo: 1,
      },
      {
        citizen: "asha.devi@grameseva.local",
        category: "regulation",
        priority: "low",
        title: "Birth certificate correction",
        description: "Spelling correction required in child's birth certificate issued in 2019.",
        ward: "Ward 4",
        status: "closed",
        daysAgo: 30,
        rating: 4,
        feedback: "Took a little long but corrected.",
      },
      {
        citizen: "ravi.kumar@grameseva.local",
        category: "welfare",
        priority: "high",
        title: "Scholarship not received",
        description: "Post-matric scholarship not credited despite documents being verified.",
        ward: "Ward 7",
        status: "escalated",
        daysAgo: 14,
      },
      {
        citizen: "meena.iyer@grameseva.local",
        category: "development",
        priority: "medium",
        title: "Open drain near school",
        description:
          "Drain near primary school is open and overflowing. Health hazard for children.",
        ward: "Ward 2",
        status: "work_in_progress",
        daysAgo: 9,
      },
      {
        citizen: "suresh.rao@grameseva.local",
        category: "regulation",
        priority: "low",
        title: "Trade license renewal",
        description: "Renewal application submitted online — no response yet.",
        ward: "Ward 5",
        status: "assigned",
        daysAgo: 4,
      },
      {
        citizen: "lakshmi.s@grameseva.local",
        category: "development",
        priority: "critical",
        title: "No drinking water for 3 days",
        description:
          "Entire lane has no piped water since Monday. Tanker requested but not arrived.",
        ward: "Ward 3",
        status: "resolved",
        daysAgo: 21,
        rating: 5,
        feedback: "Tanker arrived within hours after raising — thank you.",
      },
      {
        citizen: "asha.devi@grameseva.local",
        category: "welfare",
        priority: "medium",
        title: "Old age pension biometric mismatch",
        description: "Biometric is rejected at the bank window. Need help to update record.",
        ward: "Ward 4",
        status: "in_review",
        daysAgo: 5,
      },
      {
        citizen: "ravi.kumar@grameseva.local",
        category: "regulation",
        priority: "medium",
        title: "Property tax mutation pending",
        description: "Mutation after sale deed not reflected in records.",
        ward: "Ward 7",
        status: "submitted",
        daysAgo: 0,
      },
      {
        citizen: "meena.iyer@grameseva.local",
        category: "welfare",
        priority: "high",
        title: "Disability certificate renewal",
        description: "Renewal application pending for 4 weeks.",
        ward: "Ward 2",
        status: "resolved",
        daysAgo: 25,
        rating: 3,
        feedback: "Eventually resolved.",
      },
      {
        citizen: "suresh.rao@grameseva.local",
        category: "development",
        priority: "low",
        title: "Garbage not lifted regularly",
        description: "Garbage van skips our lane on alternate days.",
        ward: "Ward 5",
        status: "closed",
        daysAgo: 40,
        rating: 4,
        feedback: "Service has improved.",
      },
    ] as const;

    let created = 0;
    for (const c of complaints) {
      const createdAt = new Date(now - c.daysAgo * day).toISOString();
      const resolvedAt =
        c.status === "resolved" || c.status === "closed"
          ? new Date(now - Math.max(0, c.daysAgo - 2) * day).toISOString()
          : null;
      const escalatedAt =
        c.status === "escalated"
          ? new Date(now - Math.max(0, c.daysAgo - 7) * day).toISOString()
          : null;
      const { data: ins, error } = await supabaseAdmin
        .from("complaints")
        .insert({
          citizen_id: ids[c.citizen],
          title: c.title,
          description: c.description,
          category: c.category as any,
          priority: c.priority as any,
          status: c.status as any,
          ward: c.ward,
          rating: (c as any).rating ?? null,
          feedback: (c as any).feedback ?? null,
          feedback_at: (c as any).rating ? resolvedAt : null,
          resolved_at: resolvedAt,
          escalated_at: escalatedAt,
          complaint_code: "",
          created_at: createdAt,
        } as any)
        .select("id")
        .single();
      if (error || !ins) continue;
      created++;
      const msgs: any[] = [
        {
          complaint_id: ins.id,
          author_id: ids[c.citizen],
          kind: "message",
          message: c.description,
          created_at: createdAt,
        },
      ];
      if (c.status !== "submitted") {
        msgs.push({
          complaint_id: ins.id,
          author_id: context.userId,
          kind: "status_change",
          old_status: "submitted",
          new_status: c.status,
          created_at: new Date(now - (c.daysAgo - 1) * day).toISOString(),
        });
      }
      await supabaseAdmin.from("complaint_updates").insert(msgs);
    }
    return { ok: true, created };
  });
