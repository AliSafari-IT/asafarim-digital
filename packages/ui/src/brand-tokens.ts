export const asafarimBrandTokens = {
  name: "asafarim-digital",
  essence: "AI-Empowered Digital Craftsmanship",
  tagline: "One partner for interface, architecture, and intelligent workflows.",

  // ─── Brand Core Colors ───────────────────────────────────
  colors: {
    // Primary brand colors
    midnightGraphite: "#0D0D0F",      // Midnight Graphite — primary surface
    midnightNavy: "#07111F",          // Portal canonical surface
    electricAzure: "#3A7BFF",           // Electric Azure — primary accent
    softSlate: "#A3A9B7",              // Soft Slate — muted text
    neonMint: "#4FF2C9",               // Neon Mint — secondary accent / success
    violet: "#C084FC",                 // Tertiary spark for heroes/gradients
    pink: "#F472B6",                   // Tertiary spark, paired with violet
    white: "#F5F7FB",                  // High-contrast white on midnight

    // Portal palette (canonical app)
    primary: "#4C7DFF",
    primaryDark: "#355FE0",
    accent: "#5DE4C7",
    surface: "#07111F",
    surfaceSoft: "#0D192D",
    surfaceElevated: "#14161C",
    panel: "rgba(11, 23, 42, 0.78)",
    panelStrong: "rgba(8, 17, 31, 0.92)",
    border: "rgba(129, 149, 181, 0.18)",
    borderStrong: "rgba(129, 149, 181, 0.34)",
    text: "#EFF4FF",
    textMuted: "#9FB0CF",
    danger: "#FF7B92",
    success: "#4FF2C9",
    warning: "#FFBE5B",
  },

  // ─── Gradients (signature brand expression) ────────────────
  gradients: {
    brand: "linear-gradient(135deg, #3A7BFF 0%, #4FF2C9 100%)",
    headline: "linear-gradient(120deg, #6AA3FF 0%, #A78BFA 50%, #5DE4C7 100%)",
    violet: "linear-gradient(135deg, #C084FC, #F472B6)",
    mint: "linear-gradient(135deg, #36C6A8, #5DE4C7)",
    azure: "linear-gradient(135deg, #4C7DFF, #6AA3FF)",
    heroMesh: `radial-gradient(circle at 15% 20%, rgba(76,125,255,0.22), transparent 38%),
               radial-gradient(circle at 85% 10%, rgba(192,132,252,0.18), transparent 40%),
               radial-gradient(circle at 70% 90%, rgba(93,228,199,0.18), transparent 42%)`,
    pageNoise: `radial-gradient(circle at top left, rgba(76, 125, 255, 0.16), transparent 28%),
                radial-gradient(circle at top right, rgba(93, 228, 199, 0.12), transparent 24%),
                linear-gradient(180deg, color-mix(in srgb, #07111F 96%, white 4%) 0%, #07111F 100%)`,
  },

  // ─── Typography ────────────────────────────────────────────
  typography: {
    sans: ['"Manrope"', '"Geist"', '"Inter Tight"', '"Inter"', '"Segoe UI"', "system-ui", "sans-serif"],
    display: ['"Manrope"', '"Geist"', '"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
    mono: ['"IBM Plex Mono"', '"JetBrains Mono"', '"Consolas"', '"SFMono-Regular"', "monospace"],

    // Type scale
    size: {
      eyebrow: "0.6875rem",     // 11px
      xs: "0.75rem",            // 12px
      sm: "0.875rem",           // 14px
      base: "1rem",              // 16px
      lg: "1.125rem",            // 18px
      xl: "1.25rem",             // 20px
      "2xl": "1.5rem",           // 24px
      "3xl": "1.875rem",         // 30px
      "4xl": "2.25rem",          // 36px
      "5xl": "3rem",               // 48px
      "6xl": "3.75rem",            // 60px
      "7xl": "5.25rem",            // 84px
    },

    // Tracking/letter-spacing
    tracking: {
      eyebrow: "0.22em",      // uppercase eyebrows
      display: "-0.05em",     // tightest, hero sizes
      h1: "-0.04em",
      h2: "-0.03em",
      tight: "-0.02em",
      normal: "0",
    },

    // Line heights
    leading: {
      tight: "1.02",
      snug: "1.05",
      normal: "1.2",
      relaxed: "1.25",
      loose: "1.7",           // body-lg leading-8
      body: "1.75",           // signature body density
    },
  },

  // ─── Radius ────────────────────────────────────────────────
  radius: {
    xs: "0.5rem",        // 8px — chips, small buttons
    sm: "0.625rem",      // 10px — inputs, secondary buttons
    md: "0.875rem",      // 14px — cards, panels
    lg: "1rem",          // 16px — primary cards
    xl: "1.25rem",       // 20px — feature panels
    "2xl": "1.5rem",     // 24px — large containers
    "3xl": "2rem",       // 32px — hero / showcase tiles
    pill: "9999px",      // full — CTAs, status pills
  },

  // ─── Spacing (Tailwind 4-base) ─────────────────────────────
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },

  // ─── Shadows ───────────────────────────────────────────────
  shadows: {
    card: "0 28px 80px -40px rgba(0, 0, 0, 0.72)",
    glow: "0 20px 40px -22px rgba(76, 125, 255, 0.75)",
    brandCard: "0 16px 50px -28px rgba(58, 123, 255, 0.50)",
    brandGlow: "0 0 0 1px rgba(58, 123, 255, 0.35), 0 12px 36px -20px rgba(79, 242, 201, 0.55)",
  },

  // ─── Motion / Animation ────────────────────────────────────
  motion: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeSmooth: "cubic-bezier(0.22, 1, 0.36, 1)",
    durationFast: "180ms",
    durationBase: "300ms",
    durationSlow: "500ms",
  },

  // ─── Content Guidelines ────────────────────────────────────
  content: {
    voice: "Confident, practical, premium. Engineering-credible without being dry.",
    casing: {
      eyebrow: "ALL CAPS, letter-spaced (0.22em)",
      headline: "Sentence case, tight tracking (-0.04em to -0.05em)",
      body: "Sentence case, verb-led CTAs",
      tags: "Title Case",
    },
    emoji: false, // Effectively never
  },

  // ─── Light Theme Overrides ─────────────────────────────────
  lightTheme: {
    primary: "#2253D8",
    primaryDark: "#173FA9",
    accent: "#059669",
    surface: "#EDF3FB",
    surfaceSoft: "#FFFFFF",
    panel: "rgba(255, 255, 255, 0.84)",
    panelStrong: "rgba(255, 255, 255, 0.94)",
    border: "rgba(100, 116, 139, 0.16)",
    borderStrong: "rgba(100, 116, 139, 0.28)",
    text: "#132033",
    textMuted: "#5F6F86",
    danger: "#D6455D",
    shadows: {
      card: "0 32px 90px -48px rgba(34, 83, 216, 0.34)",
      glow: "0 18px 36px -20px rgba(34, 83, 216, 0.35)",
    },
  },
} as const;

