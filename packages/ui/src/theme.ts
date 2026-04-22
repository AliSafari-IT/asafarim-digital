export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "asafarim-theme";
export const THEME_COOKIE_KEY = "asafarim-theme";

const LEGACY_THEME_STORAGE_KEYS = ["theme"] as const;

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

function getStoredTheme(storage: Storage): Theme | null {
  const primaryTheme = storage.getItem(THEME_STORAGE_KEY);
  if (isTheme(primaryTheme)) return primaryTheme;

  for (const legacyKey of LEGACY_THEME_STORAGE_KEYS) {
    const legacyTheme = storage.getItem(legacyKey);
    if (isTheme(legacyTheme)) return legacyTheme;
  }

  return null;
}

/** Read theme from cookie string (works in both browser and server contexts) */
export function readThemeFromCookie(cookieHeader?: string | null): Theme | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE_KEY}=([^;]+)`));
  const value = match?.[1];
  return isTheme(value) ? value : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function readTheme(): Theme {
  if (typeof window === "undefined") return "dark";

  try {
    return getStoredTheme(window.localStorage) ?? getSystemTheme();
  } catch {
    return getSystemTheme();
  }
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

/** Set cookie for cross-origin theme sharing (localhost ports, subdomains) */
function setThemeCookie(theme: Theme) {
  try {
    const maxAge = 60 * 60 * 24 * 365; // 1 year
    const domain = typeof window !== "undefined" && window.location.hostname.includes(".")
      ? `; domain=.${window.location.hostname.split(".").slice(-2).join(".")}`
      : ""; // no domain for localhost
    document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
  } catch {
    // Ignore cookie failures in restricted browsing contexts.
  }
}

export function persistTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    for (const legacyKey of LEGACY_THEME_STORAGE_KEYS) {
      window.localStorage.removeItem(legacyKey);
    }
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }

  setThemeCookie(theme);
}

export function initializeTheme() {
  const theme = readTheme();
  applyTheme(theme);
  persistTheme(theme);
  return theme;
}

export const themeInitScript = `(() => {
  try {
    const isTheme = (value) => value === 'light' || value === 'dark';
    const storage = window.localStorage;

    // Try cookie first (shared across localhost ports / subdomains)
    let theme = null;
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE_KEY}=([^;]+)/);
      const cookieValue = cookieMatch && cookieMatch[1];
      if (isTheme(cookieValue)) theme = cookieValue;
    } catch (e) {}

    // Fall back to localStorage
    if (!isTheme(theme)) {
      theme = storage.getItem('${THEME_STORAGE_KEY}');
    }

    if (!isTheme(theme)) {
      const legacyTheme = storage.getItem('theme');
      theme = isTheme(legacyTheme) ? legacyTheme : null;
    }

    if (!isTheme(theme)) {
      theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    storage.setItem('${THEME_STORAGE_KEY}', theme);
    storage.removeItem('theme');
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
  }
})();`;
