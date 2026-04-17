import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Default Permissions ─────────────────────────────────────

const defaultPermissions = [
  // Users
  { name: "users.list", displayName: "List Users", group: "users", description: "View the list of users" },
  { name: "users.view", displayName: "View User", group: "users", description: "View user details" },
  { name: "users.edit", displayName: "Edit User", group: "users", description: "Edit user fields" },
  { name: "users.deactivate", displayName: "Deactivate User", group: "users", description: "Activate or deactivate users" },
  // Roles
  { name: "roles.list", displayName: "List Roles", group: "roles", description: "View the list of roles" },
  { name: "roles.view", displayName: "View Role", group: "roles", description: "View role details and permissions" },
  { name: "roles.edit", displayName: "Edit Role", group: "roles", description: "Create, edit, or delete roles" },
  { name: "roles.assign", displayName: "Assign Role", group: "roles", description: "Assign or remove roles from users" },
  // Content
  { name: "content.list", displayName: "List Content", group: "content", description: "View the list of content sections" },
  { name: "content.view", displayName: "View Content", group: "content", description: "View content details" },
  { name: "content.create", displayName: "Create Content", group: "content", description: "Create new content sections" },
  { name: "content.edit", displayName: "Edit Content", group: "content", description: "Edit content sections" },
  { name: "content.delete", displayName: "Delete Content", group: "content", description: "Delete content sections" },
  { name: "content.publish", displayName: "Publish Content", group: "content", description: "Publish or unpublish content" },
  // Navigation
  { name: "navigation.list", displayName: "List Navigation", group: "navigation", description: "View navigation items" },
  { name: "navigation.view", displayName: "View Navigation", group: "navigation", description: "View navigation item details" },
  { name: "navigation.edit", displayName: "Edit Navigation", group: "navigation", description: "Create, edit, or delete navigation items" },
  // Settings
  { name: "settings.list", displayName: "List Settings", group: "settings", description: "View site settings" },
  { name: "settings.view", displayName: "View Settings", group: "settings", description: "View setting details" },
  { name: "settings.edit", displayName: "Edit Settings", group: "settings", description: "Modify site settings" },
  // Audit
  { name: "audit.view", displayName: "View Audit Log", group: "audit", description: "View the audit log" },
  // Profile
  { name: "profile.edit", displayName: "Edit Own Profile", group: "profile", description: "Edit own profile details" },
];

// ─── Default Roles ───────────────────────────────────────────

const defaultRoles = [
  {
    name: "superadmin",
    displayName: "Super Admin",
    description: "Full system access. Bypasses all permission checks.",
    isSystem: true,
    isDefault: false,
    permissions: defaultPermissions.map((p) => p.name),
  },
  {
    name: "admin",
    displayName: "Admin",
    description: "Administrative access with configurable permissions.",
    isSystem: true,
    isDefault: false,
    permissions: [
      "users.list", "users.view", "users.edit", "users.deactivate",
      "roles.list", "roles.view", "roles.edit", "roles.assign",
      "content.list", "content.view", "content.create", "content.edit", "content.delete", "content.publish",
      "navigation.list", "navigation.view", "navigation.edit",
      "settings.list", "settings.view", "settings.edit",
      "audit.view",
      "profile.edit",
    ],
  },
  {
    name: "standard_user",
    displayName: "Standard User",
    description: "Authenticated user with profile editing and content viewing.",
    isSystem: true,
    isDefault: false,
    permissions: ["profile.edit", "content.view"],
  },
  {
    name: "guest",
    displayName: "Guest",
    description: "Default role for new users. Read-only access to public content.",
    isSystem: true,
    isDefault: true,
    permissions: ["content.view"],
  },
];

// ─── Default Nav Items ───────────────────────────────────────

const defaultNavItems = [
  { label: "Capabilities", href: "/#capabilities", position: 0, group: "main", visibility: "public" },
  { label: "Work", href: "/#showcase", position: 1, group: "main", visibility: "public" },
  { label: "Process", href: "/#process", position: 2, group: "main", visibility: "public" },
  { label: "Stack", href: "/#stack", position: 3, group: "main", visibility: "public" },
  { label: "Contact", href: "/#contact", position: 4, group: "main", visibility: "public" },
  { label: "Profile", href: "/profile", position: 5, group: "main", visibility: "authenticated" },
  { label: "Admin", href: "/admin", position: 6, group: "main", visibility: "role", requiredRole: "admin" },
];

// ─── Default Site Content ────────────────────────────────────

