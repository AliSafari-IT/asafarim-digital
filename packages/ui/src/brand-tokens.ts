export const asafarimBrandTokens = {
  name: "asafarim-digital",
  essence: "AI-Empowered Digital Craftsmanship",
  colors: {
    midnightGraphite: "#0D0D0F",
    electricAzure: "#3A7BFF",
    softSlate: "#A3A9B7",
    neonMint: "#4FF2C9",
    white: "#F5F7FB",
    borderDark: "#2A2F3B",
    surfaceElevated: "#14161C",
  },
  gradients: {
    brand: "linear-gradient(135deg, #3A7BFF 0%, #4FF2C9 100%)",
  },
  typography: {
    heading: ["Geist", "Inter Tight", "Inter", "sans-serif"],
    body: ["Inter", "Geist Sans", "Segoe UI", "sans-serif"],
    code: ["JetBrains Mono", "Consolas", "monospace"],
  },
  radius: {
    sm: "0.625rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.25rem",
  },
  shadows: {
    card: "0 16px 50px -28px rgba(58, 123, 255, 0.5)",
    glow: "0 0 0 1px rgba(58,123,255,0.35), 0 12px 36px -20px rgba(79,242,201,0.55)",
  },
  motion: {
    easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
    easeSmooth: "cubic-bezier(0.22, 1, 0.36, 1)",
    durationFast: "180ms",
    durationBase: "300ms",
  },
} as const;

export const asafarimTailwindThemeExtension = {
  colors: {
    brand: {
      midnight: "#0D0D0F",
      azure: "#3A7BFF",
      slate: "#A3A9B7",
      mint: "#4FF2C9",
      text: "#F5F7FB",
      border: "#2A2F3B",
      surface: "#0D0D0F",
      elevated: "#14161C",
    },
  },
  boxShadow: {
    "brand-card": "0 16px 50px -28px rgba(58, 123, 255, 0.5)",
    "brand-glow": "0 0 0 1px rgba(58,123,255,0.35), 0 12px 36px -20px rgba(79,242,201,0.55)",
  },
  borderRadius: {
    "brand-sm": "0.625rem",
    "brand-md": "0.875rem",
    "brand-lg": "1rem",
    "brand-xl": "1.25rem",
  },
} as const;
