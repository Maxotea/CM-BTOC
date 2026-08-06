# Metricool via Zapier — manuel technique

> **Fichier partagé.** La doctrine Metricool doit rester identique entre ce moteur et
> `cm-metricool` (dépôt `CM-OTEA`). Toute correction s'applique **aux deux dépôts dans le même
> commit**. Sinon les moteurs divergent sur la plomberie — et c'est exactement ce qui s'est produit
> ci-dessous.
>
> **⚠️ Divergence constatée le 6 août 2026, à résoudre.** L'étape 6 de
> `CM-OTEA/.claude/skills/cm-metricool/SKILL.md` affirme encore que « l'API exige une URL publique
> pour les médias — les photos locales du client ne peuvent pas être attachées par l'API ».
> **C'est faux depuis le 23/07/2026** : la méthode d'upload ci-dessous a été employée avec succès
> sur 11 posts de Pierre Huiban (11/11 avec vraie photo, 0 sans média). Le fichier maître doit être
> corrigé — tant qu'il ne l'est pas, `cm-metricool` produit des brouillons manuels sans raison.

Tout passe par Zapier. Toujours appeler `Zapier:list_enabled_zapier_actions` en premier : les
actions activées changent, et deviner un nom d'action fait perdre un aller-retour.

## Actions utilisées

| Action | Usage |
|---|---|
| `code_action_metricoolcliapi__list_brands_direct` | Récupérer les blogId à jour |
| `code_action_metricoolcliapi__bulk_schedule_posts` | **Créer un calendrier — méthode par défaut dès 3 posts** |
| `code_action_metricoolcliapi__bulk_schedule_stories` | Créer une série de stories |
| `schedule_post` | Créer un post unitaire, et **le seul moyen d'attacher des médias** |
| `code_action_metricoolcliapi__list_scheduled_posts` | Vérifier ce qui est planifié |
| `code_action_metricoolcliapi__bulk_update_post_times` | Corriger les horaires |
| `code_action_metricoolcliapi__bulk_set_draft` | Re-verrouiller en brouillon |

## Attacher une photo locale — la méthode qui marche

C'est le point qui change tout, et il est contre-intuitif : **une photo locale n'a pas besoin d'être
hébergée publiquement quelque part.** Elle s'envoie à Metricool, qui renvoie une URL CloudFront
utilisable directement.

```
1. redimensionner la photo à 1440 px de large
2. media_upload      → obtient une URL de dépôt signée
3. PUT               → dépose le fichier sur cette URL
4. media_confirm     → Metricool valide et renvoie une URL cloudfront
5. schedule_post     → media01 = <URL cloudfront>
```

Post complet, planifié, sans que personne n'ouvre Metricool. **C'est le mode nominal.**

Le mode brouillon manuel (`draft: true`, `autoPublish: false`) ne subsiste que dans deux cas :
la légende contient des placeholders à compléter, ou le média n'existe pas encore.

## Créer un calendrier — `bulk_schedule_posts`

Méthode par défaut dès 3 posts.

```
blog_id, posts = chaîne JSON
[{"date_time":"YYYY-MM-DDTHH:mm:ss","text":"...","type":"POST|REEL"}]
```

- Crée directement en brouillon (`draft: true`, `autoPublish: false`)
- Fuseau **Europe/Paris natif — pas de bug horaire**
- **Ne gère pas les médias.** Un post avec média passe forcément par `schedule_post`

## Carrousels

Un carrousel = **un seul appel `schedule_post`** avec les slides dans `media01` … `media08`,
**dans l'ordre** — l'ordre des paramètres est l'ordre d'affichage.

`bulk_schedule_posts` ne convient pas (pas de médias). Penser à **supprimer le post feed déjà
planifié** ce jour-là si le carrousel le remplace.

## Le bug de fuseau horaire — `schedule_post` uniquement

`schedule_post` décale les heures de plusieurs heures (constaté : +7 h). `bulk_schedule_posts` n'a
pas ce défaut. Séquence de rattrapage, dans cet ordre exact :

1. `list_scheduled_posts` (blogId, start, end) → relever les horaires réels et les post_id
2. `bulk_update_post_times` — `updates` est une **chaîne JSON**, pas un objet :
   `[{"post_id":123,"date_time":"2026-09-14T18:00:00"}]`, en heure de Paris
3. **La correction fait sauter le statut brouillon.** Si les posts devaient rester en brouillon,
   enchaîner immédiatement `bulk_set_draft` — `post_ids` est aussi une chaîne JSON : `[123,456]`
4. Les post_id changent après correction : ne jamais réutiliser une liste d'IDs relevée avant

Sauter l'étape 3 publie des brouillons. C'est l'incident le plus coûteux du système.

## Éditer un post existant

Le texte d'un post planifié n'est pas modifiable directement.

- **Changer le texte** → supprimer et recréer
- **Changer la date ou le statut** → `bulk_update_post_times` puis `bulk_set_draft`

## Horaires par défaut

Les horaires ne sont pas une constante du moteur : ils se règlent **par athlète**, sur ses stats
réelles au bout de deux mois. Repères de départ, heure de Paris :

| Type | Athlète (défaut moteur) | Commerce (`cm-metricool`) |
|---|---|---|
| Reel | 6 h 45 ou 12 h 15 | 9 h 00 ou 12 h 00 |
| Post feed | 20 h 30 | 18 h 00 |
| Story | au fil de la journée | idem |

Une audience de pratiquants consulte avant la séance du matin et après celle du soir. **Un athlète
déjà installé peut avoir de meilleurs créneaux que ces valeurs par défaut** — Pierre Huiban publie à
00 h 30 et 06 h 00, des horaires atypiques mais qui sont les siens : ne pas les écraser sans données.

Format de date attendu : `YYYY-MM-DDTHH:mm:ss`.

## Réflexe de fin de session

Après toute création de posts, sans exception : `list_scheduled_posts` sur la période concernée, et
comparer avec ce qui était prévu. **Un post créé n'est pas un post vérifié.**
