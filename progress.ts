import type { Attempt, SubjectContent, SubjectId } from '../types';
import { skillStatus, type Status } from './mastery';
const DAY = 86400000;
export const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

/** XP : 10 × score + 3 pour l'effort (toute tentative sérieuse) + 5 quand une erreur passée est corrigée. */
export function attemptXp(a: Attempt, before: Attempt[]): number {
  const prev = before.filter(x => x.exerciseId === a.exerciseId);
  const fixed = prev.length > 0 && Math.max(...prev.map(x => x.score)) < 0.5 && a.score >= 0.5;
  return Math.round(10 * a.score) + 3 + (fixed ? 5 : 0);
}
export function totalXp(attempts: Attempt[]): number {
  const s = [...attempts].sort((x, y) => x.at - y.at);
  return s.reduce((t, a, i) => t + attemptXp(a, s.slice(0, i)), 0);
}
export const playerLevel = (xp: number) => Math.floor(xp / 100) + 1;
export function streak(a: Attempt[], now: number): number {
  const days = new Set(a.map(x => dayKey(x.at))); let n = 0, t = now;
  if (!days.has(dayKey(t))) t -= DAY;
  while (days.has(dayKey(t))) { n++; t -= DAY; }
  return n;
}
export const todayCount = (a: Attempt[], now: number) => a.filter(x => dayKey(x.at) === dayKey(now)).length;
export const weekCount = (a: Attempt[], now: number) => a.filter(x => x.at > now - 7 * DAY).length;
export const DAILY_GOAL = 5, WEEKLY_GOAL = 25;

export interface SkillProfile { subject: SubjectId; skill: string; title: string; status: Status; recent: number }
export const profile = (a: Attempt[], content: SubjectContent[]): SkillProfile[] =>
  content.flatMap(c => c.skills.map(s => ({ subject: c.subject, skill: s.id, title: s.title, ...skillStatus(a, s.id) })));
const pts = (s: Status) => s === 'maitrise' ? 1 : s === 'fragile' ? 0.4 : 0;

export const LEVELS = ['Je découvre', 'Je comprends les bases', 'Je m\'entraîne', 'Je commence à maîtriser', 'Je progresse', 'Je relève des défis', 'Je maîtrise', 'Je résous des problèmes complexes'];
/** Niveau 1-8 d'une matière : part de compétences maîtrisées (1 point) ou fragiles (0,4 point). Niveau 8 = tout maîtrisé. */
export function subjectLevel(p: SkillProfile[]): number {
  if (!p.length) return 1;
  const avg = p.reduce((s, x) => s + pts(x.status), 0) / p.length;
  return 1 + Math.min(7, Math.floor(avg * 7.999));
}

export const STAGES = ['Graine', 'Pousse', 'Jeune arbre', 'Arbre développé', 'Arbre florissant', 'Arbre majestueux'];
/** Stade de l'arbre : uniquement selon les compétences consolidées (jamais selon les XP) et leur diversité entre matières. */
export function treeStage(p: SkillProfile[]): number {
  const P = p.reduce((s, x) => s + pts(x.status), 0);
  const m = p.filter(x => x.status === 'maitrise');
  const subj = new Set(m.map(x => x.subject)).size;
  let s = 0;
  if (P >= 1.5) s = 1;
  if (P >= 5) s = 2;
  if (P >= 10 && subj >= 2) s = 3;
  if (P >= 17 && subj >= 4) s = 4;
  if (P >= 25 && subj >= 6 && m.length >= 20) s = 5;
  return s;
}

/** Révision espacée : intervalles 1, 3, 7, 14, 30 jours selon le nombre de jours de réussite ; échec récent = à revoir tout de suite. */
export function dueSkills(a: Attempt[], content: SubjectContent[], now: number, max = 3): SkillProfile[] {
  const due: { p: SkillProfile; urgent: boolean; last: number }[] = [];
  for (const p of profile(a, content)) {
    const att = a.filter(x => x.skill === p.skill).sort((x, y) => x.at - y.at);
    if (!att.length) continue;
    const last = att[att.length - 1];
    const good = new Set(att.filter(x => x.score >= 0.8).map(x => dayKey(x.at))).size;
    const interval = last.score < 0.8 ? 0 : [1, 3, 7, 14, 30][Math.min(good - 1, 4)] * DAY;
    if (now - last.at >= interval) due.push({ p, urgent: last.score < 0.8, last: last.at });
  }
  return due.sort((x, y) => Number(y.urgent) - Number(x.urgent) || x.last - y.last).slice(0, max).map(x => x.p);
}

