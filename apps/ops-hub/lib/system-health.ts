import { prisma } from "@asafarim/db";

export type AppHealthStatus = "ok" | "degraded" | "down";

export type AppHealth = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  url: string;
  environment: string;
  status: AppHealthStatus;
  httpStatus: number | null;
  responseTimeMs: number | null;
  error: string | null;
  checkedAt: string;
  lastDeployedAt: string | null;
};

async function pingApp(
  healthUrl: string,
  timeoutMs = 2500
): Promise<{
  status: AppHealthStatus;
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
    const status: AppHealthStatus =
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

/**
 * Fetch health for all enabled apps in parallel.
 * Results are persisted fire-and-forget to HealthCheck.
 */
export async function getSystemHealth(): Promise<AppHealth[]> {
  const apps = await prisma.appRegistry.findMany({
    where: { isEnabled: true },
    orderBy: { code: "asc" },
  });

  return Promise.all(
    apps.map(async (app): Promise<AppHealth> => {
      const result = await pingApp(app.healthUrl);
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
        id: app.id,
        code: app.code,
        name: app.name,
        description: app.description,
        url: app.url,
        environment: app.environment,
        status: result.status,
        httpStatus: result.httpStatus,
        responseTimeMs: result.responseTimeMs,
        error: result.error,
        checkedAt: new Date().toISOString(),
        lastDeployedAt: app.lastDeployedAt?.toISOString() ?? null,
      };
    })
  );
}
