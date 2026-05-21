import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DEMO_MODE } from "@/lib/demo";

export default async function Home() {
  if (DEMO_MODE) {
    redirect("/login");
  }
  const session = await getSession();
  if (session.isLoggedIn) {
    redirect("/dashboard");
  }
  redirect("/login");
}
