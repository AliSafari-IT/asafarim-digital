"use client";

import { RefObject, useEffect } from "react";

/**
 * Closes a dropdown/popover when the user clicks outside `ref`
 * or presses Escape. Works inside containers that create containing
 * blocks (e.g., `backdrop-blur`), where a `fixed inset-0` backdrop
 * would otherwise be trapped.
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}
