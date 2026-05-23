import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEMO_MODE, DEMO_USERS } from "@/lib/demo";
const DEMO_USER = DEMO_USERS[0];

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phoneNumber.replace(/\s/g, "");

    // In demo mode, auto-authenticate as admin
    if (DEMO_MODE) {
      const session = await getSession();
      session.userId = DEMO_USER.id;
      session.phoneNumber = DEMO_USER.phoneNumber;
      session.isLoggedIn = true;
      session.accessStatus = "approved";
      session.role = "admin";
      await session.save!();
      
      return NextResponse.json({ success: true, redirect: "/admin/dashboard" });
    }

    // Check if user exists and has admin role
    let user = await db.query.users.findFirst({
      where: eq(users.phoneNumber, cleanPhone),
    });

    if (!user) {
      // Create user with admin role
      const [newUser] = await db
        .insert(users)
        .values({ phoneNumber: cleanPhone, role: "admin" })
        .returning();
      user = newUser;
    } else if (user.role !== "admin") {
      // Update existing user to admin
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, user.id));
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.phoneNumber = cleanPhone;
    session.isLoggedIn = true;
    session.accessStatus = (user.status as "pending" | "approved" | "rejected") || "approved";
    session.role = "admin";
    await session.save!();

    return NextResponse.json({ success: true, redirect: "/admin/dashboard" });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}