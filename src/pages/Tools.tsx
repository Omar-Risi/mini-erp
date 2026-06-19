import { useState, Suspense } from "react";
import { toolRegistry, type ToolEntry } from "@/tools/registry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ── Tool card ─────────────────────────────────────────────────────────────────

function ToolCard({ tool, onClick }: { tool: ToolEntry; onClick: () => void }) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md cursor-pointer"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-900">{tool.title}</p>
        <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{tool.description}</p>
      </div>
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function Tools() {
  const [activeTool, setActiveTool] = useState<ToolEntry | null>(null);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Tools</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {toolRegistry.length} tool{toolRegistry.length !== 1 ? "s" : ""} available.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-2xl">
        {toolRegistry.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool)} />
        ))}
      </div>

      {/* Modal shell — body is fully owned by each tool's component */}
      <Dialog open={activeTool !== null} onOpenChange={(open) => !open && setActiveTool(null)}>
        {activeTool && (
          <DialogContent size={activeTool.size ?? "md"}>
            <DialogHeader>
              <DialogTitle>{activeTool.title}</DialogTitle>
              <DialogDescription>{activeTool.description}</DialogDescription>
            </DialogHeader>
            <Suspense
              fallback={
                <div className="flex h-24 items-center justify-center text-sm text-zinc-400">
                  Loading…
                </div>
              }
            >
              <activeTool.component />
            </Suspense>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
