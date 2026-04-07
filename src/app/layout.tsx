import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ERP Maroc — Gestion simplifiée pour TPE/PME",
  description:
    "Logiciel de facturation, devis, et gestion commerciale pour les entreprises marocaines. Conforme TVA Maroc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
