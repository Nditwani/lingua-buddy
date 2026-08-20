import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { studentContext, uid, useStore } from "@/lib/store";
import { summariseLesson, type AiLessonSummary } from "@/lib/ai.functions";
import type { LessonSummary } from "@/lib/types";

export const Route = createFileRoute("/tutor/summariser")({
  head: () => ({
    meta: [
      { title: "AI lesson note summariser — LinguaLoop" },
      { name: "description", content: "Turn an English lesson transcript into structured, editable lesson notes." },
      { property: "og:title", content: "AI lesson note summariser — LinguaLoop" },
      { property: "og:description", content: "Topic, mistakes, vocabulary, homework and next-lesson focus from your transcript." },
    ],
  }),
  component: Summariser,
});

const EXAMPLE = `Tutor: Hi Maya, how has your week been?
Student: Very busy. I am working in this company since three years and now I have a new team.
Tutor: Nice — we say "I have been working at this company for three years."
Student: Ah yes. This week I must present the campaign results to the client.
Tutor: Let's practise that. How would you open the meeting?
Student: Thanks everybody for coming. Today I will explain about the results of our campaign.
Tutor: Almost — "I'll explain the results", no "about". Also try "walk you through the results".
Student: Okay. And if someone interrupts me?
Tutor: You can say "That's a great point — can I come back to it in a moment?"`;

function Summariser() {
  const { state, activeStudent, setActiveStudent, addLesson } = useStore();
  const run = useServerFn(summariseLesson);
  const [transcript, setTranscript] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<AiLessonSummary | null>(null);

  const patch = (p: Partial<AiLessonSummary>) => setDraft((d) => (d ? { ...d, ...p } : d));

  async function generate() {
    if (!activeStudent) {
      toast.error("Add a student first.");
      return;
    }
    if (transcript.trim().length < 20) {
      toast.error("Paste a longer transcript.");
      return;
    }
    if (!consent) {
      toast.error("Please confirm the student consented to lesson analysis.");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { transcript, context: studentContext(state, activeStudent.id) } });
      setDraft(result);
      toast.success("Draft ready — please review and edit before saving.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!draft || !activeStudent) return;
    const lesson: LessonSummary = {
      id: uid(),
      studentId: activeStudent.id,
      date: new Date().toISOString(),
      approved: true,
      transcript,
      ...draft,
    };
    addLesson(lesson);
    setDraft(null);
    setTranscript("");
    toast.success("Saved to the student's profile.");
  }

  const listField = (label: string, key: "homework" | "nextFocus") => (
    <label className="block">
      <span className="text-sm font-medium">{label} (one per line)</span>
      <textarea
        value={draft?.[key].join("\n") ?? ""}
        onChange={(e) => patch({ [key]: e.target.value.split("\n").filter(Boolean) } as Partial<AiLessonSummary>)}
        rows={4}
        className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm"
      />
    </label>
  );

  return (
    <Shell role="tutor">
      <PageTitle title="AI lesson note summariser" subtitle="Paste the transcript, review the draft, then save it to the student's profile." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <label className="text-sm font-medium">Student</label>
          <select
            value={activeStudent?.id ?? ""}
            onChange={(e) => setActiveStudent(e.target.value)}
            className="mt-1 w-full rounded-lg border border-input bg-card p-2.5 text-sm"
          >
            {state.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.level} · {s.industry}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-medium">Lesson transcript or notes</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={14}
            placeholder="Paste the lesson transcript here…"
            className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm"
          />
          <button onClick={() => setTranscript(EXAMPLE)} className="mt-2 text-sm text-muted-foreground underline">
            Use an example transcript
          </button>

          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>The student has consented to this lesson being recorded/transcribed and analysed.</span>
          </label>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 w-full rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Analysing the lesson…" : "Generate lesson summary"}
          </button>
          <ReviewNotice>
            The AI only uses what is in your transcript. It can still misread things — you review and edit everything before it
            reaches the student.
          </ReviewNotice>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Draft summary</h2>
            {draft ? <AiBadge label="AI draft · editable" /> : null}
          </div>

          {!draft ? (
            <p className="mt-4 text-sm text-muted-foreground">Your structured summary will appear here.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Lesson topic</span>
                <input
                  value={draft.topic}
                  onChange={(e) => patch({ topic: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-card p-2.5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">What we talked about</span>
                <textarea
                  value={draft.discussion}
                  onChange={(e) => patch({ discussion: e.target.value })}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm"
                />
              </label>

              <div>
                <span className="text-sm font-medium">Mistakes &amp; corrections</span>
                <div className="mt-2 space-y-3">
                  {draft.mistakes.map((m, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                      {(["said", "corrected", "explanation"] as const).map((field) => (
                        <input
                          key={field}
                          value={m[field]}
                          onChange={(e) =>
                            patch({
                              mistakes: draft.mistakes.map((x, j) => (j === i ? { ...x, [field]: e.target.value } : x)),
                            })
                          }
                          className="w-full rounded-md border border-input bg-card p-2 text-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium">New vocabulary</span>
                <div className="mt-2 space-y-3">
                  {draft.vocabulary.map((v, i) => (
                    <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                      {(["term", "meaning", "example"] as const).map((field) => (
                        <input
                          key={field}
                          value={v[field]}
                          onChange={(e) =>
                            patch({
                              vocabulary: draft.vocabulary.map((x, j) => (j === i ? { ...x, [field]: e.target.value } : x)),
                            })
                          }
                          className="w-full rounded-md border border-input bg-card p-2 text-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {listField("Homework", "homework")}
              {listField("Next lesson focus", "nextFocus")}

              <button onClick={save} className="w-full rounded-full bg-highlight px-4 py-3 font-medium text-highlight-foreground">
                Approve &amp; save to student profile
              </button>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}