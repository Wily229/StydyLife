import type { Attempt, Exercise } from '../types';
export type Status = 'non_acquis' | 'fragile' | 'maitrise';
/** À passer à 3 quand chaque compétence aura plus de 3 exercices. */
export const MIN_DISTINCT = 2;
/** Maîtrise : au moins 4 essais sur 2 exercices distincts (MIN_DISTINCT) et moyenne des 5 derniers ≥ 0,8. Fragile ≥ 0,4. */
export function skillStatus(attempts: Attempt[], skill: string): { status: Status; recent: number } {
  const a = attempts.filter(x => x.skill === skill).sort((x, y) => x.at - y.at);
  if (!a.length) return { status: 'non_acquis', recent: 0 };
  const last = a.slice(-5);
  const recent = last.reduce((s, x) => s + x.score, 0) / last.length;
  const distinct = new Set(a.map(x => x.exerciseId)).size;
  if (a.length >= 4 && distinct >= MIN_DISTINCT && recent >= 0.8) return { status: 'maitrise', recent };
  return { status: recent >= 0.4 && a.length >= 2 ? 'fragile' : 'non_acquis', recent };
}
/** Prochain exercice : jamais tenté d'abord, sinon le moins bien réussi ; difficulté croissante si réussite récente. */
export function nextExercise(exs: Exercise[], attempts: Attempt[], skill: string): Exercise | undefined {
  const pool = exs.filter(e => e.skill === skill);
  const { recent } = skillStatus(attempts, skill);
  const best = (e: Exercise) => Math.max(0, ...attempts.filter(a => a.exerciseId === e.id).map(a => a.score));
  const tried = (e: Exercise) => attempts.some(a => a.exerciseId === e.id);
  const fresh = pool.filter(e => !tried(e)).sort((x, y) => recent >= 0.8 ? y.level - x.level : x.level - y.level);
  if (fresh.length) return fresh[0];
  return [...pool].sort((x, y) => best(x) - best(y))[0];
}
