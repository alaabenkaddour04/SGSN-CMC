const pool = require('../db/pool');

exports.getByEtudiant = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, m.nom as matiere, n.valeur, n.date, m.coefficient
       FROM notes n
       JOIN matieres m ON n.matiere_id = m.id
       WHERE n.etudiant_id = $1 ORDER BY m.nom`,
      [req.params.id]
    );
    const moyenne = result.rows.length > 0
      ? (result.rows.reduce((s, n) => s + parseFloat(n.valeur) * n.coefficient, 0) /
         result.rows.reduce((s, n) => s + n.coefficient, 0)).toFixed(2)
      : 0;
    res.json({ notes: result.rows, moyenne_generale: parseFloat(moyenne) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getByClasse = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.nom as stagiaire, m.nom as matiere, n.valeur
       FROM notes n
       JOIN utilisateurs u ON n.etudiant_id = u.id
       JOIN matieres m ON n.matiere_id = m.id
       JOIN classes c ON m.classe_id = c.id
       WHERE c.id = $1 ORDER BY u.nom, m.nom`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
