import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, ShieldCheck, HardDrive, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Disclaimer } from "@/components/ui-bits";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings · AI Workplace Productivity Assistant" },
    { name: "description", content: "Choose light or dark appearance and review responsible AI and local data storage information." },
    { property: "og:title", content: "Workplace Assistant Settings" },
    { property: "og:description", content: "Appearance preferences, responsible AI guidance and stored-data transparency." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your workspace preferences and privacy.</p>
      </div>

      <section className="border-b pb-8" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="text-xl">Appearance</h2>
        <div className="mt-4 inline-flex max-w-full gap-2 rounded-lg border bg-card p-1.5" role="group" aria-label="Appearance mode">
          <Button variant={theme === "light" ? "default" : "ghost"} onClick={() => setTheme("light")} aria-pressed={theme === "light"}>
            <Sun /> Light mode {theme === "light" && <Check />}
          </Button>
          <Button variant={theme === "dark" ? "default" : "ghost"} onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>
            <Moon /> Dark mode {theme === "dark" && <Check />}
          </Button>
        </div>
      </section>

      <section className="border-b pb-8" aria-labelledby="responsibility-heading">
        <h2 id="responsibility-heading" className="flex items-center gap-2 text-xl"><ShieldCheck className="h-5 w-5" /> Responsible AI at work</h2>
        <div className="mt-4"><Disclaimer /></div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Check facts, sources, calculations and recommendations before sharing or acting on an output.</li>
          <li>Do not enter passwords, personal information, confidential company material or sensitive client data.</li>
          <li>Follow your employer’s AI, privacy and security policies. You remain responsible for the work you submit.</li>
          <li>Use human judgement for decisions affecting people; do not rely on this assistant for legal, financial or safety-critical advice.</li>
        </ul>
      </section>

      <section aria-labelledby="storage-heading">
        <h2 id="storage-heading" className="flex items-center gap-2 text-xl"><HardDrive className="h-5 w-5" /> Data stored on this device</h2>
        <p className="mt-3 text-sm text-muted-foreground">This demo stores the following in this browser’s local storage:</p>
        <dl className="mt-4 divide-y border-y text-sm">
          {[
            ["Tasks", "Task names, deadlines, priorities, estimated hours and completion status."],
            ["Availability", "Your available weekly working hours."],
            ["Assistant conversations", "Your messages and the simulated assistant’s replies."],
            ["Research", "Your saved research text or link and generated summary."],
            ["Appearance", "Your light or dark mode preference."],
          ].map(([label, detail]) => <div key={label} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]"><dt className="font-semibold">{label}</dt><dd className="text-muted-foreground">{detail}</dd></div>)}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">Your work content is not sent to an AI service or stored on an app server. It is not synced or backed up across devices. Anyone using this browser profile may be able to access it; local storage is not a secure vault.</p>
        <p className="mt-3 text-sm text-muted-foreground">Saved data remains until you clear this site’s data in your browser settings. Clearing it removes your saved work and preferences; sample tasks will appear again. Private browsing may discard data when the session closes.</p>
      </section>
    </div>
  );
}