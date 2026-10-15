import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, BookOpenText, MessagesSquare, ListTodo, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useTasks, useHours } from "@/lib/store";
import { planWeek, daysLeft, quadrant } from "@/lib/sim-ai";
import { Disclaimer, PageHeader } from "@/components/ui-bits";
import { ChatPanel } from "@/components/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Workplace Productivity Assistant" },
      { name: "description", content: "Overview of your tasks, weekly schedule and workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Plan your week, summarise research and draft work content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const PRI = { high: "bg-destructive", medium: "bg-warning", low: "bg-success" } as const;

function Dashboard() {
  const [tasks] = useTasks();
  const [hours] = useHours();
  const open = tasks.filter((t) => !t.done);
  const plan = planWeek(tasks, hours);
  const urgent = open.filter((t) => quadrant(t) === "Do first");
  const upcoming = [...open].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 5);

  const stats = [
    { label: "Open tasks", value: open.length, icon: ListTodo },
    { label: "Completed", value: tasks.length - open.length, icon: CheckCircle2 },
    { label: "Urgent", value: urgent.length, icon: AlertTriangle },
    { label: "Planned hours", value: `${open.reduce((s, t) => s + t.hours, 0)}/${hours}`, icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Good day 👋" subtitle="Here's your workplace overview for this week." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="mt-3 font-display text-3xl">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { to: "/planner", label: "Plan my week", icon: CalendarCheck },
          { to: "/research", label: "Summarise research", icon: BookOpenText },
          { to: "/chat", label: "Draft an email", icon: MessagesSquare },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
            <span className="font-semibold">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-xl">Upcoming tasks</h2>
          <ul className="mt-4 space-y-3">
            {upcoming.map((t) => {
              const d = daysLeft(t.deadline);
              return (
                <li key={t.id} className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${PRI[t.priority]}`} />
                  <span className="flex-1 truncate text-sm">{t.title}</span>
                  <span className={`text-xs ${d <= 1 ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{d < 0 ? "Overdue" : d === 0 ? "Today" : `${d}d`}</span>
                </li>
              );
            })}
            {!upcoming.length && <li className="text-sm text-muted-foreground">All clear!</li>}
          </ul>
        </section>

        <section className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Weekly schedule</h2>
            <Link to="/planner" className="text-xs font-semibold underline">Edit</Link>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {plan.days.map((d) => (
              <div key={d.day} className="min-h-28 rounded-lg bg-muted p-2">
                <div className="text-xs font-semibold">{d.day.slice(0, 3)}</div>
                <div className="mt-2 space-y-1">
                  {d.blocks.map((b, i) => (
                    <div key={i} className="truncate rounded bg-card px-1.5 py-1 text-[10px]" title={`${b.title} · ${b.hours}h`}>{b.title}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <h2 className="mb-4 text-xl">Quick chat</h2>
        <ChatPanel compact />
      </section>

      <Disclaimer />
    </div>
  );
}
