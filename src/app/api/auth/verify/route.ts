import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, DEMO_SESSION, DEMO_USER } from "@/lib/demo";
import { getBiometricResult } from "@/lib/ivalt";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, accessRequests } from "@/db/schema";
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
          .values({ phoneNumber: cleanPhone, status: "pending" })
          .returning();
        user = newUser;
      } else {
        await db
          .update(users)
          .set({ lastLoginAt: new Date(), updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }

      // If user is not yet approved, create an access request if one doesn't exist
      if (user.status === "pending") {
        const existingRequest = await db.query.accessRequests.findFirst({
          where: (ar) => ar.userId === user.id,
        });

        if (!existingRequest) {
          await db.insert(accessRequests).values({
            userId: user.id,
            useCase: "",
            requestedAt: new Date(),
          });
        }
      }

      const session = await getSession();
      session.userId = user.id;
      session.phoneNumber = cleanPhone;
      session.isLoggedIn = true;
      session.accessStatus = user.status;
      await session.save!();

      return NextResponse.json({ status: "authenticated", accessStatus: user.status });
    }

    return NextResponse.json({ status: result.status, statusCode: result.statusCode });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
