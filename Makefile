# Makefile ultra-minimaliste pour ft_transcendence frontend (HTML/Tailwind/TS SPA/livechat)
# Socket IDs/messages en direct, phrases perso uniquement, npm, pas de nohup.out.

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

# Installe les dépendances npm dans frontend et backend
install:
	@echo "$(BLUE)📥 Installation des deps dans frontend…$(NC)"
	@if [ -d "$(FRONT_DIR)" ]; then \
		cd $(FRONT_DIR) && npm install && echo "$(GREEN)✅ Deps frontend ok !$(NC)"; \
	else \
		echo "$(RED)❌ Pas de dossier frontend !$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📥 Installation des deps dans backend…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && npm install && echo "$(GREEN)✅ Deps backend ok !$(NC)"; \
	else \
		echo "$(YELLOW)⚠️ Pas de dossier backend, skip.$(NC)"; \
	fi
	@echo "$(GREEN)🎉 Tout est prêt, lance 'make chat' !$(NC)"

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
		cd $(BACK_DIR) && nohup npm run chat >/dev/null 2>&1 & \
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
	-$(RM) $(BACK_DIR)/node_modules 2>/dev/null
	-$(RM) $(FRONT_DIR)/node_modules 2>/dev/null
	@echo "$(GREEN)✅ Fichiers build clean$(NC)"
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

# Construit et lance l'application avec Docker
docker:
	@echo "$(BLUE)🐳 Construction de l'image Docker pour le backend…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && docker build -t ft_transcendence_backend . && echo "$(GREEN)✅ Image Docker construite !$(NC)"; \
	else \
		echo "$(RED)❌ Pas de dossier backend !$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 Démarrage du conteneur Docker (port 3000)…$(NC)"
	@docker run -d -p 3000:3000 --name ft_transcendence_backend ft_transcendence_backend && echo "$(GREEN)✅ Backend Docker en route !$(NC)"
	@echo "$(YELLOW)🌐 Démarrage du frontend (port 3001)…$(NC)"
	@if [ -d "$(FRONT_DIR)" ]; then \
		cd $(FRONT_DIR) && npm run dev; \
	else \
		echo "$(RED)❌ Dossier frontend manquant.$(NC)"; \
		exit 1; \
	fi

# Arrête et supprime les conteneurs Docker
docker-clean:
	@echo "$(GREEN)🧹 Nettoyage des conteneurs Docker…$(NC)"
	-docker stop ft_transcendence_backend 2>/dev/null
	-docker rm ft_transcendence_backend 2>/dev/null
	-docker rmi ft_transcendence_backend 2>/dev/null
	@echo "$(GREEN)✅ Conteneurs Docker nettoyés !$(NC)"

.PHONY: chat clean docker docker-clean