const defaultSiteContent = [
  {
    section: "hero",
    title: "Ship full-stack SaaS with AI at the core.",
    subtitle: "One partner for interface, architecture, and intelligent workflows. Premium UX, durable backends, and AI wired into real products.",
    eyebrow: "Frontend · Backend · AI",
    position: 0,
    body: {
      ctaPrimary: { label: "Start a build conversation", href: "#contact" },
      ctaSecondary: { label: "Review selected work", href: "#showcase" },
      proofPoints: [
        { value: "4-12", label: "week delivery window for MVP-to-v1 builds" },
        { value: "3 layers", label: "frontend, backend, and AI workflow ownership" },
        { value: "1 partner", label: "strategy, implementation, and launch support" },
      ],
    },
    metadata: {
      deliverySnapshot: {
        title: "Architecture that sells and scales",
        badge: "Shipping now",
        projectModel: "Single-owner execution",
        cards: [
          { label: "Frontend", text: "Intentional layout, motion, and content hierarchy" },
          { label: "Backend", text: "Auth, data models, APIs, queues, and maintainable service seams" },
        ],
        codePreview: `export const productSystem = {\n  frontend: ["Next.js", "TypeScript", "Design systems"],\n  backend: ["Node.js", ".NET", "PostgreSQL"],\n  intelligence: ["Agents", "RAG", "Automation"],\n  outcome: "launch-ready SaaS with operational depth"\n};`,
      },
    },
  },
  {
    section: "capabilities",
    title: "The site now needs to prove expertise, not just mention it.",
    subtitle: "The strongest signal for your business is not a long tool list. It is showing that you can shape product experience, data architecture, and automation as one coherent system.",
    eyebrow: "Capabilities",
    position: 1,
    body: {
      tracks: [
        {
          title: "Frontend Systems",
          eyebrow: "Interface quality",
          description: "Design-forward product interfaces with structured information flow, polished interactions, and conversion-aware UX.",
          points: ["Next.js App Router", "Design systems", "Product landing pages", "Dashboard UX"],
        },
        {
          title: "Backend Platforms",
          eyebrow: "Architecture depth",
          description: "Service boundaries, data modeling, secure auth flows, observability, and delivery patterns that hold up after launch.",
          points: ["TypeScript APIs", "C#/.NET services", "PostgreSQL", "Queues + automation"],
        },
        {
          title: "AI Product Layers",
          eyebrow: "Applied intelligence",
          description: "Production-focused agent flows, retrieval pipelines, and operational tooling that support real teams instead of demos.",
          points: ["RAG pipelines", "Tool-enabled agents", "Workflow orchestration", "Content automation"],
        },
      ],
    },
  },
  {
    section: "showcase",
    title: "Products that connect UX ambition to system design",
    subtitle: "These cards are positioned as product systems, not generic portfolio tiles. That reads as more senior and more credible.",
    eyebrow: "Selected Work",
    position: 2,
    body: {
      items: [
        {
          name: "Content Generator",
          label: "Live product",
          type: "AI writing workspace",
          summary: "Prompt-driven content production with clean UI states, reusable generation flows, and an application shell ready for expansion.",
          href: "/showcase/content-generator",
          cta: "Open app",
          isLive: true,
        },
        {
          name: "SaaS Operations Hub",
          label: "Backend-heavy concept",
          type: "Admin analytics + lifecycle controls",
          summary: "Billing, feature access, metrics, and workflow controls designed as one operator surface rather than disconnected tools.",
          href: "#contact",
          cta: "Discuss build",
          isLive: false,
        },
        {
          name: "Marketing + Content Engine",
          label: "Growth system",
          type: "Website, SEO, and lead automation",
          summary: "A conversion-oriented marketing system combining front-end polish, structured content, and automated acquisition workflows.",
          href: "#contact",
          cta: "Request similar system",
          isLive: false,
        },
      ],
    },
  },
  {
    section: "process",
    title: "Hands-on from product framing to deployment",
    subtitle: "You are selling senior execution. The layout now emphasizes judgment, sequencing, and ownership instead of just listing services.",
    eyebrow: "Working Style",
    position: 3,
    body: {
      phases: [
        { step: "01", title: "Strategy + scoping", summary: "Define the revenue path, product surface, system boundaries, and delivery constraints before code expands." },
        { step: "02", title: "Interface + architecture", summary: "Shape the product experience and data flow together so the UI and backend reinforce each other." },
        { step: "03", title: "Build + operationalize", summary: "Ship the app, instrument it, and leave behind a maintainable platform instead of a fragile launch artifact." },
      ],
    },
  },
  {
    section: "stack",
    title: "Depth across interface, infrastructure, and AI delivery",
    eyebrow: "Technology Stack",
    position: 4,
    body: {
      groups: [
        { title: "Frontend", items: ["Next.js App Router", "TypeScript", "Tailwind CSS", "Conversion-focused UI systems"] },
        { title: "Backend", items: ["Node.js services", "C# / .NET microservices", "PostgreSQL", "Authentication + multi-tenant patterns"] },
        { title: "AI + Ops", items: ["RAG pipelines", "Agent orchestration", "Workflow automation", "Operational tooling"] },
      ],
    },
  },
  {
    section: "about",
    title: "I work at the intersection of product taste and engineering discipline.",
    subtitle: "My focus is building software that helps a business move: clearer positioning, cleaner interfaces, stronger backend foundations, and automation that reduces manual load. That balance is what makes a solo technical partner valuable.",
    eyebrow: "About",
    position: 5,
  },
  {
    section: "contact",
    title: "Need a serious technical partner for your next SaaS product?",
    subtitle: "Let's scope the product, architecture, and build sequence with the end-state in mind from day one.",
    eyebrow: "Contact",
    position: 6,
    body: {
      email: "info@asafarim.com",
      ctas: [
        { label: "Copy email address", action: "copy_email" },
        { label: "Open mail client", href: "mailto:info@asafarim.com" },
        { label: "View monorepo", href: "https://github.com/AliSafari-IT/asafarim-digital" },
      ],
    },
  },
];