export const asafarimTailwindThemeExtension = {
  colors: {
    brand: {
      // Core brand colors
      midnight: "#0D0D0F",
      "midnight-navy": "#07111F",
      azure: "#3A7BFF",
      slate: "#A3A9B7",
      mint: "#4FF2C9",
      violet: "#C084FC",
      pink: "#F472B6",
      text: "#F5F7FB",
      border: "#2A2F3B",
      surface: "#0D0D0F",
      elevated: "#14161C",

      // Portal palette (semantic)
      primary: "#4C7DFF",
      "primary-dark": "#355FE0",
      accent: "#5DE4C7",
      "surface-soft": "#0D192D",
      panel: "rgba(11, 23, 42, 0.78)",
      "panel-strong": "rgba(8, 17, 31, 0.92)",
      "border-subtle": "rgba(129, 149, 181, 0.18)",
      "border-strong": "rgba(129, 149, 181, 0.34)",
      "text-primary": "#EFF4FF",
      "text-muted": "#9FB0CF",
      danger: "#FF7B92",
      success: "#4FF2C9",
      warning: "#FFBE5B",
    },
  },
  backgroundImage: {
    "gradient-brand": "linear-gradient(135deg, #3A7BFF 0%, #4FF2C9 100%)",
    "gradient-headline": "linear-gradient(120deg, #6AA3FF 0%, #A78BFA 50%, #5DE4C7 100%)",
    "gradient-violet": "linear-gradient(135deg, #C084FC, #F472B6)",
    "gradient-mint": "linear-gradient(135deg, #36C6A8, #5DE4C7)",
    "gradient-azure": "linear-gradient(135deg, #4C7DFF, #6AA3FF)",
  },
  boxShadow: {
    card: "0 28px 80px -40px rgba(0, 0, 0, 0.72)",
    glow: "0 20px 40px -22px rgba(76, 125, 255, 0.75)",
    "brand-card": "0 16px 50px -28px rgba(58, 123, 255, 0.50)",
    "brand-glow": "0 0 0 1px rgba(58,123,255,0.35), 0 12px 36px -20px rgba(79,242,201,0.55)",
  },
  borderRadius: {
    xs: "0.5rem",
    sm: "0.625rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    pill: "9999px",
  },
  fontFamily: {
    sans: ['"Manrope"', '"Geist"', '"Inter Tight"', '"Inter"', '"Segoe UI"', "system-ui", "sans-serif"],
    display: ['"Manrope"', '"Geist"', '"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
    mono: ['"IBM Plex Mono"', '"JetBrains Mono"', '"Consolas"', '"SFMono-Regular"', "monospace"],
  },
  fontSize: {
    eyebrow: ["0.6875rem", { letterSpacing: "0.22em", fontWeight: "600" }],     // 11px uppercase
    xs: ["0.75rem", { lineHeight: "1.5" }],            // 12px
    sm: ["0.875rem", { lineHeight: "1.75" }],           // 14px body
    base: ["1rem", { lineHeight: "1.5" }],              // 16px
    lg: ["1.125rem", { lineHeight: "1.7" }],            // 18px body-lg
    xl: ["1.25rem", { lineHeight: "1.25" }],             // 20px
    "2xl": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],          // 24px
    "3xl": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.03em" }],          // 30px
    "4xl": ["2.25rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],          // 36px
    "5xl": ["3rem", { lineHeight: "1.02", letterSpacing: "-0.04em" }],            // 48px
    "6xl": ["3.75rem", { lineHeight: "1.02", letterSpacing: "-0.05em" }],          // 60px
    "7xl": ["5.25rem", { lineHeight: "1.02", letterSpacing: "-0.05em" }],          // 84px
  },
  transitionTimingFunction: {
    "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
  transitionDuration: {
    fast: "180ms",
    base: "300ms",
    slow: "500ms",
  },
} as const;
