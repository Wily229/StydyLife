import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { saveAttempt, loadAttempts, exportAll, importAll } from './db';
describe('stockage IndexedDB', () => {
  it('sauvegarde puis recharge', async () => {
    expect(await saveAttempt({ exerciseId: 'x', skill: 's', subject: 'maths', score: 1, at: 1 })).toBe(true);
    expect((await loadAttempts()).map(a => a.exerciseId)).toContain('x');
  });
  it('export puis import ignorent les entrées invalides', async () => {
    const json = await exportAll();
    expect(await importAll(json)).toBeGreaterThan(0);
    expect(await importAll(JSON.stringify({ attempts: [{ bad: 1 }, null] }))).toBe(0);
  });
});
