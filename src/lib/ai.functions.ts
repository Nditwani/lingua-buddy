import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAi, callAiJson, studentContextBlock } from "./ai.server";

const ctxSchema = z.object({
  name: z.string(),
  level: z.string(),
  industry: z.string(),
  goals: z.string(),
  recentMistakes: z.array(z.string()).default([]),
  recentVocab: z.array(z.string()).default([]),
  recentTopics: z.array(z.string()).default([]),
});

const str = { type: "string" } as const;
const strArr = { type: "array", items: { type: "string" } } as const;
const obj = (props: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(props),
  properties: props,
});

const TUTOR_SYSTEM =
  "You are an assistant to a professional online English tutor. You support the tutor, you never replace their judgement. " +
  "Adapt all language, examples and difficulty to the student's CEFR level and industry. Never invent facts that were not given to you. " +
  "Never judge an accent as better or worse. Be warm, clear and practical.";

/* ---------------- 1. Lesson note summariser ---------------- */

const summarySchema = {
  name: "lesson_summary",
  schema: obj({
    topic: str,
    discussion: str,
    mistakes: {
      type: "array",
      items: obj({ said: str, corrected: str, explanation: str }),
    },
    vocabulary: {
      type: "array",
      items: obj({ term: str, meaning: str, example: str }),
    },
    homework: strArr,
    nextFocus: strArr,
  }),
};

export type AiLessonSummary = {
  topic: string;
  discussion: string;
  mistakes: { said: string; corrected: string; explanation: string }[];
  vocabulary: { term: string; meaning: string; example: string }[];
  homework: string[];
  nextFocus: string[];
};

export const summariseLesson = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ transcript: z.string().min(20), context: ctxSchema }).parse(d))
  .handler(async ({ data }) =>
    callAiJson<AiLessonSummary>({
      system: TUTOR_SYSTEM,
      effort: "medium",
      schema: summarySchema,
      prompt: [
        studentContextBlock(data.context),
        "",
        "TASK: Summarise the English lesson transcript below for the tutor's records.",
        "RULES:",
        "- Use ONLY information present in the transcript. Do not invent events, mistakes or vocabulary.",
        "- Under 'mistakes', include only meaningful errors that affect accuracy or naturalness (max 6). Skip tiny slips.",
        "- Explanations must be understandable to a " + data.context.level + " learner.",
        "- Vocabulary: only words/phrases actually introduced or clarified in the lesson.",
        "- Homework (3-5 items) must target what the student struggled with in THIS lesson, using their industry where natural.",
        "- Next lesson focus: 2-4 concrete points.",
        "",
        "TRANSCRIPT:",
        data.transcript,
      ].join("\n"),
    }),
  );

/* ---------------- 2. Task planner ---------------- */

const taskSchema = {
  name: "task_plan",
  schema: obj({
    tasks: {
      type: "array",
      items: obj({ title: str, detail: str, category: str, minutes: { type: "integer" } }),
    },
    focusNote: str,
  }),
};

export type AiTaskPlan = {
  tasks: { title: string; detail: string; category: string; minutes: number }[];
  focusNote: string;
};

export const generateTaskPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ scope: z.enum(["daily", "weekly"]), context: ctxSchema, lastLesson: z.string().default("") }).parse(d),
  )
  .handler(async ({ data }) =>
    callAiJson<AiTaskPlan>({
      system: TUTOR_SYSTEM,
      schema: taskSchema,
      prompt: [
        studentContextBlock(data.context),
        data.lastLesson ? `\nMOST RECENT LESSON SUMMARY:\n${data.lastLesson}` : "",
        "",
        data.scope === "daily"
          ? "TASK: Create today's study plan — exactly 4 short, achievable tasks (5-15 minutes each)."
          : "TASK: Create this week's learning plan — 6 to 7 tasks total, one per category: vocabulary, grammar, speaking, listening, reading, homework, revision.",
        "RULES:",
        "- Prioritise the areas where this student is weakest, based on their recent mistakes.",
        "- Use their industry and goals for topics and examples.",
        "- 'category' must be one of: Vocabulary, Grammar, Speaking, Listening, Reading, Homework, Revision.",
        "- 'detail' explains exactly what to do, in language suitable for a " + data.context.level + " learner.",
        "- Do not overwhelm the student. Keep it realistic.",
        "- 'focusNote' is one sentence for the tutor explaining why these tasks were chosen.",
      ].join("\n"),
    }),
  );

/* ---------------- 3. Fun facts ---------------- */

const funFactSchema = {
  name: "fun_fact",
  schema: obj({
    fact: str,
    whyInteresting: str,
    vocabulary: { type: "array", items: obj({ term: str, meaning: str }) },
    question: str,
  }),
};

export type AiFunFact = {
  fact: string;
  whyInteresting: string;
  vocabulary: { term: string; meaning: string }[];
  question: string;
};

export const generateFunFact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ topic: z.string(), level: z.string(), industry: z.string().default("") }).parse(d))
  .handler(async ({ data }) =>
    callAiJson<AiFunFact>({
      system: TUTOR_SYSTEM,
      schema: funFactSchema,
      prompt: [
        `TASK: Give one short, genuinely interesting English fun fact about: ${data.topic}.`,
        `The reader is a ${data.level} English learner${data.industry ? ` working in ${data.industry}` : ""}.`,
        "RULES:",
        "- 2-4 sentences maximum, written at " + data.level + " level.",
        "- Only well-established, widely accepted facts.",
        "- 'vocabulary': 2-3 useful words from the fact with simple meanings.",
        "- 'question': one friendly question inviting the student to reply in English.",
      ].join("\n"),
    }),
  );

