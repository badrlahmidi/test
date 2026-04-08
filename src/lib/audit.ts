/**
 * Audit log helper.
 *
 * Writes an immutable record to the `audit_logs` table whenever a business
 * entity is mutated.  Failures are logged but never bubble up to the caller
 * so that an audit-log issue never blocks the primary operation.
 */
import { prisma } from "@/lib/prisma";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface WriteAuditParams {
  tenantId: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  before?: unknown;
  after?: unknown;
}

export async function writeAudit(params: WriteAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        before: params.before !== undefined ? (params.before as object) : undefined,
        after: params.after !== undefined ? (params.after as object) : undefined,
      },
    });
  } catch (err) {
    // Non-fatal: log the error but do not propagate it.
    console.error("[audit] Failed to write audit log:", err);
  }
}
