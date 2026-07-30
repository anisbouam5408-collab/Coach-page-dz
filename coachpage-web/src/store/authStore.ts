import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Coach } from "@/types/domain";
import { clearPendingRegistration, readPendingRegistration } from "@/lib/pendingRegistration";

interface AuthState {
  ready: boolean;
  session: Session | null;
  coach: Coach | null;
  isSuperAdmin: boolean;
  init: () => Promise<void>;
  refreshCoach: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * When email confirmation is enabled, the coach's session only becomes
 * available once they click the confirm link — often in a completely
 * different browser/app than the one used to fill out the signup form
 * (e.g. a mail app's in-app browser on mobile), so localStorage saved at
 * signup time may not be there. The signup call also stores the same
 * details in the auth user's metadata, which travels with the account
 * server-side and is always available here — that's the primary source;
 * localStorage and generated defaults are just fallbacks so this never
 * gets stuck unable to create the row.
 */
async function ensureCoachRow(userId: string): Promise<Coach | null> {
  const { data: existing } = await supabase.from("coaches").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return existing as Coach;

  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData.user;
  const metadata = (authUser?.user_metadata ?? {}) as { full_name?: string; username?: string; phone?: string };
  const pending = readPendingRegistration();

  const username = metadata.username || pending?.username || `coach_${userId.slice(0, 8)}`;
  const fullName = metadata.full_name || pending?.fullName || authUser?.email?.split("@")[0] || "مدرب جديد";
  const phone = metadata.phone || pending?.phone || "";
  const email = authUser?.email || pending?.email || "";

  const { data: created, error } = await supabase
    .from("coaches")
    .insert({
      user_id: userId,
      username,
      full_name: fullName,
      email,
      phone_number: phone,
      subscription_status: "TRIAL",
      // Legacy column from the original Flask app's own password auth,
      // which this app doesn't use (Supabase Auth handles it) but the
      // column is still NOT NULL with no default — a random placeholder
      // keeps the insert valid without meaning anything.
      password_hash: crypto.randomUUID(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create coach row:", error.message);
    return null;
  }
  clearPendingRegistration();
  return created as Coach;
}

async function loadCoachAndRole(userId: string) {
  const [coach, { data: isSuperAdmin }] = await Promise.all([ensureCoachRow(userId), supabase.rpc("am_i_super_admin")]);
  return { coach, isSuperAdmin: Boolean(isSuperAdmin) };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  coach: null,
  isSuperAdmin: false,

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { coach, isSuperAdmin } = await loadCoachAndRole(session.user.id);
      set({ session, coach, isSuperAdmin, ready: true });
    } else {
      set({ session: null, coach: null, isSuperAdmin: false, ready: true });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { coach, isSuperAdmin } = await loadCoachAndRole(session.user.id);
        set({ session, coach, isSuperAdmin, ready: true });
      } else {
        set({ session: null, coach: null, isSuperAdmin: false, ready: true });
      }
    });
  },

  refreshCoach: async () => {
    const { session } = get();
    if (!session) return;
    const { coach, isSuperAdmin } = await loadCoachAndRole(session.user.id);
    set({ coach, isSuperAdmin });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, coach: null, isSuperAdmin: false });
  },
}));
