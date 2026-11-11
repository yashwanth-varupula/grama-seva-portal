import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DB_FILE = path.resolve(process.cwd(), "supabase-local-db.json");

type UserRecord = {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  ward?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
};

type ProfileRecord = {
  id: string;
  full_name: string | null;
  phone: string | null;
  ward: string | null;
  address?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type UserRoleRecord = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

type ComplaintRecord = {
  id: string;
  complaint_code: string;
  citizen_id: string;
  title: string;
  description: string;
  category: "welfare" | "development" | "regulation";
  priority: "low" | "medium" | "high" | "critical";
  status:
    | "draft"
    | "submitted"
    | "assigned"
    | "in_review"
    | "work_in_progress"
    | "resolved"
    | "closed"
    | "reopened"
    | "escalated"
    | "rejected";
  location?: string | null;
  ward?: string | null;
  contact_phone?: string | null;
  attachments?: any;
  assigned_to?: string | null;
  rating?: number | null;
  feedback?: string | null;
  feedback_at?: string | null;
  resolved_at?: string | null;
  escalated_at?: string | null;
  created_at: string;
  updated_at: string;
};

type ComplaintUpdateRecord = {
  id: string;
  complaint_id: string;
  author_id: string;
  kind: "status_change" | "remark" | "message";
  message?: string | null;
  old_status?: string | null;
  new_status?: string | null;
  created_at: string;
};

type LocalDb = {
  users: UserRecord[];
  profiles: ProfileRecord[];
  user_roles: UserRoleRecord[];
  complaints: ComplaintRecord[];
  complaint_updates: ComplaintUpdateRecord[];
  seq: number;
};

function getInitialData(): LocalDb {
  const now = Date.now();
  const day = 86400000;

  const users: UserRecord[] = [
    {
      id: "00000000-0000-4000-a000-000000000001",
      email: "yashwanthvarupula@gmail.com",
      password: "yashwanth56",
      full_name: "Yashwanth Varupula",
      phone: "+91 9876543210",
      ward: "Ward 1",
      role: "super_admin",
      is_active: true,
      created_at: new Date(now - 30 * day).toISOString(),
    },
    {
      id: "10000000-0000-4000-a000-000000000001",
      email: "welfare.coord@grameseva.local",
      password: "DemoPass!234",
      full_name: "Welfare Coordinator",
      phone: "+91 9876543211",
      ward: "Ward 4",
      role: "welfare_coordinator",
      is_active: true,
      created_at: new Date(now - 25 * day).toISOString(),
    },
    {
      id: "10000000-0000-4000-a000-000000000002",
      email: "dev.coord@grameseva.local",
      password: "DemoPass!234",
      full_name: "Development Coordinator",
      phone: "+91 9876543212",
      ward: "Ward 7",
      role: "development_coordinator",
      is_active: true,
      created_at: new Date(now - 25 * day).toISOString(),
    },
    {
      id: "10000000-0000-4000-a000-000000000003",
      email: "reg.coord@grameseva.local",
      password: "DemoPass!234",
      full_name: "Regulation Coordinator",
      phone: "+91 9876543213",
      ward: "Ward 2",
      role: "regulation_coordinator",
      is_active: true,
      created_at: new Date(now - 25 * day).toISOString(),
    },
    {
      id: "20000000-0000-4000-a000-000000000001",
      email: "asha.devi@grameseva.local",
      password: "DemoPass!234",
      full_name: "Asha Devi",
      phone: "+91 9876543214",
      ward: "Ward 4",
      role: "citizen",
      is_active: true,
      created_at: new Date(now - 20 * day).toISOString(),
    },
    {
      id: "20000000-0000-4000-a000-000000000002",
      email: "ravi.kumar@grameseva.local",
      password: "DemoPass!234",
      full_name: "Ravi Kumar",
      phone: "+91 9876543215",
      ward: "Ward 7",
      role: "citizen",
      is_active: true,
      created_at: new Date(now - 20 * day).toISOString(),
    },
    {
      id: "20000000-0000-4000-a000-000000000003",
      email: "meena.iyer@grameseva.local",
      password: "DemoPass!234",
      full_name: "Meena Iyer",
      phone: "+91 9876543216",
      ward: "Ward 2",
      role: "citizen",
      is_active: true,
      created_at: new Date(now - 20 * day).toISOString(),
    },
    {
      id: "20000000-0000-4000-a000-000000000004",
      email: "suresh.rao@grameseva.local",
      password: "DemoPass!234",
      full_name: "Suresh Rao",
      phone: "+91 9876543217",
      ward: "Ward 5",
      role: "citizen",
      is_active: true,
      created_at: new Date(now - 20 * day).toISOString(),
    },
    {
      id: "20000000-0000-4000-a000-000000000005",
      email: "lakshmi.s@grameseva.local",
      password: "DemoPass!234",
      full_name: "Lakshmi S",
      phone: "+91 9876543218",
      ward: "Ward 3",
      role: "citizen",
      is_active: true,
      created_at: new Date(now - 20 * day).toISOString(),
    },
  ];

  const profiles: ProfileRecord[] = users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    phone: u.phone ?? null,
    ward: u.ward ?? null,
    is_active: u.is_active,
    created_at: u.created_at,
    updated_at: u.created_at,
  }));

  const user_roles: UserRoleRecord[] = users.map((u, i) => ({
    id: `role-${i + 1}`,
    user_id: u.id,
    role: u.role,
    created_at: u.created_at,
  }));

  const rawComplaints = [
    {
      citizen: "asha.devi@grameseva.local",
      category: "welfare" as const,
      priority: "high" as const,
      title: "Widow pension not credited for 3 months",
      description:
        "I have not received my widow pension since the last quarter despite repeated visits.",
      ward: "Ward 4",
      status: "work_in_progress" as const,
      daysAgo: 11,
    },
    {
      citizen: "ravi.kumar@grameseva.local",
      category: "development" as const,
      priority: "critical" as const,
      title: "Major pothole on Main Bazaar Road",
      description:
        "A large pothole has caused two accidents in the last week. Urgent repair required.",
      ward: "Ward 7",
      status: "resolved" as const,
      daysAgo: 18,
      rating: 5,
      feedback: "Repaired within a week. Excellent response from the team.",
    },
    {
      citizen: "meena.iyer@grameseva.local",
      category: "regulation" as const,
      priority: "medium" as const,
      title: "Income certificate pending for 20 days",
      description: "Applied for income certificate online; still showing under verification.",
      ward: "Ward 2",
      status: "in_review" as const,
      daysAgo: 6,
    },
    {
      citizen: "suresh.rao@grameseva.local",
      category: "development" as const,
      priority: "high" as const,
      title: "Street light non-functional",
      description: "Street light pole 14B near community hall has been off for 2 weeks.",
      ward: "Ward 5",
      status: "assigned" as const,
      daysAgo: 3,
    },
    {
      citizen: "lakshmi.s@grameseva.local",
      category: "welfare" as const,
      priority: "medium" as const,
      title: "Ration card not updated after family addition",
      description: "Added new family member 3 months ago. Card still shows old entries.",
      ward: "Ward 3",
      status: "submitted" as const,
      daysAgo: 1,
    },
    {
      citizen: "asha.devi@grameseva.local",
      category: "regulation" as const,
      priority: "low" as const,
      title: "Birth certificate correction",
      description: "Spelling correction required in child's birth certificate issued in 2019.",
      ward: "Ward 4",
      status: "closed" as const,
      daysAgo: 30,
      rating: 4,
      feedback: "Took a little long but corrected.",
    },
    {
      citizen: "ravi.kumar@grameseva.local",
      category: "welfare" as const,
      priority: "high" as const,
      title: "Scholarship not received",
      description: "Post-matric scholarship not credited despite documents being verified.",
      ward: "Ward 7",
      status: "escalated" as const,
      daysAgo: 14,
    },
    {
      citizen: "meena.iyer@grameseva.local",
      category: "development" as const,
      priority: "medium" as const,
      title: "Open drain near school",
      description: "Drain near primary school is open and overflowing. Health hazard for children.",
      ward: "Ward 2",
      status: "work_in_progress" as const,
      daysAgo: 9,
    },
    {
      citizen: "suresh.rao@grameseva.local",
      category: "regulation" as const,
      priority: "low" as const,
      title: "Trade license renewal",
      description: "Renewal application submitted online — no response yet.",
      ward: "Ward 5",
      status: "assigned" as const,
      daysAgo: 4,
    },
    {
      citizen: "lakshmi.s@grameseva.local",
      category: "development" as const,
      priority: "critical" as const,
      title: "No drinking water for 3 days",
      description: "Entire lane has no piped water since Monday. Tanker requested but not arrived.",
      ward: "Ward 3",
      status: "resolved" as const,
      daysAgo: 21,
      rating: 5,
      feedback: "Tanker arrived within hours after raising — thank you.",
    },
    {
      citizen: "asha.devi@grameseva.local",
      category: "welfare" as const,
      priority: "medium" as const,
      title: "Old age pension biometric mismatch",
      description: "Biometric is rejected at the bank window. Need help to update record.",
      ward: "Ward 4",
      status: "in_review" as const,
      daysAgo: 5,
    },
    {
      citizen: "ravi.kumar@grameseva.local",
      category: "regulation" as const,
      priority: "medium" as const,
      title: "Property tax mutation pending",
      description: "Mutation after sale deed not reflected in records.",
      ward: "Ward 7",
      status: "submitted" as const,
      daysAgo: 0,
    },
  ];

  const complaints: ComplaintRecord[] = [];
  const complaint_updates: ComplaintUpdateRecord[] = [];

  rawComplaints.forEach((c, idx) => {
    const userMatch = users.find((u) => u.email === c.citizen);
    const citizen_id = userMatch?.id ?? users[4].id;
    const createdAt = new Date(now - c.daysAgo * day).toISOString();
    const resolvedAt =
      c.status === "resolved" || c.status === "closed"
        ? new Date(now - Math.max(0, c.daysAgo - 2) * day).toISOString()
        : null;
    const escalatedAt =
      c.status === "escalated"
        ? new Date(now - Math.max(0, c.daysAgo - 7) * day).toISOString()
        : null;

    const id = `cmp-${idx + 1}-${crypto.randomUUID().slice(0, 8)}`;
    const complaint_code = `CMP-2026-${String(idx + 1).padStart(6, "0")}`;

    complaints.push({
      id,
      complaint_code,
      citizen_id,
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      ward: c.ward,
      location: `${c.ward}, Puttagunta`,
      attachments: [],
      rating: (c as any).rating ?? null,
      feedback: (c as any).feedback ?? null,
      feedback_at: (c as any).rating ? resolvedAt : null,
      resolved_at: resolvedAt,
      escalated_at: escalatedAt,
      created_at: createdAt,
      updated_at: resolvedAt ?? createdAt,
    });

    complaint_updates.push({
      id: crypto.randomUUID(),
      complaint_id: id,
      author_id: citizen_id,
      kind: "message",
      message: c.description,
      created_at: createdAt,
    });

    if (c.status !== "submitted") {
      complaint_updates.push({
        id: crypto.randomUUID(),
        complaint_id: id,
        author_id: users[0].id,
        kind: "status_change",
        old_status: "submitted",
        new_status: c.status,
        message: `Status updated to ${c.status.replace(/_/g, " ")}`,
        created_at: new Date(now - Math.max(0, c.daysAgo - 1) * day).toISOString(),
      });
    }
  });

  return {
    users,
    profiles,
    user_roles,
    complaints,
    complaint_updates,
    seq: rawComplaints.length + 1,
  };
}

