import { describe, it, expect } from 'vitest';
import { skillStatus, nextExercise } from './mastery';
import { CONTENT } from '../content';
import { gradeExercise } from './grade';
import type { Attempt } from '../types';
const at = (id: string, score: number, t: number): Attempt => ({ exerciseId: id, skill: 's', subject: 'maths', score, at: t });
describe('maîtrise', () => {
  it('une erreur isolée ne suffit pas', () => expect(skillStatus([at('a', 0, 1)], 's').status).toBe('non_acquis'));
  it('mémoriser un seul exercice ne suffit pas', () =>
    expect(skillStatus([1,2,3,4].map(t => at('a', 1, t)), 's').status).not.toBe('maitrise'));
  it('maîtrise après réussites variées', () =>
    expect(skillStatus([at('a',1,1),at('b',1,2),at('c',1,3),at('a',1,4)], 's').status).toBe('maitrise'));
  it('fragile si résultats mitigés', () =>
    expect(skillStatus([at('a',1,1),at('b',0,2),at('c',0.5,3)], 's').status).toBe('fragile'));
});
describe('contenu', () => {
  const all = CONTENT.flatMap(c => c.exercises);
  it('identifiants uniques', () => expect(new Set(all.map(e => e.id)).size).toBe(all.length));
  it('au moins 10 exercices et 5 compétences par matière', () =>
    CONTENT.forEach(c => { expect(c.exercises.length).toBeGreaterThanOrEqual(10); expect(c.skills.length).toBeGreaterThanOrEqual(5); }));
  it('chaque exercice a une compétence existante, une explication, un niveau 1-8', () =>
    CONTENT.forEach(c => c.exercises.forEach(e => {
      expect(c.skills.some(s => s.id === e.skill)).toBe(true);
      expect(e.explanation.length).toBeGreaterThan(10);
      expect(e.level >= 1 && e.level <= 8).toBe(true);
    })));
  it('la réponse attendue est corrigée comme correcte', () =>
    all.forEach(e => expect(gradeExercise(e, String(e.answer)).verdict).toBe('correct')));
  it('un QCM a sa bonne réponse parmi les options', () =>
    all.filter(e => e.type === 'choice').forEach(e => expect(e.options!.some(o => o.id === e.answer)).toBe(true)));
  it('prochain exercice : un non tenté en premier', () => {
    const m = CONTENT[0].exercises; const first = nextExercise(m, [], 'm-fractions')!;
    expect(first.level).toBe(1);
  });
});
