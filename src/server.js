import express from "express";
import { randomInt } from "node:crypto";
import { readData, writeData, nextId } from "./store.js";
import { validateRegister, validateLogin, validateMove, MOVES } from "./validation.js";
import { hashPassword, checkPassword, createToken, deleteToken, requireAuth } from "./auth.js";

const PORT = process.env.PORT || 3000;
const app = express();

// ============================================================
// Règles du jeu
// ============================================================

// Les crédits sont stockés en DIXIÈMES (nombre entier) pour éviter les erreurs
// d'arrondi des nombres à virgule : 123 dixièmes = 12,3 crédits.
const STARTING_CREDITS = 50;   // 5 crédits à l'inscription
const WIN_CREDITS = 10;        // 1 crédit par victoire
const BOOSTER_PRICE = 50;      // 5 crédits par booster
const DUPLICATE_CREDITS = 1;   // 0,1 crédit par doublon
const BOOSTER_SIZE = 5;        // 5 emojis par booster

export const TYPES = [
  { slug: "visages", label: "Visages" },
  { slug: "animaux", label: "Animaux" },
  { slug: "nourriture", label: "Nourriture" },
  { slug: "nature", label: "Nature" },
  { slug: "objets", label: "Objets" },
  { slug: "activites", label: "Activités" },
  { slug: "voyages", label: "Voyages" },
  { slug: "symboles", label: "Symboles" }
];

// weight : chance d'obtenir cette rareté à chaque emoji tiré (sur 100)
export const RARITIES = [
  { slug: "commune", label: "Commune", weight: 60 },
  { slug: "rare", label: "Rare", weight: 28 },
  { slug: "epique", label: "Épique", weight: 10 },
  { slug: "legendaire", label: "Légendaire", weight: 2 }
];

const toCredits = (tenths) => tenths / 10;

// Pour les messages : 47 dixièmes → "4,7"
const creditsText = (tenths) => String(tenths / 10).replace(".", ",");

// Ce qui bat quoi : la clé bat la valeur
const BEATS = { pierre: "ciseaux", feuille: "pierre", ciseaux: "feuille" };

// ============================================================
// Middlewares
// ============================================================

// --- CORS : autorise les pages servies par Live Server à appeler l'API ---
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// --- Log simple de chaque requête dans le terminal ---
app.use((req, res, next) => {
  res.on("finish", () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

// ============================================================
// Outils
// ============================================================

// Profil complet de l'utilisateur : crédits, progression, boosters à ouvrir
async function buildProfile(userId) {
  const users = await readData("users");
  const emojis = await readData("emojis");
  const collections = await readData("collections");
  const boosters = await readData("boosters");

  const user = users.find((u) => u.id === userId);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    credits: toCredits(user.creditsTenths),
    collectionCount: collections.filter((c) => c.userId === userId).length,
    collectionTotal: emojis.length,
    unopenedBoosters: boosters.filter((b) => b.userId === userId && b.openedAt === null).length
  };
}

// Tire une rareté au hasard selon les poids, puis un emoji de cette rareté
function drawEmoji(emojis) {
  const total = RARITIES.reduce((sum, r) => sum + r.weight, 0);
  let roll = randomInt(total);
  let rarity = RARITIES[0].slug;

  for (const r of RARITIES) {
    if (roll < r.weight) {
      rarity = r.slug;
      break;
    }
    roll -= r.weight;
  }

  const candidates = emojis.filter((e) => e.rarity === rarity);
  return candidates[randomInt(candidates.length)];
}

// ============================================================
// Authentification
// ============================================================

// POST /auth/register : { username, email, password }
app.post("/auth/register", async (req, res) => {
  const errors = validateRegister(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" "), details: errors });
  }

  const email = req.body.email.trim().toLowerCase();
  const username = req.body.username.trim();
  const users = await readData("users");

  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ error: "Un compte existe déjà avec cet e-mail." });
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "Ce pseudo est déjà utilisé." });
  }

  const user = {
    id: nextId(users),
    username: username,
    email: email,
    password: await hashPassword(req.body.password),
    creditsTenths: STARTING_CREDITS
  };
  users.push(user);
  await writeData("users", users);

  const { token, expiresAt } = await createToken(user.id);
  res.status(201).json({ token, expiresAt, user: await buildProfile(user.id) });
});

