"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, LayoutDashboard, BookOpen, LogOut, Menu, X, Key, FlaskConical } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "API Keys", href: "/dashboard/keys", icon: Key },
  { label: "API Docs", href: "/dashboard/docs", icon: BookOpen },
];

interface DashboardShellProps {
  children: React.ReactNode;
  phoneNumber: string;
  demoMode?: boolean;
}

export default function DashboardShell({ children, phoneNumber, demoMode = false }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(demoMode ? "Exited demo mode" : "Logged out successfully");
    router.push("/login");
  };

  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, Math.min(4, phoneNumber.length))}••••${phoneNumber.slice(-3)}`
    : "Unknown";

  const activeItem = navItems.find(
    (n) => n.href === pathname || (n.href !== "/dashboard" && pathname.startsWith(n.href))
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "256px", backgroundColor: "#282c33", flexShrink: 0, borderRight: "1px solid rgba(220, 224, 229, 0.08)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(220, 224, 229, 0.1)", boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px inset" }}>
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0"
            style={{ background: "rgba(19, 72, 220, 0.15)", borderRadius: "2px", border: "1px solid rgba(19, 72, 220, 0.3)" }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: "#8ec5ff" }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm" style={{ fontFamily: "var(--font-plex-serif)", color: "#ffffff", letterSpacing: "-0.02em" }}>
              iVALT
            </p>
            <p className="text-xs" style={{ color: "rgba(220, 224, 229, 0.5)", fontFamily: "var(--font-writer)", letterSpacing: "-0.025em" }}>
              Developer Portal
            </p>
          </div>
          <button 
            className="ml-auto lg:hidden" 
            style={{ color: "rgba(220, 224, 229, 0.5)", borderRadius: "2px", padding: "4px" }}
            onClick={() => setSidebarOpen(false)}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(220, 224, 229, 0.5)")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo badge */}
        {demoMode && (
          <div className="px-4 pt-3">
            <div
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"
              style={{ 
                backgroundColor: "rgba(142, 197, 255, 0.1)", 
                color: "#8ec5ff", 
                fontFamily: "var(--font-writer)", 
                letterSpacing: "-0.025em",
                borderRadius: "2px",
                border: "1px solid rgba(142, 197, 255, 0.2)",
                boxShadow: "rgba(5, 55, 148, 0.1) 0px -2px 0px 0px inset"
              }}
            >
              <FlaskConical className="w-4 h-4 shrink-0" />
              Demo Mode Active
            </div>
          </div>
        )}

        {/* User info */}
        <div className="px-4 py-4 border-b" style={{ borderColor: "rgba(220, 224, 229, 0.08)" }}>
          <div
            className="flex items-center gap-3 px-3 py-2.5"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.04)", 
              borderRadius: "2px",
              border: "1px solid rgba(220, 224, 229, 0.1)",
              boxShadow: "rgba(0, 0, 0, 0.1) 0px -2px 0px 0px inset"
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ 
                background: "linear-gradient(102deg, #1348dc, #2b7fff)", 
                color: "#fff",
                fontFamily: "var(--font-plex-serif)"
              }}
            >
              {phoneNumber.slice(-2) || "DM"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ 
                color: "#ffffff", 
                fontFamily: "var(--font-writer)", 
                letterSpacing: "-0.025em" 
              }}>
                {demoMode ? "Demo User" : maskedPhone}
              </p>
              <p className="text-xs" style={{ 
                color: "rgba(220, 224, 229, 0.4)", 
                fontFamily: "var(--font-writer)" 
              }}>
                {demoMode ? "Demo account" : "Verified via iVALT"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 transition-all text-sm font-medium"
                style={{
                  backgroundColor: isActive ? "rgba(19, 72, 220, 0.12)" : "transparent",
                  color: isActive ? "#ffffff" : "rgba(220, 224, 229, 0.6)",
                  fontFamily: "var(--font-writer)",
                  letterSpacing: "-0.025em",
                  borderRadius: "2px",
                  border: isActive ? "1px solid rgba(19, 72, 220, 0.3)" : "1px solid transparent",
                  boxShadow: isActive ? "rgba(5, 55, 148, 0.15) 0px -2px 0px 0px inset" : "rgba(0, 0, 0, 0.05) 0px -2px 0px 0px inset",
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <Icon className="w-5 h-5 shrink-0" style={{ color: isActive ? "#8ec5ff" : "rgba(220, 224, 229, 0.6)" }} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#8ec5ff" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(220, 224, 229, 0.08)", boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 0px 0px inset" }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-sm font-medium"
            style={{ 
              color: "rgba(220, 224, 229, 0.6)", 
              fontFamily: "var(--font-writer)", 
              letterSpacing: "-0.025em",
              borderRadius: "2px",
              backgroundColor: "transparent",
              border: "1px solid transparent"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
              e.currentTarget.style.borderColor = "rgba(220, 224, 229, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <LogOut className="w-5 h-5" style={{ color: "rgba(220, 224, 229, 0.6)" }} />
            {loggingOut ? "Logging out…" : demoMode ? "Exit Demo" : "Log out"}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="flex items-center gap-4 px-6 py-4 border-b shrink-0"
          style={{ backgroundColor: "#fff", borderColor: "#cccfd3", boxShadow: "rgba(0,0,0,0.04) 0px 1px 0px 0px" }}
        >
          <button
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(true)}
            style={{ color: "#5d636f", borderRadius: "2px" }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1
              className="font-semibold text-base truncate"
              style={{ fontFamily: "'IBM Plex Serif', serif", color: "#3a3d43", letterSpacing: "-0.02em" }}
            >
              {activeItem?.label || "Dashboard"}
            </h1>
          </div>
          {demoMode && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 shrink-0"
              style={{ backgroundColor: "#bedbff", color: "#1348dc", border: "1px solid #8ec5ff", borderRadius: "2px" }}
            >
              <FlaskConical className="w-4 h-4" />
              Demo
            </span>
          )}
          <a
            href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium shrink-0"
            style={{ color: "#2b7fff", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.025em" }}
          >
            API Ref ↗
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
