import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, getDemoAdminKeys } from "@/lib/demo";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ keys: getDemoAdminKeys() });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const allKeys = await db.query.apiKeys.findMany({
      with: {
        user: {
          columns: {
            id: true,
            phoneNumber: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Add usage counts (you could integrate with actual usage tracking here)
    const keysWithUsage = allKeys.map((key) => ({
      id: key.id,
      keyName: key.keyName,
      awsKeyId: key.awsKeyId,
      keyValue: null, // Never expose the actual key value
      isActive: key.isActive,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: 0, // Would come from actual usage tracking
      user: key.user
        ? {
            id: key.user.id,
            phoneNumber: key.user.phoneNumber,
            name: key.user.name,
            status: key.user.status,
          }
        : null,
    }));

    return NextResponse.json({ keys: keysWithUsage });
  } catch (error) {
    console.error("Get keys error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}