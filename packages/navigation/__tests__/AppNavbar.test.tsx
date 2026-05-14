import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppNavbar } from "../src/AppNavbar";
import type { NavItem } from "../src/types";

const items: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "docs", label: "Docs", href: "/docs" },
  { id: "ext", label: "External", href: "https://example.com", external: true },
  { id: "off", label: "Disabled", href: "/off", disabled: true },
];

describe("AppNavbar", () => {
  it("renders logo, actions, and nav items", () => {
    render(
      <AppNavbar
        logo={<span data-testid="logo">LOGO</span>}
        navItems={items}
        actions={<button>Sign in</button>}
        responsiveMode="always-expanded"
      />
    );
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
  });

  it("marks an item active via currentPath", () => {
    render(
      <AppNavbar navItems={items} currentPath="/docs" responsiveMode="always-expanded" />
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("marks an item active via activeItemId", () => {
    render(
      <AppNavbar navItems={items} activeItemId="ext" responsiveMode="always-expanded" />
    );
    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("renders external links with safe attrs", () => {
    render(<AppNavbar navItems={items} responsiveMode="always-expanded" />);
    const link = screen.getByRole("link", { name: "External" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("disabled item renders as non-link and is not focusable", () => {
    render(<AppNavbar navItems={items} responsiveMode="always-expanded" />);
    const disabled = screen.getByText("Disabled");
    // disabled item is rendered as a span (no link role)
    expect(disabled.closest("a")).toBeNull();
  });

  it("uses custom renderLink", () => {
    render(
      <AppNavbar
        navItems={items}
        responsiveMode="always-expanded"
        renderLink={({ children }) => <span data-testid="custom-link">{children}</span>}
      />
    );
    expect(screen.getAllByTestId("custom-link").length).toBeGreaterThan(0);
  });

  it("opens drawer on hamburger click and closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <AppNavbar
        navItems={items}
        responsiveMode="always-collapsed"
        hamburgerMode
      />
    );
    const btn = screen.getByRole("button", { name: /open navigation/i });
    await user.click(btn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fires onNavigate when clicking a link", async () => {
    const onNav = vi.fn();
    const user = userEvent.setup();
    render(
      <AppNavbar
        navItems={items}
        responsiveMode="always-expanded"
        onNavigate={onNav}
      />
    );
    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(onNav).toHaveBeenCalledWith(expect.objectContaining({ id: "home" }));
  });

  it("supports controlled open state", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <AppNavbar
        navItems={items}
        responsiveMode="always-collapsed"
        open={false}
        onOpenChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: /open navigation/i }));
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(
      <AppNavbar
        navItems={items}
        responsiveMode="always-collapsed"
        open={true}
        onOpenChange={onChange}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
