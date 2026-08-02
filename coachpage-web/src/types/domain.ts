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

export interface Exercise {
  id: number;
  coach_id: number;
  name: string;
  muscle_group: string | null;
  is_cardio: boolean;
  notes: string | null;
  created_at: string;
}

export interface TrainingProgram {
  id: number;
  coach_id: number;
  client_id: number | null;
  name: string;
  split_type: string | null;
  is_template: boolean;
  notes: string | null;
  created_at: string;
}

export interface TrainingDay {
  id: number;
  program_id: number;
  name: string;
  order_index: number;
}

export interface TrainingExercise {
  id: number;
  training_day_id: number;
  exercise_id: number | null;
  exercise_name: string;
  sets: number | null;
  reps: string | null;
  rest_seconds: number | null;
  is_cardio: boolean;
  cardio_duration_minutes: number | null;
  notes: string | null;
  order_index: number;
}

export interface WeightLog {
  id: number;
  client_id: number;
  date: string;
  weight: number;
}

export interface MeasurementLog {
  id: number;
  client_id: number;
  date: string;
  body_fat_pct: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  arm: number | null;
  thigh: number | null;
  notes: string | null;
  created_at: string;
}

export type ProgressPhotoType = "before" | "after" | "progress";

export interface ProgressPhoto {
  id: number;
  client_id: number;
  photo_url: string;
  photo_type: ProgressPhotoType;
  taken_at: string;
  created_at: string;
}

export interface NutritionProgram {
  id: number;
  coach_id: number;
  client_id: number | null;
  name: string;
  daily_calories: number | null;
  is_template: boolean;
  notes: string | null;
  created_at: string;
}

export interface NutritionMeal {
  id: number;
  program_id: number;
  name: string;
  time_of_day: string | null;
  items: string | null;
  calories: number | null;
  order_index: number;
}

export type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: number;
  coach_id: number;
  client_id: number | null;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
}

export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED";

export interface Invoice {
  id: number;
  coach_id: number;
  client_id: number | null;
  amount_dzd: number;
  description: string | null;
  status: InvoiceStatus;
  issued_at: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}
