import React, { useState, useEffect, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/ui";

// Roles that have admin panel access
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    // "ADMIN" requirement is satisfied by both ADMIN and SUPER_ADMIN
    if (requiredRole === "ADMIN" && ADMIN_ROLES.includes(user?.role)) {
      return children;
    }
    // Exact role match for EMPLOYEE and SUPER_ADMIN-specific routes
    if (user?.role !== requiredRole) {
      const home = ADMIN_ROLES.includes(user?.role) ? "/admin/dashboard" : "/dashboard";
      return <Navigate to={home} replace />;
    }
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Was the user a guest (not authenticated) when GuestRoute first rendered with data?
  const mountedAsGuest = useRef(null);
  // Has the redirect delay been activated? (set synchronously during render)
  const shouldDelay = useRef(false);
  // Force re-render after timer completes
  const [, forceUpdate] = useState(0);

  // On first non-loading render, record whether user was a guest
  if (mountedAsGuest.current === null && !isLoading) {
    mountedAsGuest.current = !isAuthenticated;
  }

  // SYNCHRONOUS detection: if user was a guest and just became authenticated,
  // flag the delay immediately (before the return statement below).
  if (isAuthenticated && mountedAsGuest.current && !shouldDelay.current) {
    shouldDelay.current = true;
  }

  // Timer effect: navigate after 3s, then clear the delay flag
  useEffect(() => {
    if (!shouldDelay.current) return;
    const timer = setTimeout(() => {
      const home = ADMIN_ROLES.includes(user?.role) ? "/admin/dashboard" : "/dashboard";
      shouldDelay.current = false;
      navigate(home, { replace: true });
      forceUpdate(n => n + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  if (isLoading) return <PageLoader />;

  // During the toast delay, keep showing children (LoginPage with its toast)
  if (shouldDelay.current) return children;

  // Already authenticated on page load (session restore) — redirect immediately
  if (isAuthenticated) {
    const home = ADMIN_ROLES.includes(user?.role) ? "/admin/dashboard" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}
