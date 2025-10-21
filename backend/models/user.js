// src/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Il nome utente è richiesto'],
        unique: true, // Impedisce la creazione di utenti con lo stesso username
        trim: true    // Rimuove spazi bianchi all'inizio/fine
    },
    email: {
        type: String,
        required: [true, 'L\'indirizzo email è richiesto'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Indirizzo email non valido']
    },
    password: {
        type: String,
        required: [true, 'La password è richiesta'],
        minlength: [6, 'La password deve contenere almeno 6 caratteri']
    },
    
    // Aggiungi un timestamp per tracciare la creazione
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);