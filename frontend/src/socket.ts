// src/socket.ts

import { io } from 'socket.io-client';

// 1) On force la connexion vers le stub Socket.IO sur http://localhost:3000
export const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'], // Permet fallback
  timeout: 20000,
  forceNew: true  // Force une nouvelle connexion
});

// 2) Quand on se connecte
socket.on('connect', async () => {
  console.log('📡 Socket.IO connecté :', socket.id);
  
  // Récupérer le pseudo depuis l'authentification centralisée
  const token = sessionStorage.getItem('authToken');
  if (token) {
    try {
      // Récupérer les infos utilisateur via l'API
      const response = await fetch('http://localhost:3001/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        const username = result.user.name;
        socket.emit('set_username', username);
        console.log('👤 Pseudo envoyé au serveur:', username);
      } else {
        // Token invalide, utiliser un pseudo par défaut
        socket.emit('set_username', `User_${socket.id?.substring(0, 6) || 'Unknown'}`);
      }
    } catch (error) {
      console.error('❌ Erreur récupération profil pour Socket.IO:', error);
      socket.emit('set_username', `User_${socket.id?.substring(0, 6) || 'Unknown'}`);
    }
  } else {
    // Pas connecté, pseudo par défaut
    socket.emit('set_username', `BonjourPage${Math.floor(Math.random() * 100)}`);
  }
});

// 3) Quand on reçoit un "newMessage" du serveur
// eslint-disable-next-line @typescript-eslint/no-explicit-any
socket.on('message_backend_to_frontend', (data: any) => {
  console.log('📡 message_backend_to_frontend :', data);
  // On redispatche un event global comme avant
  window.dispatchEvent(new CustomEvent('message_backend_to_frontend', { detail: data }));
});

socket.on('user_list', (data: any) => {
  console.log('📡 user_list :', data);
  // On redispatche un event global comme avant
  window.dispatchEvent(new CustomEvent('user_list', { detail: data }));
});

// Gestion de la déconnexion
socket.on('disconnect', (reason: string) => {
  console.log('🔌 Socket.IO déconnecté :', reason);
});

// Gestion des erreurs de connexion
socket.on('connect_error', (error: any) => {
  console.warn('⚠️ Erreur de connexion Socket.IO:', error.message);
  console.info('💡 Vérifiez que le serveur Socket.IO est démarré sur http://localhost:3000');
});

// Gestion de la reconnexion
socket.on('reconnect', async (attemptNumber: number) => {
  console.log('🔄 Socket.IO reconnecté :', attemptNumber);
  // Renvoyer le pseudo après reconnexion en utilisant l'auth centralisée
  const token = sessionStorage.getItem('authToken');
  if (token) {
    try {
      const response = await fetch('http://localhost:3001/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        socket.emit('set_username', result.user.name);
        console.log('👤 Pseudo renvoyé après reconnexion:', result.user.name);
      }
    } catch (error) {
      console.error('❌ Erreur reconnexion Socket.IO:', error);
    }
  }
});

// 4) Utility pour envoyer un message
export function sendMessageToBackend(to: any, text: any) {
  socket.emit('message_frontend_to_backend', {
    from: socket.id,
    to: to,
    text: text,
  });
}

// 5) Fonction pour mettre à jour le pseudo côté serveur
export function updateUsernameOnServer(newUsername: string) {
  socket.emit('set_username', newUsername);
  console.log('👤 Pseudo mis à jour sur le serveur:', newUsername);
}
