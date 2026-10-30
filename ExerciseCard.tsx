import { useRef, useState } from 'react';
import type { Exercise } from '../types';
import { gradeExercise } from '../engine/grade';
import type { Result } from '../engine/grading';
import { speak } from '../audio/speak';
const MSG = { correct: 'Bravo, c\'est correct !', partial: 'Presque !', incorrect: 'Pas tout à fait, mais tu apprends.', ambiguous: 'Je ne peux pas corriger cette réponse.' };
export function ExerciseCard({ ex, nextLabel, onGraded, onNext }: { ex: Exercise; nextLabel: string; onGraded: (r: Result, ms: number) => number; onNext: () => void }) {
  const [ans, setAns] = useState(''); const [hint, setHint] = useState(false); const [res, setRes] = useState<Result | null>(null);
  const [xp, setXp] = useState(0); const [noVoice, setNoVoice] = useState(false); const t0 = useRef(Date.now());
  const listen = (rate: number) => { if (ex.audio && !speak(ex.audio.text, ex.audio.lang, rate)) setNoVoice(true); };
  const submit = () => { const r = gradeExercise(ex, ans); setRes(r); if (r.verdict !== 'ambiguous') setXp(onGraded(r, Date.now() - t0.current)); };
  return (<section className="card"><p><strong>{ex.prompt}</strong></p>
    {ex.audio && <div><button onClick={() => listen(0.85)}>🔊 Écouter</button><button onClick={() => listen(0.55)}>🐢 Plus lentement</button>
      {noVoice && <p role="alert" className="err">Aucune voix n'est disponible sur cet appareil. Passe cet exercice ou installe une voix dans les réglages du système.</p>}</div>}
    {ex.type === 'choice'
      ? <div role="radiogroup" aria-label="Choix">{ex.options!.map(o => <label key={o.id} className="opt"><input type="radio" name="q" disabled={!!res} checked={ans === o.id} onChange={() => setAns(o.id)} /> {o.text}</label>)}</div>
      : <input aria-label="Ta réponse" value={ans} disabled={!!res} autoComplete="off" autoCapitalize="off" inputMode={ex.type === 'numeric' ? 'decimal' : 'text'} onChange={e => setAns(e.target.value)} onKeyDown={e => e.key === 'Enter' && !res && submit()} />}
    {!res && <div><button onClick={submit}>Valider</button>{ex.hint && <button onClick={() => setHint(true)}>Indice</button>}</div>}
    {hint && !res && <p>💡 {ex.hint}</p>}
    {res && <div role="status" className={`fb ${res.verdict}`}>
      <p><strong>{MSG[res.verdict]}</strong> {res.note}{res.verdict !== 'ambiguous' && <span className="xp"> +{xp} XP</span>}</p>
      {res.verdict !== 'ambiguous' && <p>Réponse attendue : {String(ex.answer)}</p>}
      <p>{ex.explanation}</p>
      {ex.commonError && res.verdict !== 'correct' && <p>Erreur fréquente : {ex.commonError}</p>}
      <button onClick={res.verdict === 'ambiguous' ? () => setRes(null) : onNext}>{res.verdict === 'ambiguous' ? 'Corriger ma réponse' : nextLabel}</button></div>}
  </section>);
}
