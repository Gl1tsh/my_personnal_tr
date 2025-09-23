import { createServer } from "http";
import { Server, Socket } from "socket.io";

// On utilise any pour le message, pas d'import de shared
const httpServer = createServer();
const io = new Server<any>(httpServer, {
  cors: { origin: "*" },
});

const clients = new Map<String, Socket>();
const usernames = new Map<String, String>(); // socket.id -> username

io.on("connection", (socket) => {
  console.log("📡 Client connecté:", socket.id);
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
