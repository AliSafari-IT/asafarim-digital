import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppNavDropdown } from "../src/AppNavDropdown";
import type { NavItem } from "../src/types";

const items: NavItem[] = [
  { id: "p", label: "Profile", href: "/profile" },
  { id: "s", label: "Settings", href: "/settings" },
];

describe("AppNavDropdown", () => {
  it("opens and closes on trigger click", async () => {
    const user = userEvent.setup();
    render(<AppNavDropdown trigger={<span>Menu</span>} items={items} />);
    const trigger = screen.getByRole("button", { name: /menu/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<AppNavDropdown trigger={<span>Menu</span>} items={items} />);
    await user.click(screen.getByRole("button", { name: /menu/i }));
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders all items as links", async () => {
    const user = userEvent.setup();
    render(<AppNavDropdown trigger={<span>Menu</span>} items={items} />);
    await user.click(screen.getByRole("button", { name: /menu/i }));
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });
});
