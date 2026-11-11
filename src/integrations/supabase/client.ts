import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const envUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost:3000";
const supabaseUrl =
  typeof window !== "undefined" &&
  (!envUrl || envUrl.includes("127.0.0.1") || envUrl.includes("localhost"))
    ? window.location.origin
    : envUrl;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.sig";

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey ? "Loaded" : "Missing");

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
