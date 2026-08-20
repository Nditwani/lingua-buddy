import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Circle, Lightbulb, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { useStore } from "@/lib/store";
import type { VocabItem } from "@/lib/types";

export const Route = createFileRoute("/student/practice")({
  head: () => ({
    meta: [
      { title: "Vocabulary & homework practice — LinguaLoop" },
      { name: "description", content: "Review vocabulary from your lessons and tick off the homework your tutor set." },
      { property: "og:title", content: "Vocabulary & homework practice — LinguaLoop" },
      { property: "og:description", content: "Flashcards, lesson vocabulary and homework in one student practice space." },
    ],
  }),
  component: Practice,
});

function Practice() {
  const { state, activeStudent, toggleTask } = useStore();
  const [tab, setTab] = useState<"vocab" | "homework">("vocab");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [practicing, setPracticing] = useState(false);

  const lessons = useMemo(
    () => state.lessons.filter((l) => l.studentId === activeStudent?.id),
    [state.lessons, activeStudent?.id],
  );

  const vocabulary = useMemo(() => {
    const seen = new Set<string>();
    const items: VocabItem[] = [];
    for (const lesson of lessons) {
      for (const v of lesson.vocabulary) {
        if (!seen.has(v.term.toLowerCase())) {
          seen.add(v.term.toLowerCase());
          items.push(v);
        }
      }
    }
    return items;
  }, [lessons]);

  const homeworkTasks = useMemo(
    () => state.tasks.filter((t) => t.studentId === activeStudent?.id && t.category === "Homework"),
    [state.tasks, activeStudent?.id],
  );

  const tutorHomework = useMemo(
    () => lessons.flatMap((l) => l.homework.map((text) => ({ lessonId: l.id, topic: l.topic, text }))),
    [lessons],
  );

  if (!activeStudent) {
    return (
      <Shell role="student">
        <PageTitle title="No student selected" subtitle="Ask your tutor to add you first." />
      </Shell>
    );
  }

  function nextCard() {
    setFlipped(false);
    setCardIndex((i) => (i + 1) % vocabulary.length);
  }

  function prevCard() {
    setFlipped(false);
    setCardIndex((i) => (i - 1 + vocabulary.length) % vocabulary.length);
  }

  function markKnown(term: string) {
    setKnown((prev) => {
      const next = new Set(prev);
      next.add(term.toLowerCase());
      return next;
    });
  }

  function markLearning(term: string) {
    setKnown((prev) => {
      const next = new Set(prev);
      next.delete(term.toLowerCase());
      return next;
    });
  }

  const currentCard = vocabulary[cardIndex];
  const knownCount = vocabulary.filter((v) => known.has(v.term.toLowerCase())).length;

  return (
    <Shell role="student">
      <PageTitle
        title="Vocabulary & homework practice"
        subtitle="Everything your tutor set, plus the words from your lessons."
      />

      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1">
        <button
          onClick={() => setTab("vocab")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "vocab" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Vocabulary
        </button>
        <button
          onClick={() => setTab("homework")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "homework" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Homework
        </button>
      </div>

      {tab === "vocab" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card title="Words saved" value={String(vocabulary.length)} icon={BookOpen} />
            <Card title="Words you know" value={String(knownCount)} icon={CheckCircle2} />
            <Card
              title="Still learning"
              value={String(vocabulary.length - knownCount)}
              icon={Lightbulb}
            />
          </div>

          {vocabulary.length > 0 && !practicing ? (
            <div className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Flashcard practice</h2>
                  <p className="text-sm text-muted-foreground">Flip cards to check meaning and example.</p>
                </div>
                <button
                  onClick={() => {
                    setCardIndex(0);
                    setFlipped(false);
                    setPracticing(true);
                  }}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  Start practice
                </button>
              </div>
            </div>
          ) : null}

          {practicing && currentCard ? (
            <div className="surface-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Card {cardIndex + 1} of {vocabulary.length}
                </span>
                <button
                  onClick={() => setPracticing(false)}
                  className="text-sm text-muted-foreground underline hover:text-foreground"
                >
                  Exit practice
                </button>
              </div>

              <button
                onClick={() => setFlipped((f) => !f)}
                className="mt-4 w-full rounded-2xl border-2 border-dashed border-border bg-muted/40 p-10 text-center transition-colors hover:bg-muted/60"
              >
                <p className="text-2xl font-semibold">{currentCard.term}</p>
                {flipped ? (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-muted-foreground">{currentCard.meaning}</p>
                    <p className="italic text-foreground">“{currentCard.example}”</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Tap to reveal meaning</p>
                )}
              </button>

              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={prevCard}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
                >
                  <ArrowLeft className="size-4" /> Previous
                </button>
                <button
                  onClick={() => markLearning(currentCard.term)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
                >
                  <RotateCcw className="size-4" /> Still learning
                </button>
                <button
                  onClick={() => markKnown(currentCard.term)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  <CheckCircle2 className="size-4" /> I know this
                </button>
                <button
                  onClick={nextCard}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
                >
                  Next <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

          {vocabulary.length === 0 ? (
            <div className="surface-card p-6 text-center">
              <BookOpen className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No vocabulary yet. Ask your tutor to save a lesson summary with words from your classes.
              </p>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vocabulary.map((v) => {
                const isKnown = known.has(v.term.toLowerCase());
                return (
                  <li key={v.term} className="surface-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{v.term}</p>
                      {isKnown ? (
                        <CheckCircle2 className="size-5 text-primary" aria-label="Known" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" aria-label="Learning" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{v.meaning}</p>
                    <p className="mt-2 text-sm italic">“{v.example}”</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => markKnown(v.term)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          isKnown
                            ? "bg-primary text-primary-foreground"
                            : "border border-border hover:bg-muted"
                        }`}
                      >
                        I know this
                      </button>
                      <button
                        onClick={() => markLearning(v.term)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          !isKnown
                            ? "bg-accent text-accent-foreground"
                            : "border border-border hover:bg-muted"
                        }`}
                      >
                        Still learning
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <ReviewNotice>
            Marking a word as "known" is just for your own tracking — your tutor will still review it with you.
          </ReviewNotice>
        </div>
      ) : (
        <div className="space-y-6">
          {homeworkTasks.length > 0 ? (
            <section className="surface-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-semibold">Tasks from your plan</h2>
                <AiBadge label="AI-personalised" />
              </div>
              <ul className="space-y-3">
                {homeworkTasks.map((t) => (
                  <li key={t.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTask(t.id)}
                      className="mt-1 size-4"
                    />
                    <div>
                      <p className={`font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>
                        {t.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{t.detail}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.minutes} min</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {tutorHomework.length > 0 ? (
            <section className="surface-card p-5">
              <h2 className="text-lg font-semibold">Homework from your tutor</h2>
              <ul className="mt-4 space-y-3">
                {tutorHomework.map((h, i) => (
                  <li key={`${h.lessonId}-${i}`} className="flex gap-3 rounded-xl border border-border p-3">
                    <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{h.text}</p>
                      <p className="text-xs text-muted-foreground">From lesson: {h.topic}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {homeworkTasks.length === 0 && tutorHomework.length === 0 ? (
            <div className="surface-card p-6 text-center">
              <Lightbulb className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No homework set yet. Your tutor can add it when they save a lesson summary.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </Shell>
  );
}

function Card({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="surface-card p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-center gap-2">
        <Icon className="size-5 text-muted-foreground" />
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
