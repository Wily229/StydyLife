import type { Exercise } from '../types';
import { gradeChoice, gradeNumeric, gradeShort, type Result } from './grading';
export function gradeExercise(ex: Exercise, answer: string): Result {
  if (ex.type === 'choice') return gradeChoice(answer, String(ex.answer));
  if (ex.type === 'numeric') return gradeNumeric(answer, Number(ex.answer), ex.tolerance ?? 0);
  return gradeShort(answer, ex.accepted ?? [String(ex.answer)]);
}
