/**
 * Dispositif athlète OTEA — génération des formulaires.
 *
 * Crée les DEUX formulaires du dispositif et leurs feuilles de réponses :
 *   1. « Dossier Athlète »  — rempli une fois, à l'onboarding
 *   2. « Point hebdo »      — rempli chaque dimanche, 30 secondes
 *
 * MODE D'EMPLOI
 *   1. script.google.com → Nouveau projet → coller ce fichier
 *   2. Exécuter `creerFormulaires` → autoriser l'accès à Drive
 *   3. Les URLs s'affichent dans le journal d'exécution (Ctrl+Entrée)
 *
 * POURQUOI UN SCRIPT ET PAS UN FORMULAIRE FAIT À LA MAIN
 *   Le formulaire se construit à partir du schéma, jamais l'inverse. Les libellés de questions
 *   deviennent les en-têtes de colonnes de la feuille de réponses : s'ils dérivent, l'import vers
 *   `profil.json` casse. Ici les deux sortent du même tableau `SCHEMA`, donc ils ne peuvent pas
 *   diverger. Et un athlète de plus = une exécution de plus, pas une recopie.
 *
 * CE QUI N'EST VOLONTAIREMENT PAS DANS LE FORMULAIRE
 *   Les parties « Ta voix » et « Ceux qui te suivent » du Dossier Athlète. Elles se font à l'oral.
 *   Un athlète qui écrit se corrige, lisse ses tournures et supprime exactement ce qu'on cherche.
 *   Le formulaire se contente de fixer le rendez-vous. Voir references/persona-et-voix.md, §2.
 */

// ---------------------------------------------------------------------------
// LE SCHÉMA — source unique du formulaire et de la correspondance des champs
// ---------------------------------------------------------------------------
// type : 'court' | 'long' | 'choix' | 'liste' | 'date' | 'titre'
// champ : le chemin dans profil.json. '' pour les éléments de mise en page.

