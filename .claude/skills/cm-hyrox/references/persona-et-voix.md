# Persona, voix et mantra — extraction, modèle de données, chaîne de génération

Comment on obtient une voix d'athlète exploitable, et comment ce qu'on obtient **entre directement
dans l'outil** au lieu de dormir dans un document.

Ce qu'on envoie : le **formulaire**, généré par `../templates/creer-formulaires.gs`.
Le document `../templates/dossier-athlete.md` en est la source et la référence.

## 1. La méthode : on ne demande jamais la chose qu'on veut

Trois questions ne marchent jamais, et ce sont pourtant celles que tout le monde pose :

| Question posée | Ce qu'on obtient | Pourquoi |
|---|---|---|
| « Quel est ton mantra ? » | *« Ne rien lâcher »* | Il répond ce qu'il pense qu'on attend |
| « Quel est ton ton ? » | *« Authentique et motivant »* | Personne ne sait décrire sa propre voix |
| « Quelle est ta cible ? » | *« Tous ceux qui veulent progresser »* | Il ne veut exclure personne |

**On demande la situation, pas la conclusion.** « Au sixième kilomètre, quand ça fait mal, qu'est-ce
que tu te dis dans ta tête ? » produit une phrase réelle, souvent brutale, immédiatement
utilisable — parce que l'athlète revit la scène au lieu de se décrire.

Même principe pour la cible : « décris la dernière personne qui t'a écrit en DM » donne un persona
utilisable en trente secondes, là où « quelle est ta cible » ne donne rien.

**Le mantra se relève, il ne s'invente pas.** Celui de Pierre Huiban — *LFG*, jamais expliqué —
n'aurait été produit par aucune question directe. Il s'est relevé dans son usage.

## 2. Pourquoi le vocal, et où l'imposer

Le découpage du document n'est pas cosmétique :

- **Faits → formulaire.** Dates, charges, `@` de sponsors, créneaux de séance. Ça se saisit et ça
  se relit vite.
- **Voix et persona → note vocale, jamais formulaire.** Un athlète qui écrit se corrige, lisse ses
  tournures et supprime exactement ce qu'on cherche. Un athlète qui parle laisse ses tics, ses
  raccourcis, ses jurons. C'est ça, la matière.

À la transcription, relever et stocker tels quels : **les tics de langage, les mots récurrents, les
formules de transition, la façon de dire un chiffre.** Ce sont eux qui rendent une légende
reconnaissable, pas le sujet.

## 3. Ce que chaque réponse produit

C'est la discipline du document : **aucune question qui ne produise pas de contenu.**

| Réponse | Ce qu'elle alimente |
|---|---|
| Ce qu'il se dit au km 6 | Carte de story récurrente · hook de reel · slide « à retenir » |
| Ce qu'il répète à ses potes | Carte de story récurrente |
| La séance la plus dure | Reel H3 · archétype 2 |
| Ce que 9 sur 10 n'auraient pas fait | Reel H3 · preuve dans le dossier de sponsoring |
| Ce qui l'énerve dans le milieu | **Pilier H4** — la matière la plus rare et la plus portante |
| Ce sur quoi tout le monde se trompe | Pilier H2 · archétype « N erreurs » |
| Le jour où il a failli arrêter | Reel H3 — le contenu de rétention le plus performant de la niche |
| **La phrase qui reste** | **Le mantra** : signature, bio, carte de story, slide de CTA |
| La dernière personne qui lui a écrit | Le persona, en une ligne utilisable |
| Les 3 questions récurrentes | **Trois carrousels immédiats**, archétype 7 |
| Qui lui demande conseil | Le niveau de la cible → calibre le vocabulaire technique |
| Ce qu'il ne veut plus qu'on lui demande | Ce qu'on ne traite pas |

## 4. Le rituel hebdomadaire — cinq lignes qui alimentent tout

Le message du dimanche n'est pas un point d'étape, **c'est l'alimentation du moteur** :

| Ligne | Ce qu'elle alimente |
|---|---|
| 1 — Mes séances de la semaine | Archétype 2 « une semaine de prépa, vraiment » |
| 2 — **Mon chiffre de la semaine** | **Pilier H1, et le hook de tous les reels de la semaine** |
| 3 — Ce qui a été dur | Pilier H3, récit |
| 4 — Une question qu'on m'a posée | Pilier H2, archétype 7 |
| 5 — Ce qui arrive | Compteur J-XX, annonces |

