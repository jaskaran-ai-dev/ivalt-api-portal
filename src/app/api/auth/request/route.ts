import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/demo";
import { sendBiometricAuthRequest } from "@/lib/ivalt";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const cleanPhone = phoneNumber.replace(/\s/g, "");

    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 900));
      return NextResponse.json({
        success: true,
        message: "Demo: biometric request sent",
        demo: true,
      });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const result = await sendBiometricAuthRequest(cleanPhone);

    if (!result.success) {
      if (result.statusCode === 404) {
        return NextResponse.json(
          { error: "This phone number is not registered with iVALT. Please install and register the iVALT app first." },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: result.message || "Authentication request failed" }, { status: 400 });
    }

    await db
      .insert(users)
      .values({ phoneNumber: cleanPhone })
      .onConflictDoUpdate({
        target: users.phoneNumber,
        set: { updatedAt: new Date() },
      });

    return NextResponse.json({ success: true, message: "Authentication request sent to your iVALT app" });
  } catch (error) {
    console.error("Auth request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
