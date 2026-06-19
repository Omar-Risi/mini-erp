import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { CheckSquare, StickyNote, Wrench } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-400 mt-1">Here's what's on your plate today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Tasks left today</p>
          <p className="mt-2 text-4xl font-semibold text-zinc-900">—</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Total tasks</p>
          <p className="mt-2 text-4xl font-semibold text-zinc-900">—</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">Quick actions</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 h-10"
            onClick={() => navigate("/tasks")}
          >
            <CheckSquare size={16} />
            New task
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-10"
            onClick={() => navigate("/notes")}
          >
            <StickyNote size={16} />
            New note
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-10"
            onClick={() => navigate("/tools")}
          >
            <Wrench size={16} />
            Check tools
          </Button>
        </div>
      </div>
    </div>
  );
}
