import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarDays, MessageCircleHeart, Search, Users } from "lucide-react";
import { Shell, PageTitle, AiBadge } from "@/components/app/shell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/tutor/")({
  head: () => ({
    meta: [
      { title: "Tutor dashboard — LinguaLoop" },
      { name: "description", content: "Students, upcoming lessons, mistakes, vocabulary and homework in one tutor view." },
      { property: "og:title", content: "Tutor dashboard — LinguaLoop" },
      { property: "og:description", content: "Everything you need before and after an English lesson, in one place." },
    ],
  }),
  component: TutorDashboard,
});

function TutorDashboard() {
  const { state, setActiveStudent } = useStore();
  const lessons = state.lessons;
  const mistakes = lessons.flatMap((l) => l.mistakes.map((m) => ({ ...m, lesson: l.topic, studentId: l.studentId })));
  const vocab = lessons.flatMap((l) => l.vocabulary);

  const stats = [
    { label: "Students", value: state.students.length, icon: Users },
    { label: "Lesson summaries", value: lessons.length, icon: BookOpen },
    { label: "Tracked mistakes", value: mistakes.length, icon: Search },
    { label: "Vocabulary items", value: vocab.length, icon: CalendarDays },
  ];

  return (
    <Shell role="tutor">
      <PageTitle title="Tutor dashboard" subtitle="Your students, their lessons and everything they still need to practise." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-4">
            <s.icon className="size-5 text-muted-foreground" />
            <p className="mt-3 text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="surface-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Students</h2>
            <Link to="/tutor/onboarding" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
              Add new student
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {state.students.map((s) => {
              const count = lessons.filter((l) => l.studentId === s.id).length;
              return (
                <li key={s.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">
                      {s.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.level} · {s.industry} · {count} lesson{count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="ml-auto flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveStudent(s.id)}
                        className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        {state.activeStudentId === s.id ? "Active" : "Set active"}
                      </button>
                      <Link
                        to="/tutor/students/$studentId"
                        params={{ studentId: s.id }}
                        className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                      >
                        Open profile
                      </Link>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    <CalendarDays className="mr-1 inline size-4" />
                    Next lesson: {s.nextLesson || "not scheduled"} · Goals: {s.goals || "not shared yet"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="surface-card p-5">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Link to="/tutor/summariser" className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:bg-secondary">
                <BookOpen className="size-4" /> Summarise a lesson transcript
              </Link>
              <Link to="/tutor/research" className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:bg-secondary">
                <Search className="size-4" /> Research a student sentence
              </Link>
              <Link to="/tutor/onboarding" className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:bg-secondary">
                <MessageCircleHeart className="size-4" /> Onboard a new student
              </Link>
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Recent mistakes</h2>
              <AiBadge label="From reviewed lessons" />
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              {mistakes.slice(0, 4).map((m, i) => (
                <li key={i} className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground line-through">{m.said}</p>
                  <p className="font-medium">{m.corrected}</p>
                </li>
              ))}
              {mistakes.length === 0 ? <li className="text-muted-foreground">No mistakes recorded yet.</li> : null}
            </ul>
          </section>
        </div>
      </div>
    </Shell>
  );
}