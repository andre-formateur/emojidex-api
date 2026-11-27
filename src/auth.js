// Mots de passe hachés et jetons de connexion, uniquement avec le module crypto de Node
// (aucune clé secrète ni variable d'environnement à configurer)
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readData, writeData } from "./store.js";

const scryptAsync = promisify(scrypt);

// Durée de validité d'un jeton : 24 heures
const TOKEN_DURATION_MS = 24 * 60 * 60 * 1000;

// --- Mots de passe ---

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString("hex")}`;
}

export async function checkPassword(password, stored) {
  const [salt, hashHex] = stored.split(":");
  const expected = Buffer.from(hashHex, "hex");
  const hash = await scryptAsync(password, salt, 64);
  return timingSafeEqual(hash, expected);
}

// --- Jetons ---

export async function createToken(userId) {
  const tokens = await readData("tokens");
  const now = Date.now();

  // On en profite pour retirer les jetons expirés
  const validTokens = tokens.filter((t) => t.expiresAt > now);

  const token = randomBytes(32).toString("hex");
  validTokens.push({ token, userId, expiresAt: now + TOKEN_DURATION_MS });
  await writeData("tokens", validTokens);

  return { token, expiresAt: new Date(now + TOKEN_DURATION_MS).toISOString() };
}

export async function deleteToken(token) {
  const tokens = await readData("tokens");
  await writeData("tokens", tokens.filter((t) => t.token !== token));
}

// Un utilisateur tel qu'il est renvoyé au client : jamais de mot de passe
export function toPublicUser(user) {
  return { id: user.id, username: user.username, email: user.email };
}

// Middleware : exige l'en-tête "Authorization: Bearer <jeton>"
// et place l'utilisateur connecté dans req.user
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Vous devez être connecté : en-tête « Authorization: Bearer <jeton> » manquant." });
  }

  const tokens = await readData("tokens");
  const session = tokens.find((t) => t.token === token);

  if (!session) {
    return res.status(401).json({ error: "Jeton invalide, reconnectez-vous." });
  }
  if (session.expiresAt <= Date.now()) {
    await deleteToken(token);
    return res.status(401).json({ error: "Jeton expiré, reconnectez-vous." });
  }

  const users = await readData("users");
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: "Utilisateur introuvable." });
  }

  req.user = toPublicUser(user);
  req.token = token;
  next();
}
