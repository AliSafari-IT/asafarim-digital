import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppDrawer } from "../src/AppDrawer";
import type { NavItem } from "../src/types";

const items: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "docs", label: "Docs", href: "/docs" },
];

describe("AppDrawer", () => {
  it("renders nothing when closed", () => {
    render(<AppDrawer open={false} onOpenChange={() => {}} navItems={items} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders with dialog role and aria-label when open", () => {
    render(
      <AppDrawer
        open
        onOpenChange={() => {}}
        navItems={items}
        ariaLabel="Main menu"
      />
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Main menu");
  });

  it("closes via Escape", () => {
    const onChange = vi.fn();
    render(<AppDrawer open onOpenChange={onChange} navItems={items} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("closes on backdrop click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <AppDrawer open onOpenChange={onChange} navItems={items} />
    );
    const backdrop = container.querySelector(".asaf-nav-drawer__backdrop");
    expect(backdrop).not.toBeNull();
    await user.click(backdrop as Element);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does NOT close on backdrop when disabled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <AppDrawer
        open
        onOpenChange={onChange}
        navItems={items}
        closeOnBackdrop={false}
      />
    );
    const backdrop = container.querySelector(".asaf-nav-drawer__backdrop");
    await user.click(backdrop as Element);
    expect(onChange).not.toHaveBeenCalled();
  });
});
