// backend/src/logic/userManager.ts
import * as bcrypt from 'bcrypt';
import { Database } from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Type pour les données d'un nouvel utilisateur
export interface CreateUserData {
  name: string;
  login: string;
  email: string;
  password: string;
}

// Type pour les données utilisateur retournées
export interface UserData {
  id: number;
  name: string;
  login: string;
  avatar?: string;
}

// Récupérer tous les utilisateurs de la base de données
export async function getAllUsers(db: Database): Promise<{ success: boolean; users?: UserData[]; error?: string }> {
  try {
    // Promisifier db.all
    const getAllUsersQuery = (): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all('SELECT id, name, login, avatar FROM users', (err, rows) => {
          if (err) reject(err);
          else resolve(rows as any[]);
        });
      });
    };

    const rows = await getAllUsersQuery();
    const formattedUsers = rows.map((row: any): UserData => ({
      id: row.id,
      name: row.name,
      login: row.login,
      avatar: row.avatar || null
    }));
    
    return { success: true, users: formattedUsers };
    
  } catch (err: any) {
    console.error('❌ Erreur récupération utilisateurs:', err);
    return { success: false, error: err.message };
  }
}

// Créer un nouvel utilisateur dans la base de données
export async function createUser(
  db: Database, 
  userData: CreateUserData
): Promise<{ success: boolean; userId?: number; error?: string }> {
  
  const { name, login, email, password } = userData;

  console.log('📝 Création utilisateur:', { name, login, email, password: '***' });

  // Validation basique
  if (!name || !login || !email || !password) {
    console.log('❌ Validation échouée: champs manquants');
    return { success: false, error: 'Champs requis manquants' };
  }

  // Validation des longueurs
  if (name.trim().length < 1 || name.trim().length > 50) {
    return { success: false, error: 'Le pseudo doit contenir entre 1 et 50 caractères' };
  }
  if (login.trim().length < 3 || login.trim().length > 30) {
    return { success: false, error: 'Le login doit contenir entre 3 et 30 caractères' };
  }
  if (email.trim().length < 5 || email.trim().length > 100) {
    return { success: false, error: 'L\'email doit contenir entre 5 et 100 caractères' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
  }

  try {
    // Hash du mot de passe (cryptage sécurisé)
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔐 Mot de passe hashé');

    // Version promisifiée de l'insertion
    const insertUser = (): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO users (name, login, email, password) VALUES (?, ?, ?, ?)");
        stmt.run(name, login, email, hashedPassword, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID as number);
          }
        });
        stmt.finalize();
      });
    };

    const userId = await insertUser();
    console.log('✅ Utilisateur créé avec ID:', userId);
    
    return { success: true, userId };

  } catch (err: any) {
    console.error('❌ Erreur lors de la création:', err.message);
    if (err.message.includes('UNIQUE')) {
      return { success: false, error: 'Login ou email déjà utilisé' };
    } else {
      return { success: false, error: err.message };
    }
  }
}

// Mettre à jour le pseudo d'un utilisateur
export async function updateUserName(
  db: Database,
  userId: number,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  
  console.log('✏️ Modification pseudo utilisateur ID:', userId, 'vers:', newName);

  // Validation basique
  if (!newName || newName.trim().length === 0) {
    return { success: false, error: 'Le nouveau pseudo ne peut pas être vide' };
  }

  if (newName.trim().length > 50) {
    return { success: false, error: 'Le pseudo ne peut pas dépasser 50 caractères' };
  }

  try {
    // Version promisifiée de la mise à jour
    const updateUser = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const stmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
        stmt.run(newName.trim(), userId, function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Utilisateur non trouvé'));
          } else {
            resolve();
          }
        });
        stmt.finalize();
      });
    };

    await updateUser();
    console.log('✅ Pseudo mis à jour pour l\'utilisateur ID:', userId);
    
    return { success: true };

  } catch (err: any) {
    console.error('❌ Erreur lors de la modification:', err.message);
    if (err.message === 'Utilisateur non trouvé') {
      return { success: false, error: 'Utilisateur non trouvé' };
    } else {
      return { success: false, error: err.message };
    }
  }
}

// Supprimer complètement un utilisateur et toutes ses données
export async function deleteUser(
  db: Database,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  
  console.log('🗑️ Suppression utilisateur ID:', userId);

  try {
    // 1. Récupérer l'avatar avant suppression
    const getUserAvatar = (): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        db.get('SELECT avatar FROM users WHERE id = ?', [userId], (err, row: any) => {
          if (err) reject(err);
          else resolve(row?.avatar || null);
        });
      });
    };

    const avatarPath = await getUserAvatar();

    // 2. Supprimer l'utilisateur de la base de données
    const removeUser = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const stmt = db.prepare("DELETE FROM users WHERE id = ?");
        stmt.run(userId, function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Utilisateur non trouvé'));
          } else {
            resolve();
          }
        });
        stmt.finalize();
      });
    };

    await removeUser();

    // 3. Supprimer le fichier avatar s'il existe
    if (avatarPath) {
      try {
        const fullAvatarPath = path.join(__dirname, '../../', avatarPath);
        if (fs.existsSync(fullAvatarPath)) {
          fs.unlinkSync(fullAvatarPath);
          console.log('🗑️ Avatar supprimé lors de la suppression utilisateur:', fullAvatarPath);
        }
      } catch (fileError) {
        console.warn('⚠️ Erreur lors de la suppression de l\'avatar:', fileError);
        // Ne pas échouer pour autant
      }
    }

    console.log('✅ Utilisateur supprimé avec succès ID:', userId);
    
    return { success: true };

  } catch (err: any) {
    console.error('❌ Erreur lors de la suppression:', err.message);
    if (err.message === 'Utilisateur non trouvé') {
      return { success: false, error: 'Utilisateur non trouvé' };
    } else {
      return { success: false, error: err.message };
    }
  }
}

