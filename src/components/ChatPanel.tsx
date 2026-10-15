import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Trash2, Pencil, Bot } from "lucide-react";
import { useLocal, uid, type ChatMsg } from "@/lib/store";
import { chatReply } from "@/lib/sim-ai";
import { CopyButton } from "./ui-bits";

const STARTERS = [
  "Write an email to my manager about a project delay",
  "Brainstorm ideas for improving team engagement",
  "Summarise meeting notes for our sprint review",
  "I feel overwhelmed — how can I improve my focus?",
];

export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [msgs, setMsgs] = useLocal<ChatMsg[]>("wpa.chat", []);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [msgs, thinking]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;
    setMsgs((m) => [...m, { id: uid(), role: "user", content: t }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: uid(), role: "assistant", content: chatReply(t) }]);
      setThinking(false);
      taRef.current?.focus();
    }, 600);
  };

  return (
    <div className="flex flex-col">
      <div className={`space-y-4 overflow-y-auto pr-1 ${compact ? "max-h-80" : "h-[55vh]"}`}>
        {!msgs.length && (
          <div className="grid gap-2 sm:grid-cols-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-lg border bg-muted/50 p-3 text-left text-sm hover:bg-muted">{s}</button>
            ))}
          </div>
        )}
        {msgs.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"><Bot className="h-4 w-4" /></span>
              <div className="min-w-0 flex-1">
                {editing === m.id ? (
                  <textarea
                    autoFocus
                    className="field font-mono text-xs"
                    rows={12}
                    defaultValue={m.content}
                    onBlur={(e) => {
                      const v = e.target.value;
                      setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, content: v } : x)));
                      setEditing(null);
                    }}
                  />
                ) : (
                  <div className="prose-chat text-sm leading-relaxed [&_h3]:mt-2 [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_table]:my-2 [&_td]:border [&_td]:px-2 [&_th]:border [&_th]:px-2 [&_ul]:list-disc">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
                <div className="mt-1 flex gap-2">
                  <CopyButton text={m.content} />
                  <button className="btn btn-ghost px-2.5 py-1.5 text-xs" onClick={() => setEditing(m.id)}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                </div>
              </div>
            </div>
          ),
        )}
        {thinking && <div className="text-sm text-muted-foreground animate-pulse">Analysing your request…</div>}
        <div ref={endRef} />
      </div>
      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => { e.preventDefault(); send(input); }}
      >
        <textarea
          ref={taRef}
          className="field resize-none"
          rows={2}
          placeholder="Ask for an email, brainstorm, meeting summary, or advice…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
        />
        <button type="submit" className="btn btn-primary h-11 w-11 p-0" disabled={!input.trim() || thinking} aria-label="Send"><Send className="h-4 w-4" /></button>
        {msgs.length > 0 && (
          <button type="button" className="btn btn-ghost h-11 w-11 p-0" onClick={() => setMsgs([])} aria-label="Clear chat"><Trash2 className="h-4 w-4" /></button>
        )}
      </form>
    </div>
  );
}
