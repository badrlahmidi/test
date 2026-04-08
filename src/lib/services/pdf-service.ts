/**
 * PDF Service — generates Moroccan-compliant invoice PDFs.
 * Uses @react-pdf/renderer server-side.
 */
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";

export interface InvoicePdfData {
  number: string;
  issueDate: Date;
  dueDate: Date;
  tenant: {
    name: string;
    ice?: string | null;
    ifNumber?: string | null;
    rc?: string | null;
    address?: string | null;
    city?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  client: {
    name: string;
    ice?: string | null;
    address?: string | null;
    city?: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    tvaRate: number;
    total: number;
  }>;
  subtotal: number;
  tvaAmount: number;
  total: number;
  notes?: string | null;
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  tenantName: { fontSize: 18, fontWeight: "bold", color: "#2563eb" },
  tenantInfo: { fontSize: 9, color: "#555", marginTop: 2 },
  invoiceTitle: { fontSize: 22, fontWeight: "bold", textAlign: "right" },
  invoiceMeta: { fontSize: 9, textAlign: "right", color: "#555", marginTop: 2 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 4 },
  sectionValue: { fontSize: 10, fontWeight: "bold" },
  sectionSub: { fontSize: 9, color: "#555" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 6, borderRadius: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  colDesc: { flex: 4 },
  colNum: { flex: 1, textAlign: "right" },
  tableHeaderText: { fontSize: 9, fontWeight: "bold", color: "#374151" },
  totalsBox: { marginTop: 16, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 9, fontWeight: "bold" },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", width: 200, borderTopWidth: 1, borderTopColor: "#374151", paddingTop: 4, marginTop: 4 },
  grandTotalLabel: { fontSize: 11, fontWeight: "bold" },
  grandTotalValue: { fontSize: 11, fontWeight: "bold", color: "#2563eb" },
  notes: { marginTop: 20, padding: 8, backgroundColor: "#f9fafb", borderRadius: 4 },
  notesTitle: { fontSize: 9, fontWeight: "bold", marginBottom: 4 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#9ca3af" },
});

function fmt(n: number) {
  return `${n.toFixed(2)} MAD`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("fr-MA", { year: "numeric", month: "long", day: "numeric" });
}

function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  return createElement(
    Document,
    null,
    createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      createElement(
        View,
        { style: styles.header },
        // Tenant info
        createElement(
          View,
          null,
          createElement(Text, { style: styles.tenantName }, data.tenant.name),
          data.tenant.ice && createElement(Text, { style: styles.tenantInfo }, `ICE: ${data.tenant.ice}`),
          data.tenant.ifNumber && createElement(Text, { style: styles.tenantInfo }, `IF: ${data.tenant.ifNumber}`),
          data.tenant.rc && createElement(Text, { style: styles.tenantInfo }, `RC: ${data.tenant.rc}`),
          data.tenant.address && createElement(Text, { style: styles.tenantInfo }, data.tenant.address),
          data.tenant.city && createElement(Text, { style: styles.tenantInfo }, data.tenant.city),
          data.tenant.phone && createElement(Text, { style: styles.tenantInfo }, data.tenant.phone),
          data.tenant.email && createElement(Text, { style: styles.tenantInfo }, data.tenant.email),
        ),
        // Invoice number
        createElement(
          View,
          null,
          createElement(Text, { style: styles.invoiceTitle }, "FACTURE"),
          createElement(Text, { style: styles.invoiceMeta }, data.number),
          createElement(Text, { style: styles.invoiceMeta }, `Date: ${fmtDate(data.issueDate)}`),
          createElement(Text, { style: styles.invoiceMeta }, `Échéance: ${fmtDate(data.dueDate)}`),
        ),
      ),
      createElement(View, { style: styles.divider }),
      // Client info
      createElement(
        View,
        { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, "Facturé à"),
        createElement(Text, { style: styles.sectionValue }, data.client.name),
        data.client.ice && createElement(Text, { style: styles.sectionSub }, `ICE: ${data.client.ice}`),
        data.client.address && createElement(Text, { style: styles.sectionSub }, data.client.address),
        data.client.city && createElement(Text, { style: styles.sectionSub }, data.client.city),
      ),
      createElement(View, { style: styles.divider }),
      // Table header
      createElement(
        View,
        { style: styles.tableHeader },
        createElement(Text, { style: [styles.colDesc, styles.tableHeaderText] }, "Description"),
        createElement(Text, { style: [styles.colNum, styles.tableHeaderText] }, "Qté"),
        createElement(Text, { style: [styles.colNum, styles.tableHeaderText] }, "P.U HT"),
        createElement(Text, { style: [styles.colNum, styles.tableHeaderText] }, "TVA"),
        createElement(Text, { style: [styles.colNum, styles.tableHeaderText] }, "Total HT"),
      ),
      // Table rows
      ...data.items.map((item, i) =>
        createElement(
          View,
          { style: styles.tableRow, key: String(i) },
          createElement(Text, { style: styles.colDesc }, item.description),
          createElement(Text, { style: styles.colNum }, String(item.quantity)),
          createElement(Text, { style: styles.colNum }, fmt(item.unitPrice)),
          createElement(Text, { style: styles.colNum }, `${item.tvaRate}%`),
          createElement(Text, { style: styles.colNum }, fmt(item.total)),
        ),
      ),
      // Totals
      createElement(
        View,
        { style: styles.totalsBox },
        createElement(
          View,
          { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, "Sous-total HT"),
          createElement(Text, { style: styles.totalValue }, fmt(data.subtotal)),
        ),
        createElement(
          View,
          { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, "TVA"),
          createElement(Text, { style: styles.totalValue }, fmt(data.tvaAmount)),
        ),
        createElement(
          View,
          { style: styles.grandTotalRow },
          createElement(Text, { style: styles.grandTotalLabel }, "Total TTC"),
          createElement(Text, { style: styles.grandTotalValue }, fmt(data.total)),
        ),
      ),
      // Notes
      data.notes &&
        createElement(
          View,
          { style: styles.notes },
          createElement(Text, { style: styles.notesTitle }, "Notes"),
          createElement(Text, { style: { fontSize: 9 } }, data.notes),
        ),
      // Footer
      createElement(
        Text,
        { style: styles.footer },
        `${data.tenant.name}${data.tenant.ice ? ` · ICE: ${data.tenant.ice}` : ""}${data.tenant.rc ? ` · RC: ${data.tenant.rc}` : ""}`,
      ),
    ),
  );
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  const element = createElement(InvoiceDocument, { data });
  return renderToBuffer(element);
}
