/**
 * Firestore Database Schema and TypeScript Types
 */

export type UserRole = "admin" | "candidate";

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "admin";
}

export interface Candidate {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  title: string;
  content: string; // Markdown content
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationTemplate {
  id: string;
  name: string;
  description: string;
  questionIds: string[]; // Array of question IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationSession {
  id: string;
  candidateId: string;
  templateId: string; // Reference to original template (for history)
  // Deep copy of questions for immutability
  questions: SessionQuestion[];
  status: "active" | "completed" | "expired" | "terminated";
  startedAt: Date;
  expiresAt: Date; // 2 hours from start
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionQuestion {
  id: string;
  title: string;
  content: string; // Markdown
  order: number;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  candidateId: string;
  code: string;
  output: string;
  isConfirmed: boolean; // False = draft, True = submitted
  createdAt: Date;
  updatedAt: Date;
}

// Firestore Collection Paths
export const FIRESTORE_PATHS = {
  CANDIDATES: "candidates",
  QUESTIONS: "questions",
  TEMPLATES: "evaluationTemplates",
  SESSIONS: "evaluationSessions",
  ANSWERS: "answers",
} as const;
