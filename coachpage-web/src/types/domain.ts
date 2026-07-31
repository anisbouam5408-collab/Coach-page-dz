export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "PENDING_APPROVAL";
export type SubscriptionPlanCode = "MONTHLY" | "QUARTERLY" | "FIVE_MONTHS";

export interface SubscriptionPlan {
  code: SubscriptionPlanCode;
  label: string;
  price_dzd: number;
  duration_days: number;
  sort_order: number;
}

export interface Coach {
  id: number;
  user_id: string | null;
  username: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  bio: string | null;
  specialty: string | null;
  photo_url: string | null;
  subscription_price: number;
  subscription_status: SubscriptionStatus;
  subscription_plan: SubscriptionPlanCode | null;
  subscription_expires_at: string | null;
  registered_at: string;
}

export type ClientStatus = "ACTIVE" | "PAUSED" | "EXPIRED";

export interface Client {
  id: number;
  coach_id: number;
  full_name: string;
  email: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: "male" | "female";
  activity_level: string;
  fitness_goal: string | null;
  training_program: string | null;
  phone_number: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  injuries: string | null;
  status: ClientStatus;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  tags: string[];
  coach_notes: string | null;
  active_status: boolean;
  access_code: string;
}

export interface PlatformSettings {
  id: number;
  owner_whatsapp: string;
  owner_ccp: string;
  coach_monthly_price: number;
  platform_name: string;
}
