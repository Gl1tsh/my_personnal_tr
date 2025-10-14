#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
#                           🚀 TRANSCENDANCE DEV SCRIPT 🚀
# ═══════════════════════════════════════════════════════════════════════════════

FRONT_DIR="frontend"
BACK_DIR="backend"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    pkill -f "npm run server" 2>/dev/null || true
    pkill -f "npm run chat" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
    echo "✅ Services arrêtés"
    exit 0
}

# Gestionnaire de signaux
trap cleanup SIGINT SIGTERM

echo "🚀 Démarrage des services de développement..."
echo ""

# Vérifier que les répertoires existent
if [ ! -d "$BACK_DIR" ] || [ ! -d "$FRONT_DIR" ]; then
    echo "❌ Erreur: Répertoires backend ou frontend introuvables"
    exit 1
fi

# Compilation du backend
echo "🔨 Compilation du backend..."
cd "$BACK_DIR"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation du backend"
    exit 1
fi
echo "✅ Backend compilé"

# Compilation du frontend
echo "🔨 Compilation du frontend..."
cd "../$FRONT_DIR"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation du frontend"
    exit 1
fi
echo "✅ Frontend compilé"
cd "../$BACK_DIR"

# Lancement du backend API avec watcher
echo "📡 Démarrage du backend API avec watcher..."
npm run server &
SERVER_PID=$!

# Lancement du chat WebSocket avec watcher
echo "💬 Démarrage du chat WebSocket avec watcher..."
npm run chat &
CHAT_PID=$!

# Attendre que les backends soient prêts
echo "⏳ Attente du démarrage des services backend..."
sleep 3

# Vérifier que les services sont démarrés
if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "⚠️  Backend API peut ne pas être prêt, mais on continue..."
fi

if ! curl -s http://localhost:3000/socket.io/?EIO=4&transport=polling >/dev/null 2>&1; then
    echo "⚠️  WebSocket peut ne pas être prêt, mais on continue..."
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     🎉 PRÊT À DÉVELOPPER ! 🎉                ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  🔗 Backend API:  http://localhost:3001                      ║"
echo "║  📡 Socket.IO:     http://localhost:3000                     ║"
echo "║  🌐 Frontend App:  http://localhost:3002                     ║"
echo "║                                                              ║"
echo "║             Appuyez sur Ctrl+C pour arrêter                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Lancement du frontend avec watcher (bloquant)
echo "🌐 Démarrage du frontend avec watcher..."
cd "../$FRONT_DIR"
npm run dev &
FRONTEND_PID=$!

# Attendre tous les processus
wait $SERVER_PID $CHAT_PID $FRONTEND_PID