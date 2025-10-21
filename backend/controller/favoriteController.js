const User = require('../models/user');
const Movie = require('../models/movie');

// Funzione per ottenere i preferiti di un utente
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user.favorites);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei preferiti', error });
    }
};

// Funzione per aggiungere o rimuovere un film dai preferiti
exports.toggleFavorite = async (req, res) => {
    const { tmdbId, title, poster_path } = req.body;
    try {
        let movie = await Movie.findOne({ tmdbId });
        if (!movie) {
            movie = new Movie({ tmdbId, title, poster_path });
            await movie.save();
        }

        const user = await User.findById(req.user.id);
        const isFavorite = user.favorites.includes(movie._id);

        if (isFavorite) {
            user.favorites.pull(movie._id);
        } else {
            user.favorites.push(movie._id);
        }

        await user.save();
        res.json({ success: true, isFavorite: !isFavorite });
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'aggiornamento dei preferiti', error });
    }
};

// Funzione per rimuovere un film dai preferiti
exports.removeFavorite = async (req, res) => {
    const { tmdbId } = req.params;
    try {
        const movie = await Movie.findOne({ tmdbId });
        if (movie) {
            await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: movie._id } });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Errore nella rimozione del preferito', error });
    }
};

// Funzione per ottenere i film visti di un utente
exports.getWatched = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('watched');
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }
        res.json(user.watched);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei film visti', error });
    }
};

// Funzione per aggiungere o rimuovere un film dai visti
exports.toggleWatched = async (req, res) => {
    const { tmdbId, title, poster_path } = req.body;
    try {
        let movie = await Movie.findOne({ tmdbId });
        if (!movie) {
            movie = new Movie({ tmdbId, title, poster_path });
            await movie.save();
        }

        const user = await User.findById(req.user.id);
        const isWatched = user.watched.includes(movie._id);

        if (isWatched) {
            user.watched.pull(movie._id);
        } else {
            user.watched.push(movie._id);
        }

        await user.save();
        res.json({ success: true, isWatched: !isWatched });
    } catch (error) {
        res.status(500).json({ message: 'Errore nell\'aggiornamento dei film visti', error });
    }
};

// Funzione per ottenere lo stato di un film (preferito/visto)
exports.getStatus = async (req, res) => {
    const { tmdbId } = req.params;
    try {
        const movie = await Movie.findOne({ tmdbId });
        if (!movie) {
            return res.json({ isFavorite: false, isWatched: false });
        }

        const user = await User.findById(req.user.id);
        const isFavorite = user.favorites.includes(movie._id);
        const isWatched = user.watched.includes(movie._id);

        res.json({ isFavorite, isWatched });
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dello stato del film', error });
    }
};