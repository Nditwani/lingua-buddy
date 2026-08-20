import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Shell, PageTitle, AiBadge, ReviewNotice } from "@/components/app/shell";
import { uid, useStore } from "@/lib/store";
import { generateWelcomeMessage } from "@/lib/ai.functions";
import { CEFR_LEVELS, INDUSTRIES, type CefrLevel } from "@/lib/types";

export const Route = createFileRoute("/tutor/onboarding")({
  head: () => ({
    meta: [
      { title: "New student onboarding — LinguaLoop" },
      { name: "description", content: "Add a new English student and send an automatic, friendly welcome message." },
      { property: "og:title", content: "New student onboarding — LinguaLoop" },
      { property: "og:description", content: "A warm welcome message that collects goals, level and focus areas automatically." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { addStudent, updateStudent } = useStore();
  const navigate = useNavigate();
  const write = useServerFn(generateWelcomeMessage);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState<CefrLevel>("B1");
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [tutorName, setTutorName] = useState("Judith");
  const [autoSend, setAutoSend] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function preview() {
    if (!name.trim()) {
      toast.error("Add the student's name first.");
      return;
    }
    setBusy(true);
    try {
      setMessage(await write({ data: { studentName: name, tutorName, industry } }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not write the message.");
    } finally {
      setBusy(false);
    }
  }

  async function addAndSend() {
    if (!name.trim()) {
      toast.error("Add the student's name first.");
      return;
    }
    setBusy(true);
    const id = uid();
    try {
      let text = message;
      if (!text && autoSend) text = await write({ data: { studentName: name, tutorName, industry } });
      addStudent({
        id,
        name,
        email,
        level,
        industry,
        goals: "",
        reason: "",
        focusAreas: "",
        nextLesson: "",
        welcomeMessage: text,
        welcomeSentAt: autoSend ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
      });
      toast.success(autoSend ? `Welcome message sent to ${name}.` : `${name} added.`);
      void navigate({ to: "/tutor/students/$studentId", params: { studentId: id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add the student.");
      updateStudent(id, {});
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell role="tutor">
      <PageTitle
        title="Add a new student"
        subtitle="Every new student automatically receives a friendly welcome message that collects their level, goals and focus areas."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card space-y-4 p-5">
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </Field>
          <Field label="Email or messaging handle">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CEFR level (can be updated after their reply)">
              <select value={level} onChange={(e) => setLevel(e.target.value as CefrLevel)} className="input">
                {CEFR_LEVELS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Industry / field">
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="input">
                {INDUSTRIES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Your name (the tutor)">
            <input value={tutorName} onChange={(e) => setTutorName(e.target.value)} className="input" />
          </Field>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={autoSend} onChange={(e) => setAutoSend(e.target.checked)} className="mt-1" />
            <span>Automatically send the welcome message when this student is added.</span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={preview}
              disabled={busy}
              className="rounded-full border border-border px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {busy ? "Writing…" : "Preview message"}
            </button>
            <button
              onClick={addAndSend}
              disabled={busy}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Add student {autoSend ? "& send welcome" : ""}
            </button>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Welcome message</h2>
            {message ? <AiBadge label="AI-written · editable" /> : null}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={14}
            placeholder="Preview the message to see it here — you can edit every word before it is sent."
            className="mt-3 w-full rounded-lg border border-input bg-card p-3 text-sm leading-relaxed"
          />
          <ReviewNotice>
            Student details stay in this workspace and are only used to personalise their learning. Ask for consent before
            recording or analysing lessons.
          </ReviewNotice>
        </section>
      </div>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1 font-normal">{children}</div>
    </label>
  );
}