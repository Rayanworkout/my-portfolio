# rayan.world

Portfolio et blog personnel dans un seul site statique Astro. Le site professionnel Flowshift reste dans `site/` et se déploie séparément.

Prévoir Node.js 22.23.4 ou une version plus récente.

## Développement

```sh
npm ci
npm run dev
```

## Build et contrôles

```sh
npm test
```

La commande construit le site dans `dist/`, puis vérifie les articles migrés, les projets, les routes, les liens internes, les ancres, les images, les titres et le sitemap. `npm run build` construit sans lancer les contrôles. Astro génère des pages HTML statiques et optimise les images des projets en WebP.

Pour ajouter un article, créer un fichier `src/content/blog/AAAA-MM-JJ-slug.md` avec `title` et `tags` dans le front matter. La langue par défaut est l’anglais ; ajouter `lang: fr` pour un article en français. Les pages d’article suivent le chemin `/blog/AAAA/MM/JJ/slug/`. Les tags alimentent automatiquement les pages de catégories.

Pour ajouter un projet, ajouter un objet à `src/data/projects.json`. Tous les projets apparaissent dans le carrousel de l’accueil ; leurs `keywords` alimentent automatiquement les filtres. Un projet peut utiliser `image` (nom d’un fichier de `src/assets/projects/`, sans extension) ou `visual` (mots affichés sur une carte graphique). Les liens sont facultatifs. Les bulles de compétences se modifient dans `src/data/skills.json`.

## Déploiement

- Servir `dist/` à la racine de `https://rayan.world` ; `wrangler.jsonc` est prêt pour Cloudflare Workers Assets.
- Activer HTTPS et configurer l’hébergeur pour servir `404.html` avec le statut HTTP 404.
portpor- Mettre en place une redirection permanente de l’ancien `blog.rayan.world/AAAA/MM/JJ/slug/` vers `rayan.world/blog/AAAA/MM/JJ/slug/`.
- Garder `site/` sur `flowshift.fr` ; son blog professionnel conserve ses propres contenus et URLs.

Le site personnel ne requiert aucun serveur applicatif. Un court script gère les filtres et les commandes du carrousel ; tous les projets restent accessibles par défilement sans JavaScript. Les fontes sont hébergées avec le site ; leurs licences OFL sont dans `public/fonts/`.
