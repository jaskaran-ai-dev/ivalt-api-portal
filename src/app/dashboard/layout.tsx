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

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  if (session.accessStatus !== "approved") {
    redirect("/access/status");
  }

  return (
    <DashboardShell phoneNumber={session.phoneNumber || ""} demoMode={DEMO_MODE}>
      {children}
    </DashboardShell>
  );
}
