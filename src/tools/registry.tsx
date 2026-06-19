import { lazy, type LazyExoticComponent } from "react";
import type { LucideIcon } from "lucide-react";
import { Hash, Binary } from "lucide-react";

export type ToolSize = "sm" | "md" | "lg";

export type ToolEntry = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  size?: ToolSize;
  component: LazyExoticComponent<() => React.ReactElement>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Tool registry — add one entry here + one component file to ship a new tool.
// ─────────────────────────────────────────────────────────────────────────────
export const toolRegistry: ToolEntry[] = [
  {
    id: "uuid",
    title: "UUID Generator",
    description: "Generate v4 UUIDs and copy them instantly.",
    icon: Hash,
    size: "md",
    component: lazy(() => import("./UuidGenerator")),
  },
  {
    id: "base64",
    title: "Base64",
    description: "Encode or decode Base64 strings.",
    icon: Binary,
    size: "lg",
    component: lazy(() => import("./Base64Tool")),
  },
];
