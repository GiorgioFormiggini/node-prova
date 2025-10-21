// backend/tests/db-connection.test.js
require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Test di connessione al database MongoDB
 * Questo script verifica se è possibile connettersi al database MongoDB
 * e mostra informazioni sulla connessione
 */
async function testDBConnection() {
  console.log('🔄 Avvio test di connessione a MongoDB...');
  
  try {
    // Ottieni l'URI di connessione dalle variabili d'ambiente
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/movieapp';
    
    // Opzioni di connessione
    const options = {
      // Nota: queste opzioni sono deprecate nelle versioni recenti di Mongoose
      // ma le includiamo per compatibilità con versioni precedenti
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Tenta la connessione al database
    const conn = await mongoose.connect(mongoURI, options);
    
    // Se la connessione ha successo, mostra informazioni sul database
    console.log('✅ Connessione a MongoDB stabilita con successo!');
    console.log(`📡 Server MongoDB: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);
    console.log(`🔌 Stato connessione: ${conn.connection.readyState === 1 ? 'Attiva' : 'Non attiva'}`);
    
    // Verifica se possiamo accedere alle collezioni
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Collezioni disponibili: ${collections.length}`);
    if (collections.length > 0) {
      console.log('📋 Elenco collezioni:');
      collections.forEach(collection => {
        console.log(`   - ${collection.name}`);
      });
    } else {
      console.log('ℹ️ Nessuna collezione presente nel database.');
    }
    
    // Chiudi la connessione dopo il test
    await mongoose.connection.close();
    console.log('🔒 Connessione chiusa.');
    
    return true;
  } catch (error) {
    // Se la connessione fallisce, mostra l'errore
    console.error('❌ Test di connessione fallito:');
    console.error(error);
    return false;
  }
}

// Esegui il test immediatamente
testDBConnection()
  .then(success => {
    // Esci con codice appropriato
    process.exit(success ? 0 : 1);
  });