import { createServer } from "http";
import { Server, Socket } from "socket.io";

// On utilise any pour le message, pas d'import de shared
const httpServer = createServer();
const io = new Server<any>(httpServer, {
  cors: { origin: "*" },
});

const clients = new Map<String, Socket>();
const usernames = new Map<String, String>(); // socket.id -> username
const gameRooms = new Map<String, { host: string, client?: string, gameState?: any }>(); // roomId -> game info

io.on("connection", (socket) => {
  console.log("📡 Client connecté:", socket.id);
  console.log("🔄 Test recompilation automatique");
  console.log("✅ Recompilation fonctionne !");
  clients.set(socket.id, socket);
  // Pseudo par défaut en attendant que le client envoie le sien
  usernames.set(socket.id, `User_${socket.id.substring(0, 6)}`);

  // Émettre la liste des utilisateurs avec leurs pseudos
  broadcastUserList();

  // Gérer l'attribution du pseudo
  socket.on("set_username", (username: string) => {
    console.log(`👤 ${socket.id} -> ${username}`);
    usernames.set(socket.id, username);
    broadcastUserList();
  });

  // Handle game join
  socket.on("join_game", (hostId: string) => {
    let room = gameRooms.get(hostId);
    if (!room) {
      // Create room if not exists
      room = { host: hostId };
      gameRooms.set(hostId, room);
    }
    if (!room.client) {
      room.client = socket.id;
      gameRooms.set(hostId, room);
      // Notify host that client joined
      const hostSocket = clients.get(hostId);
      if (hostSocket) {
        hostSocket.emit("game_joined", { clientId: socket.id, clientUsername: usernames.get(socket.id) });
      }
      // Notify client
      socket.emit("game_started", { hostId, hostUsername: usernames.get(hostId) });
      console.log(`🎮 Game started: ${hostId} vs ${socket.id}`);
    } else {
      socket.emit("join_failed", "Game not available or already full");
    }
  });

  // Handle leave game
  socket.on("leave_game", () => {
    // Find and delete the room where this socket is involved
    for (const [hostId, room] of gameRooms) {
      if (room.host === socket.id || room.client === socket.id) {
        gameRooms.delete(hostId);
        console.log(`🎮 Room cleared for ${socket.id}`);
        break;
      }
    }
  });

  // Handle game state updates
  socket.on("game_update", (data: any) => {
    const room = Array.from(gameRooms.values()).find(r => r.host === socket.id || r.client === socket.id);
    if (room) {
      room.gameState = data;
      // Send to opponent
      const opponentId = room.host === socket.id ? room.client : room.host;
      const opponentSocket = clients.get(opponentId);
      if (opponentSocket) {
        opponentSocket.emit("game_update", data);
      }
    }
  });

  socket.on("message_frontend_to_backend", (msg: any) => {
    console.log("← message_frontend_to_backend:", msg);

    // Remplacer l'ID socket par le vrai pseudo mais garder l'original pour éviter la duplication
    const messageWithUsername = {
      ...msg,
      from: usernames.get(msg.from) || msg.from,
      originalFrom: msg.from // Garder l'ID original pour éviter la duplication côté client
    };

    if (msg.to != '') {
      // Message privé - envoyer au destinataire ET à l'expéditeur
      const targetSocket = clients.get(msg.to);
      if (targetSocket) {
        targetSocket.emit("message_backend_to_frontend", messageWithUsername);
      }
      // Envoyer aussi à l'expéditeur pour qu'il voie son message dans la conversation
      const senderSocket = clients.get(msg.from);
      if (senderSocket && senderSocket !== targetSocket) {
        senderSocket.emit("message_backend_to_frontend", messageWithUsername);
      }
    }
    else {
      // Message général - envoyer à tous les clients connectés
      for (const clientSocket of clients.values()) {
        clientSocket.emit("message_backend_to_frontend", messageWithUsername);
      }
    }
  });

  // Handle avatar updates
  socket.on("avatarUpdated", (data: { userId: number; avatarUrl: string }) => {
    console.log("🖼️ Avatar updated:", data);
    // Broadcast to all connected clients
    for (const clientSocket of clients.values()) {
      clientSocket.emit("avatarUpdated", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client déconnecté:", socket.id);
    clients.delete(socket.id);
    usernames.delete(socket.id);
    broadcastUserList();
  });
});

function broadcastUserList() {
  // Envoyer la liste des utilisateurs avec leurs vrais pseudos, sans doublons
  const seenUsernames = new Set<string>();
  const userListWithNames = [];
  for (const socketId of clients.keys()) {
    const usernameRaw = usernames.get(socketId) || `User_${socketId.substring(0, 6)}`;
    const username = String(usernameRaw);
    if (!seenUsernames.has(username)) {
      userListWithNames.push({ id: socketId, username });
      seenUsernames.add(username);
    }
  }
  for (const clientSocket of clients.values()) {
    clientSocket.emit("user_list", userListWithNames);
  }
}

httpServer.listen(3000, () =>
  console.log("🚀 Stub WS listening on http://localhost:3000")
);
