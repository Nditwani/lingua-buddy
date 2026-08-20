import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppState, LessonSummary, Student, Task } from "./types";

const KEY = "lingua-loop-state-v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

const demoStudentId = "demo-maya";

const initialState: AppState = {
  activeStudentId: demoStudentId,
  funFactPrefs: { topic: "Science", level: "B1", frequency: "Daily" },
  students: [
    {
      id: demoStudentId,
      name: "Maya Petrova",
      email: "maya@example.com",
      level: "B1",
      industry: "Marketing",
      goals: "Speak confidently in client meetings and write clearer emails.",
      reason: "Recently promoted to an international team.",
      focusAreas: "Present perfect, prepositions, meeting phrases",
      nextLesson: "Thursday 18:00",
      welcomeMessage: "",
      welcomeSentAt: new Date(Date.now() - 6 * 864e5).toISOString(),
      createdAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    },
  ],
  lessons: [
    {
      id: "demo-lesson",
      studentId: demoStudentId,
      date: new Date(Date.now() - 2 * 864e5).toISOString(),
      topic: "Running a weekly marketing status meeting",
      discussion:
        "We practised opening a meeting, giving a project update and politely interrupting. Maya described her current campaign and answered follow-up questions.",
      mistakes: [
        {
          said: "I am working in this company since three years.",
          corrected: "I have been working at this company for three years.",
          explanation:
            "Use the present perfect continuous for something that started in the past and continues now. Use 'for' with a length of time.",
        },
        {
          said: "I will explain about the results.",
          corrected: "I will explain the results.",
          explanation: "'Explain' is followed directly by the object — no 'about'.",
        },
      ],
      vocabulary: [
        { term: "to touch base", meaning: "to make quick contact with someone", example: "Let's touch base on Friday before the launch." },
        { term: "roll out", meaning: "to launch something gradually", example: "We'll roll out the new campaign next month." },
      ],
      homework: ["Write 5 sentences about your job using the present perfect.", "Record a 2-minute project update."],
      nextFocus: ["Present perfect vs past simple", "Polite interrupting phrases"],
      approved: true,
    },
  ],
  tasks: [],
};

type Ctx = {
  state: AppState;
  activeStudent: Student | undefined;
  setActiveStudent: (id: string) => void;
  addStudent: (s: Student) => void;
  updateStudent: (id: string, patch: Partial<Student>) => void;
  removeStudent: (id: string) => void;
  addLesson: (l: LessonSummary) => void;
  updateLesson: (id: string, patch: Partial<LessonSummary>) => void;
  setTasks: (studentId: string, scope: "daily" | "weekly", tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  setFunFactPrefs: (p: AppState["funFactPrefs"]) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as AppState) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const addStudent = useCallback((s: Student) => {
    setState((p) => ({ ...p, students: [...p.students, s], activeStudentId: s.id }));
  }, []);

  const updateStudent = useCallback((id: string, patch: Partial<Student>) => {
    setState((p) => ({ ...p, students: p.students.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setState((p) => ({
      ...p,
      students: p.students.filter((s) => s.id !== id),
      lessons: p.lessons.filter((l) => l.studentId !== id),
      tasks: p.tasks.filter((t) => t.studentId !== id),
    }));
  }, []);

  const addLesson = useCallback((l: LessonSummary) => {
    setState((p) => ({ ...p, lessons: [l, ...p.lessons] }));
  }, []);

  const updateLesson = useCallback((id: string, patch: Partial<LessonSummary>) => {
    setState((p) => ({ ...p, lessons: p.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }, []);

  const setTasks = useCallback((studentId: string, scope: "daily" | "weekly", tasks: Task[]) => {
    setState((p) => ({
      ...p,
      tasks: [...p.tasks.filter((t) => !(t.studentId === studentId && t.scope === scope)), ...tasks],
    }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setState((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      activeStudent: state.students.find((s) => s.id === state.activeStudentId) ?? state.students[0],
      setActiveStudent: (id) => setState((p) => ({ ...p, activeStudentId: id })),
      addStudent,
      updateStudent,
      removeStudent,
      addLesson,
      updateLesson,
      setTasks,
      toggleTask,
      setFunFactPrefs: (funFactPrefs) => setState((p) => ({ ...p, funFactPrefs })),
    }),
    [state, addStudent, updateStudent, removeStudent, addLesson, updateLesson, setTasks, toggleTask],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function studentContext(state: AppState, studentId: string) {
  const student = state.students.find((s) => s.id === studentId);
  const lessons = state.lessons.filter((l) => l.studentId === studentId).slice(0, 5);
  return {
    name: student?.name ?? "Student",
    level: student?.level ?? "B1",
    industry: student?.industry ?? "General",
    goals: student?.goals ?? "",
    recentMistakes: lessons.flatMap((l) => l.mistakes.map((m) => `${m.said} -> ${m.corrected}`)).slice(0, 10),
    recentVocab: lessons.flatMap((l) => l.vocabulary.map((v) => v.term)).slice(0, 15),
    recentTopics: lessons.map((l) => l.topic),
  };
}