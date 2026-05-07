import { NextResponse } from "next/server";
import { DEMO_MODE, getDemoKeys } from "@/lib/demo";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── DEMO MODE ───────────────────────────────────────────────────────────────
  if (DEMO_MODE) {
    return NextResponse.json({ keys: getDemoKeys(), demo: true });
  }
  // ────────────────────────────────────────────────────────────────────────────

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, session.userId),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
  });

  const maskedKeys = keys.map((k) => ({
    ...k,
    keyValue: k.keyValue
      ? `${k.keyValue.slice(0, 8)}${"•".repeat(20)}${k.keyValue.slice(-4)}`
      : null,
  }));

  return NextResponse.json({ keys: maskedKeys });
}
