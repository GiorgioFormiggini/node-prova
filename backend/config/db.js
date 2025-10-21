// src/config/db.js

const mongoose = require('mongoose');

/**
 * @function connectDB
 * @description Stabilisce la connessione al database MongoDB utilizzando Mongoose.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connesso: ${conn.connection.host}`);
    } catch (error) {
        console.error(`ERRORE Connessione DB: ${error.message}`);
        // Termina l'applicazione in caso di errore critico
        process.exit(1);
    }
};

module.exports = connectDB;