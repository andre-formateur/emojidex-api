// Contrôle des données reçues par l'API

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 6;
export const MOVES = ["pierre", "feuille", "ciseaux"];

function isObject(body) {
  return body !== null && typeof body === "object" && !Array.isArray(body);
}

function unknownFields(body, allowed) {
  return Object.keys(body)
    .filter((key) => !allowed.includes(key))
    .map((key) => `Champ inconnu : « ${key} ».`);
}

// --- Inscription : { username, email, password } ---
export function validateRegister(body) {
  if (!isObject(body)) return ["Le corps de la requête doit être un objet JSON."];

  const errors = unknownFields(body, ["username", "email", "password"]);

  if (typeof body.username !== "string" || body.username.trim().length < 2 || body.username.trim().length > 20) {
    errors.push("Le pseudo doit contenir de 2 à 20 caractères.");
  }
  if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
    errors.push("L'adresse e-mail n'est pas valide.");
  }
  if (typeof body.password !== "string" || body.password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`);
  }

  return errors;
}

// --- Connexion : { email, password } ---
export function validateLogin(body) {
  if (!isObject(body)) return ["Le corps de la requête doit être un objet JSON."];

  const errors = unknownFields(body, ["email", "password"]);
  if (typeof body.email !== "string" || body.email.trim() === "") {
    errors.push("L'e-mail est obligatoire.");
  }
  if (typeof body.password !== "string" || body.password === "") {
    errors.push("Le mot de passe est obligatoire.");
  }
  return errors;
}

// --- Partie de pierre-feuille-ciseaux : { move } ---
export function validateMove(body) {
  if (!isObject(body)) return ["Le corps de la requête doit être un objet JSON."];

  const errors = unknownFields(body, ["move"]);
  if (!MOVES.includes(body.move)) {
    errors.push(`Le coup doit valoir : ${MOVES.join(", ")}.`);
  }
  return errors;
}
