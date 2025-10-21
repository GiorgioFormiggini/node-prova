// import 
const path = require('path'); 
const express = require('express');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

// Importa la funzione di connessione al DB e i Modelli Mongoose
const connectDB = require('./config/db.js'); 
const User = require('./models/User.js'); 

// Importa il modulo delle rotte TMDB
const movieRoutes = require('./routes/movieRoute'); 
const userRoutes = require('./routes/userRoute');

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET; 

// Middleware per il parsing del corpo delle richieste in JSON
app.use(express.json());
// Middleware per servire file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public')));

// connect to db
connectDB();

// Controlla se le variabili d'ambiente sono impostate (per programmatori)
if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY non impostata');
    process.exit(1);
}
if (!JWT_SECRET) {
    console.error('JWT_SECRET non impostata');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI non impostata');
    process.exit(1);
}

// Middleware per proteggere le rotte protette
const authMiddleware = require('./middleware/authMiddleware.js');
app.use('/api/users', authMiddleware);

// Middleware per le rotte TMDB
app.use('/api/movies', movieRoutes);
// Middleware per le rotte utente
app.use('/api/users', userRoutes);

// Middleware per le rotte front-end
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Middleware per tutte le altre rotte front-end
app.use((req, res, next) => {
    if(req.path.startsWith('/api')) {
        next();
    } else {
        res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server Express è attivo su http://localhost:${PORT}`);
    console.log(`GET http://localhost:${PORT}/api/movies/popular`);
});