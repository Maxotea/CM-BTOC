---
name: cm-hyrox
description: Moteur de community management d'OTEA Production pour les ATHLÈTES HYROX et hybrides — le client est un compétiteur (Open, Pro, Doubles, Elite, coach-athlète) dont la saison de course structure tout le contenu. Pilote un athlète de bout en bout : ligne éditoriale bâtie sur ses chiffres réels, campagne de course J-56 → J+7, protocole de tournage à la salle, scripts de reels, planification Metricool via Zapier, reporting à deux tunnels (coaching vendu et valeur média livrée aux partenaires), dossier de sponsoring, onboarding et grille d'offre. Utilise ce skill dès que Maxime parle d'un client athlète HYROX ou hybride, d'une course (Paris, Nice, Bordeaux, Lyon, Toulouse, Elite Series, World Championships), d'un compte de coach HYROX, d'un dossier de partenariat sportif, ou de son offre « CM athlète » / « personal branding sportif ». N'utilise JAMAIS ce skill pour les comptes commerces du portefeuille B2B (Le Loft, Gossip Beauty Center, J Lawson Golf, La Galerie Immobilière, Otea, Otea Filmakers) — ceux-là relèvent de `cm-otea`. Pour un client perso qui n'est PAS un athlète de course (coach business, consultant, libéral, artiste), utilise `cm-b2c`.
---

# Moteur CM HYROX — athlète — v1

Spécialisation de `cm-b2c` sur une seule niche : **l'athlète HYROX**. Même plomberie que `cm-otea`
(Metricool via Zapier, Higgsfield, `reel-script`, `reel-lint`), même structuration en dix étapes,
mais un métier qui déplace trois choses par rapport au B2C générique :

- **Le goulot n'est plus « le client ne tourne pas ».** Un athlète s'entraîne 5 à 6 fois par semaine
  dans une salle pleine de miroirs, avec son téléphone sur lui. La matière existe déjà. Le vrai
  goulot, c'est qu'**il la tourne inutilisable** : plan large posé par terre, pas de son, quatre
  minutes de rameur sans début ni fin. Le moteur ne demande pas plus de tournage, il impose un
  **protocole** qui rend une séance normale exploitable sans l'allonger.
- **Le calendrier n'est plus saisonnier, il est nominatif.** Ce ne sont pas « les fêtes » qui
  structurent l'année, ce sont **ses courses à lui**. Chaque dossard est une campagne de six semaines
  qui produit 15 à 20 contenus. C'est le gain n°1 du moteur.
- **La preuve n'est plus un lead, elle est double.** Un athlète vend du coaching *et* vend de la
  visibilité à des marques. Deux tunnels, deux reportings, deux façons de rembourser l'abonnement.

## Étape 0 — Garde anti-mélange, puis identification (bloquante)

**STOP si le compte demandé est l'un de ceux-ci** — ce sont des commerces, ils relèvent de
`cm-otea` :

> LE LOFT · Gossip Beauty Center · jlawsongolf · La Galerie Immobilière · OTEA PRODUCTION ·
> Otea Filmakers

**STOP aussi si le client est une personne mais pas un athlète de course** (coach business,
consultant, libéral, créateur) : c'est `cm-b2c`, pas ce moteur. Le test qui tranche :
**« son calendrier de contenu peut-il être calé sur des dates de compétition ? »** Si non, ce moteur
ne sert à rien — toute sa mécanique repose là-dessus.

Ensuite, appeler `Zapier:list_enabled_zapier_actions` puis
`code_action_metricoolcliapi__list_brands_direct` pour obtenir les blogId à jour.

### Portefeuille athlètes

| Nom | blogId | Réseaux | Division | Prochaine course | Palier |
|---|---|---|---|---|---|
| _(aucun athlète à ce jour)_ | — | — | — | — | — |

Ajouter la ligne à la signature, jamais avant. Un compte présent dans cette table ne doit jamais
apparaître dans celle de `cm-otea` ni dans celle de `cm-b2c` — c'est la seule barrière qui empêche
les trois moteurs de se mélanger.

**La colonne « prochaine course » est la plus importante du tableau.** Elle se met à jour à chaque
session : tout le reste du moteur se déduit de la distance à cette date.

## Les cinq règles qui font gagner le temps

