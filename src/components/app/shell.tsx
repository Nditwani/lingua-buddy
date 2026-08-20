import { Link } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tutorNav = [
  { to: "/tutor", label: "Dashboard" },
  { to: "/tutor/summariser", label: "Lesson Notes" },
  { to: "/tutor/research", label: "Research Assistant" },
  { to: "/tutor/onboarding", label: "New Student" },
];

const studentNav = [
  { to: "/student", label: "My Plan" },
  { to: "/student/practice", label: "Practice" },
  { to: "/student/fun-facts", label: "Fun Facts" },
  { to: "/student/listening", label: "Listening" },
];

export function Shell({ role, children }: { role: "tutor" | "student"; children: ReactNode }) {
  const nav = role === "tutor" ? tutorNav : studentNav;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
              <GraduationCap className="size-5" />
            </span>
            LinguaLoop
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/tutor" || item.to === "/student" }}
                className="rounded-full px-3 py-1.5 opacity-80 transition-colors hover:bg-primary-foreground/10 hover:opacity-100 data-[status=active]:bg-accent data-[status=active]:text-accent-foreground data-[status=active]:opacity-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to={role === "tutor" ? "/student" : "/tutor"}
            className="ml-auto rounded-full border border-primary-foreground/30 px-3 py-1.5 text-sm transition-colors hover:bg-primary-foreground/10"
          >
            Switch to {role === "tutor" ? "student" : "tutor"} view
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground">
        AI features support the tutor — they do not replace professional judgement. Always review AI output before sharing it
        with a student.
      </footer>
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
      {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}

export function AiBadge({ className, label = "AI-generated" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-highlight/15 px-2.5 py-1 text-xs font-medium text-foreground",
        className,
      )}
    >
      <Sparkles className="size-3.5" />
      {label}
    </span>
  );
}

export function ReviewNotice({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/60 p-3 text-xs text-muted-foreground">{children}</p>
  );
}