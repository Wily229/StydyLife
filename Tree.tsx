import type { SkillProfile } from '../engine/progress';
import { STAGES } from '../engine/progress';
const COLORS: Record<string, string> = { francais: '#e07a5f', maths: '#3d85c6', physique: '#f2b632', chimie: '#9b5de5', svt: '#2e8b57', anglais: '#d6336c', allemand: '#6c757d' };
export function Tree({ stage, prof }: { stage: number; prof: SkillProfile[] }) {
  const trunkH = 20 + stage * 22, top = 250 - trunkH, R = 22 + stage * 15;
  const dots = prof.filter(p => p.status !== 'non_acquis');
  return (<figure className="tree"><svg viewBox="0 0 300 270" role="img" aria-label={`Arbre : ${STAGES[stage]}`}>
    <ellipse cx="150" cy="255" rx="110" ry="12" fill="#c9bd8f" />
    {stage === 0 ? <ellipse cx="150" cy="246" rx="12" ry="8" fill="#8a5a3c" /> : <>
      <rect x="140" y={top} width="20" height={trunkH} rx="4" fill="#8a5a3c" />
      <circle cx="150" cy={top} r={R} fill="#6BBF59" opacity=".9" />
      {dots.map((p, i) => { const ang = i * 2.4, rr = (R - 8) * Math.sqrt(((i * 37) % 100) / 100 + 0.1);
        return <circle key={p.skill} cx={150 + rr * Math.cos(ang)} cy={top + rr * Math.sin(ang)} r={p.status === 'maitrise' ? 8 : 4} fill={COLORS[p.subject]} opacity={p.status === 'maitrise' ? 1 : 0.6} />; })}
      {stage >= 4 && [0, 1, 2, 3].map(i => <circle key={'f' + i} cx={150 + R * 0.7 * Math.cos(i * 1.7)} cy={top - R * 0.5 * Math.sin(i * 1.7)} r="5" fill="#ffb3c7" />)}
      {stage >= 5 && [0, 1, 2].map(i => <circle key={'g' + i} cx={150 + R * 0.5 * Math.cos(i * 2.2 + 1)} cy={top + R * 0.5 * Math.sin(i * 2.2 + 1)} r="6" fill="#f28c28" />)}
    </>}</svg><figcaption><strong>{STAGES[stage]}</strong></figcaption></figure>);
}
