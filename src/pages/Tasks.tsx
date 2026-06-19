import { useState, useRef } from "react";
import { useLoaderData, useFetcher, Form } from "react-router";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Trash2, Plus, Clock, Search } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Task = {
  id: number;
  title: string;
  due_date: string;
  assigned_date: string;
  is_overdue: number;
  days_overdue: number;
  status: string;
  created_at: string;
  completed_at: string | null;
};

// ── Loader ───────────────────────────────────────────────────────────────────

export async function tasksLoader() {
  const [today, archive] = await Promise.all([
    db.all<Task>(`
      SELECT *, CAST(julianday('now') - julianday(due_date) AS INTEGER) AS days_overdue
      FROM tasks
      WHERE assigned_date = date('now') AND status = 'active'
      ORDER BY is_overdue DESC, created_at ASC
    `),
    db.all<Task>(`
      SELECT * FROM tasks
      WHERE status = 'done'
      ORDER BY completed_at DESC
    `),
  ]);
  return { today, archive };
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function tasksAction({ request }: { request: Request }) {
  const data = await request.formData();
  const intent = data.get("intent") as string;

  if (intent === "create") {
    const title = (data.get("title") as string).trim();
    if (title) {
      await db.run(
        `INSERT INTO tasks (title, due_date, assigned_date) VALUES (?, date('now'), date('now'))`,
        [title]
      );
    }
  } else if (intent === "complete") {
    await db.run(
      `UPDATE tasks SET status = 'done', completed_at = datetime('now') WHERE id = ?`,
      [data.get("id")]
    );
  } else if (intent === "delete") {
    await db.run(`DELETE FROM tasks WHERE id = ?`, [data.get("id")]);
  }

  return null;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  const fetcher = useFetcher();
  const isCompleting = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "complete";
  const isDeleting = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "delete";

  if (isCompleting || isDeleting) return null;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      {/* Complete button */}
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="complete" />
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 hover:border-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
          aria-label="Mark complete"
        >
          <Check size={11} className="opacity-0 group-hover:opacity-50" />
        </button>
      </fetcher.Form>

      {/* Title */}
      <span className="flex-1 text-sm text-zinc-800">{task.title}</span>

      {/* Overdue badge */}
      {task.is_overdue === 1 && (
        <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 border border-red-100">
          <Clock size={10} />
          {task.days_overdue}d overdue
        </span>
      )}

      {/* Delete button */}
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </fetcher.Form>
    </div>
  );
}

function ArchiveRow({ task }: { task: Task }) {
  const fetcher = useFetcher();
  if (fetcher.state !== "idle") return null;

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
      <Check size={14} className="shrink-0 text-zinc-400" />
      <span className="flex-1 text-sm text-zinc-500 line-through">{task.title}</span>
      <span className="text-xs text-zinc-400">
        {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : ""}
      </span>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="id" value={task.id} />
        <button
          type="submit"
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
          aria-label="Delete"
        >
          <Trash2 size={14} />
        </button>
      </fetcher.Form>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function Tasks() {
  const { today, archive } = useLoaderData<typeof tasksLoader>();
  const [view, setView] = useState<"today" | "archive">("today");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const overdueCount = today.filter((t) => t.is_overdue).length;
  const freshCount = today.length - overdueCount;

  const filteredArchive = archive.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 overflow-y-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Tasks</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {today.length === 0
              ? "Nothing due today."
              : `${today.length} task${today.length !== 1 ? "s" : ""} today${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
          {(["today", "archive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors cursor-pointer",
                view === tab
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {tab}
              {tab === "archive" && archive.length > 0 && (
                <span className="ml-1.5 text-xs text-zinc-400">{archive.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {view === "today" ? (
        <div className="flex flex-col gap-4">
          {/* Add task form */}
          <Form
            method="post"
            onSubmit={() => setTimeout(() => inputRef.current?.focus(), 50)}
          >
            <input type="hidden" name="intent" value="create" />
            <div className="flex gap-2">
              <input
                ref={inputRef}
                name="title"
                placeholder="Add a task…"
                autoComplete="off"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 shadow-sm"
              />
              <Button type="submit" variant="default" size="default" className="gap-1.5">
                <Plus size={15} />
                Add
              </Button>
            </div>
          </Form>

          {/* Today list */}
          {today.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <Check size={32} className="mb-3 opacity-30" />
              <p className="text-sm">All clear for today.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {freshCount > 0 && overdueCount > 0 && (
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Today</p>
              )}
              {today.filter((t) => !t.is_overdue).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}

              {overdueCount > 0 && (
                <>
                  <p className="text-xs font-medium text-red-400 uppercase tracking-wide mt-2">
                    Overdue
                  </p>
                  {today.filter((t) => t.is_overdue).map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archive…"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 shadow-sm"
            />
          </div>

          {filteredArchive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
              <p className="text-sm">{search ? "No results." : "No completed tasks yet."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredArchive.map((task) => (
                <ArchiveRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