const SCHEMA_DOSSIER = [
  { type: 'titre', titre: 'Toi, en compétition',
    aide: 'Les faits. Cinq minutes, et on ne te les redemande plus.' },

  { champ: 'nom',                     titre: 'Prénom et nom',                         type: 'court', requis: true },
  { champ: 'instagram',               titre: 'Ton compte Instagram (sans le @)',      type: 'court', requis: true },
  { champ: 'reseaux_autres',          titre: 'Tes autres comptes, si tu en as',       type: 'court' },
  { champ: 'naissance',               titre: 'Ta date de naissance',                  type: 'date',  requis: true,
    aide: 'Elle détermine ton groupe d\'âge — et en doubles, c\'est la moyenne des deux qui compte.' },

  { champ: 'division',                titre: 'Ta division cette saison',              type: 'liste', requis: true,
    choix: ['Open', 'Pro', 'Doubles Open', 'Doubles Pro', 'Doubles Mixte', 'Relais', 'Je ne sais pas encore'] },
  { champ: 'partenaire.nom',          titre: 'Si tu cours en doubles : le nom de ton partenaire', type: 'court' },
  { champ: 'partenaire.naissance',    titre: 'Sa date de naissance',                  type: 'date',
    aide: 'En doubles, le groupe d\'âge est la moyenne de vos deux âges.' },
  { champ: 'partenaire.instagram',    titre: 'Son compte Instagram',                  type: 'court' },

  { champ: 'entrainement.coach',      titre: 'Ton coach',                             type: 'court' },
  { champ: 'entrainement.club',       titre: 'Ton club ou ta team',                   type: 'court' },
  { champ: 'entrainement.salles',     titre: 'La ou les salles où tu t\'entraînes',   type: 'court' },
  { champ: 'entrainement.creneaux',   titre: 'Tes jours et créneaux de séance dans une semaine normale', type: 'long',
    aide: 'Ex. : lundi 6h30, mardi 19h, jeudi 6h30, samedi matin. C\'est ce qui nous sert à caler tes plans de tournage.' },

  { champ: 'historique',              titre: 'Tes trois dernières courses',           type: 'long', requis: true,
    aide: 'Une par ligne : ville, date, temps, et en une phrase comment ça s\'est passé.' },
  { champ: 'chiffres.splits',         titre: 'Tes splits, si tu les as gardés',       type: 'long',
    aide: 'Lien, capture d\'écran, copier-coller — peu importe le format. Ce sont eux qui alimentent tes contenus chiffrés.' },
  { champ: 'chiffres.pb',             titre: 'Ton record personnel, et où il a été fait', type: 'court' },

  { champ: 'courses_inscrit',         titre: 'Les courses où tu es DÉJÀ INSCRIT',     type: 'long', requis: true,
    aide: 'Ville et dates. C\'est ce qui structure tout ton calendrier de contenu.' },
  { champ: 'courses_vises',           titre: 'Les courses que tu VISES sans être inscrit', type: 'long' },
  { champ: 'objectif_saison',         titre: 'Ton objectif de la saison, en UN chiffre', type: 'court', requis: true,
    aide: 'Un temps, une place, une qualification. Un seul.' },
  { champ: 'objectif_qualitatif',     titre: 'Qu\'est-ce qui ferait de cette saison une réussite, même sans ce chiffre ?', type: 'long' },

  { type: 'titre', titre: 'Tes limites',
    aide: 'La partie qui nous empêche de faire une bêtise en ton nom. Sois franc, rien n\'est publié sans toi.' },

  { champ: 'positions_ok',            titre: 'Deux sujets sur lesquels tu acceptes de prendre position publiquement', type: 'long', requis: true,
    aide: 'Quitte à ce que ça fasse débat. C\'est ce qui fait la portée — et c\'est toi qui décides jusqu\'où.' },
  { champ: 'interdits',               titre: 'Trois sujets sur lesquels on ne parle JAMAIS en ton nom', type: 'long', requis: true },
  { champ: 'interdits_image',         titre: 'Ce qu\'on ne montre jamais', type: 'long',
    aide: 'Personnes, lieux, aspects de ta vie privée.' },
  { champ: 'sponsors',                titre: 'Tes partenaires et sponsors actuels',   type: 'long',
    aide: 'Pour chacun : la marque, son @ exact, ce que tu leur dois (nombre de publications, échéances), et s\'ils imposent un hashtag ou une façon de les citer.' },
  { champ: 'contraintes',             titre: 'Ton cadre professionnel', type: 'long',
    aide: 'Y a-t-il des choses à éviter à cause de ton métier ou de ton employeur ?' },
  { champ: 'contraintes_reglementaires', titre: 'Es-tu soumis à des contrôles, une fédération, un ordre professionnel ?', type: 'long' },

  { type: 'titre', titre: 'Ton matériel',
    aide: 'Deux minutes. On cale le protocole de tournage sur tes réponses.' },

  { champ: 'materiel.telephone',      titre: 'Le modèle de ton téléphone',            type: 'court' },
  { champ: 'materiel.micro_cravate',  titre: 'As-tu un micro-cravate sans fil ?',     type: 'choix', requis: true,
    choix: ['Oui', 'Non'],
    aide: 'C\'est le seul achat qu\'on te demande, autour de 50 €. Le son est ce qui fait décrocher une vidéo, pas l\'image.' },
  { champ: 'materiel.mode_son',       titre: 'Tu préfères parler pendant ta séance, ou filmer muet et enregistrer ta voix au calme le soir ?', type: 'choix', requis: true,
    choix: ['Parler pendant la séance', 'Filmer muet + voix off le soir', 'Je ne sais pas, on teste les deux'],
    aide: 'Les deux marchent. La voix off donne souvent un meilleur rendu et prend moins de temps.' },
  { champ: 'materiel.lieux',          titre: 'Deux endroits fixes où tu peux te filmer', type: 'long',
    aide: 'Un pour parler face caméra, un pour l\'action. Les fixer une fois évite d\'avoir à décider à chaque séance.' },
  { champ: 'materiel.autorisation',   titre: 'As-tu le droit de filmer dans ta salle ?', type: 'choix',
    choix: ['Oui', 'Non', 'Je dois vérifier'] },

  { type: 'titre', titre: 'Dernière étape — et elle ne se fait pas par écrit',
    aide: 'Il reste la partie la plus importante : ta voix.\n\n'
        + 'Huit questions, quinze minutes, à l\'oral — pas par écrit. Quand on écrit, on se corrige, '
        + 'on lisse, et on perd exactement ce qu\'on cherche : ta façon de parler.\n\n'
        + 'On t\'appelle pour la faire ensemble. Réponds à la question ci-dessous et on cale ça.' },

  { champ: 'dispo_appel',             titre: 'Quand es-tu joignable 20 minutes cette semaine ?', type: 'long', requis: true,
    aide: 'Deux ou trois créneaux suffisent.' }
];