let dbCache: LocalDb | null = null;

function loadDb(): LocalDb {
  if (dbCache) {
    ensureSuperAdminUser(dbCache);
    ensureLikithaUser(dbCache);
    return dbCache;
  }
  if (fs.existsSync(DB_FILE)) {
    try {
      dbCache = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Ensure accounts are always updated
      ensureSuperAdminUser(dbCache!);
      ensureLikithaUser(dbCache!);
      return dbCache!;
    } catch (e) {
      console.warn("Failed to load existing local db, creating fresh one:", e);
    }
  }
  dbCache = getInitialData();
  saveDb(dbCache);
  return dbCache;
}

function ensureSuperAdminUser(db: LocalDb) {
  let admin = db.users.find((u) => u.email === "yashwanthvarupula@gmail.com");
  if (!admin) {
    admin = {
      id: "00000000-0000-4000-a000-000000000001",
      email: "yashwanthvarupula@gmail.com",
      password: "yashwanth56",
      full_name: "Yashwanth Varupula",
      phone: "+91 9876543210",
      ward: "Ward 1",
      role: "super_admin",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.users.unshift(admin);
  } else {
    admin.password = "yashwanth56";
    admin.role = "super_admin";
    admin.is_active = true;
  }

  const prof = db.profiles.find((p) => p.id === admin!.id);
  if (!prof) {
    db.profiles.unshift({
      id: admin.id,
      full_name: admin.full_name,
      phone: admin.phone ?? null,
      ward: admin.ward ?? null,
      is_active: true,
      created_at: admin.created_at,
      updated_at: admin.created_at,
    });
  } else {
    prof.is_active = true;
  }

  const roleRec = db.user_roles.find((r) => r.user_id === admin!.id && r.role === "super_admin");
  if (!roleRec) {
    db.user_roles.unshift({
      id: `ur-admin-${admin.id}`,
      user_id: admin.id,
      role: "super_admin",
      created_at: admin.created_at,
    });
  }
}

function ensureLikithaUser(db: LocalDb) {
  const email = "peddireddylikitha321@gmail.com";
  let user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    user = {
      id: "20000000-0000-4000-a000-000000000099",
      email,
      password: "yashwanth",
      full_name: "Likitha Peddireddy",
      phone: "+91 9876543299",
      ward: "Ward 1",
      role: "citizen",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    db.users.push(user);
  } else {
    user.password = "yashwanth";
    user.role = "citizen";
    user.is_active = true;
  }

  const prof = db.profiles.find((p) => p.id === user!.id);
  if (!prof) {
    db.profiles.push({
      id: user.id,
      full_name: user.full_name,
      phone: user.phone ?? null,
      ward: user.ward ?? null,
      is_active: true,
      created_at: user.created_at,
      updated_at: user.created_at,
    });
  } else {
    prof.is_active = true;
  }

  const roleRec = db.user_roles.find((r) => r.user_id === user!.id && r.role === "citizen");
  if (!roleRec) {
    db.user_roles.push({
      id: `ur-citizen-${user.id}`,
      user_id: user.id,
      role: "citizen",
      created_at: user.created_at,
    });
  }
}

function saveDb(db: LocalDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save local db:", e);
  }
}

