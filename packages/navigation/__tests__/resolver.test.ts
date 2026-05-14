import { describe, it, expect } from "vitest";
import { resolveNavigation, flattenNavigation, resolveCrossAppUrl } from "../src/resolver";
import type { NavItemDto, AppCode, ResolvedNavItem } from "../src/resolver-types";

describe("resolveNavigation", () => {
  const mockItems: NavItemDto[] = [
    {
      id: "1",
      label: "Home",
      href: "/",
      position: 0,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["all"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      label: "Dashboard",
      href: "/dashboard",
      position: 1,
      visibility: "authenticated",
      requiredPermissions: [],
      appScope: ["portal"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      label: "Admin",
      href: "/admin",
      position: 2,
      visibility: "role",
      requiredRole: "ADMIN",
      requiredPermissions: [],
      appScope: ["portal"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      label: "Inactive Item",
      href: "/inactive",
      position: 3,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["all"],
      isActive: false,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "5",
      label: "EduMatch Only",
      href: "/edumatch",
      position: 0,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["edumatch"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should filter by isActive", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
    });
    expect(result.items.some((item) => item.id === "4")).toBe(false);
    expect(result.items.some((item) => item.id === "1")).toBe(true);
  });

  it("should filter by appScope", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
      user: { authenticated: true, roles: [], permissions: [] },
    });
    expect(result.items.some((item) => item.id === "5")).toBe(false); // edumatch only
    expect(result.items.some((item) => item.id === "2")).toBe(true); // portal
    expect(result.items.some((item) => item.id === "1")).toBe(true); // all
  });

  it("should filter by visibility - public", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
      user: { authenticated: false, roles: [], permissions: [] },
    });
    expect(result.items.some((item) => item.id === "1")).toBe(true);
    expect(result.items.some((item) => item.id === "2")).toBe(false); // authenticated only
    expect(result.items.some((item) => item.id === "3")).toBe(false); // role only
  });

  it("should filter by visibility - authenticated", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
      user: { authenticated: true, roles: [], permissions: [] },
    });
    expect(result.items.some((item) => item.id === "2")).toBe(true);
  });

  it("should filter by visibility - role", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
      user: { authenticated: true, roles: ["ADMIN"], permissions: [] },
    });
    expect(result.items.some((item) => item.id === "3")).toBe(true);
  });

  it("should filter by required role when user does not have it", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
      user: { authenticated: true, roles: ["USER"], permissions: [] },
    });
    expect(result.items.some((item) => item.id === "3")).toBe(false);
  });

  it("should sort by position", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
    });
    const positions = result.items.map((item) => item.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("should group results", () => {
    const result = resolveNavigation({
      items: mockItems,
      currentApp: "portal" as AppCode,
    });
    expect(result.groups).toContain("main");
  });
});

describe("flattenNavigation", () => {
  it("should flatten nested items", () => {
    const nestedItems: ResolvedNavItem[] = [
      {
        id: "1",
        label: "Parent",
        href: "/parent",
        position: 0,
        visibility: "public" as const,
        requiredPermissions: [],
        appScope: ["all"] as ResolvedNavItem["appScope"],
        isActive: true,
        group: "main",
        placement: "header" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedHref: "/parent",
        isVisible: true,
        children: [
          {
            id: "2",
            label: "Child",
            href: "/child",
            position: 0,
            visibility: "public" as const,
            requiredPermissions: [],
            appScope: ["all"] as ResolvedNavItem["appScope"],
            isActive: true,
            group: "main",
            placement: "header" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            resolvedHref: "/child",
            isVisible: true,
          },
        ],
      },
    ];

    const flattened = flattenNavigation(nestedItems);
    expect(flattened).toHaveLength(2);
    expect(flattened[0].id).toBe("1");
    expect(flattened[1].id).toBe("2");
  });
});

describe("resolveCrossAppUrl", () => {
  it("should return external URLs as-is", () => {
    const item: NavItemDto = {
      id: "1",
      label: "External",
      href: "https://example.com",
      position: 0,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["all"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = resolveCrossAppUrl(item, {});
    expect(result).toBe("https://example.com");
  });

  it("should resolve cross-app URLs with appTarget", () => {
    const item: NavItemDto = {
      id: "1",
      label: "Profile",
      href: "/profile",
      position: 0,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["all"],
      isActive: true,
      group: "main",
      placement: "header",
      metadata: { appTarget: "portal" },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const appUrls = { portal: "https://portal.asafarim.com" };
    const result = resolveCrossAppUrl(item, appUrls);
    expect(result).toBe("https://portal.asafarim.com/profile");
  });

  it("should return original href for internal navigation", () => {
    const item: NavItemDto = {
      id: "1",
      label: "Internal",
      href: "/internal",
      position: 0,
      visibility: "public",
      requiredPermissions: [],
      appScope: ["all"],
      isActive: true,
      group: "main",
      placement: "header",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = resolveCrossAppUrl(item, {});
    expect(result).toBe("/internal");
  });
});
