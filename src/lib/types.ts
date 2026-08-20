export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const INDUSTRIES = [
  "Sales",
  "Marketing",
  "Engineering",
  "Medicine / Healthcare",
  "Finance",
  "Information Technology",
  "Human Resources",
  "Education",
  "Business Administration",
  "Hospitality",
  "Customer Service",
  "Project Management",
] as const;

export const REAL_LIFE_TOPICS = [
  "Travel",
  "Restaurants",
  "Shopping",
  "Social conversations",
  "Workplace conversations",
  "Meetings",
  "Presentations",
  "Job interviews",
  "Networking",
  "Customer service",
  "Giving opinions",
  "Problem-solving",
  "Negotiations",
  "Making phone calls",
  "Emails",
  "Everyday conversations",
] as const;

export const ACCENTS = [
  "South African English",
  "British English",
  "American English",
  "Australian English",
  "Irish English",
  "Indian English",
] as const;

export const FUN_FACT_TOPICS = [
  "History",
  "Culture",
  "Science",
  "Animals",
  "Travel",
  "Food",
  "Technology",
  "Business",
  "Language",
  "Countries",
  "Interesting people",
  "Sports",
  "Random",
] as const;

export type Mistake = { said: string; corrected: string; explanation: string };
export type VocabItem = { term: string; meaning: string; example: string };

export type LessonSummary = {
  id: string;
  studentId: string;
  date: string;
  topic: string;
  discussion: string;
  mistakes: Mistake[];
  vocabulary: VocabItem[];
  homework: string[];
  nextFocus: string[];
  approved: boolean;
  transcript?: string;
};

export type Task = {
  id: string;
  studentId: string;
  title: string;
  detail: string;
  category: string;
  scope: "daily" | "weekly";
  minutes: number;
  done: boolean;
  createdAt: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  level: CefrLevel;
  industry: string;
  goals: string;
  reason: string;
  focusAreas: string;
  nextLesson: string;
  welcomeMessage: string;
  welcomeSentAt: string | null;
  createdAt: string;
};

export type FunFactPrefs = {
  topic: string;
  level: CefrLevel;
  frequency: "Daily" | "Every 2 days" | "Weekly";
};

export type AppState = {
  students: Student[];
  lessons: LessonSummary[];
  tasks: Task[];
  activeStudentId: string;
  funFactPrefs: FunFactPrefs;
};