# Précieux

PWA éducative hors ligne pour un élève de 4ᵉ (7 matières). **État : lot 3** (socle, correction, stockage IndexedDB, parcours d'exercices, contenu des 7 matières).

## Commandes
- `npm install` · `npm run dev` · `npm test` · `npm run build` · `npm run preview`

## Polices
- Luckiest Guy : licence Apache 2.0 (`public/fonts/LuckiestGuy-LICENSE.txt`), redistribuable.
- Chillink : **gratuite pour usage personnel uniquement** (usage commercial sous licence de l'auteur). Le fichier est exclu du dépôt par `.gitignore` : copiez `Chillink.woff2` dans `public/fonts/` en local. Repli : Impact / system-ui.

## Fait (lot 4, complet)
- Accueil illustré (SVG intégré), 7 matières, reprise de la dernière activité, défis du jour/semaine, série, mission de révision espacée (1, 3, 7, 14, 30 jours ; échec récent = à revoir tout de suite).
- Diagnostic facultatif par matière (1 question par compétence, puis une plus difficile si réussie) ; il oriente le premier exercice proposé.
- Niveaux 1-8 par matière (part de compétences maîtrisées ; 8 = tout maîtrisé), maîtrise = au moins 4 essais sur 2 exercices distincts avec 80 % de réussite récente (`MIN_DISTINCT` à passer à 3 quand il y aura plus d'exercices).
- XP (effort + réussite + correction d'erreur), 9 badges, statistiques (temps, taux global/récent/par matière, maîtrise durable, erreurs fréquentes, jours actifs).
- Arbre en 6 stades : dépend seulement des compétences consolidées et de leur diversité entre matières (règles dans `src/engine/progress.ts`).
- Audio : dictées (mots et phrases) en français, anglais, allemand via la synthèse vocale du navigateur.
- Contenu : 7 matières, 79 exercices, dont une compétence de remédiation (tables et divisions) en maths ; correction expliquée.
- Stockage IndexedDB (migrations versionnées), export/import JSON, icônes PNG pour l'installation.
- 31 tests unitaires et d'intégration (correction, maîtrise, progression, arbre, révision, contenu, IndexedDB simulé).

## Limites connues
- **Hors ligne non testé dans un vrai navigateur** (aucun navigateur dans l'environnement de développement). Vérifié seulement : le build précache tous les fichiers (page, scripts, contenu, polices, icônes). À tester : ouvrir une fois en ligne, couper le réseau, recharger.
- **Audio** : synthèse vocale du système uniquement ; hors ligne, cela dépend des voix installées (surtout allemand). Aucun enregistrement audio fourni, pas de reconnaissance vocale ni d'exercice de répétition.
- Contenu à relire par un enseignant ; programme francophone usuel, non confirmé comme béninois. Remédiation 6ᵉ-5ᵉ limitée aux maths.
- Peu de formats d'exercice (QCM, nombre, réponse courte, dictée) ; pas encore d'associations, de classements ni de textes à compléter longs. La correction des réponses ouvertes reste stricte (variantes à lister dans `accepted`).
- Pas de test automatisé de l'interface ni de bout en bout ; pas de mode parent ; les niveaux 4 à 8 dépassent ce que le contenu actuel permet de travailler en profondeur (peu d'exercices par compétence).
- Pas d'unités de temps réelles de session sauvegardées au-delà de la durée par exercice (plafonnée à 5 min).
