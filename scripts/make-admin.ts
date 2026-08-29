// TICKET-040: the documented one-off step for granting admin access —
// no self-service "become admin" path exists in the app itself, on
// purpose. Usage: npm run make-admin -- someone@example.com
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(
      `No user found with email "${email}". They need to sign up first.`,
    );
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${email} is now an admin.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
