import { openDB, type IDBPDatabase } from 'idb';
import type { Attempt } from '../types';
export const DB_VERSION = 1;
let dbp: Promise<IDBPDatabase> | null = null;
/** Migrations : une étape par version, jamais de suppression de données utilisateur. */
const db = () => (dbp ??= openDB('precieux', DB_VERSION, {
  upgrade(d, oldV) {
    if (oldV < 1) {
      const s = d.createObjectStore('attempts', { keyPath: 'id', autoIncrement: true });
      s.createIndex('skill', 'skill');
      d.createObjectStore('meta');
    }
  }
}));
export async function saveAttempt(a: Attempt): Promise<boolean> {
  try { await (await db()).add('attempts', a); return true; } catch { return false; }
}
export async function loadAttempts(): Promise<Attempt[]> {
  try { return await (await db()).getAll('attempts'); } catch { return []; }
}
/** Demande au navigateur de ne pas effacer les données. */
export const requestPersistence = async () => { try { return await navigator.storage?.persist?.(); } catch { return false; } };
export async function exportAll(): Promise<string> {
  return JSON.stringify({ version: DB_VERSION, attempts: await loadAttempts() });
}
export async function importAll(json: string): Promise<number> {
  const d = JSON.parse(json) as { attempts?: Attempt[] };
  let n = 0;
  for (const a of d.attempts ?? []) if (a && typeof a.exerciseId === 'string' && typeof a.score === 'number' && await saveAttempt({ exerciseId: a.exerciseId, skill: a.skill, subject: a.subject, score: a.score, at: a.at })) n++;
  return n;
}
