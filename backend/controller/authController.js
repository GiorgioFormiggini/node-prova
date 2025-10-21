// Import 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Importa il modello User per interagire con il DB
const User = require('../models/User'); 

// controler per registrare un nuovo utente su MongoDB
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Verifica se l'utente esiste già nel DB (username o email)
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea e salva il nuovo utente nel DB
        const newUser = new User({ 
            username, 
            email,
            password: hashedPassword 
        });
        await newUser.save(); 

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Errore durante la registrazione:", error.message);
        res.status(500).json({ message: 'Registration failed', details: error.message });
    }
};

// controller per autenticare un utente tramite DB e generare un token JWT
exports.login = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // richiesta di login deve contenere username/email e password
        if (!password || (!username && !email)) {
            return res.status(400).json({ message: 'Username/email and password are required' });
        }
        // ricerca utente nel DB basata su username/email forniti
        let user = null;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
        } else if (username && username.includes('@')) {
            user = await User.findOne({ email: username.toLowerCase() });
        } else if (username) {
            user = await User.findOne({ username: username });
        }

        // controllo se utente non trovato, credenziali non valide
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // confronta password fornita con quella hashata nel DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // se password corrisponde, genera token JWT per autenticazione
        const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error("Errore durante il login:", error.message);
        res.status(500).json({ message: 'Login failed', details: error.message });
    }
};