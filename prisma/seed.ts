import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { ice: "002345678901234" },
    update: {},
    create: {
      name: "Demo SARL",
      ice: "002345678901234",
      ifNumber: "12345678",
      rc: "123456",
      cnss: "9876543",
      address: "123 Boulevard Mohammed V",
      city: "Casablanca",
      phone: "+212 522 000 000",
      email: "contact@demo-sarl.ma",
      currency: "MAD",
      tvaRate: 20,
      plan: "STARTER",
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@demo-sarl.ma" },
    update: {},
    create: {
      email: "owner@demo-sarl.ma",
      name: "Ahmed Alaoui",
      passwordHash,
      role: "OWNER",
      tenantId: tenant.id,
    },
  });
  console.log(`✅ User: ${owner.email}`);

  const accountant = await prisma.user.upsert({
    where: { email: "compta@demo-sarl.ma" },
    update: {},
    create: {
      email: "compta@demo-sarl.ma",
      name: "Fatima Benali",
      passwordHash,
      role: "ACCOUNTANT",
      tenantId: tenant.id,
    },
  });
  console.log(`✅ User: ${accountant.email}`);

  // Clients
  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: "seed-client-001" },
      update: {},
      create: {
        id: "seed-client-001",
        tenantId: tenant.id,
        name: "Alpha Technologies SARL",
        email: "contact@alpha-tech.ma",
        phone: "+212 522 111 111",
        ice: "001234567890123",
        address: "Rue de la Liberté, Casablanca",
        city: "Casablanca",
        type: "COMPANY",
      },
    }),
    prisma.client.upsert({
      where: { id: "seed-client-002" },
      update: {},
      create: {
        id: "seed-client-002",
        tenantId: tenant.id,
        name: "Beta Consulting",
        email: "info@beta.ma",
        phone: "+212 537 222 222",
        ice: "001234567890124",
        address: "Avenue Hassan II, Rabat",
        city: "Rabat",
        type: "COMPANY",
      },
    }),
    prisma.client.upsert({
      where: { id: "seed-client-003" },
      update: {},
      create: {
        id: "seed-client-003",
        tenantId: tenant.id,
        name: "Karim El Mansouri",
        email: "karim@gmail.com",
        phone: "+212 661 333 333",
        city: "Marrakech",
        type: "INDIVIDUAL",
      },
    }),
  ]);
  console.log(`✅ ${clients.length} clients`);

  // Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: "seed-product-001" },
      update: {},
      create: {
        id: "seed-product-001",
        tenantId: tenant.id,
        name: "Développement web",
        description: "Développement et maintenance de site web",
        unitPrice: 5000,
        tvaRate: 20,
        unit: "jour",
        sku: "DEV-WEB",
        stockQty: 999,
        minStockAlert: 0,
        category: "Services",
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "seed-product-002" },
      update: {},
      create: {
        id: "seed-product-002",
        tenantId: tenant.id,
        name: "Hébergement web",
        description: "Hébergement serveur mensuel",
        unitPrice: 300,
        tvaRate: 20,
        unit: "mois",
        sku: "HOSTING-01",
        stockQty: 999,
        minStockAlert: 0,
        category: "Services",
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: "seed-product-003" },
      update: {},
      create: {
        id: "seed-product-003",
        tenantId: tenant.id,
        name: "Ordinateur portable",
        description: "Laptop 15 pouces 16Go RAM",
        unitPrice: 8500,
        tvaRate: 20,
        unit: "pièce",
        sku: "LAPTOP-15",
        stockQty: 3,
        minStockAlert: 5,
        category: "Matériel",
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ ${products.length} products`);

  // Invoice
  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await prisma.invoice.upsert({
    where: { tenantId_number: { tenantId: tenant.id, number: "FAC-2024-0001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      clientId: clients[0].id,
      number: "FAC-2024-0001",
      issueDate: new Date("2024-11-01"),
      dueDate: new Date("2024-12-01"),
      status: "PAID",
      subtotal: 10000,
      tvaAmount: 2000,
      total: 12000,
      notes: "Facture de développement site web",
      items: {
        create: [
          {
            description: "Développement web — phase 1",
            quantity: 2,
            unitPrice: 5000,
            tvaRate: 20,
            total: 10000,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.upsert({
    where: { tenantId_number: { tenantId: tenant.id, number: "FAC-2024-0002" } },
    update: {},
    create: {
      tenantId: tenant.id,
      clientId: clients[1].id,
      number: "FAC-2024-0002",
      issueDate: now,
      dueDate,
      status: "SENT",
      subtotal: 1500,
      tvaAmount: 300,
      total: 1800,
      items: {
        create: [
          {
            description: "Hébergement web — 5 mois",
            quantity: 5,
            unitPrice: 300,
            tvaRate: 20,
            total: 1500,
          },
        ],
      },
    },
  });
  console.log(`✅ Invoices: ${invoice.number}, ${invoice2.number}`);

  // Payment for invoice 1
  await prisma.payment.upsert({
    where: { id: "seed-payment-001" },
    update: {},
    create: {
      id: "seed-payment-001",
      tenantId: tenant.id,
      invoiceId: invoice.id,
      amount: 12000,
      method: "TRANSFER",
      reference: "VIR-2024-1101",
      paidAt: new Date("2024-11-15"),
    },
  });
  console.log("✅ Payment seeded");

  // Quote
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + 30);

  await prisma.quote.upsert({
    where: { tenantId_number: { tenantId: tenant.id, number: "DEV-2024-0001" } },
    update: {},
    create: {
      tenantId: tenant.id,
      clientId: clients[2].id,
      number: "DEV-2024-0001",
      issueDate: now,
      validUntil,
      status: "SENT",
      subtotal: 8500,
      tvaAmount: 1700,
      total: 10200,
      notes: "Devis ordinateur portable",
      items: {
        create: [
          {
            description: "Ordinateur portable 15 pouces",
            quantity: 1,
            unitPrice: 8500,
            tvaRate: 20,
            total: 8500,
          },
        ],
      },
    },
  });
  console.log("✅ Quote seeded");

  console.log("\n🎉 Seed complete!");
  console.log("📧 Login: owner@demo-sarl.ma / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
