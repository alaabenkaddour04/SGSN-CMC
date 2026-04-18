const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Route de Login centralisée
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Logique de recherche unifiée
        const query = `
            SELECT id, nom, email, role FROM staff WHERE email = $1 AND password = $2
            UNION ALL
            SELECT id, nom, email, 'Etudiant' as role FROM stagiaires WHERE email = $1 AND password = $2
        `;
        
        const result = await pool.query(query, [email, password]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            // F l-production ghadi n-zido hna JWT Token
            res.json({
                id: user.id,
                name: user.nom,
                role: user.role,
                status: 'Success'
            });
        } else {
            res.status(401).json({ message: 'Identifiants invalides' });
        }
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
