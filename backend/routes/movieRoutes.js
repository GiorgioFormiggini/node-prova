// import
const express = require("express");
const router = express.Router();

// import controllers
const movieController = require("../controller/movieController");
const verifyToken = require("../middleware/authMiddleware");
const favoriteController = require("../controller/favoriteController");

// Ricerca film popolari (pubblico)
router.get("/popular", movieController.fetchPopularMovies);
// Ricerca e dettagli film (pubblici)
router.get("/search", movieController.searchMovies);
// Rotte protette per la gestione dei preferiti (richiedono autenticazione)
router.get("/favorites", verifyToken, favoriteController.getFavorites);
router.post("/favorites", verifyToken, favoriteController.toggleFavorite);
router.delete(
  "/favorites/:tmdbId",
  verifyToken,
  favoriteController.removeFavorite
);
// watched routes
router.get("/watched", verifyToken, favoriteController.getWatched);
router.post("/watched", verifyToken, favoriteController.toggleWatched);
router.get("/status/:tmdbId", verifyToken, favoriteController.getStatus);

// Dettagli film (pubblico) - posizionato dopo le rotte più specifiche
router.get("/:id", movieController.getMovieDetails);

module.exports = router;
