export type { Role, Plan, ClientType, InvoiceStatus, QuoteStatus, PaymentMethod } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface DashboardStats {
  monthlyRevenue: number;
  pendingInvoices: number;
  pendingAmount: number;
  totalClients: number;
  lowStockProducts: number;
  overdueInvoices: number;
}
