import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { SubscriptionPlan } from "@/types/domain";

export function usePlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setPlans((data as SubscriptionPlan[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { plans, loading };
}
