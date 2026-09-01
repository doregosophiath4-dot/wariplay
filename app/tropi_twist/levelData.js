// levelData.js
// Les données de niveaux ne sont plus codées en dur ici : elles sont
// chargées dynamiquement depuis levels_data.json (le fichier est au même
// niveau que index.html) par App._chargerDonneesNiveaux() dans app.js,
// pendant l'écran de chargement.
//
// LEVELS_DATA est déclarée ici en "let" (pas "const") pour pouvoir être
// réassignée depuis app.js une fois le fetch terminé ; tout le reste du
// code (grille.js, main.js, levelSelect.js) continue de la lire comme
// avant via LEVELS_DATA[niveauId].
//
// ATTENTION : fetch() d'un fichier local est bloqué par le navigateur si
// tu ouvres index.html directement en double-cliquant dessus (protocole
// file://). Sers le dossier via un petit serveur local, par ex. :
//   python -m http.server 8000
// puis ouvre http://localhost:8000 dans le navigateur.
let LEVELS_DATA = null;
