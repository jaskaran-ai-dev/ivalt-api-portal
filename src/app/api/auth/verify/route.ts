import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, DEMO_SESSION, DEMO_USER } from "@/lib/demo";
import { getBiometricResult } from "@/lib/ivalt";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      // Simulate 2 "pending" polls then immediately succeed
      const { searchParams } = new URL(req.url);
      await new Promise((r) => setTimeout(r, 400));
      // Always return authenticated in demo — the client polls and we just say yes
      return NextResponse.json({ status: "authenticated", demo: true });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const cleanPhone = phoneNumber.replace(/\s/g, "");
    const result = await getBiometricResult(cleanPhone);

    if (result.status === "authenticated") {
      let user = await db.query.users.findFirst({
        where: eq(users.phoneNumber, cleanPhone),
      });

      if (!user) {
        const [newUser] = await db
          .insert(users)
          .values({ phoneNumber: cleanPhone })
          .returning();
        user = newUser;
      } else {
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));
      }

      const session = await getSession();
      session.userId = user.id;
      session.phoneNumber = cleanPhone;
      session.isLoggedIn = true;
      await session.save!();

      return NextResponse.json({ status: "authenticated" });
    }

    return NextResponse.json({ status: result.status, statusCode: result.statusCode });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
