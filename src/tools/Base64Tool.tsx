import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type Mode = "encode" | "decode";

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");

  let output = "";
  let error = false;
  try {
    output = input ? (mode === "encode" ? btoa(unescape(encodeURIComponent(input))) : decodeURIComponent(escape(atob(input)))) : "";
  } catch {
    output = "Invalid input for decoding.";
    error = true;
  }

  function copy() {
    if (output && !error) navigator.clipboard.writeText(output);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex gap-1 self-start rounded-lg border border-zinc-200 bg-zinc-100 p-1">
        {(["encode", "decode"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setInput(""); }}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer",
              mode === m ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {mode === "encode" ? "Plain text" : "Base64"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
          rows={4}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 font-mono text-sm text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          spellCheck={false}
        />
      </div>

      {/* Output */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
            {mode === "encode" ? "Base64" : "Plain text"}
          </label>
          {output && !error && (
            <button
              onClick={copy}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              <Copy size={11} /> Copy
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          rows={4}
          className={cn(
            "w-full resize-none rounded-lg border px-3 py-2.5 font-mono text-sm focus:outline-none",
            error
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-zinc-200 bg-zinc-50 text-zinc-700"
          )}
        />
      </div>
    </div>
  );
}
