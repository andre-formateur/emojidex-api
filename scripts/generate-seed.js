// Génère les données de départ (data/seed/*.json)
// Usage : node scripts/generate-seed.js   puis   npm run reset
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../src/auth.js";

const path = (rel) => fileURLToPath(new URL(rel, import.meta.url));

// [emoji, nom, type, rareté] — par type : 5 communes, 3 rares, 1 épique, 1 légendaire
const CATALOG = [
  ["😀", "Grand sourire", "visages", "commune"],
  ["😂", "Mort de rire", "visages", "commune"],
  ["😊", "Sourire timide", "visages", "commune"],
  ["😴", "Endormi", "visages", "commune"],
  ["🤔", "Pensif", "visages", "commune"],
  ["😎", "Lunettes de soleil", "visages", "rare"],
  ["🥳", "Fêtard", "visages", "rare"],
  ["😱", "Terrifié", "visages", "rare"],
  ["🤯", "Tête qui explose", "visages", "epique"],
  ["🤖", "Robot", "visages", "legendaire"],

  ["🐶", "Chien", "animaux", "commune"],
  ["🐱", "Chat", "animaux", "commune"],
  ["🐭", "Souris", "animaux", "commune"],
  ["🐰", "Lapin", "animaux", "commune"],
  ["🐸", "Grenouille", "animaux", "commune"],
  ["🦊", "Renard", "animaux", "rare"],
  ["🐼", "Panda", "animaux", "rare"],
  ["🐧", "Manchot", "animaux", "rare"],
  ["🦄", "Licorne", "animaux", "epique"],
  ["🐉", "Dragon", "animaux", "legendaire"],

  ["🍎", "Pomme", "nourriture", "commune"],
  ["🍌", "Banane", "nourriture", "commune"],
  ["🥕", "Carotte", "nourriture", "commune"],
  ["🍞", "Pain", "nourriture", "commune"],
  ["🧀", "Fromage", "nourriture", "commune"],
  ["🍕", "Pizza", "nourriture", "rare"],
  ["🍔", "Burger", "nourriture", "rare"],
  ["🍣", "Sushi", "nourriture", "rare"],
  ["🎂", "Gâteau d'anniversaire", "nourriture", "epique"],
  ["🥐", "Croissant", "nourriture", "legendaire"],

  ["🌳", "Arbre", "nature", "commune"],
  ["🌸", "Fleur de cerisier", "nature", "commune"],
  ["🌵", "Cactus", "nature", "commune"],
  ["🍄", "Champignon", "nature", "commune"],
  ["🌻", "Tournesol", "nature", "commune"],
  ["🌈", "Arc-en-ciel", "nature", "rare"],
  ["🍀", "Trèfle à quatre feuilles", "nature", "rare"],
  ["❄️", "Flocon de neige", "nature", "rare"],
  ["🌋", "Volcan", "nature", "epique"],
  ["☄️", "Comète", "nature", "legendaire"],

  ["✏️", "Crayon", "objets", "commune"],
  ["📚", "Livres", "objets", "commune"],
  ["🔑", "Clé", "objets", "commune"],
  ["💡", "Ampoule", "objets", "commune"],
  ["☂️", "Parapluie", "objets", "commune"],
  ["🎧", "Casque audio", "objets", "rare"],
  ["📷", "Appareil photo", "objets", "rare"],
  ["🔭", "Télescope", "objets", "rare"],
  ["💎", "Diamant", "objets", "epique"],
  ["👑", "Couronne", "objets", "legendaire"],

  ["⚽", "Ballon de foot", "activites", "commune"],
  ["🏀", "Ballon de basket", "activites", "commune"],
  ["🎨", "Palette de peinture", "activites", "commune"],
  ["🎲", "Dé", "activites", "commune"],
  ["🎸", "Guitare", "activites", "commune"],
  ["🎮", "Manette de jeu", "activites", "rare"],
  ["♟️", "Pion d'échecs", "activites", "rare"],
  ["🎯", "Fléchettes", "activites", "rare"],
  ["🎻", "Violon", "activites", "epique"],
  ["🏆", "Trophée", "activites", "legendaire"],

  ["🚗", "Voiture", "voyages", "commune"],
  ["🚲", "Vélo", "voyages", "commune"],
  ["🚌", "Bus", "voyages", "commune"],
  ["🚂", "Locomotive", "voyages", "commune"],
  ["⛵", "Voilier", "voyages", "commune"],
  ["✈️", "Avion", "voyages", "rare"],
  ["🚁", "Hélicoptère", "voyages", "rare"],
  ["🏰", "Château", "voyages", "rare"],
  ["🚀", "Fusée", "voyages", "epique"],
  ["🛸", "Soucoupe volante", "voyages", "legendaire"],

  ["❤️", "Cœur", "symboles", "commune"],
  ["✨", "Étincelles", "symboles", "commune"],
  ["🔥", "Flamme", "symboles", "commune"],
  ["💤", "Dodo", "symboles", "commune"],
  ["🎵", "Note de musique", "symboles", "commune"],
  ["⚡", "Éclair", "symboles", "rare"],
  ["🌀", "Cyclone", "symboles", "rare"],
  ["💯", "Cent points", "symboles", "rare"],
  ["♾️", "Infini", "symboles", "epique"],
  ["🔮", "Boule de cristal", "symboles", "legendaire"]
];

const emojis = CATALOG.map(([char, name, type, rarity], i) => ({ id: i + 1, char, name, type, rarity }));

// Crédits en dixièmes : 123 = 12,3 crédits
const users = [
  { id: 1, username: "Camille", email: "demo@emojidex.fr", password: await hashPassword("demo1234"), creditsTenths: 123 },
  { id: 2, username: "Lucas", email: "lucas@emojidex.fr", password: await hashPassword("lucas1234"), creditsTenths: 50 }
];

// Camille possède déjà 26 emojis (dont un légendaire : le croissant)
const camilleOwned = [1, 2, 3, 4, 6, 11, 12, 13, 16, 21, 22, 23, 26, 30, 31, 32, 36, 41, 42, 46, 51, 52, 56, 61, 71, 72];
const collections = camilleOwned.map((emojiId) => ({ userId: 1, emojiId, obtainedAt: "2026-11-20T10:00:00.000Z" }));
// Lucas en possède quelques-uns
for (const emojiId of [1, 11, 21, 31, 41]) {
  collections.push({ userId: 2, emojiId, obtainedAt: "2026-11-21T10:00:00.000Z" });
}

// Camille a un booster pas encore ouvert
const boosters = [
  { id: 1, userId: 1, boughtAt: "2026-11-25T18:00:00.000Z", openedAt: null, emojiIds: [] }
];

const write = (name, data) => writeFile(path(`../data/seed/${name}.json`), JSON.stringify(data, null, 2) + "\n");
await write("emojis", emojis);
await write("users", users);
await write("tokens", []);
await write("collections", collections);
await write("boosters", boosters);

console.log(`Seed généré : ${emojis.length} emojis, ${users.length} utilisateurs, ${collections.length} emojis possédés, ${boosters.length} booster.`);
