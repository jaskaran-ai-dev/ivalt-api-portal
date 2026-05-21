"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Users, Key, LayoutDashboard, LogOut } from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const adminNavItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Access Requests", href: "/admin/requests", icon: ShieldCheck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "API Keys", href: "/admin/keys", icon: Key },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebarLayout children={children} />
    </SidebarProvider>
  );
}

function AdminSidebarLayout({ children }: AdminShellProps) {
  const pathname = usePathname();

  const activeItem = adminNavItems.find(
    (n) => n.href === pathname || (n.href !== "/admin/dashboard" && pathname.startsWith(n.href))
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
              <p className="font-semibold text-sm">iVALT Admin</p>
              <p className="text-xs text-sidebar-foreground/60">Access Control Panel</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[state=collapsed]:hidden px-2 py-1 text-xs">
              Admin Panel
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border px-2 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/login">
                  <LogOut className="w-5 h-5" />
                  <span className="group-data-[state=collapsed]:hidden">Admin Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center gap-4 border-b border-border/80 bg-card/90 px-6 py-4 shadow-sm shadow-foreground/5 backdrop-blur shrink-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-foreground">
              {activeItem?.label || "Admin"}
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}