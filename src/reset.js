// Remet les données de départ : npm run reset (et déconnecte tout le monde)
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

for (const name of ["users", "tokens", "emojis", "collections", "boosters"]) {
  const seed = fileURLToPath(new URL(`../data/seed/${name}.json`, import.meta.url));
  const data = fileURLToPath(new URL(`../data/${name}.json`, import.meta.url));
  await copyFile(seed, data);
}

console.log("Données réinitialisées : compte demo@emojidex.fr (mot de passe demo1234).");
