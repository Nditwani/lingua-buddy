import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Headphones, Pause, Play, RotateCcw, Square } from "lucide-react";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { useStore } from "@/lib/store";
import { generateListening, type AiListening } from "@/lib/ai.functions";
import { ACCENTS, CEFR_LEVELS, REAL_LIFE_TOPICS, type CefrLevel } from "@/lib/types";

export const Route = createFileRoute("/student/listening")({
  head: () => ({
    meta: [
      { title: "Listening practice — LinguaLoop" },
      { name: "description", content: "Short English listening activities across South African, British, American, Australian, Irish and Indian English." },
      { property: "og:title", content: "Listening practice — LinguaLoop" },
      { property: "og:description", content: "Conversations, comprehension questions, vocabulary and transcripts at your level." },
    ],
  }),
  component: Listening,
});

function Listening() {
  const { activeStudent } = useStore();
  const run = useServerFn(generateListening);
  const [accent, setAccent] = useState<string>(ACCENTS[0]);
  const [topic, setTopic] = useState<string>(REAL_LIFE_TOPICS[0]);
  const [level, setLevel] = useState<CefrLevel>(activeStudent?.level ?? "B1");
  const [activity, setActivity] = useState<AiListening | null>(null);
  const [busy, setBusy] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [supported, setSupported] = useState(true);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    setRate(level === "A1" || level === "A2" ? 0.8 : 1);
  }, [level]);

  async function generate() {
    setBusy(true);
    setActivity(null);
    setShowTranscript(false);
    setRevealed([]);
    try {
      setActivity(await run({ data: { accent, topic, level, industry: activeStudent?.industry ?? "" } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the activity.");
    } finally {
      setBusy(false);
    }
  }

  function play(restart = false) {
    if (!activity) return;
    if (!supported) {
      toast.error("Your browser can't play audio here — read the transcript instead.");
      setShowTranscript(true);
      return;
    }
    if (!restart && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    window.speechSynthesis.cancel();
    if (restart) setRevealed([]);
    const utterance = new SpeechSynthesisUtterance(activity.transcript.replace(/^[AB]:\s*/gm, ""));
    const lang = ACCENT_LANG[accent] ?? "en-GB";
    utterance.lang = lang;
    const voice =
      voicesRef.current.find((v) => v.lang.replace("_", "-") === lang) ??
      voicesRef.current.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    setPaused(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function pause() {
    if (!supported) return;
    window.speechSynthesis.pause();
    setPaused(true);
  }

  function stop() {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <Shell role="student">
      <PageTitle
        title="Listening practice"
        subtitle="Every variety of English here is equally valid — the goal is to understand them all more easily."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <section className="surface-card space-y-4 p-5">
          <label className="block text-sm font-medium">
            Accent / variety
            <select value={accent} onChange={(e) => setAccent(e.target.value)} className="input mt-1 font-normal">
              {ACCENTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Situation
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input mt-1 font-normal">
              {REAL_LIFE_TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Level
            <select value={level} onChange={(e) => setLevel(e.target.value as CefrLevel)} className="input mt-1 font-normal">
              {CEFR_LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void generate()}
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Preparing…" : "Create listening activity"}
          </button>
          <ReviewNotice>
            Audio uses your device's built-in voice, so it approximates the accent. The transcript shows the real language used.
          </ReviewNotice>
        </section>

        <section className="surface-card p-5">
          {!activity ? (
            <p className="text-sm text-muted-foreground">
              <Headphones className="mr-2 inline size-4" />
              Choose an accent and situation, then create your activity.
            </p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">{activity.title}</h2>
                <AiBadge />
              </div>
              <p className="text-sm text-muted-foreground">{activity.accentNote}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => play()}
                  disabled={speaking && !paused}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
                >
                  <Play className="size-4" />{" "}
                  {speaking && !paused ? "Playing…" : paused ? "Resume" : "Play"}
                </button>
                <button
                  onClick={pause}
                  disabled={!speaking || paused}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm disabled:opacity-50"
                >
                  <Pause className="size-4" /> Pause
                </button>
                <button onClick={() => play(true)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                  <RotateCcw className="size-4" /> Replay
                </button>
                <button onClick={stop} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm">
                  <Square className="size-4" /> Stop
                </button>
                <button
                  onClick={() => setShowTranscript((s) => !s)}
                  className="rounded-full border border-border px-4 py-2 text-sm"
                >
                  {showTranscript ? "Hide" : "Show"} transcript
                </button>
              </div>

              <label className="flex max-w-xs items-center gap-3 text-sm">
                <span className="whitespace-nowrap">Speed {rate.toFixed(2)}×</span>
                <input
                  type="range"
                  min={0.6}
                  max={1.3}
                  step={0.05}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
              </label>

              {!supported ? (
                <p className="text-sm text-muted-foreground">
                  Audio playback isn't supported in this browser — use the transcript below.
                </p>
              ) : null}

              {showTranscript ? (
                <pre className="whitespace-pre-wrap rounded-xl bg-muted p-4 font-sans text-sm leading-relaxed">
                  {activity.transcript}
                </pre>
              ) : null}

              <div>
                <h3 className="font-semibold">Comprehension questions</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {activity.comprehension.map((q, i) => (
                    <li key={i} className="rounded-lg border border-border p-3">
                      <p>{q.question}</p>
                      {revealed.includes(i) ? (
                        <p className="mt-1 text-muted-foreground">{q.answer}</p>
                      ) : (
                        <button onClick={() => setRevealed((r) => [...r, i])} className="mt-1 text-xs underline">
                          Show answer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold">Vocabulary from the audio</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {activity.vocabulary.map((v, i) => (
                    <li key={i}>
                      <span className="font-medium">{v.term}</span> — {v.meaning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}