1. **Aucun contenu sans un de ses chiffres.** Un athlète produit gratuitement ce que personne
   d'autre n'a : des splits publics, un temps de roxzone, un écart à sa dernière course. Chaque reel
   ouvre sur un de ses chiffres réels. C'est ce qui remplace le travail de hook et supprime la
   moitié du temps d'écriture.
2. **La course se produit à l'avance, pas le jour J.** Toute la campagne J-56 → J+7 s'écrit avant le
   départ, placeholders compris. Le jour de la course, on ne rédige pas, on remplit. Voir
   `references/saison-hyrox.md`.
3. **Le protocole de tournage prime sur la demande de tournage.** On n'écrit jamais « filme-toi sur
   les sleds ». On envoie une liste de plans numérotés calée sur la séance qu'il avait déjà prévue.
   Voir `references/production-media.md`.
4. **Un batch mensuel, une session.** Comme partout : reprendre le contexte d'un client coûte plus
   cher que produire le contenu.
5. **Ce qui est dans le palier est dans le palier.** Voir `references/offre-athlete.md`.

## Étape 1 — Actualité HYROX et calendrier (jamais de mémoire)

Toujours vérifier par recherche web avant d'écrire : dates de course, résultats, classements,
changements de règlement, charges par division. Un chiffre faux sur un compte d'athlète coûte plus
cher que sur un compte de commerce — son audience est composée de pratiquants qui connaissent les
standards par cœur et corrigent en commentaire.

Trois veilles à tenir, distinctes :

- **Veille fédérale** : ce que HYROX annonce (calendrier, règlement, structure Elite, ouverture des
  inscriptions). C'est le carburant du pilier H4 et la source des réactions à 48 h.
- **Veille résultats** : ce que font les athlètes de référence, français et internationaux, et
  surtout **ce que fait l'athlète lui-même** — chaque course produit des splits publics exploitables.
- **Veille conversation** : les questions qui reviennent en DM et en commentaire. C'est le pilier H2,
  le plus rentable et le plus négligé. Les relever pendant la modération et les stocker dans la fiche.

Repères de saison 26/27, format de course, charges par division, changements de règlement et
vocabulaire : `references/saison-hyrox.md`. **Ce fichier est daté** — le relire, c'est aussi vérifier
que sa date de dernière validation n'a pas plus de deux mois.

## Étape 2 — Structure éditoriale

Cinq piliers. Ils ne sont ni ceux du commerce ni ceux du personal branding générique : ici on
n'installe pas une autorité abstraite, on documente une progression mesurable.

| Pilier | Part | Contenu |
|---|---|---|
| H1 — Performance chiffrée | 30 % | Ses splits, son PB, son écart à la course précédente, ce que la data dit de sa prépa |
| H2 — Technique & stations | 25 % | Les 8 stations, la roxzone, l'erreur qui coûte 30 s — en réponse à une question réelle de sa cible |
| H3 — Récit de saison | 20 % | Prépa, blessure, doute, voyage, jour J. Le feuilleton, c'est ce qui fidélise |
| H4 — Position & communauté | 15 % | Prendre parti sur un sujet du milieu, réagir à une annonce HYROX. Assumé, argumenté, jamais gratuit |
| H5 — Preuve & offre | 10 % | Résultats de ses athlètes coachés, témoignages, partenaires, ouverture des places |

Cadence de base : **4 reels + 2 posts feed par semaine**, plus les stories. Le reel est le seul
format qui recrute une audience neuve ; le feed et les stories retiennent celle qui est déjà là.

Le pilier H4 est celui qui fait la portée et celui que l'athlète refuse en premier — surtout s'il a
des partenaires. Il se négocie à l'onboarding, pas en cours de mois : faire valider **deux sujets
sur lesquels il accepte d'être clivant** et **trois sur lesquels il refuse**, par écrit.

### Déclencheurs automatiques

- **Course inscrite** → campagne complète J-56 → J+7 posée au calendrier le jour même de
  l'inscription (`references/saison-hyrox.md`)
- **Annonce HYROX** (règlement, calendrier, structure Elite) → réaction H4 ou H2 sous 48 h, sinon on
  ne publie pas : une réaction tardive coûte plus qu'elle ne rapporte
- **Question posée 3 fois en DM** → reel H2 dans les 7 jours
- **PB ou résultat d'un athlète coaché** → post H5, avec accord écrit
- **Ouverture des places de coaching / lancement de programme** → séquence H5 sur 5 jours, préparée
  un mois à l'avance, calée juste après une course (c'est le pic d'audience de la saison)
