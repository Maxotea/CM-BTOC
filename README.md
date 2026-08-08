# CM-BTOC — moteur athlète

Dépôt B2C d'OTEA Production. Il héberge le moteur de community management destiné aux
**athlètes HYROX et hybrides**.

## Architecture

| Dépôt | Périmètre | Skill |
|---|---|---|
| `CM-OTEA` | B2B — commerces | `cm-metricool` |
| **`CM-BTOC`** | **B2C — personal branding et athlètes** | **`cm-hyrox`** (ce dossier), et `cm-b2c` à migrer depuis le compte |

**Règle : les moteurs vivent dans les dépôts, jamais sur le compte.**

Trois moteurs, trois clientèles, trois grilles de prix qui ne se croisent jamais :

| Moteur | Client type | Grille |
|---|---|---|
| `cm-metricool` | Commerces premium (Le Loft, Gossip, J Lawson Golf, La Galerie Immobilière, Otea) | 590 / 890 / 1 490 € |
| `cm-b2c` | Coachs, consultants, libéraux, créateurs — des personnes **qui ont un chiffre d'affaires** | 290 / 590 / 990 € |
| **`cm-hyrox`** | **Athlètes de course** | **49 / 89 / 179 €** |

Un athlète ne voit jamais la grille B2C générique, une entreprise ne voit jamais la grille athlète.
C'est le point où les activités risquent le plus de se contaminer, et la séparation en trois skills
est ce qui l'empêche structurellement.

## Ce que le moteur athlète fait différemment

