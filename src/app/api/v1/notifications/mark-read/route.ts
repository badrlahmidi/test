import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  getSession,
  unauthorized,
  serverError,
} from "@/lib/api-utils";

const markReadSchema = z.object({
  ids: z.array(z.string()).optional(), // if omitted, mark ALL as read
});

/**
 * PATCH /api/v1/notifications/mark-read
 * Mark one, several, or all notifications as read for the current user.
 * Body: { ids?: string[] }  — omit `ids` to mark all unread as read.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const { ids } = markReadSchema.parse(body);

    await prisma.notification.updateMany({
      where: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        read: false,
        ...(ids && ids.length > 0 && { id: { in: ids } }),
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
