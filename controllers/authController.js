const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email et password requis' });

  try {
    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1', [email]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Email ou password incorrect' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Email ou password incorrect' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nom, email, role FROM utilisateurs WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
