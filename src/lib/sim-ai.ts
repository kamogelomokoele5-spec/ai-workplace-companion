// Simulated AI: deterministic, rule-based analysis that runs entirely in the browser.
// No real language model is called.
import type { Task } from "./store";

const PW = { high: 3, medium: 2, low: 1 } as const;
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function daysLeft(deadline: string) {
  const ms = new Date(deadline + "T23:59:59").getTime() - Date.now();
  return Math.ceil(ms / 86400000);
}

export function quadrant(t: Task) {
  const urgent = daysLeft(t.deadline) <= 2;
  const important = t.priority !== "low";
  if (urgent && important) return "Do first";
  if (important) return "Schedule";
  if (urgent) return "Quick win";
  return "Later";
}

export function score(t: Task) {
  const d = daysLeft(t.deadline);
  const urgency = d <= 0 ? 6 : d <= 1 ? 5 : d <= 2 ? 4 : d <= 4 ? 2 : 1;
  return PW[t.priority] * 2 + urgency;
}

export interface Block { taskId: string; title: string; hours: number; priority: Task["priority"] }
export interface Schedule { days: { day: string; blocks: Block[]; used: number }[]; overflow: Block[]; notes: string[]; capacity: number }

export function planWeek(tasks: Task[], weeklyHours: number): Schedule {
  const open = tasks.filter((t) => !t.done).sort((a, b) => score(b) - score(a));
  const cap = Math.max(1, Math.round((weeklyHours / 5) * 2) / 2);
  const days = DAYS.map((day) => ({ day, blocks: [] as Block[], used: 0 }));
  const overflow: Block[] = [];
  for (const t of open) {
    let remaining = t.hours;
    const lastIdx = Math.min(4, Math.max(0, daysLeft(t.deadline) - 1));
    for (let i = 0; i < 5 && remaining > 0; i++) {
      const day = days[i]!;
      const free = cap - day.used;
      if (free <= 0) continue;
      const h = Math.min(free, remaining);
      day.blocks.push({ taskId: t.id, title: t.title, hours: h, priority: t.priority });
      day.used += h;
      remaining -= h;
      if (i > lastIdx && remaining === 0) break;
    }
    if (remaining > 0) overflow.push({ taskId: t.id, title: t.title, hours: remaining, priority: t.priority });
  }
  const need = open.reduce((s, t) => s + t.hours, 0);
  const notes: string[] = [];
  notes.push(`${open.length} open tasks need ${need}h against ${weeklyHours}h available (${cap}h/day).`);
  if (need > weeklyHours) notes.push(`You are over capacity by ${need - weeklyHours}h — consider delegating or renegotiating low-priority deadlines.`);
  const urgent = open.filter((t) => quadrant(t) === "Do first");
  if (urgent.length) notes.push(`Front-loaded ${urgent.length} urgent & important task(s): ${urgent.map((t) => t.title).join(", ")}.`);
  const late = open.filter((t) => daysLeft(t.deadline) < 0);
  if (late.length) notes.push(`${late.length} task(s) are past deadline — flag these to stakeholders today.`);
  return { days, overflow, notes, capacity: cap };
}

export function scheduleToText(s: Schedule) {
  return [
    "WEEKLY PLAN (simulated)",
    ...s.notes.map((n) => "• " + n),
    "",
    ...s.days.map((d) => `${d.day} (${d.used}/${s.capacity}h)\n` + (d.blocks.length ? d.blocks.map((b) => `  - ${b.title} — ${b.hours}h [${b.priority}]`).join("\n") : "  - Buffer / deep work")),
    s.overflow.length ? "\nUnscheduled:\n" + s.overflow.map((b) => `  - ${b.title} — ${b.hours}h`).join("\n") : "",
  ].join("\n");
}

/* ---------------- Research ---------------- */
const STOP = new Set("the a an and or but of to in on for with at by from is are was were be been it this that as its their they we you our your has have had not can will would should could into about than then also more most such these those which who what when where how all any each other some".split(" "));

