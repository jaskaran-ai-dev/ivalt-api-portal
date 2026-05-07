"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  LogOut, 
  Key, 
  FlaskConical,
  ExternalLink,
  HelpCircle,
  Settings,
  Minus
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";

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
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarContentLayout 
        children={children}
        phoneNumber={phoneNumber}
        demoMode={demoMode}
      />
    </SidebarProvider>
  );
}

function SidebarContentLayout({ children, phoneNumber, demoMode }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
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
    <>
      <Sidebar className="border-r border-sidebar-border/80 bg-sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border/80">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="size-9 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1 group-data-[state=collapsed]:hidden">
              <p className="font-semibold text-sm">iVALT</p>
              <p className="text-xs text-sidebar-foreground/60">Developer Portal</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-2">
          {/* Demo badge - only show when expanded */}
          {demoMode && (
            <div className="mb-2 px-2 group-data-[state=collapsed]:hidden">
              <div className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                <FlaskConical className="w-4 h-4 shrink-0" />
                <span className="truncate">Demo Mode Active</span>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden px-2 py-1 text-xs">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon className="w-5 h-5" />
                          <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                          {isActive && (
                            <div className="ml-auto size-1.5 rounded-full bg-primary group-data-[state=collapsed]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2" />

          {/* Secondary Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden px-2 py-1 text-xs">
              Resources
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Postman Collection"
                    asChild
                  >
                    <a 
                      href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span className="group-data-[state=collapsed]:hidden">Postman Docs</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Help & Support"
                    asChild
                  >
                    <Link href="#">
                      <HelpCircle className="w-5 h-5" />
                      <span className="group-data-[state=collapsed]:hidden">Help</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Settings"
                    asChild
                  >
                    <Link href="#">
                      <Settings className="w-5 h-5" />
                      <span className="group-data-[state=collapsed]:hidden">Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
          {/* User section */}
          <div className="mb-2 px-2 group-data-[state=collapsed]:hidden">
            <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/80 p-2.5">
              <div className="size-8 rounded-2xl bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                {phoneNumber.slice(-2) || "DM"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">
                  {demoMode ? "Demo User" : maskedPhone}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {demoMode ? "Demo account" : "Verified via iVALT"}
                </p>
              </div>
            </div>
          </div>

          {/* Logout button */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                disabled={loggingOut}
                tooltip={demoMode ? "Exit Demo" : "Log out"}
                className="text-sidebar-foreground/80 hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="group-data-[state=collapsed]:hidden">
                  {loggingOut ? "Logging out…" : demoMode ? "Exit Demo" : "Log out"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* Rail for expand on hover */}
        <SidebarRail />
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        {/* Top bar */}
        <header className="flex items-center gap-4 border-b border-border/80 bg-card/90 px-6 py-4 shadow-sm shadow-foreground/5 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="hidden text-xs text-muted-foreground md:inline">⌘B to toggle</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-foreground">
              {activeItem?.label || "Dashboard"}
            </h1>
          </div>
          {demoMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <FlaskConical className="w-4 h-4" />
              Demo
            </span>
          )}
          <a
            href="https://documenter.getpostman.com/view/10533913/2sB2j4grRW"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-sm font-medium text-primary underline-offset-4 hover:underline sm:inline"
          >
            API Ref ↗
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(97,31,105,0.06),transparent_32%),var(--background)] p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
