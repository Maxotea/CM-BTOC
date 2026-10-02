-- Réglages du module OTEA · HYROX. Tout ce qui se modifie à la main est ici.
-- Après une modification : Fichier > Gestionnaire de modules externes > Recharger.

return {
  -- Nom du jeu de collections créé à la racine du catalogue
  nomJeuRacine = 'HYROX',

  -- Une photo est rattachée à une ville si son GPS est à moins de ce rayon (km)
  rayonKm = 40,

  -- Tolérance autour des dates de course (en jours) : la veille et le lendemain
  -- comptent encore pour la course (arrivée, brief, départ)
  margeJours = 1,

  -- Deux photos de la même ville séparées de plus de N jours sont deux courses
  ecartJoursMemeCourse = 7,

  -- Villes HYROX reconnues par géolocalisation (centre-ville, le rayon fait le reste)
  villes = {
    { nom = 'Rome',      lat = 41.9028, lon = 12.4964 },
    { nom = 'Toulouse',  lat = 43.6047, lon = 1.4442 },
    { nom = 'Lyon',      lat = 45.7640, lon = 4.8357 },
    { nom = 'Nice',      lat = 43.7102, lon = 7.2620 },
    { nom = 'Poznan',    lat = 52.4064, lon = 16.9252 },
    { nom = 'Paris',     lat = 48.8566, lon = 2.3522 },
    { nom = 'Bordeaux',  lat = 44.8378, lon = -0.5792 },
    { nom = 'Marseille', lat = 43.2965, lon = 5.3698 },
    { nom = 'Stockholm', lat = 59.3293, lon = 18.0686 },
  },

  -- Secours quand la photo n'a pas de GPS : la date de prise de vue suffit.
  -- Dates vérifiées le 6 août 2026 (references/saison-hyrox.md). À compléter
  -- avec les courses passées (Toulouse, Lyon, Poznan...) : une ligne par course.
  datesCourses = {
    { ville = 'Stockholm', debut = '2026-06-18', fin = '2026-06-21' },
    { ville = 'Rome',      debut = '2026-09-24', fin = '2026-09-27' },
    { ville = 'Bordeaux',  debut = '2026-09-30', fin = '2026-10-04' },
    { ville = 'Nice',      debut = '2026-10-29', fin = '2026-11-01' },
    { ville = 'Paris',     debut = '2026-12-12', fin = '2026-12-20' },
  },

  -- Athlètes reconnus par leurs mots-clés (les visages nommés dans la vue
  -- Personnes de Lightroom deviennent des mots-clés : il suffit que le nom
  -- donné au visage figure dans cette liste). Deux athlètes sur la même photo
  -- donnent une collection « Doubles ».
  athletes = {
    { nom = 'Pierre Huiban', motsCles = { 'Pierre Huiban', 'Pierre', 'pierrehuiban89' } },
    { nom = 'Antoine',       motsCles = { 'Antoine' } },
  },

  -- Mot-clé qui force une photo dans HYROX même sans GPS ni date connue
  motCleHyrox = 'HYROX',

  -- Mot-clé posé sur chaque photo retouchée par le module (évite de repasser dessus)
  motCleStyle = 'OTEA style appliqué',

  -- Jeu de collections pour les photos hors HYROX (option de la boîte de dialogue)
  nomCollectionAutres = 'Autres séances',
}
