import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { navSections, bottomNavItems, type NavItem } from "./nav-config";

function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <NavLink to={item.path} end={item.path === "/"}>
          {({ isActive }) => (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "w-full h-9",
                isActive && "bg-zinc-100 text-zinc-900"
              )}
              aria-label={item.label}
            >
              <Icon size={18} />
            </Button>
          )}
        </NavLink>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-14 flex-col border-r border-zinc-200 bg-white py-3">
      {/* Logo */}
      <div className="flex h-9 items-center justify-center mb-4">
        <span className="text-xs font-bold tracking-widest text-zinc-400 select-none">ERP</span>
      </div>

      <Separator className="mb-3" />

      {/* Main nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2">
        {navSections.map((section, i) => (
          <div key={i} className="flex flex-col gap-1">
            {section.items.map((item) => (
              <NavButton key={item.path} item={item} />
            ))}
            {i < navSections.length - 1 && <Separator className="mt-2" />}
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <Separator className="mt-3 mb-3" />
      <div className="flex flex-col gap-1 px-2">
        {bottomNavItems.map((item) => (
          <NavButton key={item.path} item={item} />
        ))}
      </div>
    </aside>
  );
}
