const KEY = "coachpage:pending-registration";

export interface PendingRegistration {
  fullName: string;
  username: string;
  phone: string;
  email: string;
}

export function savePendingRegistration(data: PendingRegistration) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function readPendingRegistration(): PendingRegistration | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  localStorage.removeItem(KEY);
}
