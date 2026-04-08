import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSession,
  unauthorized,
  serverError,
} from "@/lib/api-utils";

/**
 * GET /api/v1/notifications
 * Returns the 20 most recent notifications for the authenticated user.
 * Supports ?unread=true to return only unread notifications.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    return serverError(error);
  }
}
