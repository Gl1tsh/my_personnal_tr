# Makefile pour ft_transcendence avec nettoyage automatique des ports
# Backend: port 3001, Frontend: port 3002

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
    KILL_PORT_3001 = for /f "tokens=5" %a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %a >nul 2>&1 || echo -
    KILL_PORT_3002 = for /f "tokens=5" %a in ('netstat -ano ^| findstr :3002') do taskkill /F /PID %a >nul 2>&1 || echo -
    WAIT = timeout /T 2 /NOBREAK >nul
    START = start /B
else
    RM = rm -rf
    KILL_PORT_3001 = lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    KILL_PORT_3002 = lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    WAIT = sleep 2
    START = nohup
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

# Lance tout : nettoie les ports + backend (3001) + frontend (3002)
chat: kill-ports
	@echo "$(BLUE)🔨 Compilation du backend…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && npm run build && echo "$(GREEN)✅ Backend compilé !$(NC)"; \
	else \
		echo "$(RED)❌ Pas de dossier backend !$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 Démarrage du serveur backend (port 3001)…$(NC)"
ifeq ($(OS),Windows_NT)
	@cd $(BACK_DIR) && start /B npm run server
else
	@cd $(BACK_DIR) && nohup npm run server >/dev/null 2>&1 &
endif
	@$(WAIT)
	@echo "$(GREEN)✅ Backend API en route sur http://localhost:3001 !$(NC)"
	@echo "$(YELLOW)🌐 Démarrage du frontend (port 3002)…$(NC)"
	@if [ -d "$(FRONT_DIR)" ]; then \
		cd $(FRONT_DIR) && npm run dev; \
	else \
		echo "$(RED)❌ Dossier frontend manquant.$(NC)"; \
		exit 1; \
	fi

# Tue tous les processus sur les ports 3001 et 3002
kill-ports:
	@echo "$(YELLOW)🔫 Nettoyage des ports 3001 et 3002…$(NC)"
ifeq ($(OS),Windows_NT)
	@$(KILL_PORT_3001)
	@$(KILL_PORT_3002)
else
	@$(KILL_PORT_3001)
	@$(KILL_PORT_3002)
endif
	@$(WAIT)
	@echo "$(GREEN)✅ Ports libérés !$(NC)"

# Nettoie tout : processus + fichiers build
clean: kill-ports
	@echo "$(GREEN)🧹 Nettoyage complet…$(NC)"
	@echo "$(GREEN)🗑️ Suppression des fichiers build…$(NC)"
ifeq ($(OS),Windows_NT)
	@if exist "$(BACK_DIR)\dist" rmdir /S /Q "$(BACK_DIR)\dist" 2>nul
	@if exist "$(FRONT_DIR)\dist" rmdir /S /Q "$(FRONT_DIR)\dist" 2>nul
else
	@$(RM) $(BACK_DIR)/dist 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/dist 2>/dev/null || true
endif
	@echo "$(GREEN)✅ Nettoyage terminé !$(NC)"

# Nettoie tout y compris node_modules (reset complet)
fclean: clean
	@echo "$(RED)🧨 Suppression complète (node_modules inclus)…$(NC)"
ifeq ($(OS),Windows_NT)
	@if exist "$(BACK_DIR)\node_modules" rmdir /S /Q "$(BACK_DIR)\node_modules" 2>nul
	@if exist "$(FRONT_DIR)\node_modules" rmdir /S /Q "$(FRONT_DIR)\node_modules" 2>nul
else
	@$(RM) $(BACK_DIR)/node_modules 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/node_modules 2>/dev/null || true
endif
	@echo "$(GREEN)✅ Reset complet terminé !$(NC)"

# Construit et lance l'application avec Docker
docker:
	@echo "$(BLUE)🐳 Construction de l'image Docker pour le backend…$(NC)"
	@if [ -d "$(BACK_DIR)" ]; then \
		cd $(BACK_DIR) && docker build -t ft_transcendence_backend . && echo "$(GREEN)✅ Image Docker construite !$(NC)"; \
	else \
		echo "$(RED)❌ Pas de dossier backend !$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 Démarrage du conteneur Docker (port 3001)…$(NC)"
	@docker run -d -p 3001:3001 --name ft_transcendence_backend ft_transcendence_backend && echo "$(GREEN)✅ Backend Docker en route !$(NC)"
	@echo "$(YELLOW)🌐 Démarrage du frontend (port 3002)…$(NC)"
	@if [ -d "$(FRONT_DIR)" ]; then \
		cd $(FRONT_DIR) && npm run dev; \
	else \
		echo "$(RED)❌ Dossier frontend manquant.$(NC)"; \
		exit 1; \
	fi

# Arrête et supprime les conteneurs Docker
docker-clean:
	@echo "$(GREEN)🧹 Nettoyage des conteneurs Docker…$(NC)"
	@docker stop ft_transcendence_backend 2>/dev/null || true
	@docker rm ft_transcendence_backend 2>/dev/null || true
	@docker rmi ft_transcendence_backend 2>/dev/null || true
	@echo "$(GREEN)✅ Conteneurs Docker nettoyés !$(NC)"

# Affiche l'état des ports
status:
	@echo "$(BLUE)📊 État des ports 3001 et 3002…$(NC)"
ifeq ($(OS),Windows_NT)
	@netstat -ano | findstr :3001 || echo "Port 3001: $(GREEN)libre$(NC)"
	@netstat -ano | findstr :3002 || echo "Port 3002: $(GREEN)libre$(NC)"
else
	@lsof -i:3001 || echo "Port 3001: $(GREEN)libre$(NC)"
	@lsof -i:3002 || echo "Port 3002: $(GREEN)libre$(NC)"
endif

.PHONY: chat clean fclean kill-ports status docker docker-clean install