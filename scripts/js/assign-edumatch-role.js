const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] || "edumatch_student";

  if (!email) {
    console.log("Usage: node scripts/js/assign-edumatch-role.js <email> [role]");
    console.log("Example: node scripts/js/assign-edumatch-role.js asafarim@gmail.com edumatch_student");
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) {
    console.log(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name || user.email}`);
  console.log(`Current roles: ${user.roles.map((r) => r.name).join(", ") || "none"}`);

  const roleRecord = await prisma.role.findUnique({
    where: { name: role },
  });

  if (!roleRecord) {
    console.log(`Role not found: ${role}`);
    process.exit(1);
  }

  const hasRole = user.roles.some((r) => r.name === role);

  if (hasRole) {
    console.log(`User already has role: ${role}`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        roles: {
          connect: { id: roleRecord.id },
        },
      },
    });
    console.log(`✓ Assigned role: ${role} to user: ${email}`);
  }

  const updatedUser = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });
  console.log(`Updated roles: ${updatedUser.roles.map((r) => r.name).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
