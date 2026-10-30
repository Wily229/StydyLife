export type Verdict = 'correct' | 'partial' | 'incorrect' | 'ambiguous';
export interface Result { verdict: Verdict; score: number; note?: string }

/** Normalise : minuscules, sans accents, espaces et ponctuation réduits. */
export const normalize = (s: string): string =>
  s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
   .replace(/[’']/g, "'").replace(/[.,;:!?]+$/g, '').replace(/\s+/g, ' ').trim();

/** Nombre décimal : accepte virgule ou point, espaces. Retourne null si invalide. */
export const parseNumber = (s: string): number | null => {
  const t = s.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
};

export function gradeChoice(answer: string, expected: string): Result {
  const ok = answer === expected;
  return { verdict: ok ? 'correct' : 'incorrect', score: ok ? 1 : 0 };
}

/** Réponse courte : variantes acceptées ; l'orthographe exacte compte à moitié si seuls les accents diffèrent. */
export function gradeShort(answer: string, accepted: string[]): Result {
  if (!answer.trim()) return { verdict: 'ambiguous', score: 0, note: 'Réponse vide.' };
  if (accepted.some(a => a.trim() === answer.trim())) return { verdict: 'correct', score: 1 };
  const n = normalize(answer);
  if (accepted.some(a => normalize(a) === n))
    return { verdict: 'partial', score: 0.5, note: 'Attention aux accents ou à la casse.' };
  return { verdict: 'incorrect', score: 0 };
}

export function gradeNumeric(answer: string, expected: number, tol = 0): Result {
  const v = parseNumber(answer);
  if (v === null) return { verdict: 'ambiguous', score: 0, note: 'Écris un nombre (ex : 12 ou 12,5).' };
  return Math.abs(v - expected) <= tol ? { verdict: 'correct', score: 1 } : { verdict: 'incorrect', score: 0 };
}

/** Texte à trous / ordre : score = part de blancs corrects. */
export function gradeBlanks(answers: string[], expected: string[][]): Result {
  const hits = expected.filter((acc, i) => answers[i] !== undefined && acc.some(a => normalize(a) === normalize(answers[i]))).length;
  const score = expected.length ? hits / expected.length : 0;
  return { verdict: score === 1 ? 'correct' : score > 0 ? 'partial' : 'incorrect', score };
}
