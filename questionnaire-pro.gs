/**
 * Dispositif Pro OTEA — génération des formulaires.
 *
 * Jumeau généraliste de `.claude/skills/cm-hyrox/templates/creer-formulaires.gs`. Même mécanique,
 * mêmes fonctions, mêmes garde-fous — seuls le vocabulaire et les questions changent. Les deux
 * fichiers sont faits pour être comparés ligne à ligne : toute divergence doit être une décision,
 * pas un oubli.
 *
 * Crée les DEUX formulaires du dispositif et leurs feuilles de réponses :
 *   1. « Dossier Pro »   — rempli une fois, à l'onboarding
 *   2. « Point hebdo »   — rempli chaque dimanche, 30 secondes
 *
 * MODE D'EMPLOI
 *   1. script.google.com, connecté à contact@oteaproduction.com → Nouveau projet → coller ce fichier
 *   2. Exécuter `creerFormulaires` → autoriser l'accès à Drive
 *   3. Les URLs s'affichent dans le journal d'exécution (Ctrl+Entrée)
 *   4. Reporter les identifiants dans clients/_formulaires.json ET dans les trois constantes
 *      FORM_/SHEET_ en bas de ce fichier — sans elles, l'import ne sait pas quoi relire.
 *   5. Remplacer le mailto: du bouton « Démarrer mon dossier » de dossier-pro.html par le lien
 *      public du Dossier.
 *
 * ⚠️ Un projet Apps Script par dispositif. Ce fichier et celui de l'athlète déclarent les mêmes
 *    noms de fonctions : collés dans le même projet, l'un écrase l'autre silencieusement.
 *
 * POURQUOI UN SCRIPT ET PAS UN FORMULAIRE FAIT À LA MAIN
 *   Le formulaire se construit à partir du schéma, jamais l'inverse. Les libellés de questions
 *   deviennent les en-têtes de colonnes de la feuille de réponses : s'ils dérivent, l'import vers
 *   `profil.json` casse. Ici les deux sortent du même tableau `SCHEMA`, donc ils ne peuvent pas
 *   diverger. Et un client de plus = une exécution de plus, pas une recopie.
 *
 * CE QUI N'EST VOLONTAIREMENT PAS DANS LE FORMULAIRE
 *   La voix et le persona. Ils passent par un FACECAM de 3 minutes que le client tourne seul :
 *   cinq questions, une seule prise, jamais publié. Quelqu'un qui écrit se corrige et lisse ses
 *   tournures ; une prise unique l'en empêche. Le formulaire porte la consigne et enregistre le
 *   mode d'envoi — il ne collecte pas les réponses.
 */

// ---------------------------------------------------------------------------
// LE SCHÉMA — source unique du formulaire et de la correspondance des champs
// ---------------------------------------------------------------------------
// type : 'court' | 'long' | 'choix' | 'liste' | 'cases' | 'date' | 'titre'
// champ : le chemin dans profil.json. '' pour les éléments de mise en page.

