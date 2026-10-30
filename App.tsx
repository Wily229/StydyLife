import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONTENT, SUBJECT_LABELS, getSubject } from './content';
import { loadAttempts, saveAttempt, requestPersistence, exportAll, importAll } from './storage/db';
import { badges, dueSkills, diagLabel, DAILY_GOAL, WEEKLY_GOAL, LEVELS, playerLevel, profile, stats, streak, subjectLevel, todayCount, totalXp, treeStage, weekCount } from './engine/progress';
import type { Attempt, SubjectId } from './types';
import { Hero } from './ui/Hero'; import { Tree } from './ui/Tree'; import { Session, STATUS } from './ui/Session';
import { Diagnostic } from './ui/Diagnostic'; import { Progress } from './ui/Progress';
const ALL: SubjectId[] = ['francais', 'maths', 'physique', 'chimie', 'svt', 'anglais', 'allemand'];
type View = { page: 'home' } | { page: 'subject'; subject: SubjectId } | { page: 'skill'; subject: SubjectId; skill: string } | { page: 'diag'; subject: SubjectId };

export function App() {
  const [online, setOnline] = useState(navigator.onLine);
  const [view, setView] = useState<View>({ page: 'home' });
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    addEventListener('online', on); addEventListener('offline', off);
    loadAttempts().then(a => { setAttempts(a); setLoaded(true); }); requestPersistence();
    return () => { removeEventListener('online', on); removeEventListener('offline', off); };
  }, []);
  const record = useCallback(async (a: Attempt) => { setAttempts(p => [...p, a]); if (!(await saveAttempt(a))) setSaveError(true); }, []);
  const now = Date.now();
  const prof = useMemo(() => profile(attempts, CONTENT), [attempts]);
  const back = () => setView(view.page === 'skill' ? { page: 'subject', subject: view.subject } : view.page === 'diag' ? { page: 'subject', subject: view.subject } : { page: 'home' });
  return (<main className="home">
    <span className="net" aria-live="polite">{online ? 'En ligne' : 'Hors ligne : tout fonctionne'}</span>
    {saveError && <p role="alert" className="err">La sauvegarde a échoué sur cet appareil. Ta progression de cette session peut être perdue.</p>}
    {view.page !== 'home' && <button className="back" onClick={back}>← Retour</button>}
    {!loaded ? <p>Chargement…</p> : <>
      {view.page === 'home' && <Home attempts={attempts} prof={prof} now={now} go={setView} />}
      {view.page === 'subject' && <Subject id={view.subject} attempts={attempts} prof={prof} go={setView} />}
      {view.page === 'skill' && <Session key={view.skill} subject={view.subject} skill={view.skill} attempts={attempts} record={record} />}
      {view.page === 'diag' && <Diagnostic key={view.subject} subject={view.subject} attempts={attempts} record={record} stop={() => setView({ page: 'subject', subject: view.subject })} />}
    </>}</main>);
}

function Home({ attempts, prof, now, go }: { attempts: Attempt[]; prof: ReturnType<typeof profile>; now: number; go: (v: View) => void }) {
  const [msg, setMsg] = useState('');
  const xp = totalXp(attempts), st = treeStage(prof), s = stats(attempts, CONTENT, now);
  const last = [...attempts].sort((a, b) => b.at - a.at)[0];
  const due = dueSkills(attempts, CONTENT, now);
  const today = todayCount(attempts, now), week = weekCount(attempts, now);
  return (<>
    <header className="banner"><Hero /><h1>Coucou Précieux, on bosse sur quoi aujourd'hui ?</h1></header>
    <nav className="subjects" aria-label="Matières">
      {ALL.map(id => <button key={id} onClick={() => go({ page: 'subject', subject: id })}>{SUBJECT_LABELS[id]}<small>Niveau {subjectLevel(prof.filter(p => p.subject === id))}/8</small></button>)}
    </nav>
    {last && <button className="resume" onClick={() => go({ page: 'skill', subject: last.subject, skill: last.skill })}>▶ Reprendre : {prof.find(p => p.skill === last.skill)?.title}</button>}
    <section className="card"><h2>Défis du jour</h2>
      <p>Objectif du jour : <strong>{Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}</strong> exercices {today >= DAILY_GOAL && '✅'}</p>
      <p>Défi de la semaine : <strong>{Math.min(week, WEEKLY_GOAL)}/{WEEKLY_GOAL}</strong> exercices {week >= WEEKLY_GOAL && '✅'} · Série : <strong>{streak(attempts, now)}</strong> jour(s)</p>
      <p>Mission de révision :{due.length === 0 ? ' rien à réviser pour le moment.' : ''}</p>
      {due.map(p => <button key={p.skill} className="chip" onClick={() => go({ page: 'skill', subject: p.subject, skill: p.skill })}>{SUBJECT_LABELS[p.subject]} : {p.title}</button>)}</section>
    <section className="card"><h2>Mon arbre de progression</h2><Tree stage={st} prof={prof} />
      <p className="muted">L'arbre grandit avec les compétences que tu maîtrises vraiment, dans plusieurs matières. Les points (XP) seuls ne le font pas pousser.</p></section>
    <section className="card"><h2>Ma progression</h2><p>XP : <strong>{xp}</strong> · Niveau joueur : <strong>{playerLevel(xp)}</strong></p>
      <Progress s={s} badges={badges(attempts, CONTENT, now)} /></section>
    <details><summary>Sauvegarde</summary>
      <button onClick={async () => { const b = new Blob([await exportAll()], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'precieux-sauvegarde.json'; a.click(); }}>Exporter</button>
      <input type="file" accept="application/json" aria-label="Importer une sauvegarde" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { setMsg(`${await importAll(await f.text())} résultat(s) restauré(s). Recharge la page.`); } catch { setMsg('Fichier invalide.'); } }} />
      <p>{msg}</p></details>
  </>);
}

function Subject({ id, attempts, prof, go }: { id: SubjectId; attempts: Attempt[]; prof: ReturnType<typeof profile>; go: (v: View) => void }) {
  const c = getSubject(id)!; const lv = subjectLevel(prof.filter(p => p.subject === id));
  const diagDone = attempts.some(a => a.diag && a.subject === id);
  return (<><h1>{c.title}</h1><p>Niveau {lv}/8 : {LEVELS[lv - 1]}</p>
    <button className="resume" onClick={() => go({ page: 'diag', subject: id })}>{diagDone ? 'Refaire le diagnostic' : 'Faire le diagnostic (facultatif)'}</button>
    <ul className="skills">{c.skills.map(sk => { const p = prof.find(x => x.skill === sk.id)!; const d = diagLabel(attempts, sk.id);
      return <li key={sk.id}><button onClick={() => go({ page: 'skill', subject: id, skill: sk.id })}>{sk.title}<small> · {STATUS[p.status]}{d ? ` · diagnostic : ${d}` : ''}</small></button></li>; })}</ul></>);
}
