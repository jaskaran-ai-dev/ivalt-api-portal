import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, accessRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({
        status: session.accessStatus || "pending",
        request: null,
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const request = await db.query.accessRequests.findFirst({
      where: (ar) => ar.userId === userId,
    });

    // Return the user's status - if no user record, they need to complete access request
    return NextResponse.json({
      status: user?.status || "pending",
      request: request || null,
    });
  } catch (error) {
    console.error("Get access status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}