const SCHEMA_DOSSIER = [
  { champ: 'nom',                      titre: 'Votre nom et prénom',                     type: 'court', requis: true },
  { champ: 'activite',                 titre: 'Le nom de votre activité, si différent',  type: 'court' },
  { champ: 'metier',                   titre: 'Votre métier, en un mot ou deux',         type: 'court', requis: true,
    aide: 'Coach sportif, kiné, plombier, consultante RH, photographe, fleuriste…' },
  { champ: 'telephone',                titre: 'Votre téléphone',                         type: 'court', requis: true,
    aide: 'Pour le point de calage et le quotidien — on travaille par WhatsApp.' },
  { champ: 'zone',                     titre: 'Où travaillez-vous ?',                    type: 'court', requis: true,
    aide: 'Ville et rayon d\'intervention — ou « en ligne ».' },
  { champ: 'depuis',                   titre: 'Depuis quand ?',                          type: 'court', requis: true,
    aide: 'L\'année suffit.' },
  { champ: 'equipe',                   titre: 'Seul ou en équipe ?',                     type: 'choix', requis: true,
    choix: ['Seul(e)', 'À 2 ou 3', 'Plus de 3'] },
  { champ: 'reseaux',                  titre: 'Vos comptes déjà ouverts',                type: 'long',  requis: true,
    aide: 'Instagram, TikTok, Facebook, LinkedIn, YouTube, Google Business… Le @ ou le lien de chacun, même à l\'abandon.' },

  { type: 'titre', titre: '01 · Ce que vous vendez',
    aide: 'Les vrais chiffres. Ils ne seront jamais publiés sans votre accord — ils servent à écrire des contenus qui sonnent juste.' },

  { champ: 'offre.prestations',        titre: 'Vos prestations principales et leurs prix réels', type: 'long', requis: true,
    aide: 'Telles que vous les vendez aujourd\'hui, avec les vrais prix.' },
  { champ: 'offre.plus_demandee',      titre: 'La prestation qu\'on vous demande le plus', type: 'court', requis: true },
  { champ: 'offre.a_developper',       titre: 'Celle que vous préféreriez vendre plus souvent', type: 'court', requis: true,
    aide: 'Et si c\'est un autre type de client que vous cherchez, dites-le ici aussi.' },
  { champ: 'offre.ticket_moyen',       titre: 'Votre ticket moyen',                      type: 'choix', requis: true,
    choix: ['Moins de 50 €', '50 à 150 €', '150 à 500 €', '500 à 2 000 €', 'Plus de 2 000 €'] },
  { champ: 'offre.recurrence',         titre: 'Vos clients reviennent-ils ?',            type: 'choix', requis: true,
    choix: ['Surtout de la récurrence', 'Un peu des deux', 'Surtout des nouveaux clients'] },
  { champ: 'preuve',                   titre: 'Un chiffre ou un résultat dont vous êtes fier', type: 'long', requis: true,
    aide: 'Années de métier, clients servis, un avant/après, une note Google, un record. Ce sont eux qui ouvriront vos contenus.' },

  { type: 'titre', titre: '01 · Vos clients et votre cap',
    aide: 'À qui on parle, et où on va.' },

  { champ: 'client_reel',              titre: 'Décrivez votre client réel',              type: 'long',  requis: true,
    aide: 'Pas l\'idéal : le réel. Qui, quel besoin, qu\'est-ce qui le décide à payer.' },
  { champ: 'phrase_metier',            titre: 'Votre métier en une phrase, comme vous le diriez à un voisin', type: 'court', requis: true,
    aide: 'Pas la phrase de la plaquette. C\'est elle qui nourrira votre bio.' },
  { champ: 'acquisition.canaux',       titre: 'Comment vos clients vous trouvent-ils aujourd\'hui ?', type: 'cases', requis: true,
    choix: ['Bouche-à-oreille', 'Instagram ou TikTok', 'Google',
            'Partenaires et prescripteurs', 'Publicité', 'Je ne sais pas vraiment'] },
  { champ: 'objectif_6mois',           titre: 'Votre objectif à six mois, en un seul chiffre', type: 'court', requis: true,
    aide: 'En demandes, devis ou ventes — jamais en abonnés. Ex. : « 10 demandes par mois », « 5 nouveaux clients », « agenda plein à 3 semaines ».' },
  { champ: 'acquisition.engagement',   titre: 'Vous engagez-vous à demander « vous m\'avez trouvé comment ? » à chaque nouveau client ?', type: 'choix', requis: true,
    choix: ['Oui, systématiquement', 'J\'essaierai'],
    aide: 'C\'est la seule façon de mesurer ce que tout ça vous rapporte vraiment. La question du dimanche vous le redemande chaque semaine.' },

  { type: 'titre', titre: '03 · Vos limites',
    aide: 'La partie qui nous empêche de faire une bêtise en votre nom. Soyez franc : rien ici ne sort d\'entre nous.' },

  { champ: 'positions_ok',             titre: 'Deux sujets sur lesquels vous acceptez de prendre position publiquement', type: 'long', requis: true,
    aide: 'Quitte à ce que ça fasse débat. Ex. : « les devis gratuits tuent le métier », « le low-cost finit toujours par coûter plus cher ».' },
  { champ: 'interdits',                titre: 'Trois sujets sur lesquels on ne parle jamais en votre nom', type: 'long', requis: true },
  { champ: 'interdits_image',          titre: 'Ce qu\'on ne montre jamais',              type: 'long',  requis: true,
    aide: 'Personnes, lieux, clients, vie privée. Votre famille ? Vos clients en séance ? L\'intérieur des maisons ? Dites tout.' },
  { champ: 'reglementation.encadre',   titre: 'Votre communication est-elle encadrée par des règles professionnelles ?', type: 'choix', requis: true,
    choix: ['Oui', 'Non', 'Je ne sais pas'],
    aide: 'Ordre professionnel, mentions obligatoires, allégations interdites (santé, droit, argent).' },
  { champ: 'reglementation.details',   titre: 'Si oui, lesquelles ?',                    type: 'long' },
  { champ: 'partenaires',              titre: 'Partenaires, fournisseurs, concurrents',  type: 'long',
    aide: 'Ceux à citer (leur @ exact, ce que vous leur devez, à quelle échéance) — et ceux qu\'on ne cite jamais.' },

  { type: 'titre', titre: '04 · Votre matériel et vos créneaux',
    aide: 'Votre téléphone suffit. On vérifie juste trois choses.' },

  { champ: 'materiel.telephone',       titre: 'Votre téléphone (marque et modèle)',      type: 'court', requis: true },
  { champ: 'materiel.micro_cravate',   titre: 'Un micro-cravate sans fil ?',             type: 'choix', requis: true,
    choix: ['J\'en ai déjà un', 'Pas encore — je peux l\'acheter (≈ 50 €)', 'À discuter'],
    aide: 'C\'est le seul achat qu\'on vous demande. Le son est ce qui fait décrocher une vidéo, pas l\'image.' },
  { champ: 'materiel.mode_son',        titre: 'Parler face caméra ?',                    type: 'choix', requis: true,
    choix: ['Ça va, je me lance', 'Pas à l\'aise, mais prêt(e) à essayer',
            'Je préfère filmer muet et enregistrer ma voix à part'],
    aide: 'Les trois marchent. On adapte la méthode.' },
  { champ: 'materiel.creneau',         titre: 'Votre créneau fixe pour filmer',          type: 'court', requis: true,
    aide: 'Un moment récurrent où vous êtes tranquille. Ex. : « mardi 13 h – 13 h 30 », « le premier samedi du mois ».' },
  { champ: 'materiel.lieux',           titre: 'Vos lieux de tournage possibles',         type: 'court', requis: true,
    aide: 'Atelier, cabinet, salle, bureau, chantier, domicile, extérieur…' },
  { champ: 'validation',               titre: 'Qui valide avant publication, et sous quel délai ?', type: 'court', requis: true,
    aide: 'En général : vous, sous 48 h, par WhatsApp. Deux allers-retours max par contenu, pour tenir le rythme.' },

  { type: 'titre', titre: '02 · Dernière étape — 3 minutes de vidéo',
    aide: 'Il reste la partie la plus importante : votre voix. Elle ne se fait pas par écrit — quand '
        + 'on écrit, on se corrige, on lisse, et on perd exactement ce qu\'on cherche.\n\n'
        + 'Vous lancez l\'enregistrement sur votre téléphone, vous répondez aux cinq questions à la '
        + 'suite, vous envoyez. Pas de rendez-vous à caler.\n\n'
        + 'LES QUATRE RÈGLES — elles comptent plus que vos réponses :\n'
        + '1. UNE SEULE PRISE. Vous ne recommencez pas. Si vous bafouillez, vous continuez : c\'est '
        + 'exactement ce qu\'on veut.\n'
        + '2. Vous ne coupez pas entre les questions, vous enchaînez.\n'
        + '3. 3 minutes en tout. Ne préparez rien.\n'
        + '4. Cette vidéo ne sera JAMAIS publiée. Elle sert à nous, pour apprendre à écrire '
        + 'comme vous.\n\n'
        + 'Ce n\'est pas une présentation : on ne veut pas que vous vous vendiez, on veut vous '
        + 'entendre parler normalement. Téléphone vertical, cadre poitrine, là où vous êtes.\n\n'
        + 'LES CINQ QUESTIONS\n'
        + '1. Racontez votre pire journée des six derniers mois — et ce que vous vous êtes dit dans '
        + 'votre tête pour tenir. Les mots exacts, même s\'ils sont bêtes ou grossiers.\n'
        + '2. Qu\'est-ce qui vous énerve dans votre milieu ? Soyez franc, rien ne sort d\'ici.\n'
        + '3. Sur quoi vos clients se trompent-ils, avant de venir vous voir ?\n'
        + '4. Le jour où vous avez failli tout arrêter — c\'était quand, et pourquoi vous avez '
        + 'continué ?\n'
        + '5. Décrivez la dernière personne qui vous a payé — qui c\'était, pour quoi, et comment '
        + 'elle vous avait trouvé.' },

  { champ: 'facecam_envoi',            titre: 'Comment nous envoyez-vous votre vidéo ?', type: 'choix', requis: true,
    choix: ['Je l\'envoie par WhatsApp tout de suite', 'Je la dépose dans le dossier partagé',
            'Je la fais dans les 48 h'],
    aide: 'Le plus simple est le mieux. Une vidéo de téléphone brute, sans montage.' },
  { champ: 'facecam_note',             titre: 'Un mot à nous dire sur cet exercice ?',   type: 'long',
    aide: 'Optionnel. Si vous détestez vous filmer, dites-le — on adapte le dispositif.' }
];

