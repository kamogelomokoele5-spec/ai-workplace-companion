import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, CalendarCheck, BookOpenText, MessagesSquare, PanelLeftClose, PanelLeftOpen, Menu, X, Briefcase, Home } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research", icon: BookOpenText },
  { to: "/chat", label: "Assistant", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current =
    NAV.find((n) => (n.to === "/" ? pathname === "/" : pathname.startsWith(n.to))) ?? NAV[0];

  const nav = (compact: boolean) => (
    <nav className="mt-6 flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMobile(false)}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          activeProps={{ className: "bg-sidebar-accent !text-sidebar-foreground" }}
          title={label}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!compact && <span>{label}</span>}
        </Link>
      ))}
    </nav>
  );

  const brand = (compact: boolean) => (
    <Link
      to="/"
      onClick={() => setMobile(false)}
      aria-label="Go to home"
      title="Home"
      className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-sidebar-accent"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Briefcase className="h-5 w-5" />
      </div>
      {!compact && <div className="font-display text-lg leading-tight">Workplace<br /><span className="text-xs font-sans text-sidebar-foreground/60">AI Productivity Assistant</span></div>}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      <aside className={`sticky top-0 hidden h-screen flex-col bg-sidebar p-4 text-sidebar-foreground transition-all md:flex ${collapsed ? "w-20" : "w-64"}`}>
        {brand(collapsed)}
        {nav(collapsed)}
        <button onClick={() => setCollapsed(!collapsed)} className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent" aria-label="Toggle sidebar">
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <><PanelLeftClose className="h-5 w-5" /> Collapse</>}
        </button>
      </aside>

      {mobile && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-primary/50" onClick={() => setMobile(false)} />
          <aside className="relative h-full w-64 bg-sidebar p-4 text-sidebar-foreground">
            <button className="absolute right-3 top-4" onClick={() => setMobile(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
            {brand(false)}
            {nav(false)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/85 px-4 py-2.5 backdrop-blur md:px-8">
          <button onClick={() => setMobile(true)} aria-label="Open menu" className="md:hidden"><Menu className="h-6 w-6" /></button>
          <span className="font-display text-lg md:hidden">Workplace Assistant</span>
          <span className="hidden font-display text-lg md:inline">{current.label}</span>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            aria-label="Back to home"
          >
            <Home className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back to home</span>
          </Link>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