Cinq lignes, trente secondes pour lui, et de quoi produire la semaine entière. **C'est le seul
rendez-vous qui ne se saute pas** — c'est ce qui distingue « écrire avec l'athlète » de « écrire
sur lui ».

## 5. Le modèle de données — brancher le dossier sur l'outil

Le dossier ne doit pas rester un document. Il devient **une source de données** que la chaîne de
génération lit. Structure par athlète :

```
athletes/<slug>/
├── profil.json          le dossier d'onboarding, structuré
├── voix.md              les verbatims du vocal — texte libre, non structurable, et c'est normal
├── courses.json         son calendrier de saison
└── semaines/
    └── 2026-W32.json    les cinq lignes du dimanche
```

### `profil.json`

```json
{
  "slug": "pierre-huiban",
  "nom": "Pierre Huiban",
  "blog_id": 6572293,
  "instagram": "pierrehuiban89",
  "naissance": "1989-**-**",
  "division": "doubles-pro-homme",
  "partenaire": { "nom": "Antoine", "naissance": "****-**-**", "instagram": null },
  "objectif_saison": "Requalification Mondiaux Hong Kong 2027",
  "horaires": { "story": "06:00", "post": "00:30", "carrousel": "18:00" },
  "da": { "bg": "#0A0A0A", "fg": "#FFFFFF", "accent": "#DC2626",
          "font_family": ["Anton"], "mono_family": ["JetBrains Mono"],
          "uppercase_titles": true },
  "mantra": "LFG",
  "tics": ["LFG", "..."],
  "persona": "Pratiquant amateur qui travaille à plein temps et prépare sa 1re ou 2e course",
  "questions_recurrentes": ["...", "...", "..."],
  "positions_ok": ["...", "..."],
  "interdits": ["...", "...", "..."],
  "sponsors": [
    { "marque": "SPLIT NUTRITION", "handle": null, "hashtag": "#partenariat",
      "obligations": "...", "echeance": "...", "dans_assiette": true }
  ],
  "materiel": { "micro_cravate": false, "mode_son": "voix-off", "lieux": ["...", "..."] }
}
```

### `courses.json`

```json
[
  { "nom": "Rome", "debut": "2026-09-24", "fin": "2026-09-27", "objectif": "qualification",
    "campagne_debut": "2026-07-30", "vitrine": false },
  { "nom": "Paris Porte de Versailles", "debut": "2026-12-12", "fin": "2026-12-20",
    "objectif": null, "campagne_debut": "2026-10-17", "vitrine": true }
]
```

### `semaines/<ISO>.json`

```json
{ "semaine": "2026-W32", "seances": "...", "chiffre": "...", "dur": "...",
  "question": "...", "a_venir": "..." }
```

## 6. La chaîne de génération

Ce que ces fichiers permettent, une fois branchés :

| Ce qui est généré | À partir de | Gain |
|---|---|---|
| L'entrée de `themes.json` (DA du client) | `profil.json.da` | Plus de saisie manuelle, plus d'écart entre la fiche et le rendu |
| **Les cartes de stories du mois, compteur J-XX inclus** | `profil.json` + `courses.json` | Le compteur cesse d'être écrit à la main — donc cesse d'être faux |
| **Les specs de carrousel pré-remplis** | `semaines/*.json` + templates d'archétype | Le poste de 20 min/mois tombe à 5-8 |
| Le rappel de dépôt du dimanche | `profil.json` | Plus de relance manuelle |
| Le squelette du reporting | Metricool + `profil.json.sponsors` | Seule l'analyse s'écrit |

### Le linter d'interdits — la brique la plus rentable

Un contrôle automatique qui lit `profil.json` et **refuse un contenu avant publication** s'il :

- contient un mot d'un sujet listé dans `interdits`
- mentionne une marque absente de `sponsors`, ou un `@handle` qui n'y figure pas
- cite un sponsor **sans** la mention de transparence exigée
- contient un `[` — placeholder oublié
- affiche un compteur J-XX incohérent avec `courses.json`
- fait référence à une campagne dont la course est passée

Cette dernière règle est celle qui aurait évité les deux mois de `#roadtostockholm`. Les cinq
premières couvrent l'essentiel de la checklist qualité de `playbook-athlete.md`, aujourd'hui passée
à l'œil.

