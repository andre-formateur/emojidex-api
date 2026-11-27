# API Emojidex — Documentation

Cette API fait tourner le jeu **Emojidex** : vous jouez à pierre-feuille-ciseaux contre l'API pour gagner des crédits, vous achetez des boosters avec ces crédits, et vous les ouvrez pour compléter votre collection de **80 emojis**.

Votre travail consiste à créer le **front** (HTML, CSS, JavaScript) qui utilise cette API. Vous n'avez **pas à modifier** le code de l'API. Ce qui est attendu est décrit dans l'[énoncé du projet](./enonce.md).

---

## Sommaire

1. [Installation et lancement](#1-installation-et-lancement)
2. [Comptes de démonstration](#2-comptes-de-démonstration)
3. [Les règles du jeu](#3-les-règles-du-jeu)
4. [Ce qu'il faut savoir avant de commencer](#4-ce-quil-faut-savoir-avant-de-commencer)
5. [Liste des routes](#5-liste-des-routes)
6. [Détail des routes](#6-détail-des-routes)
7. [Les erreurs](#7-les-erreurs)
8. [Tester les cas d'erreur](#8-tester-les-cas-derreur)

---

## 1. Installation et lancement

Prérequis : [Node.js](https://nodejs.org/) en version **LTS** (22 ou plus).

Dans le dossier `api/` :

```bash
npm install
npm start
```

L'API répond sur **`http://localhost:3000`**.

Laissez ce terminal ouvert pendant que vous travaillez : chaque requête reçue y est affichée avec son code de réponse, ce qui aide beaucoup à comprendre ce qui se passe.

```
POST /auth/login -> 200
GET /emojis?type=animaux -> 200
POST /boosters -> 400
```

| Commande | Rôle |
|---|---|
| `npm start` | Démarre l'API |
| `npm run reset` | Remet les données de départ (comptes de démonstration) et **déconnecte tout le monde** |

Il n'y a **pas de base de données** : toutes les données sont enregistrées dans des fichiers JSON du dossier `data/`. Il n'y a ni variable d'environnement ni clé secrète à configurer.

Le fichier **`requests.http`** contient une requête prête à l'emploi pour chaque route : ouvrez-le dans VS Code avec l'extension **REST Client** pour tester l'API **avant** d'écrire votre JavaScript.

---

## 2. Comptes de démonstration

| Pseudo | E-mail | Mot de passe | Situation de départ |
|---|---|---|---|
| Camille | `demo@emojidex.fr` | `demo1234` | 12,3 crédits, 26 emojis, 1 booster à ouvrir |
| Lucas | `lucas@emojidex.fr` | `lucas1234` | 5 crédits, 5 emojis, aucun booster |

Vous pouvez aussi créer vos propres comptes. `npm run reset` les supprime.

---

## 3. Les règles du jeu

| Règle | Valeur |
|---|---|
| Crédits offerts à l'inscription | **5** |
| Victoire à pierre-feuille-ciseaux | **+1 crédit** |
| Égalité ou défaite | rien (on ne perd jamais de crédits en jouant) |
| Prix d'un booster | **5 crédits** |
| Contenu d'un booster | **5 emojis** tirés au hasard |
| Doublon (emoji déjà possédé) | converti en **0,1 crédit** |

Le catalogue contient **80 emojis**, répartis en **8 types** et **4 raretés**. Pour chaque emoji tiré dans un booster, les chances sont :

| Rareté | Chance |
|---|---|
| Commune | 60 % |
| Rare | 28 % |
| Épique | 10 % |
| Légendaire | 2 % |

C'est **l'API** qui fait tous les calculs : elle choisit son coup, tire les emojis, ajoute et retire les crédits. Le front se contente d'envoyer les demandes et d'afficher les réponses.

---

## 4. Ce qu'il faut savoir avant de commencer

### Le format des échanges

- L'API reçoit et renvoie du **JSON**.
- Quand vous envoyez un corps de requête, ajoutez l'en-tête `Content-Type: application/json`.
- Les dates sont au format ISO : `"2026-11-26T17:00:00.000Z"`. Passez-les à `new Date()` pour les afficher.

### Les crédits ont une décimale

À cause des doublons (0,1 crédit), les crédits peuvent valoir par exemple `12.3`. L'API renvoie un **nombre** avec un point ; c'est à vous de l'afficher à la française (« 12,3 »).

### Le jeton (token)

La plupart des routes sont réservées aux utilisateurs connectés (🔒 dans ce document).

1. Vous vous inscrivez (`POST /auth/register`) ou vous vous connectez (`POST /auth/login`).
2. L'API vous renvoie un **jeton** (`token`), valable **24 heures** (date de fin dans `expiresAt`).
3. Vous conservez ce jeton (dans le `localStorage`, par exemple).
4. Pour chaque route 🔒, vous l'envoyez dans l'en-tête `Authorization` :

```
Authorization: Bearer 3f9a1c...votre jeton...
```

Le mot `Bearer`, puis **une espace**, puis le jeton.

Sans jeton, ou avec un jeton invalide ou expiré, l'API répond **401**.

### Les identifiants (`slug`)

Les types et les raretés ont un **slug**, un identifiant sans accent ni majuscule (`activites`, `epique`), et un **label**, le texte à afficher (`Activités`, `Épique`). Envoyez toujours le slug à l'API, affichez le label.

| Types (`slug`) | Raretés (`slug`) |
|---|---|
| `visages`, `animaux`, `nourriture`, `nature`, `objets`, `activites`, `voyages`, `symboles` | `commune`, `rare`, `epique`, `legendaire` |

---

## 5. Liste des routes

| Méthode | URL | 🔒 | Rôle |
|---|---|---|---|
| POST | `/auth/register` | | Créer un compte |
| POST | `/auth/login` | | Se connecter |
| GET | `/auth/me` | 🔒 | Profil de l'utilisateur connecté (crédits, progression, boosters à ouvrir) |
| POST | `/auth/logout` | 🔒 | Se déconnecter |
| GET | `/types` | | Liste des 8 types d'emojis |
| GET | `/rarities` | | Liste des 4 raretés et de leurs chances |
| GET | `/emojis` | 🔒 | Le catalogue des 80 emojis, avec ceux que vous possédez (filtres possibles) |
| POST | `/game/play` | 🔒 | Jouer une partie de pierre-feuille-ciseaux |
| GET | `/boosters` | 🔒 | Vos boosters pas encore ouverts |
| POST | `/boosters` | 🔒 | Acheter un booster (5 crédits) |
| POST | `/boosters/:id/open` | 🔒 | Ouvrir un de vos boosters |

---

## 6. Détail des routes

Pour chaque route : ce qu'il faut envoyer, ce que l'API renvoie quand tout va bien, puis les erreurs possibles avec leur message exact.

### Authentification

#### `POST /auth/register` — Créer un compte

**Corps à envoyer**

```json
{
  "username": "Alex",
  "email": "alex@emojidex.fr",
  "password": "secret1"
}
```

| Champ | Règle |
|---|---|
| `username` | de 2 à 20 caractères, unique (sans tenir compte des majuscules) |
| `email` | adresse e-mail valide, unique |
| `password` | 6 caractères minimum |

**Réponse : `201 Created`**

Le compte est créé **et** l'utilisateur est directement connecté : la réponse contient déjà un jeton.

```json
{
  "token": "3f9a1c0e7b...",
  "expiresAt": "2026-11-28T10:00:00.000Z",
  "user": {
    "id": 3,
    "username": "Alex",
    "email": "alex@emojidex.fr",
    "credits": 5,
    "collectionCount": 0,
    "collectionTotal": 80,
    "unopenedBoosters": 0
  }
}
```

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 400 | Un ou plusieurs messages à la suite, par exemple : « Le pseudo doit contenir de 2 à 20 caractères. L'adresse e-mail n'est pas valide. Le mot de passe doit contenir au moins 6 caractères. » |
| 409 | « Un compte existe déjà avec cet e-mail. » |
| 409 | « Ce pseudo est déjà utilisé. » |

---

#### `POST /auth/login` — Se connecter

**Corps à envoyer**

```json
{
  "email": "demo@emojidex.fr",
  "password": "demo1234"
}
```

**Réponse : `200 OK`**

Même format que l'inscription : `token`, `expiresAt` et `user` (le profil).

```json
{
  "token": "a81d44f2c9...",
  "expiresAt": "2026-11-28T10:00:00.000Z",
  "user": {
    "id": 1,
    "username": "Camille",
    "email": "demo@emojidex.fr",
    "credits": 12.3,
    "collectionCount": 26,
    "collectionTotal": 80,
    "unopenedBoosters": 1
  }
}
```

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 400 | « L'e-mail est obligatoire. » / « Le mot de passe est obligatoire. » |
| 401 | « E-mail ou mot de passe incorrect. » |

---

#### `GET /auth/me` 🔒 — Profil de l'utilisateur connecté

Pas de corps. Utile au chargement de chaque page pour **vérifier que le jeton est encore valable** et afficher des informations **à jour** (crédits, progression, boosters à ouvrir).

**Réponse : `200 OK`**

```json
{
  "id": 1,
  "username": "Camille",
  "email": "demo@emojidex.fr",
  "credits": 12.3,
  "collectionCount": 26,
  "collectionTotal": 80,
  "unopenedBoosters": 1
}
```

| Champ | Signification |
|---|---|
| `credits` | crédits disponibles (peut avoir une décimale) |
| `collectionCount` | nombre d'emojis différents possédés |
| `collectionTotal` | nombre d'emojis dans le catalogue (80) |
| `unopenedBoosters` | nombre de boosters achetés mais pas encore ouverts |

**Erreurs** : 401 (voir [Les erreurs](#7-les-erreurs)).

---

#### `POST /auth/logout` 🔒 — Se déconnecter

Pas de corps. Le jeton envoyé n'est plus valable ensuite.

**Réponse : `204 No Content`**

⚠️ Une réponse 204 n'a **pas de corps** : n'appelez pas `response.json()` dessus, cela déclencherait une erreur.

**Erreurs** : 401.

---

### Catalogue (routes publiques)

Ces deux routes ne demandent pas de jeton.

#### `GET /types` — Les types d'emojis

**Réponse : `200 OK`**

```json
[
  { "slug": "visages", "label": "Visages" },
  { "slug": "animaux", "label": "Animaux" },
  { "slug": "nourriture", "label": "Nourriture" },
  { "slug": "nature", "label": "Nature" },
  { "slug": "objets", "label": "Objets" },
  { "slug": "activites", "label": "Activités" },
  { "slug": "voyages", "label": "Voyages" },
  { "slug": "symboles", "label": "Symboles" }
]
```

#### `GET /rarities` — Les raretés

`chance` est le pourcentage de chance d'obtenir cette rareté pour chaque emoji tiré.

**Réponse : `200 OK`**

```json
[
  { "slug": "commune", "label": "Commune", "chance": 60 },
  { "slug": "rare", "label": "Rare", "chance": 28 },
  { "slug": "epique", "label": "Épique", "chance": 10 },
  { "slug": "legendaire", "label": "Légendaire", "chance": 2 }
]
```

---

### Collection

#### `GET /emojis` 🔒 — Le catalogue et votre collection

Renvoie les **80 emojis** du catalogue. Le champ `owned` indique si l'utilisateur connecté possède l'emoji.

**Filtres (facultatifs et combinables)**, à passer dans l'URL :

| Paramètre | Valeurs possibles | Par défaut |
|---|---|---|
| `type` | `tous` ou un slug de type | `tous` |
| `rarity` | `tous` ou un slug de rareté | `tous` |
| `owned` | `tous`, `true` (obtenus) ou `false` (manquants) | `tous` |

Exemples :

```
GET /emojis
GET /emojis?type=animaux
GET /emojis?type=animaux&rarity=rare&owned=false
```

**Réponse : `200 OK`**, un tableau d'emojis (vide si aucun emoji ne correspond aux filtres) :

```json
[
  {
    "id": 1,
    "char": "😀",
    "name": "Grand sourire",
    "type": "visages",
    "rarity": "commune",
    "owned": true,
    "obtainedAt": "2026-11-20T14:12:00.000Z"
  },
  {
    "id": 10,
    "char": "🤖",
    "name": "Robot",
    "type": "visages",
    "rarity": "legendaire",
    "owned": false,
    "obtainedAt": null
  }
]
```

| Champ | Signification |
|---|---|
| `char` | l'emoji lui-même, à afficher comme du texte |
| `name` | son nom |
| `type`, `rarity` | slugs du type et de la rareté |
| `owned` | `true` si l'utilisateur possède cet emoji |
| `obtainedAt` | date d'obtention, ou `null` si l'emoji n'est pas possédé |

⚠️ L'API renvoie aussi le `char` et le `name` des emojis **non possédés** : c'est au front de les **cacher** (voir l'[énoncé du projet](./enonce.md), US4).

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 400 | « Filtre « type » invalide. Valeurs possibles : tous, visages, animaux, … » |
| 400 | « Filtre « rarity » invalide. Valeurs possibles : tous, commune, rare, epique, legendaire. » |
| 400 | « Filtre « owned » invalide. Valeurs possibles : tous, true, false. » |
| 401 | voir [Les erreurs](#7-les-erreurs) |

---

### Jeu

#### `POST /game/play` 🔒 — Jouer une partie

Vous envoyez votre coup ; l'API choisit le sien au hasard, détermine le résultat et ajoute le crédit en cas de victoire.

**Corps à envoyer**

```json
{ "move": "pierre" }
```

`move` vaut `pierre`, `feuille` ou `ciseaux`.

**Réponse : `200 OK`**

```json
{
  "playerMove": "pierre",
  "apiMove": "ciseaux",
  "result": "victoire",
  "creditsWon": 1,
  "credits": 13.3
}
```

| Champ | Signification |
|---|---|
| `playerMove` | votre coup |
| `apiMove` | le coup choisi par l'API |
| `result` | `victoire`, `egalite` ou `defaite` (sans accent) |
| `creditsWon` | crédits gagnés pendant cette partie (`1` ou `0`) |
| `credits` | vos crédits **après** la partie |

L'API ne garde **pas** l'historique des parties : un compteur de victoires, d'égalités et de défaites est à gérer côté front.

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 400 | « Le coup doit valoir : pierre, feuille, ciseaux. » |
| 401 | voir [Les erreurs](#7-les-erreurs) |

---

### Boosters

Un booster est d'abord **acheté** (il apparaît dans `GET /boosters`), puis **ouvert** (il disparaît de cette liste et ses 5 emojis rejoignent la collection).

#### `GET /boosters` 🔒 — Vos boosters non ouverts

**Réponse : `200 OK`**, un tableau trié du plus ancien au plus récent (vide si aucun booster à ouvrir) :

```json
[
  { "id": 2, "boughtAt": "2026-11-26T17:00:00.000Z", "openedAt": null },
  { "id": 5, "boughtAt": "2026-11-27T09:30:00.000Z", "openedAt": null }
]
```

**Erreurs** : 401.

---

#### `POST /boosters` 🔒 — Acheter un booster

Pas de corps. Retire 5 crédits et crée un booster non ouvert.

**Réponse : `201 Created`**

```json
{
  "booster": { "id": 6, "boughtAt": "2026-11-27T10:00:00.000Z", "openedAt": null },
  "credits": 8.3
}
```

`credits` : vos crédits **après** l'achat.

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 400 | « Crédits insuffisants : un booster coûte 5 crédits, vous en avez 4,7. » |
| 401 | voir [Les erreurs](#7-les-erreurs) |

---

#### `POST /boosters/:id/open` 🔒 — Ouvrir un booster

Pas de corps. Remplacez `:id` par l'`id` du booster, par exemple `POST /boosters/2/open`.

L'API tire 5 emojis, ajoute les nouveaux à la collection et convertit chaque doublon en 0,1 crédit.

**Réponse : `200 OK`**

```json
{
  "booster": { "id": 2, "boughtAt": "2026-11-26T17:00:00.000Z", "openedAt": "2026-11-27T10:05:00.000Z" },
  "emojis": [
    { "id": 26, "char": "🍕", "name": "Pizza", "type": "nourriture", "rarity": "rare", "isNew": true },
    { "id": 1, "char": "😀", "name": "Grand sourire", "type": "visages", "rarity": "commune", "isNew": false },
    { "id": 39, "char": "🌋", "name": "Volcan", "type": "nature", "rarity": "epique", "isNew": true },
    { "id": 15, "char": "🐸", "name": "Grenouille", "type": "animaux", "rarity": "commune", "isNew": true },
    { "id": 70, "char": "🛸", "name": "Soucoupe volante", "type": "voyages", "rarity": "legendaire", "isNew": true }
  ],
  "duplicatesCredits": 0.1,
  "credits": 8.4
}
```

| Champ | Signification |
|---|---|
| `emojis` | les 5 emojis tirés, dans l'ordre du tirage |
| `isNew` | `true` : nouvel emoji ajouté à la collection ; `false` : doublon (déjà possédé) |
| `duplicatesCredits` | crédits gagnés grâce aux doublons de ce booster (0,1 par doublon) |
| `credits` | vos crédits **après** l'ouverture |

Le même emoji peut sortir deux fois dans un booster : la première fois il est nouveau, la seconde c'est un doublon.

**Erreurs**

| Code | Message (`error`) |
|---|---|
| 404 | « Aucun booster avec l'id 42. » (il n'existe pas, ou il appartient à un autre utilisateur) |
| 409 | « Ce booster a déjà été ouvert. » |
| 401 | voir [Les erreurs](#7-les-erreurs) |

---

## 7. Les erreurs

Quand une requête échoue, l'API répond avec un **code d'erreur** et un **JSON** contenant un message lisible, prêt à être affiché à l'utilisateur :

```json
{ "error": "Crédits insuffisants : un booster coûte 5 crédits, vous en avez 4,7." }
```

Pour les erreurs de validation (400), un champ `details` liste aussi chaque problème séparément :

```json
{
  "error": "Le pseudo doit contenir de 2 à 20 caractères. Le mot de passe doit contenir au moins 6 caractères.",
  "details": [
    "Le pseudo doit contenir de 2 à 20 caractères.",
    "Le mot de passe doit contenir au moins 6 caractères."
  ]
}
```

Rappel : `fetch` ne lève **pas** d'erreur pour une réponse 400, 401, 404 ou 409. Vérifiez `response.ok` (ou `response.status`) vous-même.

### Les codes utilisés

| Code | Signification | Cas |
|---|---|---|
| 200 | OK | La requête a réussi |
| 201 | Created | Compte créé, booster acheté |
| 204 | No Content | Déconnexion réussie (pas de corps) |
| 400 | Bad Request | Données invalides, JSON mal formé, filtre invalide, coup invalide, **crédits insuffisants** |
| 401 | Unauthorized | Mauvais identifiants ; jeton absent, invalide ou expiré |
| 404 | Not Found | Booster introuvable, route inconnue |
| 409 | Conflict | E-mail ou pseudo déjà utilisé ; **booster déjà ouvert** |
| 500 | Internal Server Error | Problème dans l'API (ne devrait pas arriver) |

### Les erreurs 401 sur les routes 🔒

| Message (`error`) | Cause |
|---|---|
| « Vous devez être connecté : en-tête « Authorization: Bearer <jeton> » manquant. » | L'en-tête `Authorization` est absent ou mal écrit |
| « Jeton invalide, reconnectez-vous. » | Le jeton n'existe pas (déconnexion, ou `npm run reset`) |
| « Jeton expiré, reconnectez-vous. » | Le jeton a plus de 24 heures |

Dans les trois cas, le front doit oublier le jeton et renvoyer l'utilisateur vers la page de connexion.

### Quand l'API ne répond pas

Si l'API est arrêtée, il n'y a **pas de réponse du tout** : `fetch` lève une erreur (`TypeError: Failed to fetch`). C'est à vous d'afficher un message compréhensible, par exemple « Impossible de joindre l'API, veuillez réessayer plus tard. »

---

## 8. Tester les cas d'erreur

| Pour obtenir… | Faites… |
|---|---|
| API injoignable | Arrêtez l'API (`Ctrl + C` dans son terminal), puis utilisez votre site |
| 401 (jeton invalide) | Connectez-vous, lancez `npm run reset`, puis rechargez une page |
| 400 (crédits insuffisants) | Achetez des boosters jusqu'à ne plus avoir assez de crédits (le compte de Lucas n'en a que 5) |
| 409 (booster déjà ouvert) | Ouvrez la page des boosters dans deux onglets, ouvrez un booster dans le premier, puis le même dans le second |
| 409 (compte existant) | Inscrivez-vous avec `demo@emojidex.fr` ou le pseudo `Camille` |
| 400 (filtre invalide) | Modifiez la valeur d'une option du filtre dans les DevTools |