const SCHEMA_HEBDO = [
  { champ: 'livre',       titre: '1. Ce que j\'ai livré cette semaine',                  type: 'long',  requis: true,
    aide: 'Chantiers, séances, rendez-vous, commandes. Deux lignes suffisent.' },
  { champ: 'chiffre',     titre: '2. Mon chiffre de la semaine',                         type: 'court', requis: true,
    aide: 'Un devis signé, un délai tenu, un avant/après, un nombre de clients. C\'est celui qui ouvrira vos contenus de la semaine.' },
  { champ: 'attribution', titre: '3. Mes nouveaux clients — comment chacun m\'a trouvé', type: 'long',
    aide: 'Une ligne par personne, avec sa réponse à « vous m\'avez trouvé comment ? ». C\'est la seule mesure de ce que la communication rapporte vraiment. Rien cette semaine : écrivez « aucun ».' },
  { champ: 'dur',         titre: '4. Ce qui a coincé',                                   type: 'long' },
  { champ: 'question',    titre: '5. Une question qu\'on m\'a posée',                    type: 'long',
    aide: 'Par un client, au téléphone, en rendez-vous, en commentaire. Ce sont elles qui font les meilleurs contenus.' },
  { champ: 'a_venir',     titre: '6. Ce qui arrive la semaine prochaine',                type: 'court' }
];

