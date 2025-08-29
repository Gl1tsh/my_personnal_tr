import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { initDb, getDb, closeDb } from './db'
import * as bcrypt from 'bcrypt' // Ajoute cet import ici pour corriger l'erreur

const server: FastifyInstance = Fastify({})

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
      required: ['name', 'login', 'password'],
      properties: {
        name: { type: 'string' },
        login: { type: 'string' },
        password: { type: 'string' }
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
  const { name, login, password } = request.body as { name: string; login: string; password: string }

  // Validation basique (tu peux ajouter plus de checks, ex: longueur, unicité login via query)
  if (!name || !login || !password) {
    return reply.status(400).send({ error: 'Champs requis manquants' })
  }

  try {
    // Hash du mot de passe (sel rounds = 10 par défaut, ajustable)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Préparation et exécution de l'insertion
    const stmt = db.prepare("INSERT INTO users (name, login, password) VALUES (?, ?, ?)")
    stmt.run(name, login, hashedPassword, function (err) {
      if (err) {
        reply.status(500).send({ error: err.message })
        return
      }
      // Renvoie 201 avec l'ID du nouvel utilisateur
      reply.status(201).send({ message: 'Utilisateur créé', id: this.lastID })
    })
    stmt.finalize()
  } catch (err) {
    reply.status(500).send({ error: (err as Error).message })
  }
})

const start = async () => {
  try {
    initDb() // Plus besoin d'await
    await server.listen({ port: 3000 })

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
