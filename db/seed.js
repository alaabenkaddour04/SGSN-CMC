const pool = require('./pool');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await pool.query(`INSERT INTO classes (nom) VALUES ('Infrastructure Digitale - Cloud Computing') ON CONFLICT DO NOTHING`);
    const classe = await pool.query(`SELECT id FROM classes LIMIT 1`);
    const classeId = classe.rows[0].id;

    const matieres = ['Réseaux', 'Bases de données', 'Systèmes Cloud', 'Sécurité Informatique'];
    for (const nom of matieres) {
      await pool.query(
        `INSERT INTO matieres (nom, coefficient, classe_id) VALUES ($1, 2, $2) ON CONFLICT DO NOTHING`,
        [nom, classeId]
      );
    }

    const users = [
      { nom: 'Mr Kaabouch Abderrahim',  email: 'kaabouch@sgsn.ma',   password: 'Prof123!',    role: 'prof' },
      { nom: 'Mdm Kawtar El Bennani',   email: 'kawtar@sgsn.ma',     password: 'Admin123!',   role: 'admin' },
      { nom: 'Mdm Intissar',            email: 'intissar@sgsn.ma',   password: 'Gest123!',    role: 'gestionnaire' },
      { nom: 'Alaa Benkaddour',         email: 'alaa@sgsn.ma',       password: 'Stagiaire1!', role: 'etudiant' },
      { nom: 'Abderahman',              email: 'abderahman@sgsn.ma', password: 'Stagiaire2!', role: 'etudiant' },
      { nom: 'Aymane',                  email: 'aymane@sgsn.ma',     password: 'Stagiaire3!', role: 'etudiant' },
    ];

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      await pool.query(
        `INSERT INTO utilisateurs (nom, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        [u.nom, u.email, hash, u.role]
      );
    }

    const stagiaires = await pool.query(`SELECT id FROM utilisateurs WHERE role = 'etudiant' ORDER BY id`);
    const matieresList = await pool.query(`SELECT id FROM matieres ORDER BY id`);

    const notesData = [
      [16.5, 14, 17.5, 15],
      [13, 15.5, 12, 18],
      [14.5, 13, 16, 17],
    ];

    for (let i = 0; i < stagiaires.rows.length; i++) {
      for (let j = 0; j < matieresList.rows.length; j++) {
        await pool.query(
          `INSERT INTO notes (etudiant_id, matiere_id, valeur) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [stagiaires.rows[i].id, matieresList.rows[j].id, notesData[i][j]]
        );
      }
    }

    await pool.query(
      `INSERT INTO absences (etudiant_id, matiere_id, justifiee) VALUES ($1, $2, false), ($1, $3, true)`,
      [stagiaires.rows[0].id, matieresList.rows[0].id, matieresList.rows[1].id]
    );

    console.log('Seed terminé!');
    console.log('  kaabouch@sgsn.ma   / Prof123!');
    console.log('  kawtar@sgsn.ma     / Admin123!');
    console.log('  intissar@sgsn.ma   / Gest123!');
    console.log('  alaa@sgsn.ma       / Stagiaire1!');
    console.log('  abderahman@sgsn.ma / Stagiaire2!');
    console.log('  aymane@sgsn.ma     / Stagiaire3!');
    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

seed();
