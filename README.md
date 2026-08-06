# CM-BTOC — moteur `cm-hyrox`

Moteur de community management d'OTEA Production pour les **athlètes HYROX et hybrides**.

Troisième moteur du dispositif, calqué sur la structuration de `cm-otea` :

| Moteur | Client type | Où il vit |
|---|---|---|
| `cm-otea` | Commerces premium (Le Loft, Gossip, J Lawson Golf, La Galerie Immobilière, Otea) | `~/.claude/skills/cm-otea` |
| `cm-b2c` | Personnes dont la personne est la marque : coach business, consultant, libéral, créateur | `~/.claude/skills/cm-b2c` |
| **`cm-hyrox`** | **Athlètes de course : Open, Pro, Doubles, Elite, coach-athlète** | **ce dépôt** |

## Ce que ce moteur fait différemment

Il hérite de la plomberie commune (Metricool via Zapier, Higgsfield, `reel-script`, `reel-lint`) et
de la structuration en dix étapes de `cm-otea`. Trois déplacements le distinguent :

1. **Le goulot n'est pas « le client ne tourne pas ».** Un athlète s'entraîne 5 à 6 fois par semaine,
   téléphone sur le banc. Il tourne déjà — il tourne *inutilisable*. Le moteur impose un protocole de
   tournage calé sur des séances déjà programmées, pas une demande de tournage supplémentaire.
2. **Le calendrier est nominatif, pas saisonnier.** Ce sont ses courses qui structurent l'année.
   Chaque dossard déclenche une campagne J-56 → J+7 qui produit 12 à 14 contenus.
3. **La preuve est double.** Un athlète vend du coaching *et* vend de la visibilité à des marques.
   Le reporting a deux tunnels, et il fabrique au passage le dossier de sponsoring de l'année
   suivante.

## Structure

```
CM-BTOC/
├── SKILL.md                          moteur, étapes 0 → 9
└── references/
    ├── saison-hyrox.md               calendrier 26/27, format, charges, règles, campagne de course
    ├── offre-athlete.md              paliers, options, grille de solvabilité      ⚠️ non validé
    ├── production-media.md           protocole de tournage, captation de course, droits
    ├── roi-athlete.md                reporting deux tunnels, dossier de sponsoring
    ├── playbook-athlete.md           onboarding, interdits réglementaires, qualité, délégation
    └── metricool-api.md              copie conforme, partagée avec cm-otea et cm-b2c
```

## Installation

```bash
ln -s "$(pwd)" ~/.claude/skills/cm-hyrox
```

Le skill est alors disponible sous le nom `cm-hyrox`.

## Points ouverts avant d'ouvrir l'offre

- **Aucun prix n'est validé.** `references/offre-athlete.md` porte un bandeau explicite : ne rien
  citer à un prospect tant qu'il n'est pas levé.
- **Le portefeuille est vide.** Les tables d'athlètes de `SKILL.md` et de `roi-athlete.md` se
  remplissent à la signature, jamais avant.
- **Le monteur n'est pas testé.** Le temps réel de montage d'un reel décide de la viabilité du
  palier haut.
- **`references/saison-hyrox.md` est daté du 6 août 2026.** Toutes ses données périment : le fichier
  se revérifie avant toute publication de chiffres, et se met à jour si sa date a plus de deux mois.

## Règle de cohérence entre moteurs

`references/metricool-api.md` est strictement identique dans les trois skills. Toute correction faite
d'un côté se recopie des deux autres — sinon les moteurs divergent sur la plomberie et le bug de
fuseau horaire revient par la petite porte.

Un compte présent dans le portefeuille d'un moteur ne doit jamais apparaître dans celui d'un autre.
