import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { studentContext, useStore } from "@/lib/store";
import { analyseSentences, askResearchQuestion, type AiAnalysis } from "@/lib/ai.functions";

export const Route = createFileRoute("/tutor/research")({
  head: () => ({
    meta: [
      { title: "AI research assistant — LinguaLoop" },
      { name: "description", content: "Analyse student sentences, catch missed mistakes and spot recurring grammar patterns." },
      { property: "og:title", content: "AI research assistant — LinguaLoop" },
      { property: "og:description", content: "Corrections, explanations, natural alternatives and practice exercises for your student." },
    ],
  }),
  component: Research,
});

const QUICK_QUESTIONS = [
  "Why is this sentence incorrect?",
  "Give me a simpler explanation I can give my student.",
  "Create three practice exercises based on this mistake.",
  "What should I teach next based on these mistakes?",
  "Give me examples appropriate for this student's level.",
];

function Research() {
  const { state, activeStudent, setActiveStudent } = useStore();
  const analyse = useServerFn(analyseSentences);
  const ask = useServerFn(askResearchQuestion);

  const [text, setText] = useState("I am working in this company since three years.\nShe don't like meetings.\nI look forward to hear from you.");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState<"analyse" | "ask" | null>(null);

  const ctx = () => studentContext(state, activeStudent?.id ?? "");

  async function runAnalysis() {
    setBusy("analyse");
    try {
      setAnalysis(await analyse({ data: { text, context: ctx() } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  async function runQuestion(q: string) {
    if (!q.trim()) {
      toast.error("Type a question first.");
      return;
    }
    setBusy("ask");
    setAnswer("");
    try {
      setAnswer(await ask({ data: { question: q, context: ctx(), material: text } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell role="tutor">
      <PageTitle
        title="AI research assistant"
        subtitle="Paste what your student said or wrote — one sentence per line — and catch what you missed live."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="surface-card space-y-4 p-5">
          <label className="block text-sm font-medium">
            Student context used in the prompt
            <select
              value={activeStudent?.id ?? ""}
              onChange={(e) => setActiveStudent(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-card p-2.5 text-sm font-normal"
            >
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.level} · {s.industry}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Sentences
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="mt-1 w-full rounded-lg border border-input bg-card p-3 text-sm font-normal"
            />
          </label>
          <button
            onClick={runAnalysis}
            disabled={busy !== null}
            className="w-full rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy === "analyse" ? "Analysing…" : "Analyse sentences & find patterns"}
          </button>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium">Ask the assistant</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuestion(q);
                    void runQuestion(q);
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
                >
                  {q}
                </button>
              ))}
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Or write your own question…"
              className="mt-3 w-full rounded-lg border border-input bg-card p-3 text-sm"
            />
            <button
              onClick={() => void runQuestion(question)}
              disabled={busy !== null}
              className="mt-2 w-full rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground disabled:opacity-60"
            >
              {busy === "ask" ? "Thinking…" : "Ask"}
            </button>
          </div>
          <ReviewNotice>
            AI explanations are a starting point, not a verdict. Check them before teaching, and don't assume a pattern proves a
            student's overall ability.
          </ReviewNotice>
        </section>

        <section className="space-y-6">
          {answer ? (
            <div className="surface-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Answer for the tutor</h2>
                <AiBadge />
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{answer}</div>
            </div>
          ) : null}

          {analysis ? (
            <>
              <div className="surface-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Sentence analysis</h2>
                  <AiBadge />
                </div>
                <ul className="mt-4 space-y-4">
                  {analysis.sentences.map((s, i) => (
                    <li key={i} className="rounded-xl border border-border p-4">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {s.isCorrect ? (
                          <CheckCircle2 className="size-4 text-primary" />
                        ) : (
                          <AlertTriangle className="size-4 text-highlight" />
                        )}
                        {s.original}
                      </p>
                      <dl className="mt-3 space-y-2 text-sm">
                        <Row label="What's wrong" value={s.problem} />
                        <Row label="Corrected" value={s.corrected} />
                        <Row label="Why" value={s.why} />
                        <Row label="Natural alternative" value={s.naturalAlternative} />
                        <Row label="Grammar point" value={s.grammarPoint} />
                      </dl>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="surface-card p-5">
                <h2 className="text-lg font-semibold">Recurring patterns</h2>
                <ul className="mt-3 space-y-3 text-sm">
                  {analysis.patterns.map((p, i) => (
                    <li key={i} className="rounded-lg bg-muted p-3">
                      <p className="font-medium">{p.pattern}</p>
                      <p className="mt-1 text-muted-foreground">Evidence: {p.evidence}</p>
                      <p className="mt-1">Teach next: {p.teachNext}</p>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-5 font-semibold">Practice exercises</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                  {analysis.practiceExercises.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className="surface-card p-5 text-sm text-muted-foreground">
              Results appear here: correction, explanation, natural alternative, grammar point — plus the student's three most
              common problems.
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}