// ---------------------------------------------------------------------------
// GÉNÉRATION
// ---------------------------------------------------------------------------

function creerFormulaires() {
  const dossier = construire_(
    'Dossier Pro — OTEA',
    'Pour que ce qu\'on publie sur vos comptes sonne comme vous, et pas comme une agence.\n\n'
    + 'Vos mots, vos chiffres, vos prises de position — pas les nôtres. Rien n\'est publié tel '
    + 'quel, et rien ne sort d\'entre nous.\n\n'
    + 'Comptez 10 minutes. Une seule fois : ensuite, six lignes par semaine suffisent.',
    SCHEMA_DOSSIER,
    'C\'est envoyé, merci.\n\nIl reste la vidéo : 3 minutes, cinq questions, une seule prise, '
    + 'jamais publiée — les questions sont dans la dernière section de ce formulaire. Ensuite vous '
    + 'ne recevez plus qu\'un lien le dimanche, six lignes, trente secondes.',
    false
  );

  const hebdo = construire_(
    'Point hebdo — OTEA',
    'Six lignes, trente secondes. C\'est ce qui alimente tout ce qu\'on publie sur vos comptes la '
    + 'semaine suivante.\n\nÀ remplir le dimanche soir.',
    SCHEMA_HEBDO,
    'Reçu. Bonne semaine.',
    true
  );

  Logger.log('\n=== DOSSIER PRO ===');
  Logger.log('À envoyer     : ' + dossier.url);
  Logger.log('Réponses      : ' + dossier.sheet);
  Logger.log('Édition       : ' + dossier.edit);
  Logger.log('form_id       : ' + dossier.formId);
  Logger.log('sheet_id      : ' + dossier.sheetId);
  Logger.log('\n=== POINT HEBDO ===');
  Logger.log('À envoyer     : ' + hebdo.url);
  Logger.log('Réponses      : ' + hebdo.sheet);
  Logger.log('Édition       : ' + hebdo.edit);
  Logger.log('form_id       : ' + hebdo.formId);
  Logger.log('sheet_id      : ' + hebdo.sheetId);
  Logger.log('\nÀ FAIRE MAINTENANT');
  Logger.log('1. Reporter les quatre identifiants dans clients/_formulaires.json');
  Logger.log('2. Les reporter aussi dans les constantes FORM_/SHEET_ en bas de ce fichier');
  Logger.log('3. Remplacer le mailto: du bouton de dossier-pro.html par le lien du Dossier');
  Logger.log('4. Mettre le lien du point hebdo en rappel récurrent le dimanche 19h');
}

