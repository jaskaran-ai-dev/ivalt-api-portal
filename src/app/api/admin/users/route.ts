import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, getDemoAdminUsers } from "@/lib/demo";
import { db } from "@/db";
import { users, apiKeys } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ users: getDemoAdminUsers() });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        phoneNumber: true,
        name: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
    });

    // Count API keys for each user
    const usersWithKeyCounts = await Promise.all(
      allUsers.map(async (user) => {
        const keyCount = await db.select({ count: count(apiKeys) }).from(apiKeys).where(eq(apiKeys.userId, user.id));
        return {
          ...user,
          apiKeyCount: keyCount[0]?.count || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithKeyCounts });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}