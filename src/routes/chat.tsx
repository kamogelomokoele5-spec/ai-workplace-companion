import { createFileRoute } from "@tanstack/react-router";
import { ChatPanel } from "@/components/ChatPanel";
import { Disclaimer, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Assistant Chat · AI Productivity Assistant" },
      { name: "description", content: "Draft emails, brainstorm, solve problems and summarise meetings." },
      { property: "og:title", content: "Workplace Assistant Chat" },
      { property: "og:description", content: "Draft emails, brainstorm and get productivity advice." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Workplace Assistant" subtitle="Emails, brainstorming, problem-solving, meeting summaries and productivity advice." />
      <div className="card p-5"><ChatPanel /></div>
      <Disclaimer />
    </div>
  ),
});
