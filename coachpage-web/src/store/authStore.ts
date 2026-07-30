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
 * available once they click the confirm link — potentially in a fresh
 * page load with none of the signup form's data in memory. We stash that
 * data in localStorage at signup time and finish creating the `coaches`
 * row here, the first time we see a confirmed session with no matching row.
 */
async function ensureCoachRow(userId: string): Promise<Coach | null> {
  const { data: existing } = await supabase.from("coaches").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return existing as Coach;

  const pending = readPendingRegistration();
  if (!pending) return null;

  const { data: created, error } = await supabase
    .from("coaches")
    .insert({
      user_id: userId,
      username: pending.username,
      full_name: pending.fullName,
      email: pending.email,
      phone_number: pending.phone,
      subscription_status: "TRIAL",
    })
    .select()
    .single();

  if (error) return null;
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
