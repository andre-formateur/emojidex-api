# Projet final — Emojidex

Vous allez créer **Emojidex**, une application de collection d'emojis :

1. vous jouez à **pierre-feuille-ciseaux** contre l'API pour gagner des **crédits** ;
2. avec ces crédits, vous achetez des **boosters** ;
3. vous ouvrez vos boosters pour découvrir **5 emojis** et compléter votre **collection de 80 emojis**.

L'**API est fournie** (dossier `api/`). **Tout le front est à faire** : HTML, CSS et JavaScript.

Le **design est libre** : couleurs, polices, mise en page, animations… c'est vous qui choisissez. Ce qui est évalué, ce sont les **fonctionnalités** décrites dans ce document et la **qualité du code**.

---

## Sommaire

1. [Démarrage](#1-démarrage)
2. [Les règles du jeu](#2-les-règles-du-jeu)
3. [Les pages à créer](#3-les-pages-à-créer)
4. [Contraintes techniques](#4-contraintes-techniques)
5. [User stories](#5-user-stories)
6. [Récapitulatif des fonctionnalités](#6-récapitulatif-des-fonctionnalités)
7. [Rendu](#7-rendu)

---

## 1. Démarrage

1. Dans le dossier `api/` : `npm install`, puis `npm start`. L'API répond sur `http://localhost:3000`.
2. **Lisez [`fonctionnement_api.md`](./fonctionnement_api.md)** : il décrit chaque route, les données envoyées et reçues, et chaque message d'erreur.
3. Testez les routes avec REST Client (`api/requests.http`) **avant** d'écrire le JavaScript correspondant.
4. Créez votre dossier front **en dehors** du dossier `api/` et ouvrez vos pages avec **Live Server**.

Comptes de démonstration :

| E-mail | Mot de passe | Situation |
|---|---|---|
| `demo@emojidex.fr` | `demo1234` | 12,3 crédits, 26 emojis, 1 booster à ouvrir |
| `lucas@emojidex.fr` | `lucas1234` | 5 crédits, 5 emojis |

`npm run reset` remet les données de départ.

---

## 2. Les règles du jeu

| Règle | Valeur |
|---|---|
| Crédits à l'inscription | 5 |
| Victoire à pierre-feuille-ciseaux | +1 crédit (égalité et défaite : rien) |
| Prix d'un booster | 5 crédits |
| Contenu d'un booster | 5 emojis tirés au hasard |
| Doublon (emoji déjà possédé) | converti en 0,1 crédit |

Les emojis ont **4 raretés** : commune, rare, épique et légendaire (de la plus fréquente à la plus rare).

C'est l'**API** qui applique toutes ces règles. Votre front n'a **aucun calcul** de crédits ou de tirage à faire : il envoie les demandes et affiche les réponses.

---

## 3. Les pages à créer

Une **page HTML par vue**.

| Page | Accès | Rôle |
|---|---|---|
| Connexion | public | Se connecter. C'est la **page d'accueil** du site (`index.html`) |
| Inscription | public | Créer un compte |
| Collection | connecté | Progression et grille des 80 emojis, avec filtres |
| Jeu | connecté | Pierre-feuille-ciseaux contre l'API |
| Boutique | connecté | Acheter un booster |
| Boosters | connecté | Liste des boosters à ouvrir, ouverture et découverte des emojis |

Les 4 pages « connecté » partagent le même **en-tête**, qui affiche au minimum :

- le nom du site ;
- les crédits de l'utilisateur ;
- un lien vers chacune des 4 pages ;
- un bouton de déconnexion.

---

## 4. Contraintes techniques

- **Une page HTML par vue** (pas de vues cachées puis affichées dans une seule page).
- Le site est utilisable **sur téléphone comme sur ordinateur** (responsive).
- JavaScript organisé en **modules** (`type="module"`), avec les appels à l'API **regroupés** dans un ou plusieurs fichiers dédiés.
- Appels à l'API avec `fetch` et `async` / `await`.
- Le jeton est conservé dans le `localStorage` pour passer d'une page à l'autre.
- Les textes venant de l'API sont insérés avec `textContent` (jamais `innerHTML`).
- Chaque erreur est **affichée à l'utilisateur dans la page**, pas seulement dans la console.
- Animations éventuelles **en CSS**, sans bibliothèque.
- Projet versionné avec **Git** : des commits réguliers, avec des messages clairs.

---

## 5. User stories

Chaque user story décrit un besoin de l'utilisateur, puis :

- les **critères d'acceptation** : ce qui doit fonctionner pour qu'elle soit terminée ;
- les **cas d'erreur** : ce que l'utilisateur doit voir quand quelque chose se passe mal ;
- les **routes de l'API** à utiliser (détaillées dans [`fonctionnement_api.md`](./fonctionnement_api.md)).

Une user story n'est terminée que lorsque **tous** ses critères **et** tous ses cas d'erreur fonctionnent.

Ordre conseillé : US1 → US7. Chaque user story s'appuie sur les précédentes.

---

### US1 — Créer un compte

> **En tant que** visiteur, **je veux** créer un compte **afin de** commencer ma collection.

**Critères d'acceptation**

- Le formulaire demande un pseudo, un e-mail et un mot de passe.
- Si l'inscription réussit, je suis **directement connecté** et j'arrive sur ma collection, avec **5 crédits** et une collection vide (0 / 80).
- La page d'inscription a un lien vers la page de connexion, et inversement.

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| E-mail déjà utilisé | « Un compte existe déjà avec cet e-mail. » |
| Pseudo déjà utilisé | « Ce pseudo est déjà utilisé. » |
| Données refusées (pseudo trop court, mot de passe trop court…) | Le message renvoyé par l'API |
| L'API ne répond pas | Un message indiquant que le serveur est injoignable |

**Route** : `POST /auth/register`

---

### US2 — Se connecter

> **En tant que** visiteur, **je veux** me connecter **afin de** retrouver ma collection.

**Critères d'acceptation**

- Le formulaire demande un e-mail et un mot de passe.
- Si la connexion réussit, j'arrive sur ma collection.
- Si je suis **déjà connecté** et que j'ouvre la page de connexion, j'arrive directement sur ma collection.

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| Mauvais e-mail ou mot de passe | « E-mail ou mot de passe incorrect. » |
| L'API ne répond pas | Un message indiquant que le serveur est injoignable |
| Je réessaie après une erreur | L'ancien message d'erreur disparaît |

**Routes** : `POST /auth/login`, `GET /auth/me` (pour vérifier qu'un jeton déjà enregistré est encore valable)

---

### US3 — Naviguer et se déconnecter

> **En tant qu'**utilisateur connecté, **je veux** voir mes crédits et passer d'une page à l'autre **afin de** jouer sans me perdre.

**Critères d'acceptation**

- Sur chaque page « connecté », l'en-tête affiche mes crédits **à jour**, avec une décimale si besoin, écrite à la française (« 12,3 » et non « 12.3 »).
- L'en-tête permet d'aller sur Collection, Jeu, Boutique et Boosters.
- La page en cours est **mise en évidence** dans la navigation.
- Le bouton de déconnexion me déconnecte **auprès de l'API**, puis me ramène à la page de connexion.
- Si j'ouvre une page « connecté » **sans être connecté**, je suis renvoyé à la page de connexion.

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| Mon jeton n'est plus valable (401) | Je suis renvoyé à la page de connexion |

**Routes** : `GET /auth/me`, `POST /auth/logout`

---

### US4 — Voir ma collection

> **En tant qu'**utilisateur, **je veux** voir les 80 emojis et ceux que j'ai déjà **afin de** savoir ce qu'il me reste à obtenir.

**Critères d'acceptation**

- Ma **progression** est affichée sous la forme « 26 / 80 », accompagnée d'une barre de progression.
- **Tous** les emojis du catalogue sont affichés :
  - un emoji **obtenu** montre l'emoji et son nom ;
  - un emoji **manquant** montre un point d'interrogation à la place de l'emoji, et **pas** son nom.
- La **rareté** de chaque emoji se voit (par une couleur, par exemple), **même** pour les emojis manquants.
- Je peux filtrer par **type**, par **rareté** et par **obtenus / manquants**.
- Les trois filtres se **combinent** (ex. : les animaux rares que je n'ai pas encore).
- Le filtrage est fait **par l'API** (paramètres dans l'URL), pas en JavaScript dans le front.
- Le nombre d'emojis affichés est indiqué (ex. « 6 emoji(s) affiché(s) »).

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| L'API ne répond pas | Un message d'erreur dans la page |
| Aucun emoji ne correspond aux filtres | Une grille vide et « 0 emoji(s) affiché(s) » (ou un message équivalent) |

**Routes** : `GET /auth/me` (progression), `GET /emojis` (avec les filtres `type`, `rarity`, `owned`)

---

### US5 — Jouer à pierre-feuille-ciseaux

> **En tant qu'**utilisateur, **je veux** jouer contre l'API **afin de** gagner des crédits.

**Critères d'acceptation**

- Je choisis **pierre**, **feuille** ou **ciseaux** en cliquant sur un bouton.
- Le résultat s'affiche : **mon coup**, **le coup de l'API**, et « Victoire », « Égalité » ou « Défaite ».
- En cas de victoire, mes crédits augmentent de 1 dans l'en-tête, **sans recharger la page**.
- Un compteur de **victoires**, **égalités** et **défaites** est mis à jour à chaque partie (il peut repartir à zéro quand la page est rechargée).

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| L'API ne répond pas | Un message d'erreur ; mes crédits et les compteurs ne changent pas |

**Route** : `POST /game/play`

---

### US6 — Acheter un booster

> **En tant qu'**utilisateur, **je veux** acheter un booster **afin d'**obtenir de nouveaux emojis.

**Critères d'acceptation**

- La boutique présente le booster : son **prix** (5 crédits) et son **contenu** (5 emojis).
- Après l'achat, un **message de confirmation** s'affiche et m'indique où ouvrir mon booster.
- Mes crédits sont mis à jour dans l'en-tête, **sans recharger la page**.

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| Moins de 5 crédits | « Crédits insuffisants… » (message de l'API) ; rien n'est acheté ; l'ancien message de confirmation disparaît |
| L'API ne répond pas | Un message d'erreur |

**Route** : `POST /boosters`

---

### US7 — Ouvrir un booster

> **En tant qu'**utilisateur, **je veux** ouvrir mes boosters **afin de** découvrir les emojis obtenus.

**Critères d'acceptation**

- La page liste mes boosters **non ouverts**, chacun avec un bouton « Ouvrir ».
- S'il n'y en a **aucun**, un message l'indique et propose un lien vers la boutique.
- À l'ouverture, les **5 emojis** obtenus s'affichent, chacun avec :
  - l'emoji et son nom ;
  - sa rareté ;
  - la mention **« Nouveau »** ou **« Doublon »**.
- Un **récapitulatif** indique le nombre de nouveaux emojis et les crédits gagnés grâce aux doublons.
- Le booster ouvert **disparaît** de la liste et mes crédits sont mis à jour, **sans recharger la page**.
- Les nouveaux emojis apparaissent ensuite dans ma collection.

**Cas d'erreur**

| Situation | Ce que je dois voir |
|---|---|
| Booster déjà ouvert, par exemple depuis un autre onglet (409) | « Ce booster a déjà été ouvert. » et la liste des boosters est mise à jour |
| L'API ne répond pas | Un message d'erreur |

**Routes** : `GET /boosters`, `POST /boosters/:id/open`

---

## 6. Récapitulatif des fonctionnalités

Cochez au fur et à mesure.

### Obligatoires

- [ ] Inscription (US1)
- [ ] Connexion, avec redirection si l'on est déjà connecté (US2)
- [ ] En-tête commun : crédits, navigation, déconnexion (US3)
- [ ] Protection des pages « connecté » (US3)
- [ ] Collection : progression et grille des 80 emojis, obtenus et manquants (US4)
- [ ] Jeu de pierre-feuille-ciseaux, avec mise à jour des crédits (US5)
- [ ] Achat d'un booster (US6)
- [ ] Liste des boosters et ouverture (US7)
- [ ] **Tous** les cas d'erreur des user stories

### Attendues

- [ ] Filtres combinables de la collection, faits par l'API (US4)
- [ ] Rareté visible sur chaque emoji, collection et ouverture (US4, US7)
- [ ] Mentions « Nouveau » / « Doublon » et récapitulatif à l'ouverture (US7)
- [ ] Compteur de victoires, égalités et défaites (US5)
- [ ] Page en cours mise en évidence dans la navigation (US3)

### Bonus

- [ ] Nombre de boosters à ouvrir affiché dans la navigation (champ `unopenedBoosters` de `GET /auth/me`)
- [ ] Chances de chaque rareté affichées dans la boutique (`GET /rarities`)
- [ ] Animation à l'ouverture d'un booster (les emojis apparaissent l'un après l'autre, par exemple)
- [ ] Emojis légendaires mis en valeur
- [ ] Bouton désactivé pendant sa requête, pour éviter les doubles clics
- [ ] Toute autre idée qui rend l'application plus agréable à utiliser

---

## 7. Rendu

- Le **dépôt Git** de votre front, avec un historique de commits régulier.
- Avant de rendre, vérifiez **chaque user story**, y compris les cas d'erreur. La section « Tester les cas d'erreur » de [`fonctionnement_api.md`](./fonctionnement_api.md#8-tester-les-cas-derreur) explique comment les provoquer : arrêter l'API, utiliser deux onglets, lancer `npm run reset`, dépenser tous ses crédits…