export function diagLabel(a: Attempt[], skill: string): string | null {
  const d = a.filter(x => x.diag && x.skill === skill).sort((x, y) => x.at - y.at);
  if (!d.length) return null;
  if (d.length >= 2 && d.every(x => x.score >= 0.99)) return 'Base solide';
  return d[0].score >= 0.5 ? 'À consolider' : 'À reprendre depuis le début';
}

export interface Stats { count: number; minutes: number; rate: number; recentRate: number; bySubject: Partial<Record<SubjectId, number>>;
  masteryPct: number; toReinforce: SkillProfile[]; errors: { text: string; count: number }[]; activeDays7: number }
export function stats(a: Attempt[], content: SubjectContent[], now: number): Stats {
  const avg = (x: Attempt[]) => x.length ? Math.round(100 * x.reduce((s, y) => s + y.score, 0) / x.length) : 0;
  const prof = profile(a, content);
  const bySubject: Partial<Record<SubjectId, number>> = {};
  for (const c of content) { const x = a.filter(y => y.subject === c.subject); if (x.length) bySubject[c.subject] = avg(x); }
  const err = new Map<string, number>();
  const ex = new Map(content.flatMap(c => c.exercises).map(e => [e.id, e]));
  for (const x of a) { const t = x.score < 1 ? ex.get(x.exerciseId)?.commonError : undefined; if (t) err.set(t, (err.get(t) ?? 0) + 1); }
  return { count: a.length, minutes: Math.round(a.reduce((s, x) => s + Math.min(x.ms ?? 0, 300000), 0) / 60000),
    rate: avg(a), recentRate: avg([...a].sort((x, y) => x.at - y.at).slice(-20)), bySubject,
    masteryPct: prof.length ? Math.round(100 * prof.filter(p => p.status === 'maitrise').length / prof.length) : 0,
    toReinforce: prof.filter(p => p.status === 'fragile' || (p.status === 'non_acquis' && p.recent > 0 && p.recent < 0.4)).slice(0, 5),
    errors: [...err].map(([text, count]) => ({ text, count })).sort((x, y) => y.count - x.count).slice(0, 5),
    activeDays7: new Set(a.filter(x => x.at > now - 7 * DAY).map(x => dayKey(x.at))).size };
}

export interface Badge { id: string; title: string; desc: string; earned: boolean }
export function badges(a: Attempt[], content: SubjectContent[], now: number): Badge[] {
  const prof = profile(a, content), st = streak(a, now), n = a.length;
  const ids = new Set(a.map(x => x.exerciseId));
  const fixed = [...ids].some(id => { const t = a.filter(x => x.exerciseId === id).sort((x, y) => x.at - y.at); return t.length > 1 && t[0].score < 0.5 && t[t.length - 1].score >= 0.5; });
  return [
    { id: 'first', title: 'Premier pas', desc: 'Faire un premier exercice', earned: n >= 1 },
    { id: 'ten', title: 'Régulier', desc: 'Faire 10 exercices', earned: n >= 10 },
    { id: 'fifty', title: 'Persévérant', desc: 'Faire 50 exercices', earned: n >= 50 },
    { id: 'fix', title: 'Je corrige mes erreurs', desc: 'Réussir un exercice raté avant', earned: fixed },
    { id: 'streak3', title: '3 jours de suite', desc: 'Travailler 3 jours d\'affilée', earned: st >= 3 },
    { id: 'streak7', title: '7 jours de suite', desc: 'Travailler 7 jours d\'affilée', earned: st >= 7 },
    { id: 'explorer', title: 'Explorateur', desc: 'Essayer les 7 matières', earned: new Set(a.map(x => x.subject)).size >= 7 },
    { id: 'master', title: 'Compétence maîtrisée', desc: 'Maîtriser une compétence', earned: prof.some(p => p.status === 'maitrise') },
    { id: 'tree3', title: 'Un vrai arbre', desc: 'Faire grandir l\'arbre jusqu\'au stade « Arbre développé »', earned: treeStage(prof) >= 3 }
  ];
}
