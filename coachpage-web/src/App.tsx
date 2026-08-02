import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Coach } from "@/types/domain";
import { LandingPage } from "@/pages/LandingPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { ClientDetailPage } from "@/pages/ClientDetailPage";
import { AdminPage } from "@/pages/AdminPage";
import { GuidePage } from "@/pages/GuidePage";
import { TermsPage } from "@/pages/TermsPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SubscriptionLockedPage } from "@/pages/SubscriptionLockedPage";
import { SettingsPage } from "@/pages/SettingsPage";

// Trial and paid periods both end on subscription_expires_at; PENDING_APPROVAL
// coaches aren't locked here since they haven't started a period at all yet.
function isSubscriptionExpired(coach: Coach): boolean {
  if (coach.subscription_status === "EXPIRED") return true;
  if (coach.subscription_status === "PENDING_APPROVAL") return false;
  if (!coach.subscription_expires_at) return false;
  return new Date(coach.subscription_expires_at).getTime() < Date.now();
}

function RequireCoach({ children }: { children: React.ReactNode }) {
  const { ready, session, coach } = useAuthStore();
  if (!ready) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (coach && isSubscriptionExpired(coach)) return <SubscriptionLockedPage coach={coach} />;
  return <>{children}</>;
}

function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const { ready, session, isSuperAdmin } = useAuthStore();
  if (!ready) return null;
  if (!session || !isSuperAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireCoach>
              <DashboardPage />
            </RequireCoach>
          }
        />
        <Route
          path="/dashboard/clients/:id"
          element={
            <RequireCoach>
              <ClientDetailPage />
            </RequireCoach>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <RequireCoach>
              <SettingsPage />
            </RequireCoach>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireSuperAdmin>
              <AdminPage />
            </RequireSuperAdmin>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