- **Obligation contractuelle envers un partenaire** → traitée comme un livrable daté, pas comme une
  idée de contenu. Elle entre au calendrier avant tout le reste (voir Étape 8)

## Étape 3 — Matière : le protocole de tournage

Il n'y a pas de banque photo shootée. La matière vient de ses séances et de ses courses. Ordre de
choix pour chaque contenu :

1. **Rushes du batch mensuel**, tournés pendant des séances déjà prévues, hébergés sur URL publique
   par Maxime après réception. URL publique → le média s'attache directement au `schedule_post`.
2. **Captation de course** (option facturée, voir `references/offre-athlete.md`) — la matière la plus
   rentable du moteur : un jour de course alimente deux mois de contenu.
3. **Photos et vidéos officielles de l'événement** — attention aux droits, voir
   `references/production-media.md`.
4. **Carrousel de données** (splits, comparatif, progression) pour les posts feed H1 et H2 : souvent
   le meilleur format et il ne coûte aucun tournage.
5. **IA (Higgsfield) en dernier recours**, pour les schémas et les concepts uniquement, avec
   l'élément de référence de l'athlète. **Jamais de visage généré, jamais une scène de course
   fabriquée** : sur un compte de sport, une image inventée passée pour un vrai moment est la faute
   qui ne se rattrape pas.

Si un média n'a pas d'URL publique → post en `draft: true` + liste explicite du fichier à attacher.
Si le cas se répète, le problème est le protocole de tournage, pas la publication.

## Étape 4 — Écriture

- **Reels** : `reel-script` (hook chiffré, 3 étapes, cliffhanger, ≤ 175 mots) puis `reel-lint` avant
  tournage. Un reel qui n'a pas passé le lint ne part pas à l'athlète. **Le hook chiffré n'est jamais
  une statistique générale — c'est un de ses chiffres à lui.** « 4 min 12 de roxzone sur ma dernière
  course » bat « saviez-vous que la roxzone représente 8 % du temps total » à tous les coups.
- **Légendes** : hook + valeur + un seul CTA + 4 à 6 hashtags de niche. CTA par défaut :
  **« commente [MOT] »** ou **« envoie-moi [MOT] en DM »**. Le DM est le tunnel de vente du coaching ;
  la conversation précède toujours la vente.
- **Voix** : première personne, toujours. Reprendre les tics de langage relevés à l'onboarding.
  Le vocabulaire technique est un marqueur d'appartenance : dire « roxzone », « compromised running »,
  « splits », « sandbag », ne pas les traduire ni les expliquer à chaque fois. Expliquer une fois par
  trimestre, dans un contenu dédié aux débutants.
- **Interdictions absolues** : écrire une opinion qu'il n'a pas validée, inventer une anecdote de
  course, publier un chiffre de performance non vérifié sur les résultats officiels, formuler un
  conseil nutritionnel ou médical, présenter un complément comme un facteur de performance. Les
  trois dernières sont des risques réels pour un compétiteur, pas des précautions de style — détail
  dans `references/playbook-athlete.md`.

## Étape 5 — Planification Metricool

Identique aux deux autres moteurs — même tunnel, mêmes pièges. Manuel complet :
`references/metricool-api.md`.

- Média avec URL publique → `draft: false`, `autoPublish: true`
- Média manquant ou placeholder dans la légende → `draft: true` + `autoPublish: false`
- **Bug de fuseau horaire** : après toute création, `list_scheduled_posts` → `bulk_update_post_times`
  → `bulk_set_draft` obligatoirement, dans cet ordre. Sauter la dernière étape publie des brouillons.
- Horaires par défaut athlète, heure de Paris : **reels 6 h 45 ou 12 h 15, posts feed 20 h 30**. Une
  audience de pratiquants consulte avant la séance du matin et après celle du soir — pas aux mêmes
  heures qu'une clientèle de commerce. À réviser athlète par athlète au bout de deux mois sur les
  stats réelles.
- **Règle du jour de course : rien ne se planifie.** Le jour J se joue en stories, en direct, depuis
  le téléphone de l'athlète ou celui de Maxime s'il est sur place. Metricool ne sert à rien ce
  jour-là. Ce qui est planifié pour J et J+1, ce sont les contenus à placeholders préparés à
  l'avance, laissés en brouillon jusqu'à ce que les vrais chiffres tombent.

