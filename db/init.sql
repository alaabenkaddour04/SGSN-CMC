CREATE TABLE IF NOT EXISTS utilisateurs (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_text VARCHAR(255),
    role VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    nom_classe VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    nom_module VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS stagiaires (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
    classe_id INTEGER REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    stagiaire_id INTEGER REFERENCES stagiaires(id),
    module_id INTEGER REFERENCES modules(id),
    note DECIMAL(4,2),
    date_note DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    stagiaire_id INTEGER REFERENCES stagiaires(id),
    module_id INTEGER REFERENCES modules(id),
    date_absence DATE DEFAULT CURRENT_DATE,
    justifiee BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS emplois_du_temps (
    id SERIAL PRIMARY KEY,
    classe_id INTEGER REFERENCES classes(id),
    jour VARCHAR(20),
    heure_debut TIME,
    heure_fin TIME,
    module_id INTEGER REFERENCES modules(id),
    salle VARCHAR(30)
);

INSERT INTO utilisateurs (nom, email, password_text, role) VALUES
('Mdm Kawtar El Bennani', 'kawtar@sgsn.ma', '123456', 'Admin'),
('Mdm Intissar', 'intissar@sgsn.ma', '123456', 'Gestionnaire'),
('Mr Kaabouch Abderrahim', 'abderrahim@sgsn.ma', '123456', 'Professeur'),
('Alaa Benkaddour', 'alaa@sgsn.ma', '123456', 'Etudiant'),
('Abderahman', 'abderahman@sgsn.ma', '123456', 'Etudiant'),
('Aymane', 'aymane@sgsn.ma', '123456', 'Etudiant')
ON CONFLICT (email) DO NOTHING;

INSERT INTO classes (nom_classe) VALUES ('Infrastructure Digitale - Cloud Computing')
ON CONFLICT DO NOTHING;

INSERT INTO modules (nom_module) VALUES
('Cloud Computing'), ('Réseaux'), ('Sécurité'), ('Linux Admin')
ON CONFLICT DO NOTHING;

INSERT INTO stagiaires (user_id, classe_id) VALUES (4,1),(5,1),(6,1)
ON CONFLICT DO NOTHING;

INSERT INTO emplois_du_temps (classe_id, jour, heure_debut, heure_fin, module_id, salle) VALUES
(1,'Lundi','08:30','11:00',1,'Salle 102'),
(1,'Lundi','11:00','13:00',2,'Labo Cloud'),
(1,'Mardi','08:30','11:00',3,'Salle 102'),
(1,'Mercredi','14:00','17:00',4,'Labo Linux')
ON CONFLICT DO NOTHING;

INSERT INTO notes (stagiaire_id, module_id, note) VALUES
(1,1,17.5),(1,2,15.0),(1,3,18.0),(1,4,16.5),
(2,1,14.0),(2,2,16.5),(2,3,13.5),(2,4,15.0),
(3,1,16.0),(3,2,14.5),(3,3,17.0),(3,4,18.5)
ON CONFLICT DO NOTHING;
