"use client";

import * as React from "react";
import { useRef } from "react";
import type { AppNavDropdownProps } from "./types";
import { cn, itemKey, isItemActive } from "./utils";
import { useControlled, useOutsideClick } from "./hooks";
import { NavLink } from "./NavLink";

/**
 * Accessible dropdown menu. Trigger is provided by the consumer; the dropdown
 * supplies the menu panel and roving keyboard behavior.
 */
export function AppNavDropdown({
  trigger,
  items,
  currentPath,
  activeItemId,
  onNavigate,
  renderLink,
  align = "end",
  open,
  defaultOpen = false,
  onOpenChange,
  openOnHover = false,
  ariaLabel,
  className,
  menuClassName,
  itemClassName,
  triggerClassName,
}: AppNavDropdownProps) {
  const [isOpen, setOpen] = useControlled({
    controlled: open,
    default: defaultOpen,
    onChange: onOpenChange,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideClick(wrapperRef, isOpen, () => setOpen(false));

  const close = () => setOpen(false);
  const toggle = () => setOpen(!isOpen);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      e.stopPropagation();
      setOpen(false);
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !isOpen) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("asaf-nav-dropdown", isOpen && "asaf-nav-dropdown--open", className)}
      onMouseEnter={openOnHover ? () => setOpen(true) : undefined}
      onMouseLeave={openOnHover ? () => setOpen(false) : undefined}
    >
      <button
        type="button"
        className={cn("asaf-nav-dropdown__trigger", triggerClassName)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        {trigger}
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className={cn(
            "asaf-nav-dropdown__menu",
            `asaf-nav-dropdown__menu--align-${align}`,
            menuClassName
          )}
          onKeyDown={handleKeyDown}
        >
          <ul role="list" className="asaf-nav-dropdown__list">
            {items.map((item, idx) => {
              const active = isItemActive(item, { currentPath, activeItemId });
              return (
                <li key={itemKey(item, idx)} role="none" className="asaf-nav-dropdown__li">
                  <NavLink
                    item={item}
                    active={active}
                    disabled={item.disabled}
                    renderLink={renderLink}
                    onNavigate={(it) => {
                      onNavigate?.(it);
                      close();
                    }}
                    className={cn(
                      "asaf-nav-dropdown__item",
                      active && "asaf-nav-dropdown__item--active",
                      item.disabled && "asaf-nav-dropdown__item--disabled",
                      itemClassName
                    )}
                  >
                    {item.icon && (
                      <span className="asaf-nav-item__icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    <span className="asaf-nav-item__label">
                      <span className="asaf-nav-item__label-text">{item.label}</span>
                      {item.description && (
                        <span className="asaf-nav-item__description">
                          {item.description}
                        </span>
                      )}
                    </span>
                    {item.shortcut && (
                      <kbd className="asaf-nav-item__shortcut">{item.shortcut}</kbd>
                    )}
                    {item.badge && (
                      <span className="asaf-nav-item__badge">{item.badge}</span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
