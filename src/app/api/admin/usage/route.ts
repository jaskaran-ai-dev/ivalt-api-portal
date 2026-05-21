import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys, apiKeyUsage } from "@/db/schema";
import { fetchApiKeyUsage } from "@/lib/api-gateway-usage";
import { eq } from "drizzle-orm";
import { DEMO_MODE, getDemoAdminUsage } from "@/lib/demo";

export async function GET(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json(getDemoAdminUsage());
    }
    // ──────────────────────────────────────────────────────────────────────────

    const usageData = await fetchApiKeyUsage();

    // Get all API keys with user info
    const allKeys = await db.query.apiKeys.findMany({
      with: {
        user: true,
      },
    });

    // Build usage statistics
    const keysWithUsage = allKeys.map((key) => {
      const usage = usageData.find((u) => u.awsKeyId === key.awsKeyId);
      return {
        id: key.id,
        keyName: key.keyName,
        awsKeyId: key.awsKeyId,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt,
        usageCount: usage?.usageCount || 0,
        user: key.user
          ? {
              id: key.user.id,
              name: key.user.name,
              phoneNumber: key.user.phoneNumber,
              role: key.user.role,
            }
          : null,
      };
    });

    // Calculate totals
    const totalKeys = keysWithUsage.length;
    const activeKeys = keysWithUsage.filter((k) => k.isActive).length;
    const totalRequests = keysWithUsage.reduce((sum, k) => sum + k.usageCount, 0);
    const recentlyUsed = keysWithUsage.filter(
      (k) => k.lastUsedAt && new Date(k.lastUsedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    const inactive = keysWithUsage.filter(
      (k) => !k.lastUsedAt || new Date(k.lastUsedAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    return NextResponse.json({
      usage: keysWithUsage,
      summary: {
        totalKeys,
        activeKeys,
        inactiveKeys: inactive,
        recentlyUsed,
        totalRequests,
      },
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json({
      usage: [],
      summary: {
        totalKeys: 0,
        activeKeys: 0,
        inactiveKeys: 0,
        recentlyUsed: 0,
        totalRequests: 0,
      },
      error: "Internal server error",
    }, { status: 500 });
  }
}