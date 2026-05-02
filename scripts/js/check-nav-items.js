const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Checking navigation items for edumatch...\n");

  const items = await prisma.navItem.findMany({
    where: {
      appScope: { has: "edumatch" },
      isActive: true,
    },
    orderBy: [{ position: "asc" }],
  });

  console.log(`Found ${items.length} active nav items for edumatch:\n`);

  items.forEach((item) => {
    console.log(`- ${item.label}`);
    console.log(`  href: ${item.href}`);
    console.log(`  placement: ${item.placement}`);
    console.log(`  visibility: ${item.visibility}`);
    console.log(`  requiredRole: ${item.requiredRole || "none"}`);
    console.log(`  appScope: ${item.appScope.join(", ")}`);
    console.log("");
  });

  // Check header items specifically
  const headerItems = items.filter((i) => i.placement === "header");
  console.log(`\nHeader items: ${headerItems.length}`);
  headerItems.forEach((item) => {
    console.log(`  - ${item.label} (visibility: ${item.visibility}, role: ${item.requiredRole || "none"})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
