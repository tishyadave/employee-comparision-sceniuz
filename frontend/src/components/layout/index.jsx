import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import PillNav from "@/component/PillNav/PillNav";

const EMPLOYEE_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/self-assessment", label: "Self Assessment" },
  { to: "/test", label: "MCQ Test" },
  { to: "/results", label: "My Results" },
  { to: "/leaderboard", label: "Leaderboard" },
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/analytics", label: "Analytics" },
];

const SUPER_ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/employees", label: "Employees" },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/super", label: "Team Leads" },
];

function UserMenu() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center">
      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 hover:bg-red-500/20 hover:text-red-400"
        title="Sign out"
        style={{
          padding: '10px 14px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.7)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <LogOut size={14} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}

function TopBar({ links }) {
  const location = useLocation();
  const pillItems = links.map((link) => ({
    href: link.to,
    label: link.label,
  }));

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
      <div
        className="h-20 px-8"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        {/* Logo - Clean and Simple (As Is with White Background) */}
        <div className="flex items-center justify-start">
          <img
            src="/sceniuz_new_logo.png"
            alt="Sceniuz Logo"
            style={{
              height: "56px",
              width: "auto",
              display: "block",
              borderRadius: "6px",
            }}
          />
        </div>







        {/* Center-aligned Navbar */}
        <div className="flex justify-center">
          <PillNav
            items={pillItems}
            activeHref={location.pathname}
            baseColor="#000000"
            pillColor="#eeeeee"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#000000"
            initialLoadAnimation={false}
          />
        </div>

        {/* User Menu - Extreme Right */}
        <div className="flex justify-end">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

export function EmployeeLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface-50">
      <TopBar links={EMPLOYEE_LINKS} />
      <main className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}

export function AdminLayout({ children }) {
  const { user } = useAuth();
  const links = user?.role === "SUPER_ADMIN" ? SUPER_ADMIN_LINKS : ADMIN_LINKS;

  return (
    <div className="min-h-screen bg-surface-50">
      <TopBar links={links} />
      <main className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}