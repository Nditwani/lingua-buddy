import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CalendarCheck, GraduationCap, Headphones, Lightbulb, Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinguaLoop — AI workspace for online English tutors" },
      {
        name: "description",
        content:
          "Turn lesson transcripts into structured notes, generate personalised daily and weekly practice, and research missed mistakes — one connected tutoring workspace.",
      },
      { property: "og:title", content: "LinguaLoop — AI workspace for online English tutors" },
      {
        property: "og:description",
        content: "AI lesson notes, personalised task plans, fun facts, listening practice and a grammar research assistant.",
      },
    ],
  }),
  component: Index,
});

const features = [
  { icon: BookOpen, title: "AI lesson note summariser", text: "Paste a transcript and get topic, mistakes, vocabulary, homework and next-lesson focus — editable before you save." },
  { icon: CalendarCheck, title: "AI task planner", text: "Daily and weekly plans built from the student's real mistakes, level, goals and industry." },
  { icon: Lightbulb, title: "English fun facts", text: "Level-appropriate facts by topic, so practice feels enjoyable instead of endless studying." },
  { icon: Search, title: "Research assistant", text: "Catch the mistakes you missed live, spot recurring patterns and get simple explanations to teach." },
  { icon: Headphones, title: "Listening across accents", text: "Short conversations in six varieties of English with questions, vocabulary and transcripts." },
  { icon: ShieldCheck, title: "Responsible by design", text: "Everything AI-made is labelled, editable and reviewed by the tutor before the student sees it." },
];

const journey = [
  "New student added",
  "Automated welcome message",
  "Level, goals & interests captured",
  "Lesson taught",
  "AI lesson summary reviewed",
  "Daily & weekly plan generated",
  "Student practises + fun facts",
  "Tutor researches missed mistakes",
  "Next lesson builds on weaknesses",
];

function Index() {
  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          <GraduationCap className="size-4" /> For online English tutors
        </span>
        <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight">
          Teach the lesson. Let <span className="text-accent">LinguaLoop</span> handle the notes, plans and{" "}
          <span className="text-highlight">follow-up</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-primary-foreground/80">
          One connected workspace: lesson summaries, personalised practice, grammar research and automatic onboarding — all
          adapted to each student's CEFR level, industry and goals.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/tutor"
            className="rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Open tutor dashboard
          </Link>
          <Link
            to="/student"
            className="rounded-full bg-highlight px-6 py-3 font-medium text-highlight-foreground transition-transform hover:-translate-y-0.5"
          >
            Open student dashboard
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-5">
              <f.icon className="size-6 text-accent" />
              <h2 className="mt-3 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-primary-foreground/75">{f.text}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">The full journey, in one loop</h2>
          <ol className="mt-5 flex flex-wrap gap-2 text-sm">
            {journey.map((step, i) => (
              <li key={step} className="rounded-full border border-primary-foreground/20 px-4 py-2">
                <span className="mr-2 text-accent">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
