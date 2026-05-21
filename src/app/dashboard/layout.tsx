import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DEMO_MODE } from "@/lib/demo";
import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // In demo mode, session is always valid — skip auth check
  if (!DEMO_MODE && !session.isLoggedIn) {
    redirect("/login");
  }

  // Check if user has approved access (skip in demo mode)
  if (!DEMO_MODE && session.accessStatus !== "approved") {
    redirect("/access/status");
  }

  return (
    <DashboardShell phoneNumber={session.phoneNumber || ""} demoMode={DEMO_MODE}>
      {children}
    </DashboardShell>
  );
}
