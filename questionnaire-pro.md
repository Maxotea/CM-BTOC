# Questionnaire « Dossier Pro — OTEA »

Version généraliste du dispositif athlète (Hyrox), pour l'onboarding des clients B2C larges :
coachs, consultants, thérapeutes, créateurs, artisans, professions libérales, micro-entreprises
et TPE.

**Deux formulaires, pas un.** C'est le point qui change tout par rapport à la première version :

| Formulaire | Quand | Ce qu'il produit |
|---|---|---|
| **Dossier Pro** — 33 champs | une fois, à l'onboarding | `clients/<slug>/profil.json` |
| **Point hebdo** — 6 champs | chaque dimanche soir, 30 s | `clients/<slug>/semaines/<ISO>.json` |

Le Dossier ne sert qu'une fois. **C'est le hebdo qui fait le gain de temps réel** : le message du
dimanche devient une ligne de feuille de calcul exploitable au lieu d'un texte à retranscrire.

Le Dossier couvre les parties **01, 03 et 04** de la page `dossier-pro.html`, et porte en dernière
section la consigne de la partie **02** — la vidéo de 3 minutes. Le formulaire n'en collecte pas
les réponses, seulement le mode d'envoi : la voix ne passe pas par l'écrit.

## Le principe : le schéma d'abord, le formulaire ensuite

Les libellés de questions **deviennent les en-têtes de colonnes** de la feuille de réponses. Si un
libellé dérive, l'import cherche une colonne qui n'existe plus. C'est pour ça que le formulaire
n'est pas construit à la main : `questionnaire-pro.gs` porte un tableau `SCHEMA` où chaque entrée
tient **le libellé et le champ de `profil.json` qu'il alimente**, et le formulaire en est déduit.
Les deux ne peuvent donc pas diverger.

Corollaire, et c'est la seule discipline à tenir : **toute retouche faite à la main dans Google
Forms doit être répercutée dans le `SCHEMA`.** La fonction `exporterFormulaires` relit les
formulaires vivants et imprime leurs questions telles qu'elles sont, pour le vérifier ; `genererProfil`
journalise en clair tout libellé du schéma qu'il ne retrouve pas dans la feuille.

## Mise en service

