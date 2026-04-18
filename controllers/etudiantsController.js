const pool = require('../db/pool');

exports.getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM stagiaires ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM stagiaires WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Non trouvé' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
