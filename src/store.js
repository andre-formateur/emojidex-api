// Lecture / écriture des fichiers JSON du dossier data/ (pas de base de données)
// - users.json    : les utilisateurs (mot de passe haché)
// - tokens.json   : les jetons de connexion en cours
// - emojis.json   : le catalogue des 80 emojis
// - collections.json : les emojis possédés par chaque utilisateur
// - boosters.json  : les boosters achetés (ouverts ou non)
import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";

function dataPath(name) {
  return fileURLToPath(new URL(`../data/${name}.json`, import.meta.url));
}

export async function readData(name) {
  const content = await readFile(dataPath(name), "utf-8");
  return JSON.parse(content);
}

export async function writeData(name, data) {
  // Écriture dans un fichier temporaire puis renommage : le JSON n'est jamais à moitié écrit
  const file = dataPath(name);
  const tmpFile = file + ".tmp";
  await writeFile(tmpFile, JSON.stringify(data, null, 2) + "\n", "utf-8");
  await rename(tmpFile, file);
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}
