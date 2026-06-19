import { Outlet } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen bg-zinc-50 text-zinc-900">
        <Sidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}
