import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
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

  function summaryText(s: AiLessonSummary) {
    const lines = [
      `Lesson summary — ${activeStudent?.name ?? "Student"}`,
      new Date().toLocaleDateString(),
      "",
      `Topic: ${s.topic}`,
      "",
      "What we talked about:",
      s.discussion,
      "",
      "Mistakes & corrections:",
      ...s.mistakes.map((m) => `• "${m.said}" → "${m.corrected}" (${m.explanation})`),
      "",
      "New vocabulary:",
      ...s.vocabulary.map((v) => `• ${v.term} — ${v.meaning} (e.g. ${v.example})`),
      "",
      "Homework:",
      ...s.homework.map((h) => `• ${h}`),
      "",
      "Next lesson focus:",
      ...s.nextFocus.map((n) => `• ${n}`),
    ];
    return lines.join("\n");
  }

  function downloadPdf() {
    if (!draft) return;
    const esc = (t: string) =>
      t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const list = (items: string[]) =>
      items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "<p>—</p>";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lesson summary — ${esc(
      draft.topic,
    )}</title><style>
      body{font-family:ui-sans-serif,system-ui,Segoe UI,Helvetica,Arial;margin:40px;color:#1c1c1e;line-height:1.5}
      h1{font-size:22px;margin:0 0 4px} h2{font-size:15px;margin:24px 0 6px;text-transform:uppercase;letter-spacing:.06em}
      .meta{color:#666;font-size:13px} ul{margin:0;padding-left:18px} li{margin-bottom:4px} p{margin:0 0 8px}
    </style></head><body>
      <h1>${esc(draft.topic)}</h1>
      <p class="meta">${esc(activeStudent?.name ?? "Student")} · ${new Date().toLocaleDateString()} · LinguaLoop</p>
      <h2>What we talked about</h2><p>${esc(draft.discussion)}</p>
      <h2>Mistakes &amp; corrections</h2>${list(
        draft.mistakes.map((m) => `"${m.said}" → "${m.corrected}" — ${m.explanation}`),
      )}
      <h2>New vocabulary</h2>${list(
        draft.vocabulary.map((v) => `${v.term} — ${v.meaning} (e.g. ${v.example})`),
      )}
      <h2>Homework</h2>${list(draft.homework)}
      <h2>Next lesson focus</h2>${list(draft.nextFocus)}
    </body></html>`;

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc || !frame.contentWindow) {
      document.body.removeChild(frame);
      toast.error("Could not open the print dialog.");
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    frame.contentWindow.focus();
    setTimeout(() => {
      frame.contentWindow?.print();
      setTimeout(() => document.body.removeChild(frame), 1000);
    }, 200);
    toast.success("Choose “Save as PDF” in the print dialog.");
  }

  async function shareSummary() {
    if (!draft) return;
    const text = summaryText(draft);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Lesson summary — ${draft.topic}`, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Summary copied to your clipboard.");
    } catch {
      toast.error("Could not share the summary.");
    }
  }

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

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  <Download className="size-4" /> Download PDF
                </button>
                <button
                  onClick={() => void shareSummary()}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  <Share2 className="size-4" /> Share summary
                </button>
              </div>

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