function construire_(titre, description, schema, confirmation, reponsesMultiples) {
  const form = FormApp.create(titre);
  form.setDescription(description);
  form.setConfirmationMessage(confirmation);
  form.setProgressBar(true);
  form.setAllowResponseEdits(true);
  form.setLimitOneResponsePerUser(false);
  if (reponsesMultiples) {
    form.setShowLinkToRespondAgain(true);
  }
  try {
    form.setCollectEmail(true);
  } catch (e) {
    Logger.log('Collecte des e-mails à activer à la main dans les paramètres : ' + e);
  }

  schema.forEach(function (q) {
    var item;
    switch (q.type) {
      case 'titre':
        item = form.addPageBreakItem().setTitle(q.titre);
        if (q.aide) { item.setHelpText(q.aide); }
        return;
      case 'long':   item = form.addParagraphTextItem(); break;
      case 'choix':  item = form.addMultipleChoiceItem().setChoiceValues(q.choix); break;
      case 'liste':  item = form.addListItem().setChoiceValues(q.choix); break;
      case 'cases':  item = form.addCheckboxItem().setChoiceValues(q.choix).showOtherOption(true); break;
      case 'date':   item = form.addDateItem(); break;
      default:       item = form.addTextItem();
    }
    item.setTitle(q.titre);
    if (q.aide)   { item.setHelpText(q.aide); }
    if (q.requis) { item.setRequired(true); }
  });

  const ss = SpreadsheetApp.create(titre + ' — réponses');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  return {
    url: form.shortenFormUrl(form.getPublishedUrl()),
    edit: form.getEditUrl(),
    sheet: ss.getUrl(),
    formId: form.getId(),
    sheetId: ss.getId()
  };
}

/**
 * Imprime la correspondance « libellé de colonne → champ de profil.json ».
 * À exécuter une fois et à reporter dans clients/<slug>/ pour l'import.
 */
function afficherCorrespondance() {
  Logger.log('--- DOSSIER → profil.json ---');
  SCHEMA_DOSSIER.forEach(function (q) {
    if (q.champ) { Logger.log(q.champ + '  ←  ' + q.titre); }
  });
  Logger.log('\n--- HEBDO → semaines/<ISO>.json ---');
  SCHEMA_HEBDO.forEach(function (q) {
    Logger.log(q.champ + '  ←  ' + q.titre);
  });
}

/**
 * Relit les formulaires VIVANTS et recrache leur état réel.
 *
 * À exécuter après toute retouche manuelle dans l'interface Google Forms. Un libellé modifié à la
 * main devient un en-tête de colonne modifié dans la feuille de réponses : si le SCHEMA ci-dessus
 * n'est pas recalé dessus, l'import vers profil.json cherche une colonne qui n'existe plus.
 *
 * Sortie : les deux liens publics, et la liste numérotée des questions telles qu'elles sont.
 */
function exporterFormulaires() {
  [['DOSSIER', FORM_DOSSIER], ['HEBDO', FORM_HEBDO]].forEach(function (f) {
    if (!f[1]) { Logger.log('=== ' + f[0] + ' === identifiant non renseigné, voir le mode d\'emploi.'); return; }
    var form = FormApp.openById(f[1]);
    Logger.log('=== ' + f[0] + ' === ' + form.shortenFormUrl(form.getPublishedUrl()));
    form.getItems().forEach(function (it, i) {
      Logger.log((i + 1) + ' | ' + it.getType() + ' | ' + it.getTitle());
    });
  });
}

