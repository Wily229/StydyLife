import { SUBJECT_LABELS } from '../content';
import type { Stats } from '../engine/progress';
import type { Badge } from '../engine/progress';
export function Progress({ s, badges }: { s: Stats; badges: Badge[] }) {
  return (<div>
    <ul className="stats">
      <li><strong>{s.count}</strong> exercices</li><li><strong>{s.minutes}</strong> min d'apprentissage</li>
      <li><strong>{s.rate} %</strong> de réussite globale</li><li><strong>{s.recentRate} %</strong> sur les 20 derniers</li>
      <li><strong>{s.masteryPct} %</strong> de compétences maîtrisées (durable)</li><li><strong>{s.activeDays7}</strong> jour(s) actifs sur 7</li></ul>
    <p className="muted">Le taux de réussite montre tes résultats récents ; la maîtrise ne compte que les compétences réussies sur plusieurs exercices.</p>
    {Object.keys(s.bySubject).length > 0 && <p>Par matière : {Object.entries(s.bySubject).map(([k, v]) => `${SUBJECT_LABELS[k as keyof typeof SUBJECT_LABELS]} ${v} %`).join(' · ')}</p>}
    {s.toReinforce.length > 0 && <p><strong>À renforcer :</strong> {s.toReinforce.map(p => p.title).join(', ')}</p>}
    {s.errors.length > 0 && <><strong>Erreurs fréquentes :</strong><ul>{s.errors.map(e => <li key={e.text}>{e.text} ({e.count})</li>)}</ul></>}
    <strong>Badges</strong><ul className="badges">{badges.map(b => <li key={b.id} className={b.earned ? 'on' : ''} title={b.desc}>{b.earned ? '🏅' : '🔒'} {b.title}<small> : {b.desc}</small></li>)}</ul></div>);
}
