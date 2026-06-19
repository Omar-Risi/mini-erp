import { useState, useRef, useEffect } from "react";
import { useLoaderData, Form, Link, redirect, useFetcher } from "react-router";
import { db } from "@/lib/db";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, FileText, Plus, Eye, Pencil, Trash2 } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function todayTitle() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(new Date());
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(iso));
}

// ── Loader ───────────────────────────────────────────────────────────────────

export async function notesListLoader({ request }: { request: Request }) {
  // Skip auto-redirect when the user explicitly navigated back to the list
  const url = new URL(request.url);
  const skipRedirect = url.searchParams.get("list") === "1";

  if (!skipRedirect) {
    const todayNote = await db.get<{ id: number }>(
      `SELECT id FROM notes WHERE daily_date = ? AND is_daily = 1`,
      [todayStr()]
    );
    if (todayNote) return redirect(`/notes/${todayNote.id}?mode=edit`);
  }

  const notes = await db.all<Note>(`SELECT * FROM notes ORDER BY created_at DESC`);
  return { notes };
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function notesListAction({ request }: { request: Request }) {
  const data = await request.formData();
  const intent = data.get("intent") as string;

  if (intent === "create-daily") {
    const result = await db.run(
      `INSERT INTO notes (title, is_daily, daily_date) VALUES (?, 1, ?)`,
      [todayTitle(), todayStr()]
    );
    return redirect(`/notes/${result.lastInsertRowid}?mode=edit`);
  }

  if (intent === "create-custom") {
    const title = (data.get("title") as string).trim();
    if (!title) return null;
    const result = await db.run(`INSERT INTO notes (title) VALUES (?)`, [title]);
    return redirect(`/notes/${result.lastInsertRowid}?mode=edit`);
  }

  if (intent === "delete") {
    await db.run(`DELETE FROM notes WHERE id = ?`, [data.get("id")]);
  }

  return null;
}

// ── Note row ─────────────────────────────────────────────────────────────────

function NoteRow({ note }: { note: Note }) {
  const fetcher = useFetcher();
  if (fetcher.state !== "idle") return null;

  const snippet = note.body.replace(/[#*`_~>\[\]]/g, "").slice(0, 80).trim();

  return (
    <div className="group flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
        note.is_daily ? "bg-blue-50 text-blue-500" : "bg-zinc-100 text-zinc-400"
      )}>
        {note.is_daily ? <CalendarDays size={15} /> : <FileText size={15} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{note.title}</p>
        {snippet && (
          <p className="text-xs text-zinc-400 truncate mt-0.5">{snippet}</p>
        )}
      </div>

      <span className="text-xs text-zinc-400 shrink-0">{formatDate(note.created_at)}</span>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/notes/${note.id}?mode=preview`}>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View">
            <Eye size={13} />
          </Button>
        </Link>
        <Link to={`/notes/${note.id}?mode=edit`}>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit">
            <Pencil size={13} />
          </Button>
        </Link>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={note.id} />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-red-500"
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </Button>
        </fetcher.Form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function NotesList() {
  const { notes } = useLoaderData<typeof notesListLoader>();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCustomForm) customInputRef.current?.focus();
  }, [showCustomForm]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 overflow-y-auto max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Notes</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {notes.length === 0 ? "No notes yet." : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Form method="post">
            <input type="hidden" name="intent" value="create-daily" />
            <Button type="submit" variant="outline" className="gap-1.5 h-9">
              <CalendarDays size={14} />
              Today's note
            </Button>
          </Form>

          <Button
            variant="default"
            className="gap-1.5 h-9"
            onClick={() => setShowCustomForm((v) => !v)}
          >
            <Plus size={14} />
            New note
          </Button>
        </div>
      </div>

      {/* Custom note form */}
      {showCustomForm && (
        <Form method="post" onSubmit={() => setShowCustomForm(false)}>
          <input type="hidden" name="intent" value="create-custom" />
          <div className="flex gap-2">
            <input
              ref={customInputRef}
              name="title"
              placeholder="Note title…"
              autoComplete="off"
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 shadow-sm"
            />
            <Button type="submit" variant="default">Create</Button>
            <Button type="button" variant="ghost" onClick={() => setShowCustomForm(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <FileText size={32} className="mb-3 opacity-30" />
          <p className="text-sm">Start writing your first note.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => <NoteRow key={note.id} note={note} />)}
        </div>
      )}
    </div>
  );
}
