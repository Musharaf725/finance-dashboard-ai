import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst({
    where: { email: "admin@example.com" },
  });
  if (existing) {
    console.log("Seed skipped: admin user already exists.");
    return;
  }
  const passwordHash = await bcrypt.hash("ChangeMeAdmin123!", 10);
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Administrator",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Created default admin: admin@example.com (change password in production).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
