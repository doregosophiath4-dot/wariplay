import fs from "node:fs";
import path from "node:path";
import TropiTwistClient from "./TropiTwistClient";

// Équivalent exact de l'ordre des <script src="..."> de l'ancien index.html.
// Ici on ne les sert pas via une URL publique : on lit leur code source
// directement sur le disque (ils sont dans ce même dossier) et on les
// transmet au Client Component, qui les injecte comme de vrais <script>
// classiques au montage. Tous ces fichiers restent inchangés — pas de
// modules, pas de TypeScript.
const NOMS_SCRIPTS = [
  "config.js",
  "tween.js",
  "cameraShake.js",
  "particles.js",
  "levelData.js",
  "piece.js",
  "grille.js",
  "matchDetector.js",
  "deadlockDetector.js",
  "hintSystem.js",
  "assetLoader.js",
  "configManager.js",
  "soundManager.js",
  "boosterManager.js",
  "topUIManager.js",
  "bottomUIManager.js",
  "menuManager.js",
  "misePopup.js",
  "levelSelect.js",
  "main.js",
  "app.js",
];

// Server Component (pas de "use client" ici) : c'est lui qui a le droit
// d'utiliser fs/path, côté serveur uniquement.
export default function Page() {
  const dossier = path.join(process.cwd(), "app", "tropi_twist");
  const scripts = NOMS_SCRIPTS.map((nom) => ({
    nom,
    code: fs.readFileSync(path.join(dossier, nom), "utf8"),
  }));

  return <TropiTwistClient scripts={scripts} />;
}
