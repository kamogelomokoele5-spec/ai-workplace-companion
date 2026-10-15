import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil, Check, Wand2 } from "lucide-react";
import { useTasks, useHours, uid, type Task, type Priority } from "@/lib/store";
import { planWeek, scheduleToText, quadrant, daysLeft, type Schedule } from "@/lib/sim-ai";
import { Disclaimer, EditableOutput, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner · AI Productivity Assistant" },
      { name: "description", content: "Add tasks and generate a prioritised weekly schedule." },
      { property: "og:title", content: "AI Task Planner" },
      { property: "og:description", content: "Prioritise urgent work and plan your week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Planner,
});

const empty = { title: "", deadline: new Date().toISOString().slice(0, 10), priority: "medium" as Priority, hours: 1 };
const QCOL: Record<string, string> = { "Do first": "bg-destructive/15 text-destructive", Schedule: "bg-primary/10", "Quick win": "bg-warning/20", Later: "bg-muted" };

function Planner() {
  const [tasks, setTasks] = useTasks();
  const [hours, setHours] = useHours();
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [plan, setPlan] = useState<Schedule | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editId) setTasks((ts) => ts.map((t) => (t.id === editId ? { ...t, ...form } : t)));
    else setTasks((ts) => [...ts, { id: uid(), done: false, ...form }]);
    setForm(empty);
    setEditId(null);
  };
  const edit = (t: Task) => { setEditId(t.id); setForm({ title: t.title, deadline: t.deadline, priority: t.priority, hours: t.hours }); };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Task Planner" subtitle="Add tasks, set your hours, and generate a prioritised week." />

      <form onSubmit={submit} className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <input className="field lg:col-span-2" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="field" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
          <option value="high">High priority</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <input className="field" type="number" min={0.5} step={0.5} value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} aria-label="Estimated hours" />
        <button className="btn btn-primary">{editId ? <><Check className="h-4 w-4" /> Save</> : <><Plus className="h-4 w-4" /> Add</>}</button>
      </form>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <h2 className="text-xl">Tasks</h2>
          <ul className="mt-4 divide-y">
            {tasks.map((t) => {
              const q = quadrant(t), d = daysLeft(t.deadline);
              return (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <input type="checkbox" checked={t.done} onChange={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))} className="h-4 w-4 accent-primary" aria-label="Complete" />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.hours}h · due {t.deadline} {d < 0 && !t.done ? "· overdue" : ""} · {t.priority}</div>
                  </div>
                  {!t.done && <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline ${QCOL[q]}`}>{q}</span>}
                  <button onClick={() => edit(t)} aria-label="Edit" className="text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))} aria-label="Delete" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
            {!tasks.length && <li className="py-6 text-center text-sm text-muted-foreground">No tasks yet.</li>}
          </ul>
        </section>

        <section className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="text-xl">Generate schedule</h2>
          <label className="block text-sm">
            Available hours this week
            <input className="field mt-1" type="number" min={1} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
          <button className="btn btn-accent w-full" onClick={() => setPlan(planWeek(tasks, hours))}><Wand2 className="h-4 w-4" /> Generate weekly plan</button>
          <p className="text-xs text-muted-foreground">Ranks tasks by priority and deadline urgency (Eisenhower-style), then fills Mon–Fri up to your daily capacity.</p>
        </section>
      </div>

      {plan && (
        <section className="card space-y-5 p-5">
          <h2 className="text-xl">Your week</h2>
          <ul className="space-y-1 text-sm">{plan.notes.map((n) => <li key={n}>• {n}</li>)}</ul>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {plan.days.map((d) => (
              <div key={d.day} className="rounded-xl bg-muted p-3">
                <div className="flex justify-between text-sm font-semibold"><span>{d.day}</span><span className="text-xs text-muted-foreground">{d.used}/{plan.capacity}h</span></div>
                <div className="mt-2 space-y-1.5">
                  {d.blocks.length ? d.blocks.map((b, i) => (
                    <div key={i} className="rounded-lg bg-card p-2 text-xs shadow-sm"><div className="font-medium">{b.title}</div><div className="text-muted-foreground">{b.hours}h · {b.priority}</div></div>
                  )) : <div className="text-xs text-muted-foreground">Buffer / deep work</div>}
                </div>
              </div>
            ))}
          </div>
          {plan.overflow.length > 0 && <p className="text-sm text-destructive">Unscheduled: {plan.overflow.map((b) => `${b.title} (${b.hours}h)`).join(", ")}</p>}
          <EditableOutput value={scheduleToText(plan)} rows={12} />
        </section>
      )}
      <Disclaimer />
    </div>
  );
}
