# OTEA · HYROX pour Lightroom Classic

Module externe qui classe les photos de course et applique ta retouche de
référence, directement dans ton catalogue, sur ton Mac.

Pourquoi un module et pas un classement fait à distance : Lightroom cloud se
lit depuis l'extérieur (recherche, aperçus) mais ne s'écrit pas. Impossible de
créer un album, de déplacer une photo ou d'appliquer une retouche sans passer
par l'application. Le module fait donc le travail là où il est possible : dans
Lightroom Classic, sur le catalogue complet.

## Ce qu'il fait

**Classer les photos HYROX** (menu Bibliothèque > Modules externes)

1. Rattache chaque photo à une ville par sa géolocalisation : Rome, Toulouse,
   Lyon, Nice, Poznan, Paris, Bordeaux (et Marseille, Stockholm). Si la photo
   n'a pas de GPS, la date de prise de vue est comparée au calendrier des
   courses.
2. Découpe par course : deux séries dans la même ville à plus de 7 jours
   d'écart donnent deux courses. Chaque course devient un jeu de collections
   nommé « Ville AAAA-MM-JJ ».
3. Range par athlète à partir des visages nommés dans Lightroom (vue
   Personnes) ou des mots-clés : une collection « Pierre Huiban », une
   « Antoine », et une collection **« Doubles · Pierre Huiban + Antoine »**
   dès que les deux sont sur la même photo. Les photos sans athlète reconnu
   vont dans « À identifier ».
4. Écrit un rapport CSV sur le Bureau : une ligne par photo, avec la ville, la
   source (GPS ou date), la course, les athlètes et le sous-groupe.

Résultat dans le panneau Collections :

```
HYROX
├── Rome 2026-09-24
│   ├── Toutes
│   ├── Pierre Huiban
│   ├── Antoine
│   ├── Doubles · Pierre Huiban + Antoine
│   └── À identifier
├── Bordeaux 2026-09-30
│   └── ...
└── À situer (ni GPS ni date de course)
```

Les photos restent dans leurs dossiers d'origine : une collection est un
classement, pas un déplacement de fichiers.

**Appliquer le style de retouche** (même menu)

1. Tu sélectionnes la photo que tu as déjà retouchée à la main : elle sert de
   référence. Ou tu choisis un preset dans la liste.
2. Le module copie ses réglages (profil, courbe, couleurs, netteté, grain,
   vignettage...) sur les photos exploitables du jeu « HYROX », ou sur la
   sélection en cours.
3. Ne sont jamais copiés : le recadrage, les masques locaux, les retouches de
   zone, la correction de perspective. Par défaut, l'exposition et la balance
   des blancs de chaque photo sont conservées (option décochable).
4. Chaque photo traitée reçoit le mot-clé « OTEA style appliqué » et entre
   dans la collection « Retouchées (style OTEA) ». Relancer le module ne
   repasse pas dessus. L'historique de développement garde l'étape, donc un
   retour en arrière reste possible photo par photo.

Photo « exploitable » pour le module : pas une vidéo, pas rejetée (drapeau X),
note au moins égale au minimum choisi. Lightroom ne sait pas juger la netteté
ou le cadrage : si tu veux filtrer plus fin, passe d'abord un coup de drapeau X
sur les ratés, ou mets une étoile sur les bonnes et choisis « 1 étoile et
plus ».

## Installation (une fois)

1. Copie le dossier `OTEA-Hyrox.lrplugin` quelque part de stable, par exemple
   `~/Documents/Lightroom/Modules/`.
2. Dans Lightroom Classic : Fichier > Gestionnaire de modules externes >
   Ajouter > choisis le dossier `OTEA-Hyrox.lrplugin` > Terminé.
3. Les deux commandes apparaissent dans Bibliothèque > Modules externes et
   dans Fichier > Modules externes.

## Avant de lancer

- **Visages.** Dans la vue Personnes de Lightroom (touche O), nomme Pierre et
  Antoine une fois chacun, puis confirme les propositions. Les noms que tu
  donnes doivent figurer dans `Config.lua`, section `athletes` (« Pierre
  Huiban », « Pierre », « Antoine » y sont déjà). Sans ça, tout part dans
  « À identifier » et il n'y a pas de dossier Doubles.
- **GPS.** Un Sony n'enregistre la position que si l'application mobile
  Imaging Edge (lien de position) était active. Pour les séries sans GPS, le
  calendrier `datesCourses` de `Config.lua` prend le relais : ajoute une ligne
  par course passée (Toulouse, Lyon, Poznan...) avec ses dates, et relance.
  Autre solution : sélectionner les photos d'une course et poser le mot-clé
  « HYROX » plus la ville dans la vue Carte (glisser les photos sur la carte
  écrit le GPS).
- **Sauvegarde.** Le module ne touche pas aux fichiers, mais une sauvegarde du
  catalogue avant un passage sur 18 000 photos reste une bonne habitude.

## Utilisation conseillée

1. Lancer « Classer les photos HYROX » sur tout le catalogue, rapport activé.
2. Ouvrir le CSV, vérifier les courses trouvées et le nombre de photos « À
   situer ». Compléter `Config.lua` si une course manque, recharger le module
   (Gestionnaire de modules externes > Recharger), relancer.
3. Dans chaque course, parcourir « À identifier » et nommer les visages
   manquants, relancer le classement : les photos basculent dans la bonne
   collection.
4. Sélectionner la photo retouchée de référence, lancer « Appliquer le style
   de retouche », portée « Toutes les collections du jeu HYROX ».
5. Relire la collection « Retouchées (style OTEA) » en mode Développement et
   corriger l'exposition au cas par cas.

## Si tu es sur Lightroom (version cloud) et non Classic

Lightroom cloud n'accepte aucun module externe. Le même résultat se fait à la
main, en trois filtres :

- **Par course :** barre de filtres > Lieu (si les photos ont un GPS), ou
  recherche par mot-clé de ville, puis « Créer un album » avec la sélection.
- **Par athlète :** vue Personnes, cliquer sur Pierre, puis Antoine. Les
  photos qui apparaissent dans les deux sont les doubles : sélectionner, album
  « Doubles ».
- **Retouche :** sur la photo de référence, Réglages > Copier les réglages
  (décocher Recadrage, Masques, Géométrie), sélectionner les photos cibles,
  Coller les réglages.

Si tu veux l'automatisation complète côté cloud, elle passe par l'API
Lightroom d'Adobe, qui demande une clé développeur sur ton compte : à prévoir
dans une session dédiée.

## Fichiers

| Fichier | Rôle |
|---|---|
| `OTEA-Hyrox.lrplugin/Info.lua` | déclaration du module et des deux menus |
| `OTEA-Hyrox.lrplugin/Config.lua` | villes, calendrier des courses, athlètes, mots-clés : le seul fichier à modifier |
| `OTEA-Hyrox.lrplugin/Classer.lua` | classement par course, athlète, doubles, rapport CSV |
| `OTEA-Hyrox.lrplugin/Retoucher.lua` | copie du style de retouche sur les photos exploitables |
| `OTEA-Hyrox.lrplugin/Util.lua` | fonctions communes (distance GPS, dates, mots-clés) |
