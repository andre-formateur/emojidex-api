# Emojidex — Projet final

**Emojidex** est une application de collection d'emojis : vous jouez à pierre-feuille-ciseaux contre l'API pour gagner des crédits, vous achetez des boosters, et vous les ouvrez pour compléter votre collection de **80 emojis**.

Ce dossier contient l'**API** du projet. Votre travail : créer le **front** (HTML, CSS, JavaScript) qui l'utilise.

## Démarrage rapide

Prérequis : [Node.js](https://nodejs.org/) en version LTS.

```bash
npm install
npm start
```

L'API répond sur `http://localhost:3000`. Compte de démonstration : `demo@emojidex.fr` / `demo1234`.

## Documentation

| Document | Contenu |
|---|---|
| 📋 [**Énoncé du projet**](./docs/enonce.md) | Ce que vous devez réaliser : règles du jeu, pages, contraintes techniques, user stories et fonctionnalités attendues |
| ⚙️ [**Fonctionnement de l'API**](./docs/fonctionnement_api.md) | Comment utiliser l'API : jeton, routes, données envoyées et reçues, messages d'erreur |

Commencez par l'**énoncé**, puis gardez le **fonctionnement de l'API** ouvert pendant que vous codez.

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `docs/` | La documentation du projet |
| `requests.http` | Une requête prête à l'emploi par route, à lancer avec l'extension REST Client de VS Code |
| `src/` | Le code de l'API (vous n'avez pas à le modifier) |
| `data/` | Les données, enregistrées dans des fichiers JSON |
