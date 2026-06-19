import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Wrench,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    items: [
      { label: "Tasks", path: "/tasks", icon: CheckSquare },
      { label: "Notes", path: "/notes", icon: StickyNote },
      { label: "Tools", path: "/tools", icon: Wrench },
    ],
  },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", path: "/settings", icon: Settings },
];
