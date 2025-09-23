// backend/src/handlers/userHandlers.ts
import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { getDb } from '../db';
import { getAllUsers, createUser, CreateUserData, updateUserName, deleteUser, updateUserProfile } from '../logic/userManager';
import { validateSession, logoutUser } from '../authentication/loginManager';

// Schémas de validation pour les requêtes
const getUsersSchema: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'array', // La réponse est un tableau d'utilisateurs
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            login: { type: 'string' },
            rank: { type: 'integer', nullable: true }, // rank peut être NULL dans la DB
            avatar: { type: 'string', nullable: true } // avatar en Base64, peut être NULL
          },
          required: ['id', 'name', 'login'] // Ces champs sont NOT NULL dans la DB
        }
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

const createUserSchema: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'login', 'email', 'password'],
      properties: {
        name: { type: 'string' },
        login: { type: 'string' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          id: { type: 'integer' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

const updateNameSchema: RouteShorthandOptions = {
  schema: {
    headers: {
      type: 'object',
      properties: {
        authorization: { type: 'string' }
      },
      required: ['authorization']
    },
    body: {
      type: 'object',
      required: ['newName'],
      properties: {
        newName: { type: 'string', minLength: 1, maxLength: 50 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          error: { type: 'string' }
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

const deleteAccountSchema: RouteShorthandOptions = {
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
          message: { type: 'string' }
        }
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  }
};

// Enregistrer toutes les routes utilisateurs
export async function registerUserHandlers(fastify: FastifyInstance) {
  
  // Route GET /users - Récupérer la liste de tous les utilisateurs
  fastify.get('/users', getUsersSchema, async (request, reply) => {
    const db = getDb();
    
    const result = await getAllUsers(db);
    
    if (!result.success) {
      return reply.status(500).header('Content-Type', 'application/json').send({ error: result.error });
    }
    
    return reply.status(200).header('Content-Type', 'application/json').send(result.users);
  });

  // Route POST /users - Créer un nouvel utilisateur (inscription)
  fastify.post('/users', createUserSchema, async (request, reply) => {
    const db = getDb();
    const userData = request.body as CreateUserData;

    const result = await createUser(db, userData);

    if (!result.success) {
      const statusCode = result.error === 'Login ou email déjà utilisé' ? 400 : 500;
      return reply.status(statusCode).send({ error: result.error });
    }
    
    reply.status(201).send({ message: 'Utilisateur créé', id: result.userId });
  });

  // Route PATCH /auth/profile/name - Modifier le pseudo de l'utilisateur connecté
  fastify.patch('/auth/profile/name', updateNameSchema, async (request, reply) => {
    // Vérifier l'authentification
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).header('Content-Type', 'application/json').send({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    const session = validateSession(token);
    
    if (!session) {
      return reply.status(401).header('Content-Type', 'application/json').send({ error: 'Session invalide' });
    }

    const { newName } = request.body as { newName: string };
    const db = getDb();

    const result = await updateUserName(db, session.userId, newName);

    if (!result.success) {
      const statusCode = result.error === 'Utilisateur non trouvé' ? 404 : 400;
      return reply.status(statusCode).send({ error: result.error });
    }
    
    reply.status(200).send({ message: 'Pseudo mis à jour avec succès' });
  });

  // Route DELETE /auth/profile - Supprimer complètement le compte utilisateur
  fastify.delete('/auth/profile', deleteAccountSchema, async (request, reply) => {
    // Vérifier l'authentification
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

    // Supprimer l'utilisateur de la base de données
    const result = await deleteUser(db, session.userId);

    if (!result.success) {
      const statusCode = result.error === 'Utilisateur non trouvé' ? 404 : 500;
      return reply.status(statusCode).send({ error: result.error });
    }
    
    // Supprimer aussi la session active
    logoutUser(token);
    
    reply.status(200).send({ message: 'Compte supprimé avec succès' });
  });

  // Route PATCH /auth/profile - Modifier toutes les infos utilisateur
  fastify.patch('/auth/profile', {
    schema: {
      headers: {
        type: 'object',
        properties: { authorization: { type: 'string' } },
        required: ['authorization']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          login: { type: 'string', minLength: 3, maxLength: 30 },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
        400: { type: 'object', properties: { error: { type: 'string' } } },
        401: { type: 'object', properties: { error: { type: 'string' } } }
      }
    }
  }, async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    const session = validateSession(token);
    if (!session) {
      return reply.status(401).send({ error: 'Session invalide' });
    }
    const db = getDb();
    const updates = request.body as { name?: string; email?: string; login?: string; password?: string };
    const result = await updateUserProfile(db, session.userId, updates);
    if (!result.success) {
      return reply.status(400).send({ error: result.error });
    }
    reply.status(200).send({ message: 'Profil mis à jour avec succès' });
  });
}