// POST /auth/login : { email, password }
app.post("/auth/login", async (req, res) => {
  const errors = validateLogin(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" "), details: errors });
  }

  const email = req.body.email.trim().toLowerCase();
  const users = await readData("users");
  const user = users.find((u) => u.email === email);

  if (!user || !(await checkPassword(req.body.password, user.password))) {
    return res.status(401).json({ error: "E-mail ou mot de passe incorrect." });
  }

  const { token, expiresAt } = await createToken(user.id);
  res.json({ token, expiresAt, user: await buildProfile(user.id) });
});

// GET /auth/me : profil complet de l'utilisateur connecté
app.get("/auth/me", requireAuth, async (req, res) => {
  res.json(await buildProfile(req.user.id));
});

// POST /auth/logout : le jeton n'est plus valable
app.post("/auth/logout", requireAuth, async (req, res) => {
  await deleteToken(req.token);
  res.sendStatus(204);
});

// ============================================================
// Catalogue (public)
// ============================================================

app.get("/types", (req, res) => {
  res.json(TYPES);
});

app.get("/rarities", (req, res) => {
  res.json(RARITIES.map((r) => ({ slug: r.slug, label: r.label, chance: r.weight })));
});

// ============================================================
// Collection (connecté)
// ============================================================

// GET /emojis?type=...&rarity=...&owned=true|false
// Tous les emojis du catalogue, avec owned = true / false pour l'utilisateur connecté
app.get("/emojis", requireAuth, async (req, res) => {
  const type = (req.query.type || "tous").toString();
  const rarity = (req.query.rarity || "tous").toString();
  const owned = (req.query.owned || "tous").toString();

  if (type !== "tous" && !TYPES.some((t) => t.slug === type)) {
    return res.status(400).json({ error: `Filtre « type » invalide. Valeurs possibles : tous, ${TYPES.map((t) => t.slug).join(", ")}.` });
  }
  if (rarity !== "tous" && !RARITIES.some((r) => r.slug === rarity)) {
    return res.status(400).json({ error: `Filtre « rarity » invalide. Valeurs possibles : tous, ${RARITIES.map((r) => r.slug).join(", ")}.` });
  }
  if (!["tous", "true", "false"].includes(owned)) {
    return res.status(400).json({ error: "Filtre « owned » invalide. Valeurs possibles : tous, true, false." });
  }

  const emojis = await readData("emojis");
  const collections = await readData("collections");
  const mine = collections.filter((c) => c.userId === req.user.id);

  const result = emojis
    .map((emoji) => {
      const entry = mine.find((c) => c.emojiId === emoji.id);
      return { ...emoji, owned: entry !== undefined, obtainedAt: entry ? entry.obtainedAt : null };
    })
    .filter((emoji) =>
      (type === "tous" || emoji.type === type) &&
      (rarity === "tous" || emoji.rarity === rarity) &&
      (owned === "tous" || String(emoji.owned) === owned)
    );

  res.json(result);
});

// ============================================================
// Jeu : pierre-feuille-ciseaux (connecté)
// ============================================================

// POST /game/play : { move: "pierre" | "feuille" | "ciseaux" }
app.post("/game/play", requireAuth, async (req, res) => {
  const errors = validateMove(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(" "), details: errors });
  }

  const playerMove = req.body.move;
  const apiMove = MOVES[randomInt(MOVES.length)];

  let result = "defaite";
  if (playerMove === apiMove) {
    result = "egalite";
  } else if (BEATS[playerMove] === apiMove) {
    result = "victoire";
  }

  const creditsWonTenths = result === "victoire" ? WIN_CREDITS : 0;

  const users = await readData("users");
  const user = users.find((u) => u.id === req.user.id);
  user.creditsTenths += creditsWonTenths;
  await writeData("users", users);

  res.json({
    playerMove,
    apiMove,
    result,
    creditsWon: toCredits(creditsWonTenths),
    credits: toCredits(user.creditsTenths)
  });
});

