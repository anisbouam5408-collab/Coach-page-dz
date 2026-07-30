import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Coach } from "@/types/domain";

interface AuthState {
  ready: boolean;
  session: Session | null;
  coach: Coach | null;
  isSuperAdmin: boolean;
  init: () => Promise<void>;
  refreshCoach: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function loadCoachAndRole(userId: string) {
  const [{ data: coach }, { data: isSuperAdmin }] = await Promise.all([
    supabase.from("coaches").select("*").eq("user_id", userId).maybeSingle(),
    supabase.rpc("am_i_super_admin"),
  ]);
  return { coach: (coach as Coach | null) ?? null, isSuperAdmin: Boolean(isSuperAdmin) };
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
