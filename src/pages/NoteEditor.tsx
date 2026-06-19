import { useState, useEffect, useRef } from "react";
import { useLoaderData, useFetcher, Link, redirect } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";
import { db } from "@/lib/db";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";

// ── Markdown renderer ─────────────────────────────────────────────────────────

const markdownComponents: Components = {
  code({ className, children }) {
    const match = /language-(\w+)/.exec(className ?? "");
    if (match) {
      return (
        <SyntaxHighlighter
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style={oneLight as any}
          language={match[1]}
          PreTag="div"
          customStyle={{ borderRadius: "0.5rem", fontSize: "0.875rem", margin: "1rem 0" }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className={cn("rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.875em] text-zinc-800", className)}>
        {children}
      </code>
    );
  },
  h1: ({ children }) => <h1 className="text-2xl font-bold text-zinc-900 mt-6 mb-3 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="text-xl font-semibold text-zinc-900 mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-lg font-semibold text-zinc-800 mt-4 mb-2">{children}</h3>,
  p: ({ children }) => <p className="text-sm text-zinc-700 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-sm text-zinc-700">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-sm text-zinc-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-zinc-300 pl-4 italic text-zinc-500 my-3">{children}</blockquote>
  ),
  hr: () => <hr className="border-zinc-200 my-5" />,
  a: ({ href, children }) => (
    <a href={href} className="text-blue-600 underline underline-offset-2 hover:text-blue-800">{children}</a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-zinc-900">{children}</strong>,
  pre: ({ children }) => <>{children}</>,
};

// ── Loader ───────────────────────────────────────────────────────────────────

export async function noteLoader({
  params,
  request,
}: {
  params: { id: string };
  request: Request;
}) {
  const note = await db.get<Note>(`SELECT * FROM notes WHERE id = ?`, [params.id]);
  if (!note) throw new Response("Note not found", { status: 404 });

  const url = new URL(request.url);
  const mode = (url.searchParams.get("mode") as "edit" | "preview") ?? "preview";
  return { note, initialMode: mode };
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function noteAction({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const data = await request.formData();
  const intent = data.get("intent") as string;

  if (intent === "save") {
    await db.run(
      `UPDATE notes SET body = ?, updated_at = datetime('now') WHERE id = ?`,
      [data.get("body"), params.id]
    );
    return null;
  }

  if (intent === "delete") {
    await db.run(`DELETE FROM notes WHERE id = ?`, [params.id]);
    return redirect("/notes?list=1");
  }

  return null;
}

// ── Page ─────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved";

export function NoteEditor() {
  const { note, initialMode } = useLoaderData<typeof noteLoader>();
  const [mode, setMode] = useState<"edit" | "preview">(initialMode);
  const [body, setBody] = useState(note.body);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedBodyRef = useRef(note.body);

  // Submit save via fetcher (imperative, no form needed)
  function save(value: string) {
    savedBodyRef.current = value;
    setSaveStatus("saving");
    saveFetcher.submit(
      { intent: "save", body: value },
      { method: "post" }
    );
  }

  // Debounced auto-save: fires 2s after the user stops typing
  function handleChange(value: string) {
    setBody(value);
    setSaveStatus("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), 2000);
  }

  // Flush on unmount so we don't lose the last keystrokes
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        // Only flush if there's unsaved content
        if (body !== savedBodyRef.current) save(body);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  // Track fetcher state → update status indicator
  useEffect(() => {
    if (saveFetcher.state === "idle" && saveStatus === "saving") {
      setSaveStatus("saved");
      const t = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [saveFetcher.state, saveStatus]);

  // Cmd/Ctrl+S: flush debounce and save immediately
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && mode === "edit") {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        save(body);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, body]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-6 py-3">
        <Link to="/notes?list=1">
          <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-500 hover:text-zinc-900 -ml-2">
            <ArrowLeft size={14} />
            Notes
          </Button>
        </Link>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-zinc-900 truncate">{note.title}</span>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
          {(["edit", "preview"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer",
                mode === m
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {m === "edit" ? <Pencil size={11} /> : <Eye size={11} />}
              {m}
            </button>
          ))}
        </div>

        {/* Auto-save status */}
        {mode === "edit" && (
          <span className={cn(
            "text-xs transition-opacity duration-300",
            saveStatus === "idle" && "opacity-0",
            saveStatus === "saving" && "opacity-100 text-zinc-400",
            saveStatus === "saved" && "opacity-100 text-zinc-400",
          )}>
            {saveStatus === "saving" ? "Saving…" : "Saved"}
          </span>
        )}

        {/* Delete */}
        <deleteFetcher.Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:text-red-500"
            aria-label="Delete note"
          >
            <Trash2 size={14} />
          </Button>
        </deleteFetcher.Form>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === "edit" ? (
          <textarea
            value={body}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Start writing in markdown…"
            className="h-full w-full resize-none bg-white p-8 font-mono text-sm text-zinc-800 leading-relaxed placeholder:text-zinc-300 focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="mx-auto max-w-2xl px-8 py-8">
            {body.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {body}
              </ReactMarkdown>
            ) : (
              <p className="text-sm text-zinc-300 italic">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
