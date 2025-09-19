// backend/src/configuration/setupServer.ts
import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';

// Configuration CORS et autres paramètres du serveur
export async function configureServer(fastify: FastifyInstance): Promise<void> {
  
  // Configuration CORS pour permettre les requêtes depuis le frontend
  await fastify.register(fastifyCors, {
    origin: true, // Autorise toutes les origines (pour le développement)
    credentials: true, // Permet l'envoi de cookies/tokens
    allowedHeaders: ['content-type', 'authorization'], // Headers autorisés
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] // Méthodes HTTP autorisées
  });

  console.log('✅ Configuration CORS appliquée');
}

// Configuration des hooks pour fermer proprement les ressources
export function setupServerHooks(fastify: FastifyInstance): void {
  
  // Hook appelé quand le serveur se ferme
  fastify.addHook('onClose', async () => {
    console.log('🛑 Fermeture du serveur Fastify...');
    // Importer et fermer la base de données
    const { closeDb } = await import('../db');
    closeDb();
  });

  console.log('✅ Hooks du serveur configurés');
}