// Mettre à jour toutes les infos utilisateur
export async function updateUserProfile(
  db: Database,
  userId: number,
  updates: { name?: string; email?: string; login?: string; password?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validation des longueurs
    if (updates.name && (updates.name.trim().length < 1 || updates.name.trim().length > 30)) {
      return { success: false, error: 'Le pseudo doit contenir entre 1 et 50 caractères' };
    }
    if (updates.login && (updates.login.trim().length < 3 || updates.login.trim().length > 30)) {
      return { success: false, error: 'Le login doit contenir entre 3 et 30 caractères' };
    }
    if (updates.email && (updates.email.trim().length < 5 || updates.email.trim().length > 60)) {
      return { success: false, error: 'L\'email doit contenir entre 5 et 100 caractères' };
    }
    if (updates.password && updates.password.length < 6) {
      return { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    // Vérifier l'unicité du nom (pseudo) si fourni
    if (updates.name) {
      const existingName = await new Promise<any>((resolve, reject) => {
        db.get('SELECT id FROM users WHERE name = ? AND id != ?', [updates.name.trim(), userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (existingName) {
        return { success: false, error: 'Pseudo déjà utilisé' };
      }
    }

    // Vérifier l'unicité du login si fourni
    if (updates.login) {
      const existingLogin = await new Promise<any>((resolve, reject) => {
        db.get('SELECT id FROM users WHERE login = ? AND id != ?', [updates.login.trim(), userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (existingLogin) {
        return { success: false, error: 'Login déjà utilisé' };
      }
    }

    // Vérifier l'unicité de l'email si fourni
    if (updates.email) {
      const existingEmail = await new Promise<any>((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ? AND id != ?', [updates.email.trim(), userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      if (existingEmail) {
        return { success: false, error: 'Email déjà utilisé' };
      }
    }

    // On construit dynamiquement la requête SQL
    const fields = [];
    const values = [];
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.email) {
      fields.push('email = ?');
      values.push(updates.email.trim());
    }
    if (updates.login) {
      fields.push('login = ?');
      values.push(updates.login.trim());
    }
    if (updates.password) {
      const hashed = await bcrypt.hash(updates.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }
    if (fields.length === 0) {
      return { success: false, error: 'Aucune donnée à modifier' };
    }
    values.push(userId);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await new Promise((resolve, reject) => {
      db.run(sql, values, function (err) {
        if (err) reject(err);
        else if (this.changes === 0) reject(new Error('Utilisateur non trouvé'));
        else resolve(true);
      });
    });
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      return { success: false, error: 'Login ou email déjà utilisé' };
    }
    return { success: false, error: err.message };
  }
}

// Mettre à jour l'avatar d'un utilisateur
export async function updateUserAvatar(
  db: Database,
  userId: number,
  avatarPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🖼️ Mise à jour avatar utilisateur ID:', userId, 'vers:', avatarPath);

    // 1. Récupérer l'ancien avatar
    const getOldAvatar = (): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        db.get('SELECT avatar FROM users WHERE id = ?', [userId], (err, row: any) => {
          if (err) reject(err);
          else resolve(row?.avatar || null);
        });
      });
    };

    const oldAvatarPath = await getOldAvatar();

    // 2. Supprimer l'ancien fichier s'il existe
    if (oldAvatarPath) {
      try {
        // Convertir le chemin relatif en chemin absolu
        const fullOldPath = path.join(__dirname, '../../', oldAvatarPath);
        if (fs.existsSync(fullOldPath)) {
          fs.unlinkSync(fullOldPath);
          console.log('🗑️ Ancien avatar supprimé:', fullOldPath);
        }
      } catch (fileError) {
        console.warn('⚠️ Erreur lors de la suppression de l\'ancien avatar:', fileError);
        // Ne pas échouer pour autant, continuer avec la mise à jour
      }
    }

    // 3. Mettre à jour la base de données avec le nouveau chemin
    const updateAvatar = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const stmt = db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
        stmt.run(avatarPath, userId, function (err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Utilisateur non trouvé'));
          } else {
            resolve();
          }
        });
        stmt.finalize();
      });
    };

    await updateAvatar();
    console.log('✅ Avatar mis à jour pour l\'utilisateur ID:', userId);
    
    return { success: true };
  } catch (err: any) {
    console.error('❌ Erreur lors de la mise à jour de l\'avatar:', err.message);
    if (err.message === 'Utilisateur non trouvé') {
      return { success: false, error: 'Utilisateur non trouvé' };
    } else {
      return { success: false, error: err.message };
    }
  }
}