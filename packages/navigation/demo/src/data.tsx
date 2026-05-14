import type { NavItem } from "@asafarim/navigation";

/* ── Inline SVG icons (no external dep) ───────────────────── */

const Icon = (path: string) => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

export const HomeIcon = () => Icon("M2 8l6-5 6 5v6H2z");
export const InboxIcon = () => Icon("M2 10h4l1 2h2l1-2h4M2 4v10h12V4z");
export const DocsIcon = () =>
  Icon("M4 2h6l2 2v10H4zM6 6h4M6 9h4M6 12h2");
export const SettingsIcon = () => Icon("M8 5v6M5 8h6M8 2v1M8 13v1M2 8h1M13 8h1");
export const AdminIcon = () => Icon("M3 6l5-3 5 3v4l-5 3-5-3z");
export const BillingIcon = () => Icon("M2 5h12v6H2zM2 8h12");
export const ExternalIcon = () => Icon("M6 3h7v7M13 3L6 10");
export const StarIcon = () => Icon("M8 2l1.8 3.7L14 6l-3 2.7L11.6 13 8 11l-3.6 2L5 8.7 2 6l4.2-.3z");

/* ── Demo navigation tree ─────────────────────────────────── */

export const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: <HomeIcon /> },
  {
    id: "inbox",
    label: "Inbox",
    href: "/inbox",
    icon: <InboxIcon />,
    badge: 3,
  },
  {
    id: "docs",
    label: "Docs",
    icon: <DocsIcon />,
    description: "Guides and API reference",
    children: [
      { id: "docs-guide", label: "Getting started", href: "/docs/guide" },
      { id: "docs-api", label: "API reference", href: "/docs/api" },
      {
        id: "docs-cookbook",
        label: "Cookbook",
        href: "/docs/cookbook",
        badge: "new",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon />,
    shortcut: "⌘,",
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin",
    icon: <AdminIcon />,
    requiredRoles: ["admin"],
    description: "Restricted",
  },
  {
    id: "billing",
    label: "Billing",
    href: "/billing",
    icon: <BillingIcon />,
    permissions: ["billing:read"],
  },
  {
    id: "github",
    label: "GitHub",
    href: "https://github.com/AliSafari-IT/asafarim-digital",
    icon: <ExternalIcon />,
    external: true,
  },
  {
    id: "disabled",
    label: "Coming soon",
    href: "/soon",
    icon: <StarIcon />,
    disabled: true,
  },
];

export const accountDropdownItems: NavItem[] = [
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    description: "Public details",
  },
  { id: "team", label: "Team", href: "/team" },
  { id: "settings-d", label: "Settings", href: "/settings", shortcut: "⌘," },
  {
    id: "signout",
    label: "Sign out",
    onClick: () => alert("Sign out (demo)"),
  },
];
