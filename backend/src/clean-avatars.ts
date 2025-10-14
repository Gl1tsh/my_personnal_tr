// Script pour nettoyer les avatars orphelins (fichiers sans utilisateur correspondant)
import * as fs from 'fs';
import * as path from 'path';
import sqlite3 from 'sqlite3';

const dbPath = './database.sqlite';
const avatarsDir = path.join(__dirname, '../uploads/avatars');

function cleanOrphanedAvatars(): void {
  console.log('🧹 Nettoyage des avatars orphelins...');

  // Ouvrir la base de données
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Erreur ouverture DB:', err.message);
      return;
    }
  });

  // Récupérer tous les avatars utilisés
  db.all('SELECT avatar FROM users WHERE avatar IS NOT NULL', (err, rows: any[]) => {
    if (err) {
      console.error('❌ Erreur requête DB:', err.message);
      db.close();
      return;
    }

    const usedAvatars = new Set(rows.map(row => row.avatar));

    // Lister tous les fichiers dans le dossier avatars
    fs.readdir(avatarsDir, (err, files) => {
      if (err) {
        console.error('❌ Erreur lecture dossier:', err.message);
        db.close();
        return;
      }

      let cleanedCount = 0;

      files.forEach(file => {
        const filePath = `/uploads/avatars/${file}`;

        if (!usedAvatars.has(filePath)) {
          try {
            fs.unlinkSync(path.join(avatarsDir, file));
            console.log('🗑️ Avatar orphelin supprimé:', file);
            cleanedCount++;
          } catch (fileErr) {
            console.warn('⚠️ Erreur suppression fichier:', file, fileErr);
          }
        }
      });

      console.log(`✅ Nettoyage terminé. ${cleanedCount} avatars orphelins supprimés.`);
      db.close();
    });
  });
}

// Exécuter le nettoyage
cleanOrphanedAvatars();