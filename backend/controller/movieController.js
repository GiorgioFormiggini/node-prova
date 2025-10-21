// Importa il servizio TMDB
const tmdbService = require('../services/tmdbService');

// Controller per ottenere i film popolari (pubblico)
const fetchPopularMovies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;

        // Chiama la logica di connessione all'API delegata al Service
        const moviesData = await tmdbService.getPopularMovies(page);

        res.status(200).json({
            success: true,
            total_pages: moviesData.total_pages,
            current_page: moviesData.page,
            results: moviesData.results
        });

    } catch (error) {
        // Gestione degli errori lanciati dal Service
        console.error('Errore nel Controller (fetchPopularMovies):', error.message);
        
        // Tentiamo di dare un codice 401 se l'errore è legato all'API Key non valida
        const statusCode = error.message.includes('API Key') ? 401 : 500;

        res.status(statusCode).json({
            success: false,
            error: 'Impossibile recuperare i film popolari da TMDB.',
            details: error.message
        });
    }
};
// export del modulo
module.exports = {
    fetchPopularMovies,
};

// Controller per cercare film su TMDB per query (pubblico)
const searchMovies = async (req, res) => {
    try {
        const q = req.query.q || req.query.query || '';
        const page = parseInt(req.query.page) || 1;
        if (!q) return res.status(400).json({ success: false, error: 'query (q) è richiesta' });

        const results = await tmdbService.searchMovies(q, page);
        res.status(200).json({ success: true, ...results });
    } catch (error) {
        console.error('Errore searchMovies controller:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Controller per ottenere i dettagli di un film da TMDB (pubblico)
const getMovieDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const details = await tmdbService.getMovieDetails(id);
        res.status(200).json({ success: true, details });
    } catch (error) {
        console.error('Errore getMovieDetails controller:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
// export del modulo
module.exports = {
    fetchPopularMovies,
    searchMovies,
    getMovieDetails,
};