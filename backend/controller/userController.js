// Importa il modello User
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'Utente non trovato' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Errore getProfile:', error.message);
        res.status(500).json({ success: false, error: 'Impossibile recuperare il profilo' });
    }
};