C'est le même principe que `carrousel.py`, qui échoue plutôt que de livrer une slide illisible :
**le contrôle vaut mieux à la génération qu'à la relecture.**

## 7. Correspondance document → champs

**Le formulaire n'est plus construit à la main : il est généré depuis le schéma**, par
`../templates/creer-formulaires.gs`. Le tableau `SCHEMA` du script porte à la fois le libellé de
chaque question et le champ `profil.json` correspondant — les deux ne peuvent donc pas diverger.

C'est le point qui décide de tout : **les libellés de questions deviennent les en-têtes de colonnes
de la feuille de réponses.** S'ils dérivent, l'import casse. Un athlète de plus = une exécution du
script, pas une recopie.

Deux formulaires, deux destinations :

| Formulaire | Quand | Alimente |
|---|---|---|
| **Dossier Athlète** | une fois, à l'onboarding | `profil.json` |
| **Point hebdo** | chaque dimanche, 30 s | `semaines/<ISO>.json` |

Le second est le vrai gain : le message du dimanche cesse d'être un texte libre à retranscrire et
devient **une ligne de feuille de calcul directement exploitable**.

Table de correspondance ci-dessous — elle reste ici pour référence, mais la source est le script.

| Question du document | Champ | Fichier |
|---|---|---|
| Prénom, nom | `nom` | `profil.json` |
| Instagram | `instagram` | `profil.json` |
| Date de naissance | `naissance` | `profil.json` |
| Division | `division` | `profil.json` |
| Partenaire de doubles | `partenaire.{nom,naissance,instagram}` | `profil.json` |
| Coach, club, salles | `entrainement.{coach,club,salles}` | `profil.json` |
| Jours et créneaux de séance | `entrainement.creneaux` | `profil.json` |
| Trois dernières courses | `historique[]` | `profil.json` |
| Splits, record personnel | `chiffres.{splits,pb}` | `profil.json` |
| Courses inscrites et visées | *une entrée par course* | `courses.json` |
| Objectif de la saison | `objectif_saison` | `profil.json` |
| **Partie 2 — les 8 questions de voix** | verbatims bruts | `voix.md` |
| **Q8, la phrase qui reste** | `mantra` ⚠️ relevé à l'écoute, jamais auto-rempli | `profil.json` |
| *(relevé à l'écoute du vocal)* | `tics[]` ⚠️ idem | `profil.json` |
| Dernière personne qui a écrit en DM | `persona` | `profil.json` |
| Les 3 questions récurrentes | `questions_recurrentes[]` | `profil.json` |
| Qui demande conseil | `niveau_cible` | `profil.json` |
| Deux sujets où il prend position | `positions_ok[]` | `profil.json` |
| Trois sujets interdits | `interdits[]` | `profil.json` |
| Ce qu'on ne montre jamais | `interdits[]` | `profil.json` |
| Partenaires et sponsors | `sponsors[]` | `profil.json` |
| Cadre pro et réglementaire | `contraintes[]` | `profil.json` |
| Micro, mode son, lieux | `materiel.{micro_cravate,mode_son,lieux}` | `profil.json` |
| **Message du dimanche** | `{seances,chiffre,dur,question,a_venir}` | `semaines/<ISO>.json` |

Les champs `mantra` et `tics` sont les deux seuls qui ne se remplissent jamais depuis le
formulaire : ils sortent de l'écoute du vocal, par un humain. C'est le seul endroit du dispositif où
le jugement ne se délègue pas.

Deux champs ne se remplissent jamais depuis le formulaire, et il ne faut pas essayer : **`mantra` et
`tics`.** Ils sortent de l'écoute du vocal, par un humain. C'est le seul endroit du dispositif où le
jugement ne se délègue pas — et c'est précisément ce qui fait que le contenu sonne juste.

## 8. Séquencement

Rappel de la règle : **on automatise après trois athlètes faits à la main.**

À construire dans cet ordre, et pas avant d'avoir trois profils réels sous la main :

1. `profil.json` + génération de l'entrée `themes.json` — le plus simple, immédiatement utile
2. Le linter d'interdits — le meilleur rapport valeur/effort
3. Les cartes de stories avec compteur J-XX
4. Les templates de spec par archétype, extraits de contenus qui ont réellement tourné
5. Le rappel de dépôt et le squelette de reporting
