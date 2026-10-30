import { describe, it, expect } from 'vitest';
import { totalXp, streak, treeStage, profile, dueSkills, badges, stats, subjectLevel, diagLabel } from './progress';
import { CONTENT } from '../content';
import type { Attempt } from '../types';
const DAY = 86400000, NOW = new Date(2026, 9, 30, 12).getTime();
const A = (id: string, score: number, at: number, skill = 's', subject: Attempt['subject'] = 'maths', diag = false): Attempt => ({ exerciseId: id, skill, subject, score, at, diag });
describe('XP', () => {
  it('récompense effort et correction d\'erreur', () => {
    expect(totalXp([A('a', 0, 1)])).toBe(3);
    expect(totalXp([A('a', 0, 1), A('a', 1, 2)])).toBe(3 + 10 + 3 + 5);
  });
});
describe('séries', () => {
  it('compte les jours consécutifs', () => expect(streak([A('a', 1, NOW), A('b', 1, NOW - DAY)], NOW)).toBe(2));
  it('une pause casse la série', () => expect(streak([A('a', 1, NOW), A('b', 1, NOW - 3 * DAY)], NOW)).toBe(1));
});
describe('arbre', () => {
  it('ne grandit pas avec des XP seuls', () => {
    const many = Array.from({ length: 300 }, (_, i) => A('m-fr-1', 1, NOW - i * 1000, 'm-fractions'));
    expect(treeStage(profile(many, CONTENT))).toBeLessThan(2);
  });
  it('atteint le stade final quand tout est maîtrisé', () => {
    const all = CONTENT.flatMap(c => c.skills.flatMap(s => { const ex = c.exercises.filter(e => e.skill === s.id).slice(0, 3);
      return [...ex, ...ex].map((e, i) => A(e.id, 1, NOW - i * 1000, s.id, c.subject)); }));
    expect(treeStage(profile(all, CONTENT))).toBe(5);
    expect(subjectLevel(profile(all, CONTENT).filter(p => p.subject === 'maths'))).toBe(8);
  });
  it('graine au départ', () => expect(treeStage(profile([], CONTENT))).toBe(0));
});
describe('révision espacée', () => {
  it('à revoir après l\'intervalle, pas avant', () => {
    const mk = (age: number) => [A('m-fr-1', 1, NOW - age, 'm-fractions', 'maths')];
    expect(dueSkills(mk(2 * DAY), CONTENT, NOW).map(p => p.skill)).toContain('m-fractions');
    expect(dueSkills(mk(3600000), CONTENT, NOW)).toHaveLength(0);
  });
  it('un échec récent est à revoir tout de suite', () =>
    expect(dueSkills([A('m-fr-1', 0, NOW - 1000, 'm-fractions', 'maths')], CONTENT, NOW)[0].skill).toBe('m-fractions'));
});
describe('badges, stats, diagnostic', () => {
  it('premier pas', () => expect(badges([A('a', 1, NOW)], CONTENT, NOW).find(b => b.id === 'first')!.earned).toBe(true));
  it('stats honnêtes', () => {
    const s = stats([A('m-re-1', 0, NOW), A('m-re-2', 1, NOW)], CONTENT, NOW);
    expect(s.rate).toBe(50); expect(s.errors[0].text).toContain('+8');
  });
  it('diagnostic', () => {
    expect(diagLabel([A('a', 1, 1, 's', 'maths', true), A('b', 1, 2, 's', 'maths', true)], 's')).toBe('Base solide');
    expect(diagLabel([A('a', 0, 1, 's', 'maths', true)], 's')).toBe('À reprendre depuis le début');
  });
});
