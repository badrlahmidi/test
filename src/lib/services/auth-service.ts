import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { RegisterFormData } from "@/lib/validations/auth";

export async function registerUser(data: RegisterFormData) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const tenant = await prisma.tenant.create({
    data: {
      name: data.companyName,
      users: {
        create: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: "OWNER",
        },
      },
    },
    include: { users: true },
  });

  return tenant.users[0];
}
