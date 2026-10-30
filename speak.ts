export const canSpeak = () => typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
/** Lit un texte avec la voix du système. Retourne false si aucune synthèse vocale n'est disponible. */
export function speak(text: string, lang: string, rate = 0.85): boolean {
  if (!canSpeak()) return false;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate; speechSynthesis.speak(u);
  return true;
}
