// backend/src/server.ts
import Fastify, { FastifyInstance } from 'fastify';
import { initDb, closeDb } from './db';
import { configureServer, setupServerHooks } from './configuration/setupServer';
import { registerAuthenticationHandlers } from './handlers/authenticationHandlers';
import { registerUserHandlers } from './handlers/userHandlers';

// Créer l'instance Fastify
const server: FastifyInstance = Fastify({});

// Fonction principale de démarrage
const start = async () => {
  try {
    // 1. Initialiser la base de données
    initDb();
    console.log('✅ Base de données initialisée');

    // 2. Configurer le serveur (CORS, middlewares, etc.)
    await configureServer(server);

    // 3. Configurer les hooks (fermeture propre, etc.)
    setupServerHooks(server);

    // 4. Enregistrer les gestionnaires de routes
    await registerAuthenticationHandlers(server);
    await registerUserHandlers(server);
    console.log('✅ Gestionnaires de routes enregistrés');

    // 5. Démarrer le serveur
    await server.listen({ port: 3001 });

    const address = server.server.address();
    const port = typeof address === 'string' ? address : address?.port;
    console.log(`🚀 Serveur démarré sur le port ${port}`);

  } catch (err) {
    server.log.error(err);
    closeDb(); // Fermer la DB en cas d'erreur
    process.exit(1);
  }
};

// Démarrer l'application
start();
