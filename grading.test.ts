import { describe, it, expect } from 'vitest';
import { normalize, parseNumber, gradeShort, gradeNumeric, gradeBlanks, gradeChoice } from './grading';
describe('grading', () => {
  it('normalise accents et casse', () => expect(normalize('  Été. ')).toBe('ete'));
  it('parse virgule', () => { expect(parseNumber('12,5')).toBe(12.5); expect(parseNumber('abc')).toBeNull(); });
  it('QCM', () => expect(gradeChoice('b', 'b').verdict).toBe('correct'));
  it('réponse courte exacte', () => expect(gradeShort('éléphant', ['éléphant']).score).toBe(1));
  it('accents manquants = partiel', () => expect(gradeShort('elephant', ['éléphant']).verdict).toBe('partial'));
  it('vide = ambigu', () => expect(gradeShort(' ', ['a']).verdict).toBe('ambiguous'));
  it('numérique', () => { expect(gradeNumeric('0,75', 0.75).verdict).toBe('correct'); expect(gradeNumeric('x', 1).verdict).toBe('ambiguous'); });
  it('trous partiels', () => expect(gradeBlanks(['le', 'x'], [['le'], ['la']]).score).toBe(0.5));
});
