import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, GuestRoute } from "@/components/ui/ProtectedRoute";
import { EmployeeLayout, AdminLayout } from "./components/layout";
import { PageLoader } from "@/components/ui";

// ── Lazy-loaded pages ──────────────────────────────────────────────────────────
const LoginPage = lazy(() => import("@/pages/auth/LoginPage.draft.jsx"));

// Employee
const EmployeeDashboard = lazy(() => import("@/pages/employee/DashboardPage.draft"));
const SelfAssessmentPage = lazy(() => import("@/pages/employee/SelfAssessmentPage"));
const TestPage = lazy(() => import("@/pages/employee/TestPage.draft"));
const ResultsPage = lazy(() => import("@/pages/employee/ResultsPage.draft"));
const LeaderboardPage = lazy(() => import("@/pages/employee/LeaderboardPage.draft"));
const SecretPage = lazy(() => import("@/pages/employee/SecretPage"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/admin/DashboardPage"));
const EmployeesPage = lazy(() => import("@/pages/admin/EmployeesPage.draft"));
const QuestionsPage = lazy(() => import("@/pages/admin/QuestionsPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const SuperAdminPage = lazy(() => import("@/pages/admin/SuperAdminPage"));

// ── Wrappers ───────────────────────────────────────────────────────────────────
function EmpPage({ children }) {
  return (
    <ProtectedRoute requiredRole="EMPLOYEE">
      <EmployeeLayout>{children}</EmployeeLayout>
    </ProtectedRoute>
  );
}

function AdmPage({ children }) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function SuperAdmPage({ children }) {
  return (
    <ProtectedRoute requiredRole="SUPER_ADMIN">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

            {/* Employee routes */}
            <Route path="/dashboard" element={<EmpPage><EmployeeDashboard /></EmpPage>} />
            <Route path="/self-assessment" element={<EmpPage><SelfAssessmentPage /></EmpPage>} />
            <Route path="/test" element={<EmpPage><TestPage /></EmpPage>} />
            <Route path="/results" element={<EmpPage><ResultsPage /></EmpPage>} />
            <Route path="/leaderboard" element={<EmpPage><LeaderboardPage /></EmpPage>} />
            <Route path="/secret" element={<EmpPage><SecretPage /></EmpPage>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<AdmPage><AdminDashboard /></AdmPage>} />
            <Route path="/admin/employees" element={<AdmPage><EmployeesPage /></AdmPage>} />
            <Route path="/admin/questions" element={<AdmPage><QuestionsPage /></AdmPage>} />
            <Route path="/admin/analytics" element={<AdmPage><AnalyticsPage /></AdmPage>} />

            {/* Super Admin only routes */}
            <Route path="/admin/super" element={<SuperAdmPage><SuperAdminPage /></SuperAdmPage>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-5xl font-bold text-slate-200">404</p>
                <p className="text-slate-500 text-sm">Page not found</p>
                <a href="/login" className="btn-primary">Go home</a>
              </div>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}