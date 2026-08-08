/**
 * Crée automatiquement le Google Form « Dossier Pro — OTEA ».
 *
 * Mode d'emploi (2 minutes) :
 *   1. Ouvrir https://script.google.com connecté au compte contact@oteaproduction.com
 *   2. « Nouveau projet », coller tout ce fichier à la place du contenu par défaut
 *   3. Cliquer « Exécuter » (fonction creerDossierPro) et autoriser le script
 *   4. Les deux liens (public + édition) s'affichent dans le journal d'exécution
 *
 * Le formulaire est créé à la racine du Drive — le déplacer ensuite où tu veux.
 */
function creerDossierPro() {
  var form = FormApp.create("Dossier Pro — OTEA");

  form.setDescription(
    "Dix minutes, une seule fois. Vos réponses servent à écrire comme vous — " +
    "vos mots, vos chiffres, vos prises de position. Rien n'est publié tel quel, " +
    "et rien ne sort d'entre nous.\n" +
    "Après ce formulaire, il ne restera que votre vidéo de 3 minutes " +
    "(cinq questions, une seule prise) — on vous les envoie ensuite."
  );
  form.setConfirmationMessage(
    "C'est tout pour l'écrit — merci. Il reste la vidéo : 3 minutes, cinq questions, " +
    "une seule prise, jamais publiée. On vous les envoie. — OTEA Production"
  );
  form.setAllowResponseEdits(true);
  try {
    form.setCollectEmail(true);
  } catch (e) {
    Logger.log("Collecte des e-mails à activer à la main dans les paramètres : " + e);
  }

  function texte(titre, aide, facultatif) {
    var item = form.addTextItem().setTitle(titre).setRequired(!facultatif);
    if (aide) item.setHelpText(aide);
  }
  function paragraphe(titre, aide, facultatif) {
    var item = form.addParagraphTextItem().setTitle(titre).setRequired(!facultatif);
    if (aide) item.setHelpText(aide);
  }
  function choix(titre, options, aide) {
    var item = form.addMultipleChoiceItem().setTitle(titre).setChoiceValues(options).setRequired(true);
    if (aide) item.setHelpText(aide);
  }
  function cases(titre, options, aide) {
    var item = form.addCheckboxItem().setTitle(titre).setChoiceValues(options).showOtherOption(true).setRequired(true);
    if (aide) item.setHelpText(aide);
  }
  function page(titre, aide) {
    var item = form.addPageBreakItem().setTitle(titre);
    if (aide) item.setHelpText(aide);
  }

  // ---- Page 1 — 01 · Vous ----------------------------------------------
  // (la première page porte le titre et la description du formulaire)
  texte("Votre nom et prénom");
  texte("Le nom de votre activité, si différent", null, true);
  texte("Votre métier, en un mot ou deux",
        "Coach sportif, kiné, plombier, consultante RH, photographe, fleuriste…");
  texte("Votre téléphone",
        "Pour le point de calage et le quotidien — on travaille par WhatsApp.");
  texte("Où travaillez-vous ?",
        "Ville et rayon d'intervention — ou « en ligne ».");
  texte("Depuis quand ?", "L'année suffit.");
  choix("Seul ou en équipe ?", ["Seul(e)", "À 2 ou 3", "Plus de 3"]);
  paragraphe("Vos comptes déjà ouverts",
             "Instagram, TikTok, Facebook, LinkedIn, YouTube, Google Business… " +
             "Le @ ou le lien de chacun, même à l'abandon.");

  // ---- Page 2 — 01 · Ce que vous vendez --------------------------------
  page("01 · Ce que vous vendez",
       "Les vrais chiffres. Ils ne seront jamais publiés sans votre accord — " +
       "ils servent à écrire des contenus qui sonnent juste.");
  paragraphe("Vos prestations principales et leurs prix réels",
             "Telles que vous les vendez aujourd'hui, avec les vrais prix.");
  texte("La prestation qu'on vous demande le plus");
  texte("Celle que vous préféreriez vendre plus souvent",
        "Et si c'est un autre type de client que vous cherchez, dites-le ici aussi.");
  choix("Votre ticket moyen",
        ["Moins de 50 €", "50 à 150 €", "150 à 500 €", "500 à 2 000 €", "Plus de 2 000 €"]);
  choix("Vos clients reviennent-ils ?",
        ["Surtout de la récurrence", "Un peu des deux", "Surtout des nouveaux clients"]);
  paragraphe("Un chiffre ou un résultat dont vous êtes fier",
             "Années de métier, clients servis, un avant/après, une note Google, un record. " +
             "Ce sont eux qui ouvriront vos contenus.");

  // ---- Page 3 — 01 · Vos clients et votre cap --------------------------
  page("01 · Vos clients et votre cap", "À qui on parle, et où on va.");
  paragraphe("Décrivez votre client réel",
             "Pas l'idéal : le réel. Qui, quel besoin, qu'est-ce qui le décide à payer.");
  texte("Votre métier en une phrase, comme vous le diriez à un voisin",
        "Pas la phrase de la plaquette. C'est elle qui nourrira votre bio.");
  cases("Comment vos clients vous trouvent-ils aujourd'hui ?",
        ["Bouche-à-oreille", "Instagram ou TikTok", "Google",
         "Partenaires et prescripteurs", "Publicité", "Je ne sais pas vraiment"]);
  texte("Votre objectif à six mois, en un seul chiffre",
        "En demandes, devis ou ventes — jamais en abonnés. Ex. : « 10 demandes par mois », " +
        "« 5 nouveaux clients », « agenda plein à 3 semaines ».");
  choix("Vous engagez-vous à demander « vous m'avez trouvé comment ? » à chaque nouveau client ?",
        ["Oui, systématiquement", "J'essaierai"],
        "C'est la seule façon de mesurer ce que tout ça vous rapporte vraiment.");

  // ---- Page 4 — 03 · Vos limites ---------------------------------------
  page("03 · Vos limites",
       "La partie qui nous empêche de faire une bêtise en votre nom. " +
       "Soyez franc : rien ici ne sort d'entre nous.");
  paragraphe("Deux sujets sur lesquels vous acceptez de prendre position publiquement",
             "Quitte à ce que ça fasse débat. Ex. : « les devis gratuits tuent le métier », " +
             "« le low-cost finit toujours par coûter plus cher ».");
  paragraphe("Trois sujets sur lesquels on ne parle jamais en votre nom");
  paragraphe("Ce qu'on ne montre jamais",
             "Personnes, lieux, clients, vie privée. Votre famille ? Vos clients en séance ? " +
             "L'intérieur des maisons ? Dites tout.");
  choix("Votre communication est-elle encadrée par des règles professionnelles ?",
        ["Oui", "Non", "Je ne sais pas"],
        "Ordre professionnel, mentions obligatoires, allégations interdites (santé, droit, argent).");
  paragraphe("Si oui, lesquelles ?", null, true);
  paragraphe("Partenaires, fournisseurs, concurrents",
             "Ceux à citer (leur @ exact, ce que vous leur devez, à quelle échéance) — " +
             "et ceux qu'on ne cite jamais.", true);

  // ---- Page 5 — 04 · Votre matériel et vos créneaux --------------------
  page("04 · Votre matériel et vos créneaux",
       "Votre téléphone suffit. On vérifie juste trois choses.");
  texte("Votre téléphone (marque et modèle)");
  choix("Un micro-cravate sans fil ?",
        ["J'en ai déjà un", "Pas encore — je peux l'acheter (≈ 50 €)", "À discuter"]);
  choix("Parler face caméra ?",
        ["Ça va, je me lance", "Pas à l'aise, mais prêt(e) à essayer",
         "Je préfère filmer muet et enregistrer ma voix à part"],
        "Les trois marchent. On adapte la méthode.");
  texte("Votre créneau fixe pour filmer",
        "Un moment récurrent où vous êtes tranquille. Ex. : « mardi 13 h – 13 h 30 », " +
        "« le premier samedi du mois ».");
  texte("Vos lieux de tournage possibles",
        "Atelier, cabinet, salle, bureau, chantier, domicile, extérieur…");
  texte("Qui valide avant publication, et sous quel délai ?",
        "En général : vous, sous 48 h, par WhatsApp. Deux allers-retours max par contenu, " +
        "pour tenir le rythme.");

  Logger.log("Formulaire public : " + form.getPublishedUrl());
  Logger.log("Édition : " + form.getEditUrl());
}