Fin de session : récapitulatif à Maxime — date, réseau, contenu, média attaché ou à attacher,
placeholders restants.

## Étape 6 — Contrôle qualité avant livraison

Checklist complète : `references/playbook-athlete.md`. Les cinq points qui coûtent un athlète : un
chiffre de performance faux, une opinion non validée, une allégation nutritionnelle, un partenaire
oublié ou mal cité, un placeholder resté dans une légende publiée après la course.

## Étape 7 — Reporting mensuel : deux tunnels

Un athlète ne se demande pas « combien de clients poussent la porte ». Il se demande deux choses :
**« combien de personnes veulent que je les coache »** et **« qu'est-ce que je peux montrer à une
marque »**. Le rapport répond aux deux, séparément.

Structure fixe, une page :

1. **Ce qu'on a publié** : reels, posts, stories.
2. **Tunnel A — revenus directs** : vues → clics profil → conversations (DM, commentaires-mots-clés)
   → appels → ventes de coaching ou de programme. Chiffres Metricool pour les trois premiers étages,
   chiffres de l'athlète pour les deux derniers — **il faut les lui demander tous les mois**.
3. **Tunnel B — valeur partenaires** : contenus portant un produit partenaire, portée cumulée de ces
   contenus, mentions, utilisations du code promo, clics sur le lien en bio. C'est ce qui se
   recopie tel quel dans un bilan de partenariat et dans le prochain dossier de sponsoring.
4. **Ce qu'on fait le mois prochain** : trois actions, pas plus.

Méthode, seuils et calculs : `references/roi-athlete.md`. Le chiffre à mettre en haut du rapport est
**le nombre de conversations qualifiées**, jamais la portée. La portée est un moyen ; elle ne paie
que si elle est convertie en dossier partenaire.

## Étape 8 — Onboarding d'un athlète

Séquence J+0 → J+14, fiche athlète, premier batch et première livraison :
`references/playbook-athlete.md`.

Deux règles bloquantes propres à ce moteur :

- **Ne rien produire avant d'avoir son calendrier de courses de la saison et ses résultats passés.**
  Sans les dates, le moteur n'a pas de colonne vertébrale ; sans les résultats, les hooks n'ont pas
  de chiffres. Les deux se récupèrent en dix minutes sur les plateformes de résultats.
- **Ne rien produire avant d'avoir la liste écrite de ses obligations envers ses partenaires
  actuels.** Un athlète sponsorisé doit un nombre de publications daté à chacune de ses marques.
  Ces contenus sont des livrables contractuels : ils entrent au calendrier en premier, et leur
  oubli met l'athlète en défaut vis-à-vis de son sponsor. Personne ne pense à demander cette liste ;
  c'est pour ça qu'elle est ici.

## Étape 9 — Déléguer

Dès 5 athlètes, le montage sort du périmètre de Maxime : c'est 16 reels par athlète et par mois au
palier haut, et le premier poste de temps du moteur. Brief type, style d'overlay de données et
grille de coûts : `references/playbook-athlete.md`.

Ne se délègue jamais : la voix, l'arbitrage des opinions (H4), la relation avec les partenaires de
l'athlète, la validation avant publication, le reporting.

## Références

| Fichier | Quand le lire |
|---|---|
| `references/saison-hyrox.md` | Caler un calendrier, monter une campagne de course, vérifier un format, une charge ou une règle |
| `references/offre-athlete.md` | Chiffrer une proposition, définir un palier, arbitrer une demande hors forfait |
| `references/production-media.md` | Construire une liste de plans, cadrer un batch en salle, filmer une course, héberger les rushes |
| `references/roi-athlete.md` | Produire un reporting, monter un dossier de sponsoring, justifier un prix, préparer un renouvellement |
| `references/playbook-athlete.md` | Onboarder, contrôler la qualité, déléguer, gérer un incident |
| `references/metricool-api.md` | Toute manipulation technique de Metricool via Zapier |

**`metricool-api.md` est strictement partagé avec `cm-otea` et `cm-b2c`.** Il doit rester identique
au bit près dans les trois skills : toute correction faite d'un côté se recopie des deux autres,
sinon les moteurs divergent sur la plomberie et le bug de fuseau revient par la petite porte.
