import sqlite3 from 'sqlite3'

let db: sqlite3.Database

export function initDb(): void {
  db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
      console.error('Erreur ouverture DB:', err.message)
      return
    }
    console.log('✅ Base de données connectée')
    
    // Créer la table users si elle n'existe pas
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(128) NOT NULL,
        login VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(128) NOT NULL,
        avatar VARCHAR(255),
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table:', err.message)
      } else {
        console.log('✅ Table users prête')
      }
    })

    // Créer la table matches pour l'historique des parties
    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER NOT NULL,
        player2_id INTEGER NOT NULL,
        winner_id INTEGER,
        loser_id INTEGER,
        score VARCHAR(32),
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(player1_id) REFERENCES users(id),
        FOREIGN KEY(player2_id) REFERENCES users(id),
        FOREIGN KEY(winner_id) REFERENCES users(id),
        FOREIGN KEY(loser_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table matches:', err.message)
      } else {
        console.log('✅ Table matches prête')
      }
    })
  })
}

export function getDb(): sqlite3.Database {
  if (!db) throw new Error("DB not initialized")
  return db
}

export function closeDb(): void {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture DB:', err.message)
      } else {
        console.log('✅ Base de données fermée proprement')
      }
    })
  }
}
