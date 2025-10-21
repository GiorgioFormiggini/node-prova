// src/services/tmdbService.js

const axios = require('axios');

// Variabili d'ambiente definite nel .env
const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Creiamo un client axios configurato, riducendo la ripetizione dei parametri
const tmdbClient = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'it-IT'
    }
});

/**
 * Funzione per recuperare i film popolari.
 * @param {number} page - Il numero di pagina da recuperare.
 * @returns {Promise<object>} - I dati della risposta di TMDB.
 */
const getPopularMovies = async (page = 1) => {
    try {
        // La chiamata usa il client preconfigurato
        const response = await tmdbClient.get('/movie/popular', {
            params: { page }
        });
        
        // Restituiamo l'oggetto data grezzo che il controller elaborerà
        return response.data; 

    } catch (error) {
        // Se si verifica un errore di rete o un codice HTTP non 2xx da TMDB
        console.error("Errore nel Service TMDB:", error.message);
        // Rilanciamo un errore con un messaggio utile per il controller
        throw new Error(error.response?.data?.status_message || 'Errore nella chiamata API TMDB o di rete.');
    }
};

module.exports = {
    getPopularMovies,
};