/* ---------------- 4. Research assistant ---------------- */

const analysisSchema = {
  name: "sentence_analysis",
  schema: obj({
    sentences: {
      type: "array",
      items: obj({
        original: str,
        isCorrect: { type: "boolean" },
        problem: str,
        corrected: str,
        why: str,
        naturalAlternative: str,
        grammarPoint: str,
      }),
    },
    patterns: { type: "array", items: obj({ pattern: str, evidence: str, teachNext: str }) },
    practiceExercises: strArr,
  }),
};

export type AiAnalysis = {
  sentences: {
    original: string;
    isCorrect: boolean;
    problem: string;
    corrected: string;
    why: string;
    naturalAlternative: string;
    grammarPoint: string;
  }[];
  patterns: { pattern: string; evidence: string; teachNext: string }[];
  practiceExercises: string[];
};

export const analyseSentences = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(2), context: ctxSchema }).parse(d))
  .handler(async ({ data }) =>
    callAiJson<AiAnalysis>({
      system: TUTOR_SYSTEM,
      effort: "medium",
      schema: analysisSchema,
      prompt: [
        studentContextBlock(data.context),
        "",
        "TASK: Analyse each sentence written or spoken by this student (one per line).",
        "For every sentence give: whether it is correct, what is wrong, the corrected sentence, why the correction is needed",
        `(explained in language a ${data.context.level} learner understands), one natural alternative a native speaker might use,`,
        "and the relevant grammar concept.",
        "If a sentence is already correct, set isCorrect true, repeat it as 'corrected' and say so in 'problem'.",
        "Then identify up to 3 recurring mistake patterns across the sentences, with evidence and what to teach next.",
        "Finally create 3 short practice exercises targeting the most common problem.",
        "",
        "SENTENCES:",
        data.text,
      ].join("\n"),
    }),
  );

export const askResearchQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ question: z.string().min(3), context: ctxSchema, material: z.string().default("") }).parse(d))
  .handler(async ({ data }) =>
    callAi({
      system: TUTOR_SYSTEM + " Answer the tutor directly in clear markdown with short headings and bullet points.",
      effort: "medium",
      prompt: [
        studentContextBlock(data.context),
        data.material ? `\nSTUDENT LANGUAGE UNDER REVIEW:\n${data.material}` : "",
        "",
        "TUTOR'S QUESTION:",
        data.question,
        "",
        "Answer practically, so the tutor can use it in the next lesson. Include example sentences at the student's level.",
      ].join("\n"),
    }),
  );

/* ---------------- 5. Welcome message ---------------- */

export const generateWelcomeMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ studentName: z.string(), tutorName: z.string().default("your tutor"), industry: z.string().default("") }).parse(d),
  )
  .handler(async ({ data }) =>
    callAi({
      system: TUTOR_SYSTEM,
      prompt: [
        `TASK: Write a short welcome message from an online English tutor named ${data.tutorName} to a new student named ${data.studentName}.`,
        "RULES:",
        "- Warm, natural and conversational — like a friendly message, NOT a corporate email. One or two light emojis are fine.",
        "- 90-130 words, no subject line, no signature block.",
        "- Introduce the tutor briefly, then ask about: learning goals, current English level, why they are learning English,",
        "  what they want to improve, and any topic or industry they want to focus on.",
        data.industry ? `- The student works in ${data.industry}; mention it naturally.` : "",
        "- End by saying there are no wrong answers and you're looking forward to the first lesson.",
      ].join("\n"),
    }),
  );

/* ---------------- 6. Listening activity ---------------- */

const listeningSchema = {
  name: "listening_activity",
  schema: obj({
    title: str,
    accentNote: str,
    transcript: str,
    comprehension: { type: "array", items: obj({ question: str, answer: str }) },
    vocabulary: { type: "array", items: obj({ term: str, meaning: str }) },
  }),
};

export type AiListening = {
  title: string;
  accentNote: string;
  transcript: string;
  comprehension: { question: string; answer: string }[];
  vocabulary: { term: string; meaning: string }[];
};

export const generateListening = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ accent: z.string(), topic: z.string(), level: z.string(), industry: z.string().default("") }).parse(d),
  )
  .handler(async ({ data }) =>
    callAiJson<AiListening>({
      system: TUTOR_SYSTEM,
      schema: listeningSchema,
      prompt: [
        `TASK: Create a short listening activity script in ${data.accent} for a ${data.level} learner${data.industry ? ` in ${data.industry}` : ""}.`,
        `Topic: ${data.topic}.`,
        "RULES:",
        "- 'transcript': a natural 2-speaker conversation of 120-180 words, labelled 'A:' and 'B:'.",
        `- Use expressions and rhythm typical of ${data.accent}, described respectfully as a variety of English — never as better or worse than others.`,
        "- 'accentNote': 1-2 sentences on what to listen for in this variety (sounds, common expressions).",
        "- 4 comprehension questions with short answers.",
        "- 4 vocabulary items from the conversation with simple meanings.",
      ].join("\n"),
    }),
  );