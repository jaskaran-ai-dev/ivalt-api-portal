import { NextRequest, NextResponse } from "next/server";
import { DEMO_MODE, getDemoAccessRequests } from "@/lib/demo";
import { db } from "@/db";
import { users, accessRequests } from "@/db/schema";
import { eq, and, or, isNull, isNotNull } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      return NextResponse.json({ success: true, message: "Request processed (demo)" });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const { requestId, approved, adminNotes } = await req.json();

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Get the access request
    const request = await db.query.accessRequests.findFirst({
      where: (ar) => eq(ar.id, requestId),
    });

    if (!request) {
      return NextResponse.json({ error: "Access request not found" }, { status: 404 });
    }

    // Update the access request
    await db
      .update(accessRequests)
      .set({
        approvedAt: new Date(),
        adminNotes: adminNotes || null,
      })
      .where(eq(accessRequests.id, requestId));

    // Update user status
    const newStatus = approved ? "approved" : "rejected";
    await db
      .update(users)
      .set({ 
        status: newStatus,
        approvedAt: approved ? new Date() : null,
      })
      .where(eq(users.id, request.userId));

    // In production, send email to user with approval link
    if (approved) {
      console.log(`[USER NOTIFICATION] Access approved for user ${request.userId}`);
      // await sendUserApprovalEmail(request.userId, request.approvalToken);
    }

    return NextResponse.json({ success: true, message: `Access request ${approved ? "approved" : "rejected"}` });
  } catch (error) {
    console.error("Admin approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // ── DEMO MODE ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      const allRequests = getDemoAccessRequests();
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || "pending";
      const filtered =
        status === "all"
          ? allRequests
          : status === "pending"
            ? allRequests.filter((r) => !r.approvedAt)
            : allRequests.filter((r) => r.approvedAt);
      return NextResponse.json({ requests: filtered });
    }
    // ──────────────────────────────────────────────────────────────────────────

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    // Get all access requests with user info
    let requests;
    
    if (status === "all") {
      requests = await db.query.accessRequests.findMany({});
    } else if (status === "pending") {
      requests = await db.query.accessRequests.findMany({
        where: isNull(accessRequests.approvedAt),
      });
    } else {
      requests = await db.query.accessRequests.findMany({
        where: isNotNull(accessRequests.approvedAt),
      });
    }

    // For each request, get user info (simplified - in production you'd join or batch query)
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