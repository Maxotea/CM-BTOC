# Metricool via Zapier — manuel technique

Tout passe par Zapier. Toujours appeler `Zapier:list_enabled_zapier_actions` en premier : les
actions activées changent, et deviner un nom d'action fait perdre un aller-retour.

## Actions utilisées

| Action | Usage | Paramètres |
|---|---|---|
| `code_action_metricoolcliapi__list_brands_direct` | Récupérer les blogId à jour | — |
| `schedule_post` | Créer un post | blogId, réseaux (booléens), type, texte, date, media, draft, autoPublish |
| `code_action_metricoolcliapi__list_scheduled_posts` | Vérifier ce qui est planifié | blogId, start, end |
| `code_action_metricoolcliapi__bulk_update_post_times` | Corriger les horaires | blog_id, updates (chaîne JSON) |
| `code_action_metricoolcliapi__bulk_set_draft` | Re-verrouiller en brouillon | blog_id, post_ids (chaîne JSON) |

## Le point qui décide de tout : l'URL du média

L'API n'accepte un média que s'il est accessible par une URL publique. C'est de là que découlent
les deux modes de fonctionnement :

**Mode nominal — média avec URL publique**
```
schedule_post : draft = false, autoPublish = true, media = <URL publique>
```
Le post est planifié complet. Personne n'ouvre Metricool. C'est le mode qui doit couvrir la quasi-
totalité des publications une fois la banque du client publiée.

**Mode dégradé — pas d'URL publique, ou légende avec placeholders**
```
schedule_post : draft = true, autoPublish = false
```
Puis lister à Maxime le fichier exact à attacher et les placeholders à compléter. Chaque post en
mode dégradé coûte quelques minutes de manipulation manuelle : si un client y passe régulièrement,
le problème est sa banque photos, pas la publication.

Si Zapier renvoie une `followUpQuestion` réclamant des URLs de médias, ré-exécuter en précisant
dans `instructions` que le brouillon est volontairement créé sans média.

## Le bug de fuseau horaire

`schedule_post` décale les heures de plusieurs heures. La séquence de rattrapage, dans cet ordre
exact :

1. `list_scheduled_posts` (blogId, start, end) → relever les horaires réels et les post_id
2. `bulk_update_post_times` — `updates` est une **chaîne JSON**, pas un objet :
   `[{"post_id":123,"date_time":"2026-09-14T18:00:00"}]`, en heure de Paris
3. **La correction fait sauter le statut brouillon.** Si les posts devaient rester en brouillon,
   enchaîner immédiatement `bulk_set_draft` — `post_ids` est aussi une chaîne JSON : `[123,456]`
4. Les post_id changent après correction : ne jamais réutiliser une liste d'IDs relevée avant

Sauter l'étape 3 publie des brouillons. C'est l'incident le plus coûteux du système.

## Éditer un post existant

Le texte d'un post planifié n'est pas modifiable directement. Deux voies :

- **Changer le texte** → supprimer et recréer via `schedule_post`
- **Changer la date ou le statut** → `bulk_update_post_times` puis `bulk_set_draft`

## Horaires par défaut (heure de Paris)

| Type | Heure |
|---|---|
| Reel | 9 h 00 ou 12 h 00 |
| Post feed | 18 h 00 |
| Story | au fil de la journée, non planifié par l'API |

Format de date attendu : `YYYY-MM-DDTHH:mm:ss`.

## Réflexe de fin de session

Après toute création de posts, sans exception : `list_scheduled_posts` sur la période concernée, et
comparer avec ce qui était prévu. Un post créé n'est pas un post vérifié.
