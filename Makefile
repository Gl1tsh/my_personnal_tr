# Makefile ultra-minimaliste pour ft_transcendence frontend (HTML/Tailwind/TS SPA/livechat)
# Socket IDs/messages en direct, phrases perso uniquement, npm.

FRONT_DIR = frontend
BACK_DIR = backend

# Couleurs pour output épuré
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
NC = \033[0m

# Commandes cross-platform
ifeq ($(OS),Windows_NT)
    RM = rmdir /S /Q
    KILL = exec taskkill /F /IM node.exe >nul 2>&1
    WAIT = timeout /T 3 /NOBREAK >nul
    BG = start /B
else
    RM = rm -rf
    KILL = exec pkill -f node > /dev/null 2>&1 || true
    WAIT = sleep 3
    BG = nohup
endif

# Supprime écho des commandes
.SILENT:

# Lance tout : backend + frontend, socket IDs/messages en direct
chat:
	@echo "$(BLUE)🔨 Compilation du backend…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && npx tsc -b && echo "$(GREEN)✅ Backend compilé !$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Pas de backend, skip.$(NC)"; \
	fi
	@echo "$(BLUE)🚀 Démarrage du backend WebSocket (port 3000)…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && $(BG) npm run start > /dev/null 2>&1 & \
		$(WAIT); \
		echo "$(GREEN)✅ WebSocket en route !$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Pas de backend, skip.$(NC)"; \
	fi
	@echo "$(YELLOW)🌐 Démarrage du frontend (port 3001)…$(NC)"
	@if [ -d "$(FRONT_DIR)" ]; then \
		cd $(FRONT_DIR) && npm run dev; \
	else \
		echo "$(RED)❌ Dossier frontend manquant.$(NC)"; \
		exit 1; \
	fi

# Nettoie tout : processus + fichiers résiduels
clean:
	@echo "$(GREEN)🧹 Nettoyage des processus 🧹$(NC)"
	-$(KILL)
	@echo "$(GREEN)🗑️ Suppression des fichiers build…$(NC)"
	-$(RM) $(BACK_DIR)/dist 2>/dev/null
	-$(RM) $(FRONT_DIR)/dist 2>/dev/null
	@echo "$(GREEN)✅ Fichiers build clean$(NC)"
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

.PHONY: chat clean