1. **Le goulot n'est pas « le client ne tourne pas ».** Un athlète s'entraîne 5 à 6 fois par semaine,
   téléphone sur le banc. Il tourne déjà — il tourne *inutilisable*. Le moteur impose un **triptyque
   fixe de 3 plans** (large, serré sur l'effort, plan de fin) calé sur des séances déjà programmées,
   plus un template de montage figé par client. C'est là que se gagne la marge : au tournage, pas au
   montage.
2. **Le calendrier est nominatif, pas saisonnier.** Ce sont ses courses qui structurent l'année.
   Chaque dossard déclenche une campagne J-56 → J+7 qui produit 12 à 14 contenus. La fenêtre de
   vente est J+2 → J+9.
3. **La preuve est double.** Un athlète vend du coaching *et* vend de la visibilité à des marques.
   Le reporting a deux tunnels, et il fabrique au passage le dossier de sponsoring de la saison
   suivante.
4. **L'économie est une économie de volume, plus une ligne variable.** À 49-179 €, la cible est
   33 athlètes, pas 9 clients — d'où un palier d'entrée à zéro montage, zéro retour, zéro contact.
   Et à l'abonnement s'ajoute **un pourcentage sur les sponsors apportés et une part de la
   dotation** : l'abonnement paie la production, le variable paie la marge.

## Structure

```
CM-BTOC/
├── dossier-pro.html                     questionnaire d'onboarding B2C généraliste (voir Documents)
└── .claude/skills/cm-hyrox/
    ├── SKILL.md                         moteur, étapes 0 → 9
    ├── references/
    │   ├── dispositif.md                ce qu'on livre, ce qui est automatisé, le budget temps
    │   ├── persona-et-voix.md           extraction de la voix, facecam, modèle de données, linter
    │   ├── saison-hyrox.md              calendrier 26/27, format, charges, règles, campagne
    │   ├── offre-athlete.md             échelle 49/89/179, contrainte de montage  ⚠️ non validée
    │   ├── production-media.md          triptyque de tournage, captation de course, droits
    │   ├── roi-athlete.md               reporting deux tunnels, dossier de sponsoring
    │   ├── playbook-athlete.md          onboarding, interdits réglementaires, qualité, délégation
    │   ├── vitrine.md                   protocole du client vitrine : T0, verrous, écriture du cas
    │   ├── metricool-api.md             plomberie — à tenir synchronisée avec cm-metricool
    │   └── clients/
    │       └── pierre-huiban.md         athlète n° 1, et client vitrine
    ├── templates/
    │   ├── creer-formulaires.gs         génère les 2 formulaires Google depuis le schéma, et importe
    │   ├── dossier-athlete.md           la source et la référence du dispositif
    │   ├── Dossier-Athlete-OTEA.pdf     version imprimable
    │   └── web/dossier-athlete.html     page autonome à héberger sur oteaproduction.com
    └── athletes/
        ├── _formulaires.json            identifiants des 2 formulaires, communs à tous les athlètes
        └── pierre-huiban/               données structurées : profil.json, courses.json
```

## Documents d'onboarding

Deux déclinaisons du même questionnaire, dépersonnalisées l'une de l'autre. Elles partagent la
structure et le principe — **on ne demande jamais la chose qu'on veut, on demande la situation qui
la révèle** — et divergent sur le contexte métier.

| Document | Cible | Où |
|---|---|---|
| **Dossier Athlète** | Athlètes HYROX et hybrides | `.claude/skills/cm-hyrox/templates/` — source `.md`, PDF imprimable, page web autonome, et le script qui génère le formulaire Google |
| **Dossier Pro** | B2C large : coachs, consultants, thérapeutes, créateurs, artisans, libéraux, TPE | `dossier-pro.html`, à la racine |

Le Dossier Athlète est le seul des deux à être **branché sur l'outil** : son formulaire Google est
généré depuis le schéma de `creer-formulaires.gs`, et les réponses s'importent en `profil.json` sans
ressaisie. Toute évolution de fond se fait d'abord côté athlète, puis se répercute sur le Dossier
Pro — jamais l'inverse.

## Portefeuille

**Pierre Huiban** (@pierrehuiban89, blogId 6572293) — athlète sponsorisé, 3 partenaires, campagne
*Road to Hong Kong*. Déjà produit depuis juillet 2026 dans `cm-metricool` ; sa migration vers ce
moteur et son passage en client payant sont ouverts.

**Déjà qualifié et présent aux Mondiaux de Stockholm en juin 2026** — top 0,5 % mondial. Cette
saison, il vise **la requalification en Doubles Pro Homme avec Antoine**, pour Hong Kong.

Sa saison : **Rome 24-27 sept.** (piste de course en extérieur) puis **Paris Porte de Versailles
12-20 déc.**, la course-vitrine. Bordeaux est abandonné.

⚠️ **Une qualification en doubles est non-transférable** : les partenaires qualifiés doivent courir
ensemble aux Mondiaux, sans substitution possible. C'est le meilleur enjeu narratif de la saison, et
un risque de production réel — si Antoine tombe, tout le contenu qui suppose l'objectif devient faux.

**Antoine est le prospect n° 1** : mêmes courses, mêmes dates, déjà dans les photos, et une captation
à Rome qui couvrirait deux clients au lieu d'un.

## Actions bloquantes

1. **Test des 4 reels chronométrés** — tant qu'il n'existe pas, le palier Salle n'a pas de prix, il a
   une hypothèse. Aucun prix ne s'annonce avant.
2. **Droits photo à vérifier auprès de l'organisation HYROX** — bloquant pour tout le modèle de
   captation de course.
3. **Corriger la doctrine média de `cm-metricool`** : elle affirme encore qu'une URL publique est
   obligatoire, alors que l'upload Metricool est éprouvé depuis le 23/07/2026. Divergence documentée
   en tête de `references/metricool-api.md`.
4. **Trancher le palier de Pierre** — ce qui lui est livré aujourd'hui est très au-dessus de Salle,
   et le passer en Base sans réduire le service fixerait une référence intenable pour les suivants.
5. **Figer le T0 de la vitrine** avant sa prochaine publication. C'est la seule chose de tout ce
   dépôt qui ne se rattrape pas.
6. **Décider de la captation de Rome** — c'est le seul moment de la saison qui ne se rejoue pas.
   Y aller, faire filmer sur place avec un protocole écrit, ou acheter le pack officiel. Décision à
   prendre maintenant, la course est dans 7 semaines.
7. **Formaliser l'accord variable** — taux, part de dotation, survie, veto. L'assiette est tranchée
   (Split Nutrition oui, Kairyn et GX Society non), reste à définir par écrit ce que « obtenu
   ensemble » voudra dire pour le client n° 2. Deux points à poser à l'expert-comptable : apport
   d'affaires et avantage en nature.
8. Monteur à trouver, capable d'absorber 15 à 30 h/mois à 30 €/h.

## Règles de cohérence

- La doctrine Metricool est partagée avec `cm-metricool` : **toute correction s'applique aux deux
  dépôts dans le même commit**.
- Un compte présent dans le portefeuille d'un moteur ne doit jamais apparaître dans celui d'un autre.
- La seule passerelle autorisée entre moteurs : les chiffres du cas vitrine sortent d'ici et se
  publient sur **Otea Filmakers**, via `cm-metricool`.
- **On automatise après trois clients faits à la main**, pas avant.

## Installation

Le skill est chargé automatiquement depuis `.claude/skills/` quand le dépôt est ouvert.
