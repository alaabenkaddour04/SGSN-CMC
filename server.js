const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'sgsn-db',
    database: process.env.DB_NAME || 'sgsn_db',
    password: process.env.DB_PASSWORD || 'sgsn2026',
    port: process.env.DB_PORT || 5432,
});

// AUTH
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, nom, email, role FROM utilisateurs WHERE email = $1 AND password_text = $2',
            [email, password]
        );
        if (result.rows.length > 0) res.json(result.rows[0]);
        else res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    } catch (err) { res.status(500).json({ message: 'Erreur serveur: ' + err.message }); }
});

// STAGIAIRES
app.get('/api/stagiaires', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.nom, u.email, s.id as stagiaire_id, c.nom_classe 
             FROM utilisateurs u
             JOIN stagiaires s ON u.id = s.user_id
             JOIN classes c ON s.classe_id = c.id
             WHERE u.role = 'Etudiant' ORDER BY u.nom`
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/stagiaires', async (req, res) => {
    const { nom, email, password } = req.body;
    try {
        await pool.query('BEGIN');
        const user = await pool.query(
            'INSERT INTO utilisateurs (nom, email, password_text, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [nom, email, password || '123456', 'Etudiant']
        );
        await pool.query('INSERT INTO stagiaires (user_id, classe_id) VALUES ($1, 1)', [user.rows[0].id]);
        await pool.query('COMMIT');
        res.json({ message: 'Stagiaire ajouté', id: user.rows[0].id });
    } catch (err) { await pool.query('ROLLBACK'); res.status(500).json({ message: err.message }); }
});

app.put('/api/stagiaires/:id', async (req, res) => {
    const { nom, email } = req.body;
    try {
        await pool.query('UPDATE utilisateurs SET nom=$1, email=$2 WHERE id=$3', [nom, email, req.params.id]);
        res.json({ message: 'Modifié' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/stagiaires/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM utilisateurs WHERE id=$1', [req.params.id]);
        res.json({ message: 'Supprimé' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// NOTES
app.get('/api/notes/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT n.id, m.nom_module, n.note, n.date_note 
             FROM notes n JOIN modules m ON n.module_id = m.id
             WHERE n.stagiaire_id = $1 ORDER BY m.nom_module`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/notes', async (req, res) => {
    const { stagiaire_id, module_id, note } = req.body;
    try {
        await pool.query(
            'INSERT INTO notes (stagiaire_id, module_id, note) VALUES ($1, $2, $3)',
            [stagiaire_id, module_id, note]
        );
        res.json({ message: 'Note ajoutée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        await pool.query('UPDATE notes SET note=$1 WHERE id=$2', [req.body.note, req.params.id]);
        res.json({ message: 'Note modifiée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
        res.json({ message: 'Note supprimée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ABSENCES
app.get('/api/absences/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id, m.nom_module, a.date_absence, a.justifiee
             FROM absences a JOIN modules m ON a.module_id = m.id
             WHERE a.stagiaire_id = $1 ORDER BY a.date_absence DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/absences', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.id, u.nom as stagiaire, m.nom_module, a.date_absence, a.justifiee
             FROM absences a
             JOIN stagiaires s ON a.stagiaire_id = s.id
             JOIN utilisateurs u ON s.user_id = u.id
             JOIN modules m ON a.module_id = m.id
             ORDER BY a.date_absence DESC`
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/absences', async (req, res) => {
    const { stagiaire_id, module_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO absences (stagiaire_id, module_id, justifiee) VALUES ($1, $2, false)',
            [stagiaire_id, module_id]
        );
        res.json({ message: 'Absence ajoutée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/absences/:id/justifier', async (req, res) => {
    try {
        await pool.query('UPDATE absences SET justifiee=true WHERE id=$1', [req.params.id]);
        res.json({ message: 'Justifiée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/absences/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM absences WHERE id=$1', [req.params.id]);
        res.json({ message: 'Supprimée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// EMPLOI DU TEMPS
app.get('/api/emploi/:classeId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.id, e.jour, e.heure_debut, e.heure_fin, m.nom_module, e.salle, m.id as module_id
             FROM emplois_du_temps e
             JOIN modules m ON e.module_id = m.id
             WHERE e.classe_id = $1
             ORDER BY CASE e.jour 
             WHEN 'Lundi' THEN 1 WHEN 'Mardi' THEN 2 WHEN 'Mercredi' THEN 3 
             WHEN 'Jeudi' THEN 4 WHEN 'Vendredi' THEN 5 ELSE 6 END, e.heure_debut`,
            [req.params.classeId]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/emploi', async (req, res) => {
    const { classe_id, jour, heure_debut, heure_fin, module_id, salle } = req.body;
    try {
        await pool.query(
            'INSERT INTO emplois_du_temps (classe_id, jour, heure_debut, heure_fin, module_id, salle) VALUES ($1,$2,$3,$4,$5,$6)',
            [classe_id, jour, heure_debut, heure_fin, module_id, salle]
        );
        res.json({ message: 'Séance ajoutée' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/emploi/:id', async (req, res) => {
    const { jour, heure_debut, heure_fin, module_id, salle } = req.body;
    try {
        await pool.query(
            'UPDATE emplois_du_temps SET jour=$1, heure_debut=$2, heure_fin=$3, module_id=$4, salle=$5 WHERE id=$6',
            [jour, heure_debut, heure_fin, module_id, salle, req.params.id]
        );
        res.json({ message: 'Modifié' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/emploi/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM emplois_du_temps WHERE id=$1', [req.params.id]);
        res.json({ message: 'Supprimé' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// MODULES & CLASSES
app.get('/api/modules', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM modules ORDER BY nom_module');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/classes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classes ORDER BY nom_classe');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'SGSN-CMC' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`SGSN-CMC running on port ${PORT}`));
