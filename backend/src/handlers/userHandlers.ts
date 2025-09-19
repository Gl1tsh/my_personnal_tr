// backend/src/handlers/userHandlers.ts
import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { getDb } from '../db';
import { getAllUsers, createUser, CreateUserData } from '../logic/userManager';

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
}