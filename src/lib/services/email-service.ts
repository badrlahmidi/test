/**
 * Email Service — sends invoice PDFs via Resend.
 */
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "factures@erp-maroc.ma";

export interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  invoiceNumber: string;
  tenantName: string;
  pdfBuffer: Buffer;
}

export async function sendInvoiceEmail({
  to,
  clientName,
  invoiceNumber,
  tenantName,
  pdfBuffer,
}: SendInvoiceEmailParams): Promise<{ id: string }> {
  const { data, error } = await resend.emails.send({
    from: `${tenantName} <${FROM_EMAIL}>`,
    to: [to],
    subject: `Votre facture ${invoiceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">Bonjour ${clientName},</h2>
        <p>Veuillez trouver ci-joint votre facture <strong>${invoiceNumber}</strong>.</p>
        <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">${tenantName}</p>
      </div>
    `,
    attachments: [
      {
        filename: `${invoiceNumber}.pdf`,
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  });

  if (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }

  return { id: data!.id };
}
