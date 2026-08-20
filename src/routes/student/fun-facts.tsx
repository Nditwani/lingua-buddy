import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { useStore } from "@/lib/store";
import { generateFunFact, type AiFunFact } from "@/lib/ai.functions";
import { CEFR_LEVELS, FUN_FACT_TOPICS, type CefrLevel } from "@/lib/types";

export const Route = createFileRoute("/student/fun-facts")({
  head: () => ({
    meta: [
      { title: "English fun facts — LinguaLoop" },
      { name: "description", content: "Short, level-appropriate English fun facts on the topics you choose." },
      { property: "og:title", content: "English fun facts — LinguaLoop" },
      { property: "og:description", content: "Make English practice enjoyable with a fun fact in your topic and level." },
    ],
  }),
  component: FunFacts,
});

function FunFacts() {
  const { state, activeStudent, setFunFactPrefs } = useStore();
  const run = useServerFn(generateFunFact);
  const prefs = state.funFactPrefs;
  const [fact, setFact] = useState<AiFunFact | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    try {
      setFact(await run({ data: { topic: prefs.topic, level: prefs.level, industry: activeStudent?.industry ?? "" } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not get a fun fact.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell role="student">
      <PageTitle title="English fun facts" subtitle="Choose a topic, your level and how often you'd like one." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <section className="surface-card space-y-4 p-5">
          <label className="block text-sm font-medium">
            Topic
            <select
              value={prefs.topic}
              onChange={(e) => setFunFactPrefs({ ...prefs, topic: e.target.value })}
              className="input mt-1 font-normal"
            >
              {FUN_FACT_TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            My English level
            <select
              value={prefs.level}
              onChange={(e) => setFunFactPrefs({ ...prefs, level: e.target.value as CefrLevel })}
              className="input mt-1 font-normal"
            >
              {CEFR_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            How often
            <select
              value={prefs.frequency}
              onChange={(e) => setFunFactPrefs({ ...prefs, frequency: e.target.value as typeof prefs.frequency })}
              className="input mt-1 font-normal"
            >
              {["Daily", "Every 2 days", "Weekly"].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void generate()}
            disabled={busy}
            className="w-full rounded-full bg-highlight px-4 py-3 font-medium text-highlight-foreground disabled:opacity-60"
          >
            {busy ? "Finding something interesting…" : "Get my fun fact"}
          </button>
          <ReviewNotice>
            Facts are AI-generated at your level. If something looks surprising, check it with your tutor.
          </ReviewNotice>
        </section>

        <section className="surface-card p-6">
          {!fact ? (
            <p className="text-sm text-muted-foreground">Your fun fact will appear here.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                  <Sparkles className="size-4" /> {prefs.topic} · {prefs.level}
                </span>
                <AiBadge />
              </div>
              <p className="text-xl leading-relaxed">{fact.fact}</p>
              <p className="text-sm text-muted-foreground">{fact.whyInteresting}</p>
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Words to keep</h2>
                <ul className="mt-2 space-y-1 text-sm">
                  {fact.vocabulary.map((v, i) => (
                    <li key={i}>
                      <span className="font-medium">{v.term}</span> — {v.meaning}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="rounded-xl bg-muted p-4 text-sm">
                <span className="font-medium">Your turn:</span> {fact.question}
              </p>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}