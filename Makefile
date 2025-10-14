# ═══════════════════════════════════════════════════════════════════════════════
#                           🚀 TRANSCENDANCE MAKEFILE 🚀
# ═══════════════════════════════════════════════════════════════════════════════

MAKEFLAGS += --no-print-directory

FRONT_DIR = frontend
BACK_DIR = backend

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                            🎨 COULEURS & STYLES                             │
# └─────────────────────────────────────────────────────────────────────────────┘
BOLD = \033[1m
DIM = \033[2m
RESET = \033[0m
RED = \033[31m
GREEN = \033[32m
YELLOW = \033[33m
BLUE = \033[34m
MAGENTA = \033[35m
CYAN = \033[36m
WHITE = \033[37m

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                         ⚙️ COMMANDES CROSS-PLATFORM                        │
# └─────────────────────────────────────────────────────────────────────────────┘
ifeq ($(OS),Windows_NT)
    RM = rmdir /S /Q
    KILL_PORTS = powershell -ExecutionPolicy Bypass -File "kill-ports-simple.ps1"
    WAIT = timeout /T 3 /NOBREAK >nul
else
    RM = rm -rf
    KILL_3000 = lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    KILL_3001 = lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    KILL_3002 = lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    WAIT = sleep 3
endif

.SILENT:
.DEFAULT_GOAL := menu

# ═══════════════════════════════════════════════════════════════════════════════
#                            🎯 MENU INTERACTIF
# ═══════════════════════════════════════════════════════════════════════════════

menu:
	@echo ""
	@echo "$(CYAN)$(BOLD) ╔════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                    🚀 TRANSCENDANCE                        ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                            ║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)1.$(RESET) $(GREEN)Lancer l'application$(RESET)                                   $(CYAN)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)2.$(RESET) $(YELLOW)Installer les dépendances$(RESET)                              $(CYAN)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)3.$(RESET) $(RED)Nettoyer le projet$(RESET)                                     $(CYAN)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)4.$(RESET) $(RED)Vider la base de données$(RESET)                               $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)0.$(RESET) $(DIM)Quitter$(RESET)                                                $(CYAN)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                            ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(DIM)Websocket: http://localhost:3000 (API)$(RESET)                    $(CYAN)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(DIM)Backend: http://localhost:3001 (API)$(RESET)                      $(CYAN)║$(RESET)"
	@echo "$(CYAN) ║$(WHITE)  $(DIM)Frontend: http://localhost:3002 (App)$(RESET)                     $(CYAN)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╚════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@while true; do \
		read -p "Votre choix: " choice; \
		case $$choice in \
			1) echo ""; make dev; break ;; \
			2) echo ""; make install; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			3) echo ""; make clean; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			4) echo ""; make reset-db; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			0) echo "$(GREEN)$(BOLD)Au revoir ! 👋$(RESET)"; break ;; \
			*) echo "$(RED)❌ Choix invalide ! Veuillez choisir entre 0-4.$(RESET)"; echo "" ;; \
		esac \
	done

# ═══════════════════════════════════════════════════════════════════════════════
#                            🚀 COMMANDES PRINCIPALES
# ═══════════════════════════════════════════════════════════════════════════════

# ... (rest of the original_newString content remains unchanged)

FRONT_DIR = frontend
BACK_DIR = backend

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │                            🎨 COULEURS & STYLES                             │
# └─────────────────────────────────────────────────────────────────────────────┘
BOLD = \033[1m
DIM = \033[2m
RESET = \033[0m
RED = \033[31m
GREEN = \033[32m
YELLOW = \033[33m
BLUE = \033[34m
MAGENTA = \033[35m
CYAN = \033[36m
WHITE = \033[37m

# ═══════════════════════════════════════════════════════════════════════════════
#                            🚀 COMMANDES PRINCIPALES
# ═══════════════════════════════════════════════════════════════════════════════

dev: 
	@echo ""
	@echo "$(BLUE)$(BOLD) 🚀 Starting development server...$(RESET)"
	@echo ""
	@make kill-ports
	@echo ""
	@echo "$(BLUE) 📡 Starting services...$(RESET)"
	@bash -c '\
		CLEANUP_DONE=false; \
		cleanup() { \
			if [ "$$CLEANUP_DONE" = "true" ]; then return; fi; \
			CLEANUP_DONE=true; \
			printf "\n"; \
			printf "\033[33m\033[1m 🧹 Nettoyage en cours...\033[0m\n"; \
			lsof -ti:3000 | xargs kill -9 2>/dev/null || true; \
			lsof -ti:3001 | xargs kill -9 2>/dev/null || true; \
			lsof -ti:3002 | xargs kill -9 2>/dev/null || true; \
			pkill -f "npm run server" 2>/dev/null || true; \
			pkill -f "npm run chat" 2>/dev/null || true; \
			pkill -f "vite" 2>/dev/null || true; \
			sleep 1; \
			printf "\033[33m\033[1m ╔══════════════════════════════════════════════════════════════╗\033[0m\n"; \
			printf "\033[33m\033[1m ║                        👋 ARRÊT PROPRE 👋                    ║\033[0m\n"; \
			printf "\033[33m\033[1m ╠══════════════════════════════════════════════════════════════╣\033[0m\n"; \
			printf "\033[33m\033[1m ║                                                              ║\033[0m\n"; \
			printf "\033[33m\033[1m ║\033[0m  \033[32m\033[1m✅ Tous les ports ont été libérés\033[0m                           \033[33m\033[1m║\033[0m\n"; \
			printf "\033[33m\033[1m ║\033[0m  \033[32m\033[1m✅ Serveurs arrêtés correctement\033[0m                            \033[33m\033[1m║\033[0m\n"; \
			printf "\033[33m\033[1m ║                                                              ║\033[0m\n"; \
			printf "\033[33m\033[1m ║\033[0m  \033[36m\033[1m⚡ Tapez make pour relancer le menu\033[0m                         \033[33m\033[1m║\033[0m\n"; \
			printf "\033[33m\033[1m ║                                                              ║\033[0m\n"; \
			printf "\033[33m\033[1m ╚══════════════════════════════════════════════════════════════╝\033[0m\n"; \
			printf "\n"; \
		}; \
		trap cleanup SIGINT SIGTERM; \
		cd $(BACK_DIR) && nohup npm run server >/dev/null 2>&1 & \
		cd $(BACK_DIR) && nohup npm run chat >/dev/null 2>&1 & \
		sleep 3; \
		printf "\033[32m\033[1m ✅ Backend API démarré sur port 3001\033[0m\n"; \
		printf "\033[32m\033[1m ✅ Socket.IO démarré sur port 3000\033[0m\n"; \
		printf "\033[33m\033[1m 🌐 Lancement du frontend...\033[0m\n"; \
		printf "\n"; \
		printf "\033[36m\033[1m ╔══════════════════════════════════════════════════════════════╗\033[0m\n"; \
		printf "\033[36m\033[1m ║                     🎉 PRÊT À DÉVELOPPER ! 🎉                ║\033[0m\n"; \
		printf "\033[36m\033[1m ╠══════════════════════════════════════════════════════════════╣\033[0m\n"; \
		printf "\033[36m\033[1m ║                                                              ║\033[0m\n"; \
		printf "\033[36m\033[1m ║\033[0m  \033[32m\033[1m🔗 Backend API:\033[0m  \033[34m\033[1mhttp://localhost:3001\033[0m                      \033[36m\033[1m║\033[0m\n"; \
		printf "\033[36m\033[1m ║\033[0m  \033[32m\033[1m📡 Socket.IO:\033[0m    \033[34m\033[1mhttp://localhost:3000\033[0m                      \033[36m\033[1m║\033[0m\n"; \
		printf "\033[36m\033[1m ║\033[0m  \033[35m\033[1m🌐 Frontend App:\033[0m \033[34m\033[1mhttp://localhost:3002\033[0m                      \033[36m\033[1m║\033[0m\n"; \
		printf "\033[36m\033[1m ║                                                              ║\033[0m\n"; \
		printf "\033[36m\033[1m ║\033[0m             \033[37m\033[1mAppuyez sur Ctrl+C pour arrêter\033[0m                  \033[36m\033[1m║\033[0m\n"; \
		printf "\033[36m\033[1m ╚══════════════════════════════════════════════════════════════╝\033[0m\n"; \
		printf "\n"; \
		cd $(FRONT_DIR) && npm run dev || cleanup; \
	'

install:
	@echo ""
	@echo "$(YELLOW)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(YELLOW)$(BOLD) ║                 📦 INSTALLATION DES DÉPENDANCES 📦           ║$(RESET)"
	@echo "$(YELLOW)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(BLUE)$(BOLD) 🌐 Installation frontend...$(RESET)"
	@cd $(FRONT_DIR) && npm install --silent
	@echo "$(GREEN)$(BOLD) ✅ Frontend installé avec succès !$(RESET)"
	@echo ""
	@echo "$(BLUE)$(BOLD) ⚙️  Installation backend...$(RESET)"
	@cd $(BACK_DIR) && npm install --silent
	@echo "$(GREEN)$(BOLD) ✅ Backend installé avec succès !$(RESET)"
	@echo ""
	@echo "$(GREEN)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(GREEN)$(BOLD) ║                   🎉 INSTALLATION TERMINÉE ! 🎉              ║$(RESET)"
	@echo "$(GREEN)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

clean:
	@echo ""
	@echo "$(RED)$(BOLD) 🧹 Nettoyage en cours...$(RESET)"
	@echo ""
ifeq ($(OS),Windows_NT)
	@$(KILL_PORTS) > nul 2>&1
else
	@$(KILL_3000) > /dev/null 2>&1
	@$(KILL_3001) > /dev/null 2>&1
	@$(KILL_3002) > /dev/null 2>&1
endif
	@$(WAIT) > /dev/null 2>&1
ifeq ($(OS),Windows_NT)
	@if exist "$(BACK_DIR)\dist" rmdir /S /Q "$(BACK_DIR)\dist" 2>nul
	@if exist "$(FRONT_DIR)\dist" rmdir /S /Q "$(FRONT_DIR)\dist" 2>nul
	@if exist "$(BACK_DIR)\node_modules" rmdir /S /Q "$(BACK_DIR)\node_modules" 2>nul
	@if exist "$(FRONT_DIR)\node_modules" rmdir /S /Q "$(FRONT_DIR)\node_modules" 2>nul
else
	@$(RM) $(BACK_DIR)/dist 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/dist 2>/dev/null || true
	@$(RM) $(BACK_DIR)/node_modules 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/node_modules 2>/dev/null || true
endif
	@echo "$(CYAN)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                        🧹 NETTOYAGE TERMINÉ 🧹               ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Ports 3000, 3001, 3002 libérés$(RESET)                           $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Fichiers build supprimés$(RESET)                                 $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Dossiers node_modules supprimés$(RESET)                          $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)⚡ Tapez make pour relancer le menu$(RESET)                         $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""

# ═══════════════════════════════════════════════════════════════════════════════
#                            🔧 UTILITAIRES INTERNES
# ═══════════════════════════════════════════════════════════════════════════════

kill-ports:
	@echo "$(DIM) 🔫 Libération des ports...$(RESET)"
ifeq ($(OS),Windows_NT)
	@$(KILL_PORTS)
else
	@$(KILL_3000)
	@$(KILL_3001)
	@$(KILL_3002)
endif
	@$(WAIT)
	@echo "$(DIM) ✓ Ports libérés$(RESET)"

# ═══════════════════════════════════════════════════════════════════════════════

# Reset complet de la base de données

reset-db: kill-ports
	@echo ""
	@echo "$(RED)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(RED)$(BOLD) ║                    💣 RESET BASE DE DONNÉES 💣               ║$(RESET)"
	@echo "$(RED)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "Killing all processes on ports 3000, 3001, 3002..."
	@lsof -ti:3000 | xargs -r kill -9 2>/dev/null || true
	@lsof -ti:3001 | xargs -r kill -9 2>/dev/null || true
	@lsof -ti:3002 | xargs -r kill -9 2>/dev/null || true
	@sleep 1
	@echo "Cleaning database files..."
	@rm -f $(BACK_DIR)/database.sqlite $(BACK_DIR)/*.db $(BACK_DIR)/*.sqlite* 2>/dev/null || true
	@echo "$(GREEN) ✓ Database files removed$(RESET)"
	@echo "$(GREEN)$(BOLD) ✅ Base de données réinitialisée !$(RESET)"
	@echo ""

# Nettoyage complet du projet
nuke:
	@echo ""
	@echo "$(RED)$(BOLD) 🧹 Deep Project Cleanup$(RESET)"
	@echo ""
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File "scripts\\ultimate-clean.ps1"
else
	@echo "$(RED)Ultimate cleanup is only available on Windows$(RESET)"
	@echo "$(YELLOW)Use 'make clean' instead$(RESET)"
endif

.PHONY: help dev install clean nuke kill-ports reset-db