// server.js

// 1. IMPORTS E CONFIGURAZIONE INIZIALE
const path = require('path');
// Carica le variabili d'ambiente dal file .env nella stessa cartella di server.js
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors'); // Importa il modulo cors
const bcrypt = require('bcrypt');       // Hashing delle password
const jwt = require('jsonwebtoken');    // Generazione di token JWT

// Importa la funzione di connessione al DB e i Modelli Mongoose
const connectDB = require('./config/db.js');
const User = require('./models/user.js'); // Modello Utente

// Importa il modulo delle rotte TMDB
const movieRoutes = require('./routes/movieRoutes'); 
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET; // Chiave segreta per i JWT

// Esegui la connessione al database
connectDB(); 

// MIDDLEWARE DI BASE
app.use(express.json()); // Permette di leggere il corpo delle richieste in formato JSON
app.use(cors()); // Abilita CORS per tutte le richieste

// Serve i file statici del frontend (cartella ../frontend rispetto a src)
app.use(express.static(path.join(__dirname, '../frontend')));

// Controllo sicurezza all'avvio (essenziale)
if (!TMDB_API_KEY || !JWT_SECRET || !process.env.MONGO_URI) {
    if (!TMDB_API_KEY) console.error("ERRORE: La variabile TMDB_API_KEY non è impostata.");
    if (!JWT_SECRET) console.error("ERRORE: La variabile JWT_SECRET non è impostata. Necessaria per l'autenticazione.");
    if (!process.env.MONGO_URI) console.error("ERRORE: La variabile MONGO_URI non è impostata. Necessaria per il database.");
    process.exit(1);
}

// ----------------------------------------------------------------------
// 2. ROTTE DI AUTENTICAZIONE (IMPLEMENTATE con MONGODB)
// ----------------------------------------------------------------------

// Montiamo le rotte di autenticazione sotto /api/auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);


// ----------------------------------------------------------------------
// 3. INTEGRAZIONE ROUTING MODULARE (TMDB)
// ----------------------------------------------------------------------

// Collega le rotte TMDB (es. /popular) sotto il prefisso /api/movies.
app.use('/api/movies', movieRoutes);
app.use('/api/user', userRoutes);

// Rotta di benvenuto: serviamo la pagina index.html del frontend se esiste
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// SPA fallback: per tutte le richieste non-API, restituisci index.html
// Questo permette il client-side routing e assicura che le risorse statiche
// vengano servite correttamente dalla cartella `frontend`.
// SPA fallback middleware: per tutte le richieste non-API, restituisci index.html
// Evitiamo di usare pattern con '*' che in alcune versioni di path-to-regexp
// possono generare errori. Usiamo invece un middleware che instrada le
// richieste non-API verso il file `index.html`.
app.use((req, res, next) => {
	// Se la rotta comincia con /api, la lasciamo gestire dalle rotte precedenti
	if (req.path.startsWith('/api')) return next();
	const indexPath = path.join(__dirname, '../frontend', 'index.html');
	// Log utile per debug durante lo sviluppo
	console.log(`Serving frontend for ${req.path} -> ${indexPath}`);
	res.sendFile(indexPath);
});


// ----------------------------------------------------------------------
// 4. AVVIO DEL SERVER
// ----------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server Express è attivo su http://localhost:${PORT}`);
    console.log(`Testa l'endpoint TMDB: GET http://localhost:${PORT}/api/movies/popular`);
});