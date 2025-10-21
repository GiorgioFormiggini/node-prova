// backend/models/list.js

const mongoose = require('mongoose');

/**
 * Schema per le liste personalizzate di film e serie TV
 * Permette agli utenti di creare liste come "Da vedere", "Visti", "Preferiti", ecc.
 */
const ListSchema = new mongoose.Schema({
    // Nome della lista (es. "Da vedere", "Visti", "I miei preferiti")
    name: {
        type: String,
        required: [true, 'Il nome della lista è obbligatorio'],
        trim: true
    },
    
    // Descrizione opzionale della lista
    description: {
        type: String,
        trim: true,
        default: ''
    },
    
    // Riferimento all'utente proprietario della lista
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Tipo di lista: può essere predefinita dal sistema o personalizzata dall'utente
    listType: {
        type: String,
        enum: ['system', 'custom'],
        default: 'custom'
    },
    
    // Contenuti nella lista (riferimenti a film e serie TV)
    contents: [{
        // Riferimento al contenuto (film o serie TV)
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content',
            required: true
        },
        
        // Data di aggiunta alla lista
        addedAt: {
            type: Date,
            default: Date.now
        },
        
        // Posizione nella lista (per ordinamento personalizzato)
        position: {
            type: Number,
            default: 0
        },
        
        // Note personali dell'utente per questo contenuto specifico nella lista
        notes: {
            type: String,
            default: ''
        }
    }],
    
    // Impostazioni di privacy della lista
    isPublic: {
        type: Boolean,
        default: false
    },
    
    // Timestamp per tracciare creazione e aggiornamenti
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware pre-save per aggiornare il timestamp updatedAt
ListSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Indice composto per garantire unicità del nome della lista per utente
ListSchema.index({ user: 1, name: 1 }, { unique: true });

// Metodo per aggiungere un contenuto alla lista
ListSchema.methods.addContent = function(contentId) {
    // Verifica se il contenuto è già presente nella lista
    const contentExists = this.contents.some(item => 
        item.content.toString() === contentId.toString()
    );
    
    if (!contentExists) {
        // Aggiungi il contenuto alla lista con la posizione più alta
        const maxPosition = this.contents.length > 0 
            ? Math.max(...this.contents.map(item => item.position)) 
            : 0;
            
        this.contents.push({
            content: contentId,
            position: maxPosition + 1
        });
    }
    
    return this;
};

// Metodo per rimuovere un contenuto dalla lista
ListSchema.methods.removeContent = function(contentId) {
    this.contents = this.contents.filter(item => 
        item.content.toString() !== contentId.toString()
    );
    
    return this;
};

// Metodo statico per creare liste di sistema predefinite per un nuovo utente
ListSchema.statics.createDefaultLists = async function(userId) {
    const defaultLists = [
        { name: 'Da vedere', description: 'Film e serie TV che desideri guardare', listType: 'system' },
        { name: 'Visti', description: 'Film e serie TV che hai già visto', listType: 'system' },
        { name: 'Preferiti', description: 'I tuoi film e serie TV preferiti', listType: 'system' }
    ];
    
    const lists = defaultLists.map(list => ({
        ...list,
        user: userId
    }));
    
    return this.insertMany(lists);
};

module.exports = mongoose.model('List', ListSchema);