import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Target } from "lucide-react";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { studentContext, uid, useStore } from "@/lib/store";
import { generateTaskPlan } from "@/lib/ai.functions";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "My learning plan — LinguaLoop" },
      { name: "description", content: "Today's English tasks, your weekly plan, goals and progress in one student view." },
      { property: "og:title", content: "My learning plan — LinguaLoop" },
      { property: "og:description", content: "Personalised daily and weekly English practice built from your real lessons." },
    ],
  }),
  component: StudentHome,
});

function StudentHome() {
  const { state, activeStudent, setActiveStudent, setTasks, toggleTask } = useStore();
  const plan = useServerFn(generateTaskPlan);
  const [busy, setBusy] = useState<"daily" | "weekly" | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const tasks = state.tasks.filter((t) => t.studentId === activeStudent?.id);
  const daily = tasks.filter((t) => t.scope === "daily");
  const weekly = tasks.filter((t) => t.scope === "weekly");
  const lessons = state.lessons.filter((l) => l.studentId === activeStudent?.id);
  const last = lessons[0];
  const done = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  async function generate(scope: "daily" | "weekly") {
    if (!activeStudent) return;
    setBusy(scope);
    try {
      const lastLesson = last
        ? `Topic: ${last.topic}\nSummary: ${last.discussion}\nMistakes: ${last.mistakes.map((m) => `${m.said} -> ${m.corrected}`).join("; ")}\nVocabulary: ${last.vocabulary.map((v) => v.term).join(", ")}\nNext focus: ${last.nextFocus.join(", ")}`
        : "";
      const result = await plan({ data: { scope, context: studentContext(state, activeStudent.id), lastLesson } });
      setTasks(
        activeStudent.id,
        scope,
        result.tasks.map<Task>((t) => ({
          id: uid(),
          studentId: activeStudent.id,
          title: t.title,
          detail: t.detail,
          category: t.category,
          minutes: t.minutes,
          scope,
          done: false,
          createdAt: new Date().toISOString(),
        })),
      );
      setNotes((n) => ({ ...n, [scope]: result.focusNote }));
      toast.success(scope === "daily" ? "Today's tasks are ready." : "Your weekly plan is ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the plan.");
    } finally {
      setBusy(null);
    }
  }

  if (!activeStudent) {
    return (
      <Shell role="student">
        <PageTitle title="No student selected" subtitle="Ask your tutor to add you first." />
      </Shell>
    );
  }

  return (
    <Shell role="student">
      <PageTitle title={`Hi ${activeStudent.name.split(" ")[0]} 👋`} subtitle="Here's what will move your English forward today." />

      {state.students.length > 1 ? (
        <select
          value={activeStudent.id}
          onChange={(e) => setActiveStudent(e.target.value)}
          className="input mb-6 max-w-xs"
        >
          {state.students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="My level" value={activeStudent.level} hint={`${activeStudent.industry} English`} />
        <Card title="Tasks completed" value={`${done}/${tasks.length || 0}`} hint={`${progress}% this cycle`} />
        <Card title="Next lesson" value={activeStudent.nextLesson || "TBC"} hint="with your tutor" icon={CalendarDays} />
        <Card title="Lessons so far" value={String(lessons.length)} hint="summaries saved" />
      </div>

      <div className="mt-6 surface-card p-5">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">My goals</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{activeStudent.goals || "Share your goals with your tutor to personalise your plan."}</p>
        {last ? (
          <p className="mt-3 text-sm">
            <span className="font-medium">Last lesson:</span> {last.topic} — next we focus on {last.nextFocus.join(", ")}.
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TaskPanel
          title="Today's tasks"
          scope="daily"
          tasks={daily}
          note={notes["daily"]}
          busy={busy === "daily"}
          onGenerate={() => void generate("daily")}
          onToggle={toggleTask}
        />
        <TaskPanel
          title="This week's plan"
          scope="weekly"
          tasks={weekly}
          note={notes["weekly"]}
          busy={busy === "weekly"}
          onGenerate={() => void generate("weekly")}
          onToggle={toggleTask}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link to="/student/practice" className="surface-card p-5 hover:bg-muted">
          <p className="font-semibold">Vocabulary &amp; homework →</p>
          <p className="mt-1 text-sm text-muted-foreground">Words from your lessons and what your tutor set.</p>
        </Link>
        <Link to="/student/fun-facts" className="surface-card p-5 hover:bg-muted">
          <p className="font-semibold">English fun facts →</p>
          <p className="mt-1 text-sm text-muted-foreground">Pick a topic and learn something interesting.</p>
        </Link>
        <Link to="/student/listening" className="surface-card p-5 hover:bg-muted">
          <p className="font-semibold">Listening practice →</p>
          <p className="mt-1 text-sm text-muted-foreground">Conversations in six varieties of English.</p>
        </Link>
      </div>
    </Shell>
  );
}

function Card({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3.5" /> : null}
        {hint}
      </p>
    </div>
  );
}

function TaskPanel({
  title,
  scope,
  tasks,
  note,
  busy,
  onGenerate,
  onToggle,
}: {
  title: string;
  scope: "daily" | "weekly";
  tasks: Task[];
  note?: string | undefined;
  busy: boolean;
  onGenerate: () => void;
  onToggle: (id: string) => void;
}) {
  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onGenerate}
          disabled={busy}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Building…" : tasks.length ? "Regenerate" : `Create ${scope} plan`}
        </button>
      </div>

      {tasks.length ? <AiBadge className="mt-3" label="AI-personalised from your lessons" /> : null}

      <ul className="mt-4 space-y-3">
        {tasks.map((t) => (
          <li key={t.id} className="flex gap-3 rounded-xl border border-border p-3">
            <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} className="mt-1 size-4" />
            <div>
              <p className={`font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</p>
              <p className="text-sm text-muted-foreground">{t.detail}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.category} · {t.minutes} min
              </p>
            </div>
          </li>
        ))}
        {!tasks.length ? <li className="text-sm text-muted-foreground">No tasks yet — create your plan above.</li> : null}
      </ul>

      {note ? <ReviewNotice>Why these tasks: {note}</ReviewNotice> : null}
    </section>
  );
}