CREATE DATABASE sgsn_db;
\c sgsn_db

CREATE TABLE utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'prof', 'gestionnaire', 'etudiant')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(50) NOT NULL
);

CREATE TABLE matieres (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  coefficient INTEGER DEFAULT 1,
  classe_id INTEGER REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  etudiant_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
  matiere_id INTEGER REFERENCES matieres(id) ON DELETE CASCADE,
  valeur NUMERIC(5,2) CHECK (valeur BETWEEN 0 AND 20),
  date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE absences (
  id SERIAL PRIMARY KEY,
  etudiant_id INTEGER REFERENCES utilisateurs(id) ON DELETE CASCADE,
  matiere_id INTEGER REFERENCES matieres(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  justifiee BOOLEAN DEFAULT FALSE
);
