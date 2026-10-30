export type SubjectId = 'francais'|'maths'|'physique'|'chimie'|'svt'|'anglais'|'allemand';
export type QType = 'choice' | 'numeric' | 'short';
export interface Exercise {
  id: string; subject: SubjectId; chapter: string; skill: string; level: number; // 1..8
  type: QType; prompt: string; options?: { id: string; text: string }[];
  answer: string | number; accepted?: string[]; tolerance?: number;
  explanation: string; hint?: string; commonError?: string; audio?: { text: string; lang: string };
}
export interface Skill { id: string; title: string; lesson: string; example: string }
export interface SubjectContent { subject: SubjectId; title: string; skills: Skill[]; exercises: Exercise[] }
export interface Attempt { exerciseId: string; skill: string; subject: SubjectId; score: number; at: number; ms?: number; diag?: boolean }