1. **Créer les formulaires.** [script.google.com](https://script.google.com) connecté à
   contact@oteaproduction.com → Nouveau projet → coller `questionnaire-pro.gs` → exécuter
   `creerFormulaires` → autoriser. Les liens et les quatre identifiants s'affichent dans le journal.
   ⚠️ Un projet par dispositif : ce script et celui de l'athlète déclarent les mêmes noms de
   fonctions, collés ensemble l'un écrase l'autre.
2. **Reporter les identifiants** dans `clients/_formulaires.json` *et* dans les constantes
   `FORM_DOSSIER`, `FORM_HEBDO`, `SHEET_DOSSIER`, `SHEET_HEBDO` en bas du script. Sans elles,
   l'import ne sait pas quelle feuille relire.
3. **Brancher la page.** Remplacer le `mailto:` du bouton « Démarrer mon dossier » de
   `dossier-pro.html` par le lien public du Dossier.
4. **Programmer le rappel** du point hebdo, le dimanche 19 h.

Ensuite, par client : envoyer le lien du Dossier, puis `genererProfil` → coller dans
`clients/<slug>/profil.json`. Chaque dimanche : `genererSemaine` → `semaines/<ISO>.json`.

Réglages appliqués par le script : collecte des e-mails, barre de progression, modification des
réponses autorisée, réponses multiples sur le hebdo uniquement.

---

# Formulaire 1 — Dossier Pro

**Description**

> Pour que ce qu'on publie sur vos comptes sonne comme vous, et pas comme une agence.
>
> Vos mots, vos chiffres, vos prises de position — pas les nôtres. Rien n'est publié tel quel, et
> rien ne sort d'entre nous.
>
> Comptez 10 minutes. Une seule fois : ensuite, six lignes par semaine suffisent.

## Page 1 — 01 · Vous

*Les faits, et on ne vous les redemande plus.*

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `nom` | Votre nom et prénom | court | oui | — |
| `activite` | Le nom de votre activité, si différent | court | non | — |
| `metier` | Votre métier, en un mot ou deux | court | oui | Coach sportif, kiné, plombier, consultante RH, photographe, fleuriste… |
| `telephone` | Votre téléphone | court | oui | Pour le point de calage et le quotidien — on travaille par WhatsApp. |
| `zone` | Où travaillez-vous ? | court | oui | Ville et rayon d'intervention — ou « en ligne ». |
| `depuis` | Depuis quand ? | court | oui | L'année suffit. |
| `equipe` | Seul ou en équipe ? | choix | oui | Seul(e) · À 2 ou 3 · Plus de 3 |
| `reseaux` | Vos comptes déjà ouverts | long | oui | Instagram, TikTok, Facebook, LinkedIn, YouTube, Google Business… Le @ ou le lien de chacun, même à l'abandon. |

## Page 2 — 01 · Ce que vous vendez

*Les vrais chiffres. Ils ne seront jamais publiés sans votre accord — ils servent à écrire des
contenus qui sonnent juste.*

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `offre.prestations` | Vos prestations principales et leurs prix réels | long | oui | Telles que vous les vendez aujourd'hui, avec les vrais prix. |
| `offre.plus_demandee` | La prestation qu'on vous demande le plus | court | oui | — |
| `offre.a_developper` | Celle que vous préféreriez vendre plus souvent | court | oui | Et si c'est un autre type de client que vous cherchez, dites-le ici aussi. |
| `offre.ticket_moyen` | Votre ticket moyen | choix | oui | Moins de 50 € · 50 à 150 € · 150 à 500 € · 500 à 2 000 € · Plus de 2 000 € |
| `offre.recurrence` | Vos clients reviennent-ils ? | choix | oui | Surtout de la récurrence · Un peu des deux · Surtout des nouveaux clients |
| `preuve` | Un chiffre ou un résultat dont vous êtes fier | long | oui | Années de métier, clients servis, un avant/après, une note Google, un record. Ce sont eux qui ouvriront vos contenus. |

## Page 3 — 01 · Vos clients et votre cap

*À qui on parle, et où on va.*

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `client_reel` | Décrivez votre client réel | long | oui | Pas l'idéal : le réel. Qui, quel besoin, qu'est-ce qui le décide à payer. |
| `phrase_metier` | Votre métier en une phrase, comme vous le diriez à un voisin | court | oui | Pas la phrase de la plaquette. C'est elle qui nourrira votre bio. |
| `acquisition.canaux` | Comment vos clients vous trouvent-ils aujourd'hui ? | cases | oui | Bouche-à-oreille · Instagram ou TikTok · Google · Partenaires et prescripteurs · Publicité · Je ne sais pas vraiment · Autre |
| `objectif_6mois` | Votre objectif à six mois, en un seul chiffre | court | oui | En demandes, devis ou ventes — jamais en abonnés. Ex. : « 10 demandes par mois », « 5 nouveaux clients », « agenda plein à 3 semaines ». |
| `acquisition.engagement` | Vous engagez-vous à demander « vous m'avez trouvé comment ? » à chaque nouveau client ? | choix | oui | Oui, systématiquement · J'essaierai — *C'est la seule façon de mesurer ce que tout ça vous rapporte vraiment. La question du dimanche vous le redemande chaque semaine.* |

## Page 4 — 03 · Vos limites

*La partie qui nous empêche de faire une bêtise en votre nom. Soyez franc : rien ici ne sort
d'entre nous.*

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `positions_ok` | Deux sujets sur lesquels vous acceptez de prendre position publiquement | long | oui | Quitte à ce que ça fasse débat. Ex. : « les devis gratuits tuent le métier », « le low-cost finit toujours par coûter plus cher ». |
| `interdits` | Trois sujets sur lesquels on ne parle jamais en votre nom | long | oui | — |
| `interdits_image` | Ce qu'on ne montre jamais | long | oui | Personnes, lieux, clients, vie privée. Votre famille ? Vos clients en séance ? L'intérieur des maisons ? Dites tout. |
| `reglementation.encadre` | Votre communication est-elle encadrée par des règles professionnelles ? | choix | oui | Oui · Non · Je ne sais pas — *Ordre professionnel, mentions obligatoires, allégations interdites (santé, droit, argent).* |
| `reglementation.details` | Si oui, lesquelles ? | long | non | — |
| `partenaires` | Partenaires, fournisseurs, concurrents | long | non | Ceux à citer (leur @ exact, ce que vous leur devez, à quelle échéance) — et ceux qu'on ne cite jamais. |

## Page 5 — 04 · Votre matériel et vos créneaux

*Votre téléphone suffit. On vérifie juste trois choses.*

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `materiel.telephone` | Votre téléphone (marque et modèle) | court | oui | — |
| `materiel.micro_cravate` | Un micro-cravate sans fil ? | choix | oui | J'en ai déjà un · Pas encore — je peux l'acheter (≈ 50 €) · À discuter — *C'est le seul achat qu'on vous demande. Le son est ce qui fait décrocher une vidéo, pas l'image.* |
| `materiel.mode_son` | Parler face caméra ? | choix | oui | Ça va, je me lance · Pas à l'aise, mais prêt(e) à essayer · Je préfère filmer muet et enregistrer ma voix à part — *Les trois marchent. On adapte la méthode.* |
| `materiel.creneau` | Votre créneau fixe pour filmer | court | oui | Un moment récurrent où vous êtes tranquille. Ex. : « mardi 13 h – 13 h 30 », « le premier samedi du mois ». |
| `materiel.lieux` | Vos lieux de tournage possibles | court | oui | Atelier, cabinet, salle, bureau, chantier, domicile, extérieur… |
| `validation` | Qui valide avant publication, et sous quel délai ? | court | oui | En général : vous, sous 48 h, par WhatsApp. Deux allers-retours max par contenu, pour tenir le rythme. |

## Page 6 — 02 · Dernière étape, 3 minutes de vidéo

La page porte le brief complet en texte d'aide : pourquoi la voix ne passe pas par l'écrit, les
**quatre règles** (une seule prise, pas de coupe, 3 minutes, jamais publiée) et les **cinq
questions**. On ne demande jamais « une présentation » — ça produit une publicité lissée en quatre
prises. On demande cinq situations, en une prise.

| Champ | Question | Type | Obligatoire | Aide / options |
|---|---|---|---|---|
| `facecam_envoi` | Comment nous envoyez-vous votre vidéo ? | choix | oui | Je l'envoie par WhatsApp tout de suite · Je la dépose dans le dossier partagé · Je la fais dans les 48 h |
| `facecam_note` | Un mot à nous dire sur cet exercice ? | long | non | Optionnel. Si vous détestez vous filmer, dites-le — on adapte le dispositif. |

**Message de confirmation**

> C'est envoyé, merci.
>
> Il reste la vidéo : 3 minutes, cinq questions, une seule prise, jamais publiée — les questions
> sont dans la dernière section de ce formulaire. Ensuite vous ne recevez plus qu'un lien le
> dimanche, six lignes, trente secondes.

---

# Formulaire 2 — Point hebdo

**Description**

> Six lignes, trente secondes. C'est ce qui alimente tout ce qu'on publie sur vos comptes la
> semaine suivante.
>
> À remplir le dimanche soir.

| Champ | Question | Type | Obligatoire | Aide |
|---|---|---|---|---|
| `livre` | 1. Ce que j'ai livré cette semaine | long | oui | Chantiers, séances, rendez-vous, commandes. Deux lignes suffisent. |
| `chiffre` | 2. Mon chiffre de la semaine | court | oui | Un devis signé, un délai tenu, un avant/après, un nombre de clients. C'est celui qui ouvrira vos contenus de la semaine. |
| `attribution` | 3. Mes nouveaux clients — comment chacun m'a trouvé | long | non | Une ligne par personne, avec sa réponse à « vous m'avez trouvé comment ? ». C'est la seule mesure de ce que la communication rapporte vraiment. Rien cette semaine : écrivez « aucun ». |
| `dur` | 4. Ce qui a coincé | long | non | — |
| `question` | 5. Une question qu'on m'a posée | long | non | Par un client, au téléphone, en rendez-vous, en commentaire. Ce sont elles qui font les meilleurs contenus. |
| `a_venir` | 6. Ce qui arrive la semaine prochaine | court | non | — |

**Message de confirmation :** « Reçu. Bonne semaine. »

---

## Ce que chaque bloc alimente (usage interne)

- **Pages 1–3** → fiche client (identité, offre, prix, cible, positionnement en une phrase,
  objectif à 6 mois en conversations/ventes), bio du profil, hooks chiffrés des contenus.
- **`acquisition.canaux` + `acquisition.engagement` + `attribution` hebdo** → l'attribution, pour un
  reporting ROI crédible dès le mois 1. Les deux premiers posent l'état de départ et l'engagement,
  le troisième le mesure chaque semaine. **Sans la collecte hebdomadaire, l'engagement du Dossier
  ne produit rien** — c'est la seule question du hebdo qui n'a pas d'équivalent côté athlète.
- **Page 4** → les 2 sujets clivants autorisés, les interdits, les contraintes réglementées.
- **Page 5** → mode de production (face caméra ou voix off), créneau du batch mensuel, circuit de
  validation avec plafond de 2 allers-retours.
- **Page 6 + le facecam lui-même** → la voix : mantra, tics de langage, persona, questions
  récurrentes. Ces champs-là ne se remplissent **jamais automatiquement** : ils sortent de l'écoute,
  par un humain. `genererProfil` les laisse à `null` et les liste dans `_a_completer`.
- **Le délai de livraison du facecam** est un signal de qualification : moins de 48 h, le client
  tiendra le rituel hebdomadaire ; plus d'une semaine après relances, il ne le tiendra pas — et on
  le sait avant d'avoir produit un contenu.

## Écarts assumés avec le dispositif athlète

Les deux fichiers `.gs` sont faits pour être comparés ligne à ligne. Trois différences seulement,
toutes délibérées :

| | Athlète | Pro | Pourquoi |
|---|---|---|---|
| Question d'attribution au hebdo | ✗ | ✓ | Un athlète ne vend pas de prestation à la semaine ; un artisan si. |
| Collecte de l'e-mail | ✗ | ✓ | Le Pro est aussi un outil de prospection : on veut pouvoir relancer. |
| Date de naissance | ✓ | ✗ | Elle ne sert qu'à calculer le groupe d'âge en course. |
