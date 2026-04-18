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
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'sgsn_db',
    password: process.env.DB_PASSWORD || 'sgsn2026',
    port: process.env.DB_PORT || 5432,
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, nom, email, role FROM utilisateurs WHERE email = $1 AND password_text = $2',
            [email, password]
        );
        if (result.rows.length > 0) res.json(result.rows[0]);
        else res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    } catch (err) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.get('/api/notes/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.nom_module, n.note, n.date_note FROM notes n
             JOIN modules m ON n.module_id = m.id
             WHERE n.stagiaire_id = $1`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.get('/api/absences/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.nom_module, a.date_absence, a.justifiee FROM absences a
             JOIN modules m ON a.module_id = m.id
             WHERE a.stagiaire_id = $1`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.get('/api/emploi/:classeId', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.jour, e.heure_debut, e.heure_fin, m.nom_module, e.salle
             FROM emplois_du_temps e
             JOIN modules m ON e.module_id = m.id
             WHERE e.classe_id = $1 ORDER BY e.jour, e.heure_debut`,
            [req.params.classeId]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.get('/api/stagiaires', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.nom, u.email, s.id as stagiaire_id FROM utilisateurs u
             JOIN stagiaires s ON u.id = s.user_id WHERE u.role = 'Etudiant'`
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.post('/api/notes/add', async (req, res) => {
    const { stagiaire_id, module_id, note } = req.body;
    try {
        await pool.query(
            'INSERT INTO notes (stagiaire_id, module_id, note) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
            [stagiaire_id, module_id, note]
        );
        res.json({ message: 'Note enregistrée' });
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.post('/api/absences/add', async (req, res) => {
    const { stagiaire_id, module_id, justifiee } = req.body;
    try {
        await pool.query(
            'INSERT INTO absences (stagiaire_id, module_id, justifiee) VALUES ($1,$2,$3)',
            [stagiaire_id, module_id, justifiee]
        );
        res.json({ message: 'Absence enregistrée' });
    } catch (err) { res.status(500).json({ message: 'Erreur' }); }
});

app.listen(3000, '0.0.0.0', () => console.log('SGSN-CMC kheddam f port 3000'));
