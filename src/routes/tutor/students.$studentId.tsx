import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageTitle, AiBadge } from "@/components/app/shell";
import { useStore } from "@/lib/store";
import { CEFR_LEVELS, INDUSTRIES, type CefrLevel } from "@/lib/types";

export const Route = createFileRoute("/tutor/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student profile — LinguaLoop" },
      { name: "description", content: "Lesson history, mistakes, vocabulary, homework and progress for one English student." },
      { property: "og:title", content: "Student profile — LinguaLoop" },
      { property: "og:description", content: "Every lesson summary, mistake and vocabulary item in one student record." },
    ],
  }),
  component: StudentProfile,
});

function StudentProfile() {
  const { studentId } = Route.useParams();
  const { state, updateStudent, updateLesson } = useStore();
  const student = state.students.find((s) => s.id === studentId);
  const lessons = state.lessons.filter((l) => l.studentId === studentId);

  if (!student) {
    return (
      <Shell role="tutor">
        <PageTitle title="Student not found" />
        <Link to="/tutor" className="text-sm underline">
          Back to dashboard
        </Link>
      </Shell>
    );
  }

  const mistakes = lessons.flatMap((l) => l.mistakes);
  const vocab = lessons.flatMap((l) => l.vocabulary);
  const homework = lessons.flatMap((l) => l.homework);

  return (
    <Shell role="tutor">
      <PageTitle title={student.name} subtitle={`${student.level} · ${student.industry}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <section className="surface-card space-y-3 p-5">
          <h2 className="text-lg font-semibold">Profile</h2>
          <label className="block text-sm font-medium">
            CEFR level
            <select
              value={student.level}
              onChange={(e) => updateStudent(student.id, { level: e.target.value as CefrLevel })}
              className="input mt-1 font-normal"
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Industry
            <select
              value={student.industry}
              onChange={(e) => updateStudent(student.id, { industry: e.target.value })}
              className="input mt-1 font-normal"
            >
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          {(
            [
              ["goals", "Learning goals"],
              ["reason", "Why they are learning English"],
              ["focusAreas", "Wants to improve"],
              ["nextLesson", "Next lesson"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              <textarea
                value={student[key]}
                rows={key === "nextLesson" ? 1 : 2}
                onChange={(e) => updateStudent(student.id, { [key]: e.target.value })}
                className="input mt-1 font-normal"
              />
            </label>
          ))}

          {student.welcomeMessage ? (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium">Welcome message</p>
                <AiBadge label={student.welcomeSentAt ? "Sent" : "Draft"} />
              </div>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{student.welcomeMessage}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-sm">
            <Stat label="Lessons" value={lessons.length} />
            <Stat label="Mistakes" value={mistakes.length} />
            <Stat label="Words" value={vocab.length} />
          </div>
        </section>

        <section className="space-y-6">
          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold">Lesson history</h2>
            {lessons.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No lessons yet.{" "}
                <Link to="/tutor/summariser" className="underline">
                  Summarise a transcript
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {lessons.map((l) => (
                  <li key={l.id} className="rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{l.topic}</p>
                      <span className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString()}</span>
                      <button
                        onClick={() => updateLesson(l.id, { approved: !l.approved })}
                        className={`ml-auto rounded-full px-3 py-1 text-xs ${l.approved ? "bg-secondary text-secondary-foreground" : "bg-highlight text-highlight-foreground"}`}
                      >
                        {l.approved ? "Tutor approved" : "Needs review"}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{l.discussion}</p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <Block title="Mistakes & corrections">
                        {l.mistakes.map((m, i) => (
                          <li key={i}>
                            <span className="line-through">{m.said}</span> → <span className="font-medium">{m.corrected}</span>
                            <span className="block text-muted-foreground">{m.explanation}</span>
                          </li>
                        ))}
                      </Block>
                      <Block title="Vocabulary">
                        {l.vocabulary.map((v, i) => (
                          <li key={i}>
                            <span className="font-medium">{v.term}</span> — {v.meaning}
                            <span className="block text-muted-foreground italic">“{v.example}”</span>
                          </li>
                        ))}
                      </Block>
                      <Block title="Homework">
                        {l.homework.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </Block>
                      <Block title="Next lesson focus">
                        {l.nextFocus.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </Block>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface-card p-5">
            <h2 className="text-lg font-semibold">Outstanding homework</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {homework.length ? homework.map((h, i) => <li key={i}>{h}</li>) : <li className="list-none text-muted-foreground">Nothing assigned yet.</li>}
            </ul>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-2 text-sm">{children}</ul>
    </div>
  );
}