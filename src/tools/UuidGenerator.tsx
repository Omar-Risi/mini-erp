import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw } from "lucide-react";

function newUUID() {
  return crypto.randomUUID();
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>(() => [newUUID()]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function generate() {
    setUuids((prev) => [newUUID(), ...prev].slice(0, 8));
  }

  function copy(uuid: string) {
    navigator.clipboard.writeText(uuid);
    setCopiedId(uuid);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={generate} className="gap-2 w-full">
        <RefreshCw size={14} />
        Generate
      </Button>

      <div className="flex flex-col gap-1.5">
        {uuids.map((uuid) => (
          <div
            key={uuid}
            className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5"
          >
            <span className="font-mono text-xs text-zinc-700 select-all">{uuid}</span>
            <button
              onClick={() => copy(uuid)}
              className="ml-3 shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              aria-label="Copy UUID"
            >
              {copiedId === uuid ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