const SCHEMA_HEBDO = [
  { champ: 'seances',  titre: '1. Mes séances de la semaine',                        type: 'long',  requis: true,
    aide: 'Combien, lesquelles. Deux lignes suffisent.' },
  { champ: 'chiffre',  titre: '2. Mon chiffre de la semaine',                        type: 'court', requis: true,
    aide: 'Un chrono, une charge, un volume. C\'est celui qui ouvrira tes contenus de la semaine.' },
  { champ: 'dur',      titre: '3. Ce qui a été dur',                                 type: 'long' },
  { champ: 'question', titre: '4. Une question qu\'on m\'a posée',                    type: 'long',
    aide: 'En DM, à la salle, n\'importe où. Ce sont elles qui font les meilleurs contenus.' },
  { champ: 'a_venir',  titre: '5. Ce qui arrive la semaine prochaine',               type: 'court' }
];

// ---------------------------------------------------------------------------
// GÉNÉRATION
// ---------------------------------------------------------------------------

function creerFormulaires() {
  const dossier = construire_(
    'Dossier Athlète — OTEA',
    'Pour que ce qu\'on publie sur ton compte sonne comme toi, et pas comme une agence.\n\n'
    + 'Tes mots, tes chiffres, tes prises de position — pas les nôtres.\n\n'
    + 'Compte 10 minutes. Une seule fois : ensuite, cinq lignes par semaine suffisent.',
    SCHEMA_DOSSIER,
    'C\'est envoyé, merci.\n\nIl reste la partie voix — on t\'appelle pour la faire à l\'oral. '
    + 'Ensuite tu ne reçois plus qu\'un lien le dimanche, cinq lignes, trente secondes.',
    false
  );

  const hebdo = construire_(
    'Point hebdo — OTEA',
    'Cinq lignes, trente secondes. C\'est ce qui alimente tout ce qu\'on publie sur ton compte '
    + 'la semaine suivante.\n\nÀ remplir le dimanche soir.',
    SCHEMA_HEBDO,
    'Reçu. Bonne semaine.',
    true
  );

  Logger.log('\n=== DOSSIER ATHLÈTE ===');
  Logger.log('À envoyer     : ' + dossier.url);
  Logger.log('Réponses      : ' + dossier.sheet);
  Logger.log('Édition       : ' + dossier.edit);
  Logger.log('\n=== POINT HEBDO ===');
  Logger.log('À envoyer     : ' + hebdo.url);
  Logger.log('Réponses      : ' + hebdo.sheet);
  Logger.log('Édition       : ' + hebdo.edit);
  Logger.log('\nMettre le lien du point hebdo en rappel récurrent le dimanche 19h.');
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
    sheet: ss.getUrl()
  };
}

/**
 * Imprime la correspondance « libellé de colonne → champ de profil.json ».
 * À exécuter une fois et à reporter dans athletes/<slug>/ pour l'import.
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
