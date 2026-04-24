import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { ForbiddenError, requireOps } from "@/lib/rbac";

export const dynamic = "force-dynamic";

type AppHealth = {
  code: string;
  name: string;
  url: string;
  environment: string;
  status: "ok" | "degraded" | "down";
  httpStatus: number | null;
  responseTimeMs: number | null;
  error: string | null;
  checkedAt: string;
};

async function pingApp(healthUrl: string, timeoutMs = 2500): Promise<{
  status: "ok" | "degraded" | "down";
  httpStatus: number | null;
  responseTimeMs: number | null;
  error: string | null;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(healthUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    const elapsed = Date.now() - start;
    const status =
      res.ok && elapsed < 1500 ? "ok" : res.ok ? "degraded" : "down";
    return { status, httpStatus: res.status, responseTimeMs: elapsed, error: null };
  } catch (e) {
    const elapsed = Date.now() - start;
    const message = e instanceof Error ? e.message : String(e);
    return { status: "down", httpStatus: null, responseTimeMs: elapsed, error: message };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  try {
    await requireOps("read");

    const apps = await prisma.appRegistry.findMany({
      where: { isEnabled: true },
      orderBy: { code: "asc" },
    });

    const checks = await Promise.all(
      apps.map(async (app): Promise<AppHealth> => {
        const result = await pingApp(app.healthUrl);
        // fire-and-forget persistence (non-blocking)
        prisma.healthCheck
          .create({
            data: {
              appId: app.id,
              status: result.status,
              httpStatus: result.httpStatus,
              responseTimeMs: result.responseTimeMs,
              error: result.error?.slice(0, 500) ?? null,
            },
          })
          .catch(() => {});
        return {
          code: app.code,
          name: app.name,
          url: app.url,
          environment: app.environment,
          status: result.status,
          httpStatus: result.httpStatus,
          responseTimeMs: result.responseTimeMs,
          error: result.error,
          checkedAt: new Date().toISOString(),
        };
      })
    );

    const healthy = checks.filter((c) => c.status === "ok").length;
    const degraded = checks.filter((c) => c.status === "degraded").length;
    const down = checks.filter((c) => c.status === "down").length;

    return NextResponse.json({
      apps: checks,
      summary: { total: checks.length, healthy, degraded, down },
      checkedAt: new Date().toISOString(),
    });
  } catch (e) {
    if (e instanceof ForbiddenError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
