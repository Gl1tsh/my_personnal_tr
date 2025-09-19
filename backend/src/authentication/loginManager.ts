// backend/src/authentication/loginManager.ts
import * as bcrypt from 'bcrypt';
import { Database } from 'sqlite3';

// Type pour une session utilisateur
export interface UserSession {
  userId: number;
  login: string;
}

// Type pour les données utilisateur
export interface User {
  id: number;
  name: string;
  login: string;
  email: string;
  rank?: number;
  avatar?: string;
}

// Stockage simple des sessions (en production, utilisez Redis)
const activeSessions: Map<string, UserSession> = new Map();

// Générer un token de session simple
export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Authentifier un utilisateur (vérifier login/mot de passe)
export async function authenticateUser(
  db: Database,
  identifier: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  
  console.log('🔐 Tentative de connexion pour:', identifier);

  if (!identifier || !password) {
    console.log('❌ Données manquantes:', { identifier: !!identifier, password: !!password });
    return { success: false, error: 'Identifiant et mot de passe requis' };
  }

  try {
    // Promisifier db.get pour éviter les problèmes de callback
    const getUserByIdentifier = (identifier: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT id, name, login, email, password FROM users WHERE login = ? OR email = ?',
          [identifier, identifier],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    };

    // Chercher l'utilisateur
    const row = await getUserByIdentifier(identifier);
    
    if (!row) {
      console.log('❌ Utilisateur non trouvé:', identifier);
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    console.log('👤 Utilisateur trouvé:', row.login);

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, row.password);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', row.login);
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Succès - créer une session
    const user: User = {
      id: row.id,
      name: row.name,
      login: row.login,
      email: row.email
    };

    const sessionToken = generateSessionToken();
    activeSessions.set(sessionToken, { userId: row.id, login: row.login });

    console.log('✅ Connexion réussie pour:', row.login, 'Token:', sessionToken.substring(0, 10) + '...');

    return { success: true, user, token: sessionToken };
      
  } catch (err: any) {
    console.error('❌ Erreur générale:', err);
    return { success: false, error: err.message || 'Erreur serveur interne' };
  }
}

// Valider un token de session (vérifier si l'utilisateur est connecté)
export function validateSession(token: string): UserSession | null {
  return activeSessions.get(token) || null;
}

// Récupérer le profil utilisateur complet
export async function getUserProfile(
  db: Database,
  userId: number
): Promise<{ success: boolean; user?: User; error?: string }> {
  
  try {
    // Promisifier db.get pour éviter les problèmes de callback
    const getUserById = (userId: number): Promise<any> => {
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT id, name, login, email, rank, avatar FROM users WHERE id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
    };

    const row = await getUserById(userId);

    if (!row) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }

    const user: User = {
      id: row.id,
      name: row.name,
      login: row.login,
      email: row.email,
      rank: row.rank || 1,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null
    };

    console.log('✅ Profil récupéré pour:', row.login);
    return { success: true, user };

  } catch (err) {
    console.error('❌ Erreur récupération profil:', err);
    return { success: false, error: (err as Error).message };
  }
}

// Déconnecter un utilisateur (supprimer sa session)
export function logoutUser(token: string): void {
  if (token) {
    activeSessions.delete(token);
    console.log('👋 Session supprimée pour le token:', token.substring(0, 10) + '...');
  }
}

// Obtenir toutes les sessions actives (pour le debug)
export function getActiveSessions(): Map<string, UserSession> {
  return activeSessions;
}