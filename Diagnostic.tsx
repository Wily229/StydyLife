import { useRef, useState } from 'react';
import { getSubject } from '../content';
import { attemptXp, diagLabel } from '../engine/progress';
import type { Attempt, Exercise, SubjectId } from '../types';
import { ExerciseCard } from './ExerciseCard';
export function Diagnostic({ subject, attempts, record, stop }: { subject: SubjectId; attempts: Attempt[]; record: (a: Attempt) => void; stop: () => void }) {
  const c = getSubject(subject)!;
  const [queue, setQueue] = useState<Exercise[]>(() => c.skills.map(s => [...c.exercises.filter(e => e.skill === s.id)].sort((a, b) => a.level - b.level)[0]).filter(Boolean));
  const [i, setI] = useState(0); const last = useRef(0);
  if (i >= queue.length) return (<><h1>Diagnostic terminé</h1><p>Voici où tu en es. Il n'y a pas de note : cela sert à choisir par où commencer.</p>
    <ul className="skills">{c.skills.map(s => <li key={s.id} className="card">{s.title} : <strong>{diagLabel(attempts, s.id) ?? 'Pas encore évalué'}</strong></li>)}</ul>
    <button className="back" onClick={stop}>Commencer à apprendre</button></>);
  const ex = queue[i];
  const next = () => {
    const more = c.exercises.filter(e => e.skill === ex.skill && e.level > ex.level && !queue.includes(e)).sort((a, b) => b.level - a.level)[0];
    if (last.current >= 0.5 && more) setQueue(q => [...q.slice(0, i + 1), more, ...q.slice(i + 1)]);
    setI(i + 1);
  };
  return (<><h1>Diagnostic : {c.title}</h1><p className="muted">Question {i + 1} sur {queue.length}. Pas de pression : si tu ne sais pas, essaie quand même. <button className="link" onClick={stop}>Arrêter pour l'instant</button></p>
    <ExerciseCard key={ex.id} ex={ex} nextLabel="Suite"
      onGraded={(r, ms) => { last.current = r.score; const a: Attempt = { exerciseId: ex.id, skill: ex.skill, subject, score: r.score, at: Date.now(), ms, diag: true }; const xp = attemptXp(a, attempts); record(a); return xp; }}
      onNext={next} /></>);
}
