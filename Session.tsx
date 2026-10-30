import { useState } from 'react';
import { getSubject } from '../content';
import { nextExercise, skillStatus } from '../engine/mastery';
import { attemptXp } from '../engine/progress';
import type { Attempt, SubjectId } from '../types';
import { ExerciseCard } from './ExerciseCard';
export const STATUS = { non_acquis: 'À découvrir', fragile: 'À renforcer', maitrise: 'Maîtrisée' } as const;
export function Session({ subject, skill, attempts, record }: { subject: SubjectId; skill: string; attempts: Attempt[]; record: (a: Attempt) => void }) {
  const c = getSubject(subject)!, sk = c.skills.find(s => s.id === skill)!;
  const [ex, setEx] = useState(() => nextExercise(c.exercises, attempts, skill));
  const st = skillStatus(attempts, skill);
  return (<><h1>{sk.title}</h1>
    <section className="card"><p>{sk.lesson}</p><p><strong>Exemple :</strong> {sk.example}</p></section>
    <p className="muted">Statut : {STATUS[st.status]}</p>
    {ex && <ExerciseCard key={ex.id + attempts.length} ex={ex} nextLabel="Exercice suivant"
      onGraded={(r, ms) => { const a: Attempt = { exerciseId: ex.id, skill, subject, score: r.score, at: Date.now(), ms }; const xp = attemptXp(a, attempts); record(a); return xp; }}
      onNext={() => setEx(nextExercise(c.exercises, attempts, skill))} />}</>);
}
