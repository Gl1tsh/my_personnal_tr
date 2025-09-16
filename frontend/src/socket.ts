// src/socket.ts

import { io } from 'socket.io-client';

// 1) On force la connexion vers le stub Socket.IO sur http://localhost:3000
export const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'], // Permet fallback
  timeout: 20000,
  forceNew: true  // Force une nouvelle connexion
});

// 2) Quand on se connecte
socket.on('connect', () => {
  console.log('📡 Socket.IO connecté :', socket.id);
  
  // Envoyer notre pseudo au serveur
  const userProfile = localStorage.getItem('userProfile');
  if (userProfile) {
    const profile = JSON.parse(userProfile);
    socket.emit('set_username', profile.displayName);
    console.log('👤 Pseudo envoyé au serveur:', profile.displayName);
  } else {
    // Pseudo par défaut si pas de profil
    socket.emit('set_username', `User_${socket.id?.substring(0, 6) || 'Unknown'}`);
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
socket.on('reconnect', (attemptNumber: number) => {
  console.log('🔄 Socket.IO reconnecté :', attemptNumber);
  // Renvoyer le pseudo après reconnexion
  const userProfile = localStorage.getItem('userProfile');
  if (userProfile) {
    const profile = JSON.parse(userProfile);
    socket.emit('set_username', profile.displayName);
    console.log('👤 Pseudo renvoyé après reconnexion:', profile.displayName);
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