// ============================================================
// Boosters (connecté)
// ============================================================

function toPublicBooster(booster) {
  return { id: booster.id, boughtAt: booster.boughtAt, openedAt: booster.openedAt };
}

// GET /boosters : mes boosters pas encore ouverts
app.get("/boosters", requireAuth, async (req, res) => {
  const boosters = await readData("boosters");
  const result = boosters
    .filter((b) => b.userId === req.user.id && b.openedAt === null)
    .sort((a, b) => a.boughtAt.localeCompare(b.boughtAt))
    .map(toPublicBooster);
  res.json(result);
});

// POST /boosters : acheter un booster (5 crédits)
app.post("/boosters", requireAuth, async (req, res) => {
  const users = await readData("users");
  const user = users.find((u) => u.id === req.user.id);

  if (user.creditsTenths < BOOSTER_PRICE) {
    return res.status(400).json({
      error: `Crédits insuffisants : un booster coûte ${creditsText(BOOSTER_PRICE)} crédits, vous en avez ${creditsText(user.creditsTenths)}.`
    });
  }

  user.creditsTenths -= BOOSTER_PRICE;
  await writeData("users", users);

  const boosters = await readData("boosters");
  const booster = {
    id: nextId(boosters),
    userId: user.id,
    boughtAt: new Date().toISOString(),
    openedAt: null,
    emojiIds: []
  };
  boosters.push(booster);
  await writeData("boosters", boosters);

  res.status(201).json({ booster: toPublicBooster(booster), credits: toCredits(user.creditsTenths) });
});

// POST /boosters/:id/open : ouvrir un de mes boosters
app.post("/boosters/:id/open", requireAuth, async (req, res) => {
  const boosters = await readData("boosters");
  const booster = boosters.find((b) => b.id === Number(req.params.id) && b.userId === req.user.id);

  if (!booster) {
    return res.status(404).json({ error: `Aucun booster avec l'id ${req.params.id}.` });
  }
  if (booster.openedAt !== null) {
    return res.status(409).json({ error: "Ce booster a déjà été ouvert." });
  }

  const emojis = await readData("emojis");
  const collections = await readData("collections");
  const users = await readData("users");
  const user = users.find((u) => u.id === req.user.id);

  const now = new Date().toISOString();
  const drawn = [];
  let duplicatesTenths = 0;

  for (let i = 0; i < BOOSTER_SIZE; i++) {
    const emoji = drawEmoji(emojis);
    const alreadyOwned = collections.some((c) => c.userId === user.id && c.emojiId === emoji.id);

    if (alreadyOwned) {
      duplicatesTenths += DUPLICATE_CREDITS;
    } else {
      collections.push({ userId: user.id, emojiId: emoji.id, obtainedAt: now });
    }

    drawn.push({ ...emoji, isNew: !alreadyOwned });
  }

  user.creditsTenths += duplicatesTenths;
  booster.openedAt = now;
  booster.emojiIds = drawn.map((e) => e.id);

  await writeData("collections", collections);
  await writeData("users", users);
  await writeData("boosters", boosters);

  res.json({
    booster: toPublicBooster(booster),
    emojis: drawn,
    duplicatesCredits: toCredits(duplicatesTenths),
    credits: toCredits(user.creditsTenths)
  });
});

// ============================================================
// Divers
// ============================================================

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// Erreurs (JSON mal formé, fichier illisible...)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Le corps de la requête n'est pas un JSON valide." });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur." });
});

app.listen(PORT, () => {
  console.log(`API Emojidex démarrée : http://localhost:${PORT}`);
});
