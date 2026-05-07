import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";

export async function POST() {
  // In demo mode there is no real session cookie — just respond OK
  if (DEMO_MODE) {
    return NextResponse.json({ success: true, demo: true });
  }

  const session = await getIronSession(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ success: true });
}
