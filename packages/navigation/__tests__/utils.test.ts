import { describe, it, expect } from "vitest";
import {
  cn,
  isItemActive,
  isBranchActive,
  filterNavByRoles,
  externalLinkProps,
} from "../src/utils";
import type { NavItem } from "../src/types";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false, undefined, "b", null, "c")).toBe("a b c");
  });
});

describe("isItemActive", () => {
  it("returns true when item.active is true", () => {
    expect(isItemActive({ id: "x", label: "X", active: true }, {})).toBe(true);
  });

  it("returns true when activeItemId matches id", () => {
    expect(
      isItemActive({ id: "x", label: "X" }, { activeItemId: "x" })
    ).toBe(true);
  });

  it("matches exact path", () => {
    expect(
      isItemActive({ id: "d", label: "Docs", href: "/docs" }, { currentPath: "/docs" })
    ).toBe(true);
  });

  it("matches path as prefix segment", () => {
    expect(
      isItemActive(
        { id: "d", label: "Docs", href: "/docs" },
        { currentPath: "/docs/install" }
      )
    ).toBe(true);
  });

  it("does NOT match partial path that is not a segment", () => {
    expect(
      isItemActive(
        { id: "d", label: "Docs", href: "/doc" },
        { currentPath: "/docs" }
      )
    ).toBe(false);
  });

  it("only matches '/' for exact root", () => {
    expect(
      isItemActive({ id: "h", label: "Home", href: "/" }, { currentPath: "/" })
    ).toBe(true);
    expect(
      isItemActive(
        { id: "h", label: "Home", href: "/" },
        { currentPath: "/anything" }
      )
    ).toBe(false);
  });
});

describe("isBranchActive", () => {
  it("returns true if descendant is active", () => {
    const item: NavItem = {
      id: "p",
      label: "Parent",
      children: [{ id: "c", label: "Child", href: "/c" }],
    };
    expect(isBranchActive(item, { currentPath: "/c" })).toBe(true);
  });
});

describe("filterNavByRoles", () => {
  const items: NavItem[] = [
    { id: "public", label: "Public", href: "/p" },
    {
      id: "admin",
      label: "Admin",
      href: "/admin",
      requiredRoles: ["admin"],
    },
    {
      id: "billing",
      label: "Billing",
      href: "/billing",
      permissions: ["billing:read"],
    },
  ];

  it("keeps items with no role/permission requirements", () => {
    const result = filterNavByRoles(items, [], []);
    expect(result.find((i) => i.id === "public")).toBeTruthy();
    expect(result.find((i) => i.id === "admin")).toBeFalsy();
    expect(result.find((i) => i.id === "billing")).toBeFalsy();
  });

  it("includes role-restricted items when role present", () => {
    const result = filterNavByRoles(items, ["admin"], []);
    expect(result.find((i) => i.id === "admin")).toBeTruthy();
  });

  it("requires ALL permissions", () => {
    const result = filterNavByRoles(items, [], ["billing:read"]);
    expect(result.find((i) => i.id === "billing")).toBeTruthy();
  });
});

describe("externalLinkProps", () => {
  it("returns safe attrs for external items", () => {
    expect(externalLinkProps({ id: "x", label: "x", external: true })).toEqual({
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });
  it("returns empty for non-external", () => {
    expect(externalLinkProps({ id: "x", label: "x" })).toEqual({});
  });
});