function createJwt(user: UserRecord): string {
  const h = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(
    JSON.stringify({
      iss: "supabase",
      sub: user.id,
      aud: "authenticated",
      role: "authenticated",
      email: user.email,
      phone: user.phone || "",
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: { full_name: user.full_name },
      exp: Math.floor(Date.now() / 1000) + 86400 * 365,
    }),
  ).toString("base64url");
  return `${h}.${p}.local_sig`;
}

export function handleLocalSupabaseRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
): boolean {
  const urlStr = req.url || "";
  if (!urlStr.startsWith("/auth/v1") && !urlStr.startsWith("/rest/v1")) {
    return false;
  }

  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "apikey, authorization, content-type, prefer, accept, accept-profile, content-profile, x-client-info",
  );
  res.setHeader("Access-Control-Expose-Headers", "content-range, prefer");
  res.setHeader("Access-Control-Allow-Private-Network", "true");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return true;
  }

  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
  });

  req.on("end", () => {
    try {
      const db = loadDb();
      const parsedUrl = new URL(urlStr, "http://localhost");
      const pathname = parsedUrl.pathname;
      const jsonBody = rawBody ? JSON.parse(rawBody) : {};

      // 1. POST /auth/v1/token?grant_type=password
      if (pathname === "/auth/v1/token") {
        const email = String(jsonBody.email || "")
          .toLowerCase()
          .trim();
        const password = String(jsonBody.password || "");
        const user = db.users.find(
          (u) =>
            u.email.toLowerCase() === email &&
            (u.password === password ||
              (email === "peddireddylikitha321@gmail.com" &&
                (password === "yashwanth" || password === "yashwanthand"))),
        );
        if (!user) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "invalid_grant",
              error_description: "Invalid login credentials",
              message: "Invalid login credentials",
            }),
          );
          return;
        }

        user.last_sign_in_at = new Date().toISOString();
        saveDb(db);

        const token = createJwt(user);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            access_token: token,
            token_type: "bearer",
            expires_in: 86400 * 30,
            expires_at: Math.floor(Date.now() / 1000) + 86400 * 30,
            refresh_token: token,
            user: {
              id: user.id,
              aud: "authenticated",
              role: "authenticated",
              email: user.email,
              email_confirmed_at: user.created_at,
              phone: user.phone || "",
              confirmed_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at,
              app_metadata: { provider: "email", providers: ["email"] },
              user_metadata: { full_name: user.full_name },
              identities: [],
              created_at: user.created_at,
              updated_at: user.created_at,
            },
          }),
        );
        return;
      }

      // 2. GET /auth/v1/user
      if (pathname === "/auth/v1/user") {
        const auth = req.headers["authorization"] || "";
        const token = auth.replace(/^Bearer\s+/i, "");
        if (!token) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unauthorized" }));
          return;
        }

        try {
          const parts = token.split(".");
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
          const user = db.users.find((u) => u.id === payload.sub);
          const userData = {
            id: user?.id || payload.sub,
            aud: "authenticated",
            role: "authenticated",
            email: user?.email || payload.email,
            email_confirmed_at: user?.created_at || new Date().toISOString(),
            phone: user?.phone || "",
            confirmed_at: user?.created_at || new Date().toISOString(),
            last_sign_in_at: user?.last_sign_in_at || new Date().toISOString(),
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: { full_name: user?.full_name || payload.user_metadata?.full_name || "" },
            identities: [],
            created_at: user?.created_at || new Date().toISOString(),
            updated_at: user?.created_at || new Date().toISOString(),
          };
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(userData));
        } catch (e) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid token" }));
        }
        return;
      }

      // 3. POST /auth/v1/signup
      if (pathname === "/auth/v1/signup") {
        const email = String(jsonBody.email || "")
          .toLowerCase()
          .trim();
        const password = String(jsonBody.password || "");
        const fullName = String(jsonBody.data?.full_name || email);

        let user = db.users.find((u) => u.email.toLowerCase() === email);
        if (user) {
          user.password = password;
          user.full_name = fullName;
        } else {
          user = {
            id: crypto.randomUUID(),
            email,
            password,
            full_name: fullName,
            role: "citizen",
            is_active: true,
            created_at: new Date().toISOString(),
          };
          db.users.push(user);
        }

        // Ensure profile
        const prof = db.profiles.find((p) => p.id === user.id);
        if (!prof) {
          db.profiles.push({
            id: user.id,
            full_name: fullName,
            phone: null,
            ward: null,
            is_active: true,
            created_at: user.created_at,
            updated_at: user.created_at,
          });
        }

        // Ensure role
        if (!db.user_roles.some((r) => r.user_id === user!.id)) {
          db.user_roles.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            role: "citizen",
            created_at: user.created_at,
          });
        }
        saveDb(db);

        const token = createJwt(user);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            access_token: token,
            token_type: "bearer",
            user: {
              id: user.id,
              email: user.email,
              user_metadata: { full_name: user.full_name },
              created_at: user.created_at,
            },
          }),
        );
        return;
      }

      // 4. POST /auth/v1/logout
      if (pathname === "/auth/v1/logout") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({}));
        return;
      }

      // 5. Admin Auth API
      if (pathname === "/auth/v1/admin/users") {
        if (req.method === "GET") {
          const usersList = db.users.map((u) => ({
            id: u.id,
            aud: "authenticated",
            role: "authenticated",
            email: u.email,
            email_confirmed_at: u.created_at,
            phone: u.phone || null,
            confirmed_at: u.created_at,
            last_sign_in_at: u.last_sign_in_at || null,
            app_metadata: { provider: "email", providers: ["email"] },
            user_metadata: { full_name: u.full_name },
            banned_until: u.banned_until || null,
            created_at: u.created_at,
            updated_at: u.created_at,
          }));
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ users: usersList, aud: "authenticated" }));
          return;
        }

        if (req.method === "POST") {
          const email = String(jsonBody.email || "")
            .toLowerCase()
            .trim();
          const password = String(jsonBody.password || "DemoPass!234");
          const fullName = String(jsonBody.user_metadata?.full_name || email);

          let user = db.users.find((u) => u.email.toLowerCase() === email);
          if (!user) {
            user = {
              id: crypto.randomUUID(),
              email,
              password,
              full_name: fullName,
              role: "citizen",
              is_active: true,
              created_at: new Date().toISOString(),
            };
            db.users.push(user);
            db.profiles.push({
              id: user.id,
              full_name: fullName,
              phone: null,
              ward: null,
              is_active: true,
              created_at: user.created_at,
              updated_at: user.created_at,
            });
            saveDb(db);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ user }));
          return;
        }
      }

      if (pathname.startsWith("/auth/v1/admin/users/")) {
        const userId = pathname.replace("/auth/v1/admin/users/", "");
        const user = db.users.find((u) => u.id === userId);
        if (user && req.method === "PUT") {
          if (jsonBody.ban_duration !== undefined) {
            user.banned_until =
              jsonBody.ban_duration === "none"
                ? null
                : new Date(Date.now() + 86400 * 365 * 1000).toISOString();
            user.is_active = jsonBody.ban_duration === "none";
          }
          saveDb(db);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(user));
          return;
        }
      }

      if (pathname === "/auth/v1/admin/generate_link") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ properties: { action_link: "http://localhost:3000/auth" } }));
        return;
      }

      // 6. RPC Functions
      if (pathname.startsWith("/rest/v1/rpc/")) {
        const fnName = pathname.replace("/rest/v1/rpc/", "");
        if (fnName === "has_role") {
          const { _user_id, _role } = jsonBody;
          const has = db.user_roles.some(
            (r) =>
              r.user_id === _user_id &&
              String(r.role).toLowerCase() === String(_role).toLowerCase(),
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(has));
          return;
        }

        if (fnName === "escalate_overdue") {
          const days = jsonBody._days || 7;
          const cutoff = Date.now() - days * 86400000;
          let count = 0;
          for (const c of db.complaints) {
            if (
              !["resolved", "closed", "escalated", "rejected"].includes(c.status) &&
              new Date(c.created_at).getTime() < cutoff
            ) {
              c.status = "escalated";
              c.escalated_at = new Date().toISOString();
              count++;
            }
          }
          if (count > 0) saveDb(db);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(count));
          return;
        }

        if (fnName === "public_stats") {
          const total = db.complaints.length;
          const resolved = db.complaints.filter((c) =>
            ["resolved", "closed"].includes(c.status),
          ).length;
          const active = db.complaints.filter(
            (c) => !["resolved", "closed", "rejected"].includes(c.status),
          ).length;
          const escalated = db.complaints.filter((c) => c.status === "escalated").length;
          const rated = db.complaints.filter((c) => typeof c.rating === "number" && c.rating > 0);
          const avg_rating =
            rated.length > 0
              ? Number((rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length).toFixed(2))
              : 0;

          const by_category: Record<string, number> = {};
          const by_status: Record<string, number> = {};
          for (const c of db.complaints) {
            by_category[c.category] = (by_category[c.category] || 0) + 1;
            by_status[c.status] = (by_status[c.status] || 0) + 1;
          }

          const monthlyMap: Record<string, { new: number; resolved: number; escalated: number }> =
            {};
          for (const c of db.complaints) {
            const m = c.created_at.slice(0, 7);
            if (!monthlyMap[m]) monthlyMap[m] = { new: 0, resolved: 0, escalated: 0 };
            monthlyMap[m].new++;
            if (["resolved", "closed"].includes(c.status)) monthlyMap[m].resolved++;
            if (c.status === "escalated") monthlyMap[m].escalated++;
          }
          const monthly = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, data]) => ({ month, ...data }));

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              total,
              resolved,
              active,
              escalated,
              avg_rating,
              by_category,
              by_status,
              monthly,
            }),
          );
          return;
        }
      }

      // 7. PostgREST Tables: /rest/v1/:tableName
      if (pathname.startsWith("/rest/v1/")) {
        const table = pathname.replace("/rest/v1/", "").trim();
        const records = (db as any)[table];

        if (!Array.isArray(records)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Table '${table}' not found` }));
          return;
        }

        // GET Query
        if (req.method === "GET" || req.method === "HEAD") {
          let list = [...records];

          for (const [key, val] of parsedUrl.searchParams.entries()) {
            if (["select", "order", "limit", "offset"].includes(key)) continue;

            if (val.startsWith("eq.")) {
              const target = val.slice(3);
              list = list.filter((r) => String(r[key]) === target);
            } else if (val.startsWith("in.(") && val.endsWith(")")) {
              const items = val
                .slice(4, -1)
                .split(",")
                .map((x) => x.replace(/^["']|["']$/g, "").trim());
              list = list.filter((r) => items.includes(String(r[key])));
            } else if (val.startsWith("like.")) {
              const pattern = val.slice(5).replace(/%/g, ".*");
              const rx = new RegExp(`^${pattern}$`, "i");
              list = list.filter((r) => rx.test(String(r[key] || "")));
            }
          }

          // Order
          const order = parsedUrl.searchParams.get("order");
          if (order) {
            const [field, dir] = order.split(".");
            const desc = dir === "desc";
            list.sort((a, b) => {
              const av = a[field] ?? "";
              const bv = b[field] ?? "";
              if (av < bv) return desc ? 1 : -1;
              if (av > bv) return desc ? -1 : 1;
              return 0;
            });
          }

          // Limit
          const limitStr = parsedUrl.searchParams.get("limit");
          if (limitStr) {
            const limit = parseInt(limitStr, 10);
            if (!isNaN(limit)) list = list.slice(0, limit);
          }

          const prefer = req.headers["prefer"] || "";
          if (prefer.includes("count=exact")) {
            res.setHeader("Content-Range", `0-${Math.max(0, list.length - 1)}/${list.length}`);
          }

          if (req.method === "HEAD") {
            res.writeHead(200);
            res.end();
            return;
          }

          const accept = req.headers["accept"] || "";
          if (accept.includes("application/vnd.pgrst.object+json")) {
            if (list.length === 0) {
              res.writeHead(404, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  code: "PGRST116",
                  message: "JSON object requested, multiple (or no) rows returned",
                }),
              );
              return;
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(list[0]));
            return;
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(list));
          return;
        }

        // POST Insert / Upsert
        if (req.method === "POST") {
          const items = Array.isArray(jsonBody) ? jsonBody : [jsonBody];
          const inserted: any[] = [];

          for (const item of items) {
            const row = { ...item };
            if (!row.id) row.id = crypto.randomUUID();
            if (!row.created_at) row.created_at = new Date().toISOString();
            if (!row.updated_at) row.updated_at = row.created_at;

            if (table === "complaints") {
              if (!row.complaint_code) {
                row.complaint_code = `CMP-2026-${String(db.seq++).padStart(6, "0")}`;
              }
            }

            const existingIdx = records.findIndex((r) => r.id === row.id);
            if (existingIdx >= 0) {
              records[existingIdx] = { ...records[existingIdx], ...row };
              inserted.push(records[existingIdx]);
            } else {
              records.unshift(row);
              inserted.push(row);
            }
          }
          saveDb(db);

          const accept = req.headers["accept"] || "";
          res.writeHead(201, { "Content-Type": "application/json" });
          if (accept.includes("application/vnd.pgrst.object+json")) {
            res.end(JSON.stringify(inserted[0]));
          } else {
            res.end(JSON.stringify(Array.isArray(jsonBody) ? inserted : inserted[0]));
          }
          return;
        }

        // PATCH Update
        if (req.method === "PATCH") {
          const updated: any[] = [];
          for (const r of records) {
            let matches = true;
            for (const [key, val] of parsedUrl.searchParams.entries()) {
              if (["select", "order", "limit"].includes(key)) continue;
              if (val.startsWith("eq.") && String(r[key]) !== val.slice(3)) {
                matches = false;
                break;
              }
            }
            if (matches) {
              Object.assign(r, jsonBody, { updated_at: new Date().toISOString() });
              updated.push(r);
            }
          }
          saveDb(db);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(updated));
          return;
        }

        // DELETE
        if (req.method === "DELETE") {
          const remaining = records.filter((r) => {
            for (const [key, val] of parsedUrl.searchParams.entries()) {
              if (val.startsWith("eq.") && String(r[key]) === val.slice(3)) {
                return false;
              }
            }
            return true;
          });
          (db as any)[table] = remaining;
          saveDb(db);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify([]));
          return;
        }
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Endpoint not found: " + pathname }));
    } catch (err: any) {
      console.error("Local Supabase error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message || "Internal server error" }));
    }
  });

  return true;
}

let standaloneServer: http.Server | null = null;

export function startLocalSupabase(port = 54321): http.Server {
  if (standaloneServer) return standaloneServer;

  standaloneServer = http.createServer((req, res) => {
    handleLocalSupabaseRequest(req, res);
  });

  standaloneServer.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log(`[Local Supabase] Port ${port} in use, skipping standalone listener.`);
    } else {
      console.error("[Local Supabase] Error:", err);
    }
  });

  standaloneServer.listen(port, () => {
    console.log(`[Local Supabase] Listening on http://127.0.0.1:${port}`);
  });

  return standaloneServer;
}