// ─── Default Site Settings ───────────────────────────────────

const defaultSiteSettings = [
  { key: "brand.name", value: "ASafariM Digital", group: "brand", displayName: "Brand Name", description: "Primary brand name displayed across the portal" },
  { key: "brand.tagline", value: "Product engineering for AI-native SaaS", group: "brand", displayName: "Brand Tagline", description: "Tagline shown in the header" },
  { key: "brand.logo_initials", value: "AD", group: "brand", displayName: "Logo Initials", description: "Initials displayed in the logo badge" },
  { key: "contact.email", value: "info@asafarim.com", group: "contact", displayName: "Contact Email", description: "Primary contact email address" },
  { key: "contact.github", value: "https://github.com/AliSafari-IT/asafarim-digital", group: "contact", displayName: "GitHub URL", description: "GitHub repository URL" },
  { key: "footer.copyright", value: "ASafariM Digital", group: "footer", displayName: "Footer Copyright", description: "Copyright text in footer" },
  { key: "footer.subtitle", value: "Premium SaaS delivery across frontend, backend, and AI systems", group: "footer", displayName: "Footer Subtitle", description: "Subtitle in the footer" },
];

// ─── Seed Runner ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert permissions
  console.log("  → Seeding permissions...");
  const permissionMap: Record<string, string> = {};
  for (const p of defaultPermissions) {
    const result = await prisma.permission.upsert({
      where: { name: p.name },
      update: { displayName: p.displayName, group: p.group, description: p.description },
      create: p,
    });
    permissionMap[p.name] = result.id;
  }
  console.log(`    ✓ ${defaultPermissions.length} permissions seeded`);

  // 2. Upsert roles and connect permissions
  console.log("  → Seeding roles...");
  for (const r of defaultRoles) {
    const { permissions, ...roleData } = r;
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: roleData.displayName, description: roleData.description, isSystem: roleData.isSystem, isDefault: roleData.isDefault },
      create: roleData,
    });

    // Upsert role-permission connections
    for (const permName of permissions) {
      const permId = permissionMap[permName];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }
  console.log(`    ✓ ${defaultRoles.length} roles seeded`);

  // 3. Assign guest role to existing users that have no roles
  console.log("  → Assigning default role to existing users...");
  const guestRole = await prisma.role.findUnique({ where: { name: "guest" } });
  if (guestRole) {
    const usersWithoutRoles = await prisma.user.findMany({
      where: { userRoles: { none: {} } },
      select: { id: true },
    });
    for (const user of usersWithoutRoles) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: guestRole.id } },
        update: {},
        create: { userId: user.id, roleId: guestRole.id },
      });
    }
    console.log(`    ✓ ${usersWithoutRoles.length} users assigned guest role`);
  }

  // 4. Upsert nav items
  console.log("  → Seeding navigation items...");
  for (const nav of defaultNavItems) {
    const existing = await prisma.navItem.findFirst({
      where: { href: nav.href, group: nav.group },
    });
    if (!existing) {
      await prisma.navItem.create({ data: nav });
    }
  }
  console.log(`    ✓ Navigation items seeded`);

  // 5. Upsert site content
  console.log("  → Seeding site content...");
  for (const content of defaultSiteContent) {
    await prisma.siteContent.upsert({
      where: { section: content.section },
      update: {
        title: content.title,
        subtitle: content.subtitle,
        eyebrow: content.eyebrow,
        body: content.body ?? undefined,
        metadata: content.metadata ?? undefined,
        position: content.position,
      },
      create: {
        section: content.section,
        title: content.title,
        subtitle: content.subtitle ?? null,
        eyebrow: content.eyebrow ?? null,
        body: content.body ?? undefined,
        metadata: content.metadata ?? undefined,
        position: content.position,
        isPublished: true,
      },
    });
  }
  console.log(`    ✓ ${defaultSiteContent.length} content sections seeded`);

  // 6. Upsert site settings
  console.log("  → Seeding site settings...");
  for (const setting of defaultSiteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, group: setting.group, displayName: setting.displayName, description: setting.description },
      create: { key: setting.key, value: setting.value, group: setting.group, displayName: setting.displayName, description: setting.description },
    });
  }
  console.log(`    ✓ ${defaultSiteSettings.length} settings seeded`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
