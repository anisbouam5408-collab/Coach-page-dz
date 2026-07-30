import { createClient } from "@supabase/supabase-js";

// The anon key is safe to ship in client code by design — Row Level
// Security on every table is what actually protects data, not the
// secrecy of this key. See the `private.is_super_admin()` / RLS
// policies applied to the `coachpage-dz` Supabase project.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://glvahsehpyavmyjlduqs.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdmFoc2VocHlhdm15amxkdXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxOTIwMTksImV4cCI6MjEwMDc2ODAxOX0.CUjSURJWjCqGSwshH0_w4O59q3QxSWDAf6JmHt_9mk8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});
