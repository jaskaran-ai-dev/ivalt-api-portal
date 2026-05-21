import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, accessRequests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { useCase } = await req.json();

    if (!useCase || typeof useCase !== "string") {
      return NextResponse.json({ error: "Use case is required" }, { status: 400 });
    }

    // Check if user already has a pending request
    const existingRequest = await db.query.accessRequests.findFirst({
      where: (ar) => ar.userId === userId,
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: "Access request already submitted. Please wait for admin approval.",
        existing: true 
      }, { status: 400 });
    }

    // Create access request
    await db.insert(accessRequests).values({
      userId,
      useCase,
      requestedAt: new Date(),
    });

    // Update user status to pending
    await db
      .update(users)
      .set({ status: "pending" })
      .where(eq(users.id, userId));

    // Send email notification to admin
    await sendAdminNotification(userId, useCase);

    return NextResponse.json({ success: true, message: "Access request submitted successfully" });
  } catch (error) {
    console.error("Access request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    // Get all access requests with user info
    const requests = await db.query.accessRequests.findMany({
      where: (ar) => 
        status === "all" || 
        (status === "pending" && !ar.approvedAt) ||
        (status === "approved" && ar.approvedAt),
    });

    // For each request, get user info
    const requestsWithUsers = await Promise.all(
      requests.map(async (req) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, req.userId),
        });
        return {
          ...req,
          user: user ? { id: user.id, phoneNumber: user.phoneNumber, name: user.name } : null,
        };
      })
    );

    return NextResponse.json({ requests: requestsWithUsers });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function sendAdminNotification(userId: string, useCase: string) {
  // In production, this would send an email via SMTP or a service like SendGrid
  // For now, we'll log it and the admin can check the database
  console.log(`[ADMIN NOTIFICATION] New access request from user ${userId}: ${useCase}`);
  
  // TODO: Implement actual email sending
  // const adminEmail = process.env.ADMIN_EMAIL;
  // await sendEmail({
  //   to: adminEmail,
  //   subject: `New Access Request - ${userId}`,
  //   html: generateApprovalEmail(userId, useCase),
  // });
}