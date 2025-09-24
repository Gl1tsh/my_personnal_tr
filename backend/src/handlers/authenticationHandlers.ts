// backend/src/handlers/authenticationHandlers.ts
import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { getDb } from '../db';
import { authenticateUser, validateSession, getUserProfile, logoutUser } from '../authentication/loginManager';

// Schémas de validation pour les requêtes
const loginSchema: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['identifier', 'password'],
      properties: {
        identifier: { type: 'string' }, // login ou email
        password: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              login: { type: 'string' },
              email: { type: 'string' }
            }
          },
          sessionToken: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

const profileSchema: RouteShorthandOptions = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        authorization: { type: 'string' }
      },
      required: ['authorization']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              login: { type: 'string' },
              email: { type: 'string' },
              avatar: { type: 'string', nullable: true }
            }
          }
        }
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

// Enregistrer toutes les routes d'authentification
export async function registerAuthenticationHandlers(fastify: FastifyInstance) {
  
  // Route de connexion (login)
  fastify.post('/auth/login', loginSchema, async (request, reply) => {
    const db = getDb();
    const { identifier, password } = request.body as { identifier: string; password: string };

    const result = await authenticateUser(db, identifier, password);

    if (!result.success) {
      return reply.status(400).header('Content-Type', 'application/json').send({ error: result.error });
    }

    return reply
      .status(200)
      .header('Content-Type', 'application/json')
      .send({ 
        message: 'Connexion réussie', 
        user: result.user,
        sessionToken: result.token
      });
  });

  // Route pour récupérer le profil utilisateur
  fastify.get('/auth/profile', profileSchema, async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).header('Content-Type', 'application/json').send({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const session = validateSession(token);
    
    if (!session) {
      return reply.status(401).header('Content-Type', 'application/json').send({ error: 'Session invalide' });
    }

    const db = getDb();
    const result = await getUserProfile(db, session.userId);

    if (!result.success) {
      const statusCode = result.error === 'Utilisateur non trouvé' ? 404 : 500;
      return reply.status(statusCode).header('Content-Type', 'application/json').send({ error: result.error });
    }

    return reply.status(200).header('Content-Type', 'application/json').send({ user: result.user });
  });

  // Route de déconnexion (logout)
  fastify.post('/auth/logout', async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      logoutUser(token);
    }
    reply.status(200).send({ message: 'Déconnexion réussie' });
  });
}