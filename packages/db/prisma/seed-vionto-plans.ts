/**
 * Seed Vionto-specific plans, quotas, and feature flags
 * Run with: pnpm --filter @asafarim/db db:seed-vionto
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vionto plans, quotas, and feature flags...");

  // 1. Create Vionto plans
  const plans = [
    {
      code: "vionto_free",
      name: "Vionto Free",
      priceCents: 0,
      currency: "USD",
      interval: "month",
      seatLimit: 1,
      features: ["vionto_basic_render", "vionto_standard_quality", "vionto_watermark"],
      isActive: true,
      sortOrder: 0,
    },
    {
      code: "vionto_pro",
      name: "Vionto Pro",
      priceCents: 2900, // $29/month
      currency: "USD",
      interval: "month",
      seatLimit: 1,
      features: ["vionto_basic_render", "vionto_high_quality_render", "vionto_no_watermark", "vionto_priority_queue", "vionto_custom_music"],
      isActive: true,
      sortOrder: 1,
    },
    {
      code: "vionto_enterprise",
      name: "Vionto Enterprise",
      priceCents: 9900, // $99/month
      currency: "USD",
      interval: "month",
      seatLimit: 5,
      features: ["vionto_basic_render", "vionto_high_quality_render", "vionto_4k_render", "vionto_no_watermark", "vionto_priority_queue", "vionto_custom_music", "vionto_api_access", "vionto_sso"],
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ Plan: ${plan.code}`);
  }

  // 2. Create Vionto feature flags
  const featureFlags = [
    {
      code: "vionto_basic_render",
      name: "Basic Render (720p)",
      description: "Allow rendering videos at 720p resolution",
      category: "general",
      defaultEnabled: true,
      rolloutPercent: 100,
    },
    {
      code: "vionto_high_quality_render",
      name: "High Quality Render (1080p)",
      description: "Allow rendering videos at 1080p resolution",
      category: "general",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_4k_render",
      name: "4K Render",
      description: "Allow rendering videos at 4K resolution",
      category: "beta",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_watermark",
      name: "Watermark Exports",
      description: "Add Vionto watermark to exported videos",
      category: "general",
      defaultEnabled: true,
      rolloutPercent: 100,
    },
    {
      code: "vionto_no_watermark",
      name: "No Watermark",
      description: "Remove Vionto watermark from exported videos",
      category: "general",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_priority_queue",
      name: "Priority Render Queue",
      description: "Queue renders with higher priority",
      category: "general",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_custom_music",
      name: "Custom Music Upload",
      description: "Allow uploading custom music tracks",
      category: "general",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_api_access",
      name: "API Access",
      description: "Access Vionto via API",
      category: "beta",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
    {
      code: "vionto_sso",
      name: "Single Sign-On",
      description: "SSO integration for enterprise accounts",
      category: "general",
      defaultEnabled: false,
      rolloutPercent: 0,
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { code: flag.code },
      update: flag,
      create: flag,
    });
    console.log(`  ✓ Feature flag: ${flag.code}`);
  }

  // 3. Create Vionto plan quotas
  const quotas = [
    // Free plan quotas
    { planCode: "vionto_free", metric: "images_per_month", limitValue: 50, overagePrice: null, currency: "USD" },
    { planCode: "vionto_free", metric: "storage_mb", limitValue: 500, overagePrice: null, currency: "USD" },
    { planCode: "vionto_free", metric: "tts_seconds_per_month", limitValue: 300, overagePrice: null, currency: "USD" },
    { planCode: "vionto_free", metric: "render_minutes_per_month", limitValue: 10, overagePrice: null, currency: "USD" },
    { planCode: "vionto_free", metric: "exports_per_month", limitValue: 5, overagePrice: null, currency: "USD" },

    // Pro plan quotas
    { planCode: "vionto_pro", metric: "images_per_month", limitValue: 500, overagePrice: 10, currency: "USD" },
    { planCode: "vionto_pro", metric: "storage_mb", limitValue: 10000, overagePrice: 1, currency: "USD" },
    { planCode: "vionto_pro", metric: "tts_seconds_per_month", limitValue: 3600, overagePrice: 2, currency: "USD" },
    { planCode: "vionto_pro", metric: "render_minutes_per_month", limitValue: 120, overagePrice: 50, currency: "USD" },
    { planCode: "vionto_pro", metric: "exports_per_month", limitValue: 50, overagePrice: 100, currency: "USD" },

    // Enterprise plan quotas
    { planCode: "vionto_enterprise", metric: "images_per_month", limitValue: 5000, overagePrice: 5, currency: "USD" },
    { planCode: "vionto_enterprise", metric: "storage_mb", limitValue: 100000, overagePrice: 0, currency: "USD" },
    { planCode: "vionto_enterprise", metric: "tts_seconds_per_month", limitValue: 10000, overagePrice: 1, currency: "USD" },
    { planCode: "vionto_enterprise", metric: "render_minutes_per_month", limitValue: 1000, overagePrice: 30, currency: "USD" },
    { planCode: "vionto_enterprise", metric: "exports_per_month", limitValue: 500, overagePrice: 50, currency: "USD" },
  ];

  for (const quota of quotas) {
    await prisma.viontoPlanQuota.upsert({
      where: { planCode_metric: { planCode: quota.planCode, metric: quota.metric } },
      update: quota,
      create: quota,
    });
    console.log(`  ✓ Quota: ${quota.planCode} / ${quota.metric} = ${quota.limitValue}`);
  }

  console.log("✅ Vionto plans, quotas, and feature flags seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
