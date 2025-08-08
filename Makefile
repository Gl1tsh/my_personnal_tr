# Makefile cool & aesthetic pour frontend ft_transcendence (HTML/Tailwind/TS SPA/livechat) 💻✨

FRONT_DIR = frontend
BACK_DIR = backend

# Colors & emojis for cool output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# Dev mode (watch TS/Tailwind, localhost auto-reload on index.html - cool messages)
dev:
	@echo "$(YELLOW)🔥 Lancement dev - watch & localhost...$(NC)"
	cd $(FRONT_DIR) && npm run dev
	@echo "$(GREEN)✅ Dev lancé ! Ouvre http://localhost:3000 pour ton index.html. 😎$(NC)"

# --- LiveChat quick start (build backend + stub + frontend) ---
chat:
	@echo "🔨 Compilation du backend…"
	@cd backend && npm run build
	@echo "🚀 Démarrage du stub WebSocket (port 3000)…"
	@cd backend && npm run start \
	sleep 2; \  # Wait 2s pour que WS soit up avant frontend
	echo "🌐 Démarrage du frontend (dev mode)…"; \
	cd frontend && npm run dev
