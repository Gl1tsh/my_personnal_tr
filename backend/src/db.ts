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
        rank INTEGER,
        avatar BLOB
      )
    `, (err) => {
      if (err) {
        console.error('Erreur création table:', err.message)
      } else {
        console.log('✅ Table users prête')
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
