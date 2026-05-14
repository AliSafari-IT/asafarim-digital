"use client";

import { createContext, useContext, useMemo } from "react";
import type { NavContextValue, NavProviderProps } from "./types";

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({
  children,
  currentPath,
  activeItemId,
  renderLink,
  onNavigate,
  userRoles = [],
  userPermissions = [],
}: NavProviderProps) {
  const value = useMemo<NavContextValue>(
    () => ({
      currentPath,
      activeItemId,
      renderLink,
      onNavigate,
      userRoles,
      userPermissions,
    }),
    [currentPath, activeItemId, renderLink, onNavigate, userRoles, userPermissions]
  );
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

/**
 * Read shared navigation state. Safe to call without a provider — returns a
 * neutral default so components remain usable standalone.
 */
export function useNavState(): NavContextValue {
  const ctx = useContext(NavContext);
  return (
    ctx ?? {
      currentPath: undefined,
      activeItemId: undefined,
      renderLink: undefined,
      onNavigate: undefined,
      userRoles: [],
      userPermissions: [],
    }
  );
}
