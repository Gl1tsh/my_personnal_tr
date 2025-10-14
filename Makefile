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
	@echo "$(CYAN) ║$(WHITE)  $(BOLD)5.$(RESET) $(MAGENTA)Goodnight (Nettoyage approfondi)$(RESET)                       $(CYAN)║$(RESET)"
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
			5) echo ""; make goodnight; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			0) echo "$(GREEN)$(BOLD)Au revoir ! 👋$(RESET)"; break ;; \
			*) echo "$(RED)❌ Choix invalide ! Veuillez choisir entre 0-5.$(RESET)"; echo "" ;; \
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
	@cd $(BACK_DIR) && nohup npm run server >/dev/null 2>&1 &
	@cd $(BACK_DIR) && nohup npm run chat >/dev/null 2>&1 &
	@sleep 3
	@printf "\033[32m\033[1m ✅ Backend API démarré sur port 3001\033[0m\n"
	@printf "\033[32m\033[1m ✅ Socket.IO démarré sur port 3000\033[0m\n"
	@printf "\033[33m\033[1m 🌐 Lancement du frontend...\033[0m\n"
	@printf "\n"
	@printf "\033[36m\033[1m ╔══════════════════════════════════════════════════════════════╗\033[0m\n"
	@printf "\033[36m\033[1m ║                     🎉 PRÊT À DÉVELOPPER ! 🎉                ║\033[0m\n"
	@printf "\033[36m\033[1m ╠══════════════════════════════════════════════════════════════╣\033[0m\n"
	@printf "\033[36m\033[1m ║                                                              ║\033[0m\n"
	@printf "\033[36m\033[1m ║\033[0m  \033[32m\033[1m🔗 Backend API:\033[0m  \033[34m\033[1mhttp://localhost:3001\033[0m                      \033[36m\033[1m║\033[0m\n"
	@printf "\033[36m\033[1m ║\033[0m  \033[32m\033[1m📡 Socket.IO:\033[0m    \033[34m\033[1mhttp://localhost:3000\033[0m                      \033[36m\033[1m║\033[0m\n"
	@printf "\033[36m\033[1m ║\033[0m  \033[35m\033[1m🌐 Frontend App:\033[0m \033[34m\033[1mhttp://localhost:3002\033[0m                      \033[36m\033[1m║\033[0m\n"
	@printf "\033[36m\033[1m ║                                                              ║\033[0m\n"
	@printf "\033[36m\033[1m ║\033[0m             \033[37m\033[1mAppuyez sur Ctrl+C pour arrêter\033[0m                  \033[36m\033[1m║\033[0m\n"
	@printf "\033[36m\033[1m ╚══════════════════════════════════════════════════════════════╝\033[0m\n"
	@printf "\n"
	@cd $(FRONT_DIR) && npm run dev

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

# Goodnight - Nettoyage approfondi pour quitter
goodnight:
	@echo ""
	@echo "$(MAGENTA)$(BOLD) 🌙 Bonne nuit ! Nettoyage approfondi en cours...$(RESET)"
	@echo ""
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File "scripts\\ultimate-clean.ps1" -Force -Quiet
	@echo ""
	@echo "$(MAGENTA)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                      🌙 BONNE NUIT ! 🌙                      ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Nettoyage approfondi terminé$(RESET)                           $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Ordinateur optimisé$(RESET)                                   $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)😴 À demain !$(RESET)                                              $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
else
	@echo "$(YELLOW)• Arrêt des processus de développement...$(RESET)"
	@pkill -f "node\|npm\|npx\|yarn\|pnpm\|vite\|webpack\|tsc\|typescript\|ts-node\|tsx\|nodemon\|serve\|http-server\|live-server" 2>/dev/null || true
	@echo "$(GREEN)  ✓ Processus arrêtés$(RESET)"
	@echo "$(YELLOW)• Libération des ports de développement...$(RESET)"
	@lsof -ti:3000,3001,3002,3003,4000,5000,5173,5174,8000,8080,8081,9000 | xargs -r kill -9 2>/dev/null || true
	@sleep 2
	@echo "$(GREEN)  ✓ Ports libérés$(RESET)"
	@echo "$(YELLOW)• Suppression des dossiers de build...$(RESET)"
	@find . -type d \( -name "dist" -o -name "build" -o -name ".vite" -o -name ".next" -o -name "coverage" \) -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)  ✓ Dossiers de build supprimés$(RESET)"
	@echo "$(YELLOW)• Suppression des dépendances...$(RESET)"
	@find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)  ✓ Dossiers node_modules supprimés$(RESET)"
	@echo "$(YELLOW)• Nettoyage des caches...$(RESET)"
	@npm cache clean --force 2>/dev/null || true
	@echo "$(GREEN)  ✓ Cache npm vidé$(RESET)"
	@echo "$(YELLOW)• Suppression des bases de données...$(RESET)"
	@find . -name "*.sqlite" -o -name "*.db" -exec rm -f {} + 2>/dev/null || true
	@echo "$(GREEN)  ✓ Bases de données supprimées$(RESET)"
	@echo "$(YELLOW)• Suppression des fichiers temporaires...$(RESET)"
	@find . \( -name "*.log" -o -name "*.tmp" -o -name "*.tsbuildinfo" -o -name "package-lock.json" \) -exec rm -f {} + 2>/dev/null || true
	@echo "$(GREEN)  ✓ Fichiers temporaires supprimés$(RESET)"
	@echo ""
	@echo "$(MAGENTA)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                      🌙 BONNE NUIT ! 🌙                      ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Nettoyage approfondi terminé$(RESET)                             $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Ordinateur optimisé$(RESET)                                      $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)😴 À demain !$(RESET)                                               $(MAGENTA)$(BOLD)║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(MAGENTA)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
endif

.PHONY: help dev install clean nuke kill-ports reset-db goodnight