// ---------------------------------------------------------------------------
// IMPORT — de la feuille de réponses vers le dépôt
// ---------------------------------------------------------------------------
// À renseigner après la première exécution de `creerFormulaires` — les quatre valeurs
// s'affichent dans le journal, et se recopient aussi dans clients/_formulaires.json.

const FORM_DOSSIER  = '';
const FORM_HEBDO    = '';
const SHEET_DOSSIER = '';
const SHEET_HEBDO   = '';

/**
 * Lit la DERNIÈRE réponse au Dossier Pro et imprime le profil.json correspondant.
 * À copier dans clients/<slug>/profil.json du dépôt CM-BTOC.
 *
 * Les champs que le formulaire ne collecte pas — mantra, tics, DA, blog_id — ne sont pas
 * inventés : ils sortent à null et se remplissent à la main après l'écoute du facecam.
 */
function genererProfil() {
  const profil = lireDerniereReponse_(SHEET_DOSSIER, SCHEMA_DOSSIER);
  if (!profil) { return; }

  profil.slug = slugifier_(profil.nom || 'client');
  profil.blog_id = null;
  profil.mantra = null;
  profil.tics = [];
  profil.da = null;
  profil.palier = null;
  profil._source = 'Dossier Pro — réponse du ' + profil._horodatage;
  profil._a_completer = ['blog_id', 'mantra', 'tics', 'da',
                         'persona (écoute du facecam)', 'questions_recurrentes (écoute du facecam)'];

  Logger.log(JSON.stringify(profil, null, 2));
}

/**
 * Lit la dernière réponse au Point hebdo et imprime le semaines/<ISO>.json correspondant.
 */
function genererSemaine() {
  const semaine = lireDerniereReponse_(SHEET_HEBDO, SCHEMA_HEBDO);
  if (!semaine) { return; }

  const d = new Date(semaine._horodatage);
  semaine.semaine = d.getUTCFullYear() + '-W' + numeroSemaine_(d);
  Logger.log(JSON.stringify(semaine, null, 2));
}

function lireDerniereReponse_(sheetId, schema) {
  if (!sheetId) {
    Logger.log('Identifiant de feuille non renseigné — voir le mode d\'emploi en tête de fichier.');
    return null;
  }
  const sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
  const lignes = sheet.getDataRange().getValues();
  if (lignes.length < 2) { Logger.log('Aucune réponse pour le moment.'); return null; }

  const entetes = lignes[0];
  const derniere = lignes[lignes.length - 1];

  // index par libellé, puisque c'est le libellé qui fait le lien entre le formulaire et le schéma
  const parLibelle = {};
  entetes.forEach(function (t, i) { parLibelle[String(t).trim()] = i; });

  const out = { _horodatage: formater_(derniere[0]) };
  if (parLibelle['Adresse e-mail'] !== undefined) {
    out.email = formater_(derniere[parLibelle['Adresse e-mail']]);
  }
  const manquants = [];

  schema.forEach(function (q) {
    if (!q.champ) { return; }
    const i = parLibelle[q.titre.trim()];
    if (i === undefined) { manquants.push(q.titre); return; }
    poser_(out, q.champ, formater_(derniere[i]));
  });

  if (manquants.length) {
    Logger.log('/* ATTENTION — libellés du schéma absents de la feuille, donc non importés :');
    manquants.forEach(function (m) { Logger.log(' - ' + m); });
    Logger.log('   Le formulaire a été modifié sans recaler le SCHEMA. */');
  }
  return out;
}

function poser_(obj, chemin, valeur) {
  const parts = chemin.split('.');
  var cur = obj;
  for (var i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) { cur[parts[i]] = {}; }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = valeur;
}

function formater_(v) {
  if (v === '' || v === null || v === undefined) { return null; }
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, 'Europe/Paris', 'yyyy-MM-dd');
  }
  return String(v).trim();
}

function slugifier_(s) {
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function numeroSemaine_(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const debut = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const n = Math.ceil((((t - debut) / 86400000) + 1) / 7);
  return (n < 10 ? '0' : '') + n;
}
