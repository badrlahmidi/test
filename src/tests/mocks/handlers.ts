import { http, HttpResponse } from "msw";

const mockClients = [
  { id: "client-1", name: "Alpha SARL", email: "alpha@test.ma", phone: "0522000000", type: "COMPANY", city: "Casablanca" },
  { id: "client-2", name: "Beta Corp", email: "beta@test.ma", phone: "0537000000", type: "COMPANY", city: "Rabat" },
];

const mockProducts = [
  { id: "product-1", name: "Développement web", unitPrice: 5000, tvaRate: 20, unit: "jour", stockQty: 999, minStockAlert: 0, isActive: true },
];

const mockInvoices = [
  {
    id: "invoice-1",
    number: "FAC-2024-0001",
    clientId: "client-1",
    client: { id: "client-1", name: "Alpha SARL" },
    issueDate: "2024-01-01T00:00:00.000Z",
    dueDate: "2024-02-01T00:00:00.000Z",
    status: "SENT",
    subtotal: 5000,
    tvaAmount: 1000,
    total: 6000,
    notes: null,
    items: [{ id: "item-1", description: "Service", quantity: 1, unitPrice: 5000, tvaRate: 20, total: 5000 }],
  },
];

const mockPayments = [
  {
    id: "payment-1",
    invoiceId: "invoice-1",
    invoice: { id: "invoice-1", number: "FAC-2024-0001", total: 6000 },
    amount: 6000,
    method: "TRANSFER",
    reference: "VIR-001",
    paidAt: "2024-01-15T00:00:00.000Z",
  },
];

const mockDashboard = {
  monthlyRevenue: 50000,
  pendingInvoices: 5,
  pendingAmount: 30000,
  totalClients: 12,
  lowStockProducts: 2,
  overdueInvoices: 1,
  topClients: [],
};

export const handlers = [
  // Clients
  http.get("/api/v1/clients", () => {
    return HttpResponse.json({ data: mockClients, total: mockClients.length, page: 1, pageSize: 20, totalPages: 1 });
  }),
  http.get("/api/v1/clients/:id", ({ params }) => {
    const client = mockClients.find((c) => c.id === params.id);
    if (!client) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(client);
  }),
  http.post("/api/v1/clients", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "new-client", ...body }, { status: 201 });
  }),
  http.patch("/api/v1/clients/:id", async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const client = mockClients.find((c) => c.id === params.id);
    return HttpResponse.json({ ...client, ...body });
  }),
  http.delete("/api/v1/clients/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Products
  http.get("/api/v1/produits", () => {
    return HttpResponse.json({ data: mockProducts, total: mockProducts.length, page: 1, pageSize: 20, totalPages: 1 });
  }),
  http.get("/api/v1/produits/:id", ({ params }) => {
    const product = mockProducts.find((p) => p.id === params.id);
    if (!product) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(product);
  }),
  http.post("/api/v1/produits", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "new-product", ...body }, { status: 201 });
  }),

  // Invoices
  http.get("/api/v1/factures", () => {
    return HttpResponse.json({ data: mockInvoices, total: mockInvoices.length, page: 1, pageSize: 20, totalPages: 1 });
  }),
  http.get("/api/v1/factures/:id", ({ params }) => {
    const inv = mockInvoices.find((i) => i.id === params.id);
    if (!inv) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(inv);
  }),
  http.post("/api/v1/factures", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "new-invoice", number: "FAC-2024-0099", ...body }, { status: 201 });
  }),
  http.patch("/api/v1/factures/:id", async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const inv = mockInvoices.find((i) => i.id === params.id);
    return HttpResponse.json({ ...inv, ...body });
  }),
  http.delete("/api/v1/factures/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("/api/v1/factures/:id/duplicate", ({ params }) => {
    const inv = mockInvoices.find((i) => i.id === params.id);
    return HttpResponse.json({ ...inv, id: "dup-invoice", number: "FAC-2024-0099" }, { status: 201 });
  }),

  // Devis
  http.get("/api/v1/devis", () => {
    return HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });
  }),
  http.get("/api/v1/devis/:id", () => {
    return new HttpResponse(null, { status: 404 });
  }),
  http.post("/api/v1/devis", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "new-quote", number: "DEV-2024-0001", ...body }, { status: 201 });
  }),
  http.post("/api/v1/devis/:id/convert", () => {
    return HttpResponse.json({ id: "new-invoice-from-quote", number: "FAC-2024-0002" }, { status: 201 });
  }),

  // Payments
  http.get("/api/v1/paiements", () => {
    return HttpResponse.json({ data: mockPayments, total: mockPayments.length, page: 1, pageSize: 20, totalPages: 1 });
  }),
  http.post("/api/v1/paiements", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "new-payment", ...body }, { status: 201 });
  }),
  http.delete("/api/v1/paiements/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Dashboard
  http.get("/api/v1/rapports", () => {
    return HttpResponse.json(mockDashboard);
  }),

  // Tenant
  http.get("/api/v1/tenant", () => {
    return HttpResponse.json({ id: "tenant-1", name: "Test SARL", currency: "MAD", tvaRate: 20 });
  }),
  http.patch("/api/v1/tenant", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: "tenant-1", name: "Test SARL", currency: "MAD", tvaRate: 20, ...body });
  }),
];
