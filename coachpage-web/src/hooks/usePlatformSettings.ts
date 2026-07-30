import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PlatformSettings } from "@/types/domain";

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    supabase
      .from("platform_settings")
      .select("*")
      .maybeSingle()
      .then(({ data }) => {
        setSettings((data as PlatformSettings) ?? null);
      });
  }, []);

  return settings;
}
