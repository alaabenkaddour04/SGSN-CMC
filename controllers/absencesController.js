const pool = require('../db/pool');

exports.getByEtudiant = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, m.nom as matiere, a.date, a.justifiee
       FROM absences a
       JOIN matieres m ON a.matiere_id = m.id
       WHERE a.etudiant_id = $1 ORDER BY a.date DESC`,
      [req.params.id]
    );
    res.json({
      absences: result.rows,
      total: result.rows.length,
      non_justifiees: result.rows.filter(a => !a.justifiee).length
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
