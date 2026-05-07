import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, getDemoKeys, addDemoKey } from "@/lib/demo";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { createAwsApiKey } from "@/lib/aws-gateway";

const MAX_KEYS_PER_USER = 4;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { keyName } = await req.json();

    if (!keyName || typeof keyName !== "string" || keyName.trim().length < 3) {
      return NextResponse.json({ error: "Key name must be at least 3 characters" }, { status: 400 });
    }

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      const currentKeys = getDemoKeys();
      if (currentKeys.length >= MAX_KEYS_PER_USER) {
        return NextResponse.json(
          { error: `You can have a maximum of ${MAX_KEYS_PER_USER} API keys` },
          { status: 403 }
        );
      }

      await new Promise((r) => setTimeout(r, 600));

      const fakeKeyValue = `ivalt_demo_${ Math.random().toString(36).slice(2, 18) }`;
      const newKey = {
        id: `demo-key-${Date.now()}`,
        userId: session.userId,
        awsKeyId: `aws-demo-${Math.random().toString(36).slice(2, 14)}`,
        keyName: keyName.trim(),
        keyValue: fakeKeyValue,
        isActive: true,
        usagePlanId: "demo-plan-001",
        createdAt: new Date(),
        lastUsedAt: null,
      };

      addDemoKey(newKey);

      return NextResponse.json({
        key: newKey,
        message: "Demo API key created. Save it now — you won't see it again.",
        demo: true,
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const [{ value: keyCount }] = await db
      .select({ value: count() })
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.userId));

    if (Number(keyCount) >= MAX_KEYS_PER_USER) {
      return NextResponse.json(
        { error: `You can have a maximum of ${MAX_KEYS_PER_USER} API keys` },
        { status: 403 }
      );
    }

    const sanitizedName = `ivalt-portal-${session.userId.slice(0, 8)}-${keyName.trim().replace(/[^a-zA-Z0-9-_]/g, "-")}`;
    const awsKey = await createAwsApiKey(sanitizedName, `Portal key for user ${session.userId}`);

    const [newKey] = await db
      .insert(apiKeys)
      .values({
        userId: session.userId,
        awsKeyId: awsKey.id,
        keyName: keyName.trim(),
        keyValue: awsKey.value,
        isActive: true,
        usagePlanId: process.env.AWS_API_GATEWAY_USAGE_PLAN_ID,
      })
      .returning();

    return NextResponse.json({
      key: { ...newKey, keyValue: awsKey.value },
      message: "API key created. Save it now — you won't be able to see the full key again.",
    });
  } catch (error) {
    console.error("Create key error:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