function words(s: string) {
  return s.toLowerCase().match(/[a-z][a-z'-]{2,}/g)?.filter((w) => !STOP.has(w)) ?? [];
}
export function keywords(s: string, n = 6) {
  const f: Record<string, number> = {};
  words(s).forEach((w) => (f[w] = (f[w] || 0) + 1));
  return Object.entries(f).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

export type ResearchMode = "topic" | "article" | "url";
export function detectMode(input: string): ResearchMode {
  const t = input.trim();
  if (/^https?:\/\/\S+$/i.test(t)) return "url";
  if (t.split(/\s+/).length > 40) return "article";
  return "topic";
}

export function research(input: string) {
  const mode = detectMode(input);
  const t = input.trim();
  if (mode === "article") {
    const sentences = t.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) ?? [t];
    const f: Record<string, number> = {};
    words(t).forEach((w) => (f[w] = (f[w] || 0) + 1));
    const ranked = sentences
      .map((s, i) => ({ s: s.trim(), i, sc: words(s).reduce((a, w) => a + (f[w] || 0), 0) / Math.max(4, words(s).length) }))
      .sort((a, b) => b.sc - a.sc);
    const top = ranked.slice(0, 3).sort((a, b) => a.i - b.i).map((x) => x.s);
    const kw = keywords(t);
    const nums = t.match(/\b\d[\d,.]*%?/g)?.slice(0, 3) ?? [];
    return [
      `ANALYSIS: Pasted article · ${sentences.length} sentences · ${t.split(/\s+/).length} words`,
      "",
      "SUMMARY (extracted key sentences)",
      ...top.map((s) => "• " + s),
      "",
      "KEY INSIGHTS",
      `• Dominant themes: ${kw.slice(0, 4).join(", ")}.`,
      nums.length ? `• Figures worth verifying: ${nums.join(", ")}.` : "• No quantitative figures detected — claims may need supporting data.",
      `• The most central sentence focuses on "${kw[0] ?? "the main topic"}".`,
      "",
      "RECOMMENDATIONS",
      `• Validate claims about ${kw[0] ?? "the topic"} against a second independent source.`,
      `• Map how "${kw[1] ?? "secondary themes"}" affects your team's current priorities.`,
      "",
      "ACTION POINTS",
      "1. Share this summary with relevant stakeholders for review.",
      `2. Schedule a 30-minute discussion on ${kw.slice(0, 2).join(" & ") || "the findings"}.`,
      "3. Log follow-up questions the article leaves unanswered.",
    ].join("\n");
  }
  if (mode === "url") {
    let host = t, path: string[] = [];
    try { const u = new URL(t); host = u.hostname.replace(/^www\./, ""); path = u.pathname.split(/[/\-_.]/).filter((p) => p.length > 2 && !/^\d+$/.test(p) && p !== "html"); } catch {}
    return [
      "⚠ URL NOT FETCHED — this frontend-only demo cannot read web pages.",
      `Source: ${host}${path.length ? ` · Inferred topic from URL: "${path.join(" ")}"` : ""}`,
      "",
      "WHAT TO DO",
      "• Open the page, copy the article text, and paste it here for a real extractive summary.",
      "",
      "SUGGESTED REVIEW FRAMEWORK",
      `• Credibility: Who publishes ${host}? Check author and date.`,
      `• Relevance: How does "${path.join(" ") || "this content"}" relate to your current goals?`,
      "• Evidence: Note any statistics and trace them to primary sources.",
    ].join("\n");
  }
  const kw = keywords(t, 4);
  const topic = t.replace(/[?.!]+$/, "");
  return [
    `RESEARCH BRIEF: ${topic}`,
    `(Topic mode — structured framework; no external sources were consulted.)`,
    "",
    "SCOPE",
    `• Core question: What does "${topic}" mean for your team, and what decision does it inform?`,
    `• Key concepts to define: ${kw.join(", ") || topic}.`,
    "",
    "KEY INSIGHTS TO INVESTIGATE",
    `• Current state: How is ${topic} handled in your organisation today?`,
    `• Benchmarks: What do comparable teams achieve with ${kw[0] ?? topic}?`,
    "• Risks & constraints: budget, skills, compliance, change fatigue.",
    "",
    "RECOMMENDATIONS",
    "• Gather 3–5 credible sources (industry reports, peer-reviewed or official data).",
    "• Paste each article here to generate grounded summaries.",
    "",
    "ACTION POINTS",
    `1. Draft a one-paragraph problem statement on ${topic}.`,
    "2. Interview two stakeholders affected by it.",
    "3. Present findings with a clear recommendation by end of week.",
  ].join("\n");
}

/* ---------------- Chat ---------------- */
export type Intent = "email" | "brainstorm" | "meeting" | "problem" | "productivity" | "general";
export function detectIntent(m: string): Intent {
  const s = m.toLowerCase();
  if (/\b(email|e-mail|mail|reply|follow[- ]?up|write to)\b/.test(s)) return "email";
  if (/\b(meeting|minutes|notes|call|standup|summari[sz]e)\b/.test(s)) return "meeting";
  if (/\b(brainstorm|ideas?|names?|suggest)\b/.test(s)) return "brainstorm";
  if (/\b(problem|issue|stuck|fix|blocked|conflict|challenge)\b/.test(s)) return "problem";
  if (/\b(productiv|focus|procrastinat|time|overwhelm|prioriti|habit)\w*/.test(s)) return "productivity";
  return "general";
}

function subject(m: string) {
  const match = m.match(/\b(?:about|regarding|on|for|to)\s+(.{3,80}?)(?:[.?!]|$)/i);
  return (match?.[1] ?? keywords(m, 4).join(" ")).trim() || "this topic";
}

export function chatReply(m: string): string {
  const intent = detectIntent(m);
  const subj = subject(m);
  const kw = keywords(m, 5);
  const head = `*Simulated response · detected intent: **${intent}** · focus: "${subj}"*\n\n`;
  switch (intent) {
    case "email": {
      const tone = /urgent|asap/i.test(m) ? "direct" : /thank|appreciat/i.test(m) ? "warm" : "professional";
      return head + `Here's a ${tone} draft — edit the bracketed parts:\n\n**Subject:** ${subj.charAt(0).toUpperCase() + subj.slice(1)}\n\nHi [Name],\n\nI'm reaching out regarding ${subj}. ${tone === "direct" ? "This is time-sensitive, so I'd appreciate your input by [date]." : "I wanted to share a quick update and align on next steps."}\n\n- **Context:** [one sentence on where things stand]\n- **Ask:** [the specific decision or action you need]\n- **Timeline:** [deadline]\n\n${tone === "warm" ? "Thank you again for your support — it's genuinely appreciated." : "Happy to jump on a quick call if that's easier."}\n\nBest regards,\n[Your name]`;
    }
    case "meeting":
      return head + `Paste your raw notes and I'll structure them. Meanwhile, here's a template for **${subj}**:\n\n### Meeting summary — ${subj}\n**Date:** [date] · **Attendees:** [names]\n\n**Key decisions**\n1. [Decision]\n\n**Discussion points**\n${kw.length ? kw.map((k) => `- ${k}: [notes]`).join("\n") : "- [Topic]: [notes]"}\n\n**Action items**\n| Owner | Task | Due |\n|---|---|---|\n| [Name] | [Task] | [Date] |\n\n**Open questions:** [list]`;
    case "brainstorm":
      return head + `Ideas for **${subj}**, grouped by effort:\n\n**Quick wins (this week)**\n1. Run a 15-minute survey of people closest to ${subj}.\n2. Audit what already exists and remove one friction point.\n\n**Medium bets (this month)**\n3. Pilot a small experiment on ${kw[0] ?? subj} with one team and measure one metric.\n4. Pair ${kw[1] ?? "the idea"} with an existing workflow instead of adding a new one.\n\n**Bold moves**\n5. Reframe ${subj} from the customer's perspective — what would make it 10× easier?\n\n*Next step:* pick two, define success criteria, timebox to one week.`;
    case "problem":
      return head + `Let's work through **${subj}** systematically:\n\n1. **Define it:** What exactly is happening, and since when? Who is affected?\n2. **Root cause (5 Whys):** Ask "why" repeatedly — is it process, people, tools, or information?\n3. **Options:**\n   - *Contain:* a short-term fix to stop the impact today.\n   - *Correct:* address the root cause.\n   - *Prevent:* a check or habit so it doesn't recur.\n4. **Decide:** Score each option on impact vs. effort.\n5. **Communicate:** Tell stakeholders the plan and the next update time.\n\nTell me more about ${kw[0] ?? "the situation"} (constraints, people involved) and I'll tailor this.`;
    case "productivity":
      return head + `Practical advice for **${subj}**:\n\n- **Prioritise with the Eisenhower matrix** — the Task Planner does this automatically.\n- **Time-block** 90-minute deep-work sessions in the morning; batch email/Slack to 2–3 windows.\n- **Define "done"** for each task before starting to avoid scope creep.\n- **Weekly review (20 min, Friday):** clear inbox, update tasks, choose next week's top 3.\n- **Protect energy:** short breaks every 50–90 minutes measurably sustain focus.\n\nWhich of these feels hardest right now? I can make it more specific.`;
    default:
      return head + `I can help with **${subj}**. To give a specific answer, tell me:\n\n1. Your goal (what outcome you want)\n2. Your audience or stakeholders\n3. Any deadline or constraint\n\nOr try: *"Write an email to my manager about a project delay"*, *"Brainstorm ideas for team engagement"*, *"Summarise meeting notes: …"*.`;
  }
}
