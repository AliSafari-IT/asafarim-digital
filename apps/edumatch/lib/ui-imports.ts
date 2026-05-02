// This file imports @asafarim/ui components to ensure Tailwind scans their classes
// The classes hidden md:flex and md:hidden from CommonNavbar need to be generated

// Import the components to ensure their source files are scanned by Tailwind
export { CommonNavbar, CommonSidebar, SidebarLayout, useNavigation } from "@asafarim/ui";

// Explicitly reference the responsive classes for Tailwind to generate them
// This is a workaround for Tailwind v4 not scanning node_modules packages
const tailwindClasses = [
  "hidden",
  "md:flex",
  "md:hidden",
  "items-center",
  "gap-1",
  "gap-4",
  "p-2",
  "rounded-md",
  "w-6",
  "h-6",
  "flex-shrink-0",
  "max-w-7xl",
  "mx-auto",
  "px-4",
  "sm:px-6",
  "lg:px-8",
  "flex",
  "items-center",
  "justify-between",
  "h-16",
  "py-4",
  "border-t",
  "border-white/10",
  "flex-col",
  "mt-4",
  "pt-4",
];

// Prevent tree-shaking
console.log("Tailwind classes referenced:", tailwindClasses.length);
