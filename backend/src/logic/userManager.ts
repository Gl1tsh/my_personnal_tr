// backend/src/logic/userManager.ts
import * as bcrypt from 'bcrypt';
import { Database } from 'sqlite3';

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
  rank?: number;
  avatar?: string;
}

// Récupérer tous les utilisateurs de la base de données
export async function getAllUsers(db: Database): Promise<{ success: boolean; users?: UserData[]; error?: string }> {
  try {
    // Promisifier db.all
    const getAllUsersQuery = (): Promise<any[]> => {
      return new Promise((resolve, reject) => {
        db.all('SELECT id, name, login, rank, avatar FROM users', (err, rows) => {
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
      rank: row.rank,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null
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