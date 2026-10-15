import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles as _unused } from "lucide-react";
import { Wand2 } from "lucide-react";
import { research, detectMode } from "@/lib/sim-ai";
import { useLocal } from "@/lib/store";
import { Disclaimer, EditableOutput, PageHeader } from "@/components/ui-bits";

void _unused;

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant · AI Productivity Assistant" },
      { name: "description", content: "Turn topics and pasted articles into summaries, insights and action points." },
      { property: "og:title", content: "Research Assistant" },
      { property: "og:description", content: "Structured summaries, insights and action points." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Research,
});

const MODE_LABEL = { topic: "Topic", article: "Pasted article", url: "Website URL (not fetched)" };

function Research() {
  const [input, setInput] = useLocal("wpa.research.input", "");
  const [output, setOutput] = useLocal("wpa.research.output", "");
  const [busy, setBusy] = useState(false);
  const mode = detectMode(input);

  return (
    <div className="space-y-6">
      <PageHeader title="Research Assistant" subtitle="Enter a topic, paste an article, or drop a URL." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
          <textarea className="field" rows={14} placeholder="e.g. 'Hybrid work policies' — or paste full article text…" value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Detected input: <strong className="text-foreground">{input.trim() ? MODE_LABEL[mode] : "—"}</strong></span>
            <button
              className="btn btn-primary"
              disabled={!input.trim() || busy}
              onClick={() => { setBusy(true); setTimeout(() => { setOutput(research(input)); setBusy(false); }, 500); }}
            >
              <Wand2 className="h-4 w-4" /> {busy ? "Analysing…" : "Generate brief"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Articles get a genuine extractive summary computed in your browser. URLs cannot be read without a server, so you'll get guidance instead.</p>
        </section>
        <section className="card p-5">
          {output ? <EditableOutput value={output} rows={22} /> : <p className="text-sm text-muted-foreground">Your structured summary, insights, recommendations and action points will appear here.</p>}
        </section>
      </div>
      <Disclaimer />
    </div>
  );
}
