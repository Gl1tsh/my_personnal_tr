import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { initDb, getDb, closeDb } from './db'
import * as bcrypt from 'bcrypt' // Ajoute cet import ici pour corriger l'erreur
import fastifyCors from '@fastify/cors'

const server: FastifyInstance = Fastify({})

// Hook pour ajouter les headers CORS manuellement
server.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', 'http://localhost:3002')
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  reply.header('Access-Control-Allow-Credentials', 'true')
  
  if (request.method === 'OPTIONS') {
    reply.status(200).send()
  }
})

// Supprimer la fonction setupServer
// async function setupServer() {
//   await server.register(require('@fastify/cors'), {
//     origin: ['http://localhost:3002'],
//     credentials: true
//   })
// }

const getUsersOpts: RouteShorthandOptions = {
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
}

// Nouvelle options pour la route POST /users (schéma pour valider le body)
const postOpts: RouteShorthandOptions = {
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
}

server.get('/users', getUsersOpts, async (request, reply) => {
  const db = getDb()
  
  db.all('SELECT id, name, login, rank, avatar FROM users', (err, rows) => {
    if (err) {
      reply.status(500).send({ error: err.message })
      return
    }
    const formattedRows = rows.map((row: any) => ({
      ...row,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null
    }))
    reply.send(formattedRows)
  })
})

server.post('/users', postOpts, async (request, reply) => {
  const db = getDb()
  const { name, login, email, password } = request.body as { name: string; login: string; email: string; password: string }

  console.log('📝 Requête POST /users reçue:', { name, login, email, password: '***' })

  // Validation basique
  if (!name || !login || !email || !password) {
    console.log('❌ Validation échouée: champs manquants')
    return reply.status(400).send({ error: 'Champs requis manquants' })
  }

  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('🔐 Mot de passe hashé')

    // Version promisifiée de l'insertion
    const insertUser = () => {
      return new Promise<number>((resolve, reject) => {
        const stmt = db.prepare("INSERT INTO users (name, login, email, password) VALUES (?, ?, ?, ?)")
        stmt.run(name, login, email, hashedPassword, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID as number)
          }
        })
        stmt.finalize()
      })
    }

    const userId = await insertUser()
    console.log('✅ Utilisateur créé avec ID:', userId)
    
    reply.status(201).send({ message: 'Utilisateur créé', id: userId })

  } catch (err: any) {
    console.error('❌ Erreur lors de la création:', err.message)
    if (err.message.includes('UNIQUE')) {
      reply.status(400).send({ error: 'Login ou email déjà utilisé' })
    } else {
      reply.status(500).send({ error: err.message })
    }
  }
})

// Route de login
const loginOpts: RouteShorthandOptions = {
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
          }
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
}

// Stockage simple des sessions (en production, utilisez Redis)
const activeSessions: Map<string, { userId: number; login: string }> = new Map()

// Générer un token de session simple
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

server.post('/auth/login', loginOpts, async (request, reply) => {
  const db = getDb()
  const { identifier, password } = request.body as { identifier: string; password: string }

  if (!identifier || !password) {
    return reply.status(400).send({ error: 'Identifiant et mot de passe requis' })
  }

  try {
    // Chercher l'utilisateur par login ou email
    db.get(
      'SELECT id, name, login, email, password FROM users WHERE login = ? OR email = ?',
      [identifier, identifier],
      async (err, row: any) => {
        if (err) {
          return reply.status(500).send({ error: err.message })
        }

        if (!row) {
          return reply.status(400).send({ error: 'Utilisateur non trouvé' })
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, row.password)
        if (!isValidPassword) {
          return reply.status(400).send({ error: 'Mot de passe incorrect' })
        }

        // Succès - renvoyer les infos utilisateur (sans le mot de passe)
        const user = {
          id: row.id,
          name: row.name,
          login: row.login,
          email: row.email
        }

        // Créer une session simple (stockage en mémoire)
        const sessionToken = generateSessionToken()
        activeSessions.set(sessionToken, { userId: row.id, login: row.login })

        // Renvoyer le token dans la réponse (côté client le stockera)
        reply.status(200).send({ 
          message: 'Connexion réussie', 
          user,
          sessionToken // Le frontend utilisera ça temporairement
        })
      }
    )
  } catch (err) {
    reply.status(500).send({ error: (err as Error).message })
  }
})

// Route pour récupérer le profil utilisateur
const profileOpts: RouteShorthandOptions = {
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
              rank: { type: 'integer', nullable: true },
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
}

server.get('/auth/profile', profileOpts, async (request, reply) => {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token manquant' })
  }

  const token = authHeader.split(' ')[1]
  const session = activeSessions.get(token)
  
  if (!session) {
    return reply.status(401).send({ error: 'Session invalide' })
  }

  const db = getDb()
  
  try {
    db.get(
      'SELECT id, name, login, email, rank, avatar FROM users WHERE id = ?',
      [session.userId],
      (err, row: any) => {
        if (err) {
          return reply.status(500).send({ error: err.message })
        }

        if (!row) {
          return reply.status(404).send({ error: 'Utilisateur non trouvé' })
        }

        const user = {
          id: row.id,
          name: row.name,
          login: row.login,
          email: row.email,
          rank: row.rank || 1,
          avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null
        }

        reply.status(200).send({ user })
      }
    )
  } catch (err) {
    reply.status(500).send({ error: (err as Error).message })
  }
})

// Route de déconnexion
server.post('/auth/logout', async (request, reply) => {
  const authHeader = request.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    activeSessions.delete(token)
  }
  reply.status(200).send({ message: 'Déconnexion réussie' })
})

const start = async () => {
  try {
    initDb() // Plus besoin d'await
    await server.listen({ port: 3001 })

    const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port
    console.log(`🚀 Serveur démarré sur le port ${port}`)

  } catch (err) {
    server.log.error(err)
    closeDb() // Fermer la DB en cas d'erreur
    process.exit(1)
  }
}

// Hook Fastify (version corrigée)
server.addHook('onClose', async () => {
  console.log('🛑 Fermeture du serveur Fastify...')
  closeDb()
})

start()
