// src/models/Movie.js

const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    // ID del contenuto (film o serie TV) come fornito da TMDB (deve essere univoco per contenuto+utente)
    tmdbId: {
        type: Number,
        required: true,
    },
    // Tipo di contenuto: film o serie TV
    contentType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true,
        default: 'movie'
    },
    // Riferimento all'utente proprietario di questa preferenza
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Collega a un documento nella collezione 'User'
        required: true
    },
    // Gestione delle liste personali
    isFavorite: {
        type: Boolean,
        default: false
    },
    isWatched: {
        type: Boolean,
        default: false
    },
    toWatch: {
        type: Boolean,
        default: false
    },
    // Valutazione personale dell'utente (da 1 a 10)
    userRating: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },
    // Commenti personali dell'utente
    userComment: {
        type: String,
        trim: true,
        default: ''
    },
    // Data in cui l'utente ha visto il contenuto
    watchedDate: {
        type: Date,
        default: null
    },
    // Potresti voler salvare una piccola porzione di dati (es. titolo)
    // per non dover sempre interrogare TMDB per le liste veloci
    title: {
        type: String,
        trim: true
    }
}, {
    // Garantisce che non ci siano due record per lo stesso contenuto (tmdbId) e lo stesso utente (user)
    // user+tmdbId uniqueness verrà imposta come indice sotto
    timestamps: true
});

// Subdocument per memorizzare i dettagli completi del contenuto (cache di TMDB)
ContentSchema.add({
    details: {
        overview: { type: String },
        cast: { type: String},
        poster_path: { type: String },
        backdrop_path: { type: String },
        release_date: { type: String }, // Per film
        first_air_date: { type: String }, // Per serie TV
        genres: [{ id: Number, name: String }],
        runtime: { type: Number }, // Per film
        episode_run_time: [Number], // Per serie TV
        number_of_seasons: { type: Number }, // Per serie TV
        number_of_episodes: { type: Number }, // Per serie TV
        vote_average: { type: Number },
        vote_count: { type: Number },
        original_language: { type: String },
        popularity: { type: Number },
        status: { type: String } // Stato della serie TV (in corso, terminata, ecc.)
    }
});

// Assicura l'unicità combinata per utente + tmdbId + contentType
ContentSchema.index({ user: 1, tmdbId: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model('Content', ContentSchema);