import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppSidebar } from "../src/AppSidebar";
import type { NavItem } from "../src/types";

const items: NavItem[] = [
  { id: "a", label: "Alpha", href: "/a", icon: <span data-testid="a-icon">A</span> },
  {
    id: "b",
    label: "Beta",
    children: [
      { id: "b1", label: "Beta 1", href: "/b/1" },
      { id: "b2", label: "Beta 2", href: "/b/2" },
    ],
  },
];

describe("AppSidebar", () => {
  it("renders nav items and logo", () => {
    render(<AppSidebar logo={<span data-testid="logo" />} navItems={items} />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alpha" })).toBeInTheDocument();
  });

  it("collapses via collapsible button (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<AppSidebar navItems={items} collapsible defaultCollapsed={false} />);
    const btn = screen.getByRole("button", { name: /collapse sidebar/i });
    await user.click(btn);
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it("controlled collapsed state", () => {
    const onChange = vi.fn();
    render(
      <AppSidebar
        navItems={items}
        collapsible
        collapsed={true}
        onCollapsedChange={onChange}
      />
    );
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it("renders nested items inside disclosure", async () => {
    const user = userEvent.setup();
    render(<AppSidebar navItems={items} currentPath="/b/1" />);
    // Branch active means submenu is open initially
    expect(screen.getByRole("link", { name: "Beta 1" })).toBeInTheDocument();
    // Toggle collapse via the explicit chevron toggle
    const toggle = screen.getByRole("button", { name: /Collapse Beta/i });
    await user.click(toggle);
    expect(screen.queryByRole("link", { name: "Beta 1" })).not.toBeInTheDocument();
  });
});
