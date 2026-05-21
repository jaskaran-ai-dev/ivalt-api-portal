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

    // Check if user exists and is already approved
    const existingUser = await db.query.users.findFirst({
      where: (u) => u.phoneNumber === cleanPhone,
    });

    // If user exists and is approved, no need to create access request again
    if (existingUser && existingUser.status === "approved") {
      return NextResponse.json({ success: true, message: "Authentication request sent to your iVALT app" });
    }

    await db
      .insert(users)
      .values({ phoneNumber: cleanPhone, status: "pending" })
      .onConflictDoUpdate({
        target: users.phoneNumber,
        set: { updatedAt: new Date(), status: "pending" },
      });

    return NextResponse.json({ success: true, message: "Authentication request sent to your iVALT app" });
  } catch (error) {
    console.error("Auth request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
