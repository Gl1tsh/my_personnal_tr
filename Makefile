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
	@echo "$(CYAN)$(BOLD) ║                  Développement Menu                        ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                            ║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)1.$(RESET) $(GREEN)Lancer l'application$(RESET)                                   $(CYAN)║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)2.$(RESET) $(YELLOW)Installer les dépendances$(RESET)                              $(CYAN)║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)3.$(RESET) $(RED)Nettoyer le projet$(RESET)                                     $(CYAN)║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)4.$(RESET) $(BLUE)Vérifier l'état des ports$(RESET)                              $(CYAN)║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)5.$(RESET) $(RED)Vider la base de données$(RESET)                               $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(WHITE) ║  $(BOLD)0.$(RESET) $(DIM)Quitter$(RESET)                                                $(CYAN)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                            ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(WHITE) ║  $(DIM)Backend: http://localhost:3001 (API)$(RESET)                      $(CYAN)║$(RESET)"
	@echo "$(WHITE) ║  $(DIM)Frontend: http://localhost:3002 (App)$(RESET)                     $(CYAN)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╚════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@while true; do \
		read -p "Votre choix: " choice; \
		case $$choice in \
			1) echo ""; make dev; break ;; \
			2) echo ""; make install; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			3) echo ""; make clean; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			4) echo ""; make status; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
			5) echo ""; make reset-db; echo "Appuyez sur Entrée pour revenir au menu..."; read dummy; make menu; break ;; \
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
#                               🎯 MENU PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

help:
	@echo ""
	@echo ""
	@echo "$(CYAN)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                        🚀 TRANSCENDANCE 🚀                   ║$(RESET)"
		@echo "$(CYAN)$(BOLD) ║                    🚀 TRANSCENDANCE 🚀                   ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                      Menu de Développement                   ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)1.$(RESET) $(GREEN)$(BOLD)make dev$(RESET)       $(DIM)→ Lance l'application$(RESET)              $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)2.$(RESET) $(YELLOW)$(BOLD)make install$(RESET)   $(DIM)→ Installe les dépendances$(RESET)         $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)3.$(RESET) $(BLUE)$(BOLD)make clean$(RESET)     $(DIM)→ Nettoyage léger (ports)$(RESET)          $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)4.$(RESET) $(RED)$(BOLD)make nuke$(RESET)      $(DIM)→ Nettoyage complet$(RESET)               $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)5.$(RESET) $(MAGENTA)$(BOLD)make status$(RESET)    $(DIM)→ État des ports$(RESET)                   $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)6.$(RESET) $(RED)$(BOLD)make reset-db$(RESET)  $(DIM)→ Reset base de données$(RESET)           $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)1.$(RESET) $(GREEN)$(BOLD)make dev$(RESET)       $(DIM)→ Lance l'application complète$(RESET)     $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)2.$(RESET) $(YELLOW)$(BOLD)make install$(RESET)   $(DIM)→ Installe toutes les dépendances$(RESET)  $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)3.$(RESET) $(RED)$(BOLD)make clean$(RESET)     $(DIM)→ Nettoyage complet du projet$(RESET)     $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)4.$(RESET) $(BLUE)$(BOLD)make status$(RESET)    $(DIM)→ Vérifie l'état des ports$(RESET)        $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)$(BOLD)5.$(RESET) $(RED)$(BOLD)make reset-db$(RESET)  $(DIM)→ Vider la base de données$(RESET)       $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)Backend:$(RESET)  $(BOLD)$(BLUE)http://localhost:3001$(RESET) $(DIM)(API)$(RESET)                  $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)Socket.IO:$(RESET) $(BOLD)$(BLUE)http://localhost:3000$(RESET) $(DIM)(Chat)$(RESET)                 $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(WHITE)Frontend:$(RESET) $(BOLD)$(MAGENTA)http://localhost:3002$(RESET) $(DIM)(App)$(RESET)                  $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(WHITE)$(BOLD)                    Tapez votre choix (1-5): $(RESET)"

# ═══════════════════════════════════════════════════════════════════════════════
#                            🚀 COMMANDES PRINCIPALES
# ═══════════════════════════════════════════════════════════════════════════════

dev: 
	@echo ""
	@echo "$(BLUE)$(BOLD) � Starting development server...$(RESET)"
	@echo ""
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File "scripts\\ultimate-clean.ps1" -Force -Quiet
else
	@make kill-ports
endif
	@echo "$(BLUE) ⚡ Building backend...$(RESET)"
	@cd $(BACK_DIR) && npm run build > /dev/null 2>&1
	@echo "$(GREEN) ✓ Backend ready$(RESET)"
	@echo ""
	@echo "$(BLUE) 📡 Starting services...$(RESET)"
ifeq ($(OS),Windows_NT)
	@cd $(BACK_DIR) && start /B npm run server > /dev/null 2>&1
	@cd $(BACK_DIR) && start /B npm run chat > /dev/null 2>&1
else
	@cd $(BACK_DIR) && nohup npm run server >/dev/null 2>&1 &
	@cd $(BACK_DIR) && nohup npm run chat >/dev/null 2>&1 &
endif
	@$(WAIT)
	@echo "$(GREEN)$(BOLD) ✅ Backend API démarré sur port 3001$(RESET)"
	@echo "$(GREEN)$(BOLD) ✅ Socket.IO démarré sur port 3000$(RESET)"
	@echo "$(YELLOW)$(BOLD) 🌐 Lancement du frontend...$(RESET)"
	@echo ""
	@echo "$(CYAN)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                     🎉 PRÊT À DÉVELOPPER ! 🎉                ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)🔗 Backend API:$(RESET)  $(BLUE)$(BOLD)http://localhost:3001$(RESET)                      $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)📡 Socket.IO:$(RESET)    $(BLUE)$(BOLD)http://localhost:3000$(RESET)                      $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)  $(MAGENTA)$(BOLD)🌐 Frontend App:$(RESET) $(BLUE)$(BOLD)http://localhost:3002$(RESET)                      $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(CYAN)$(BOLD) ║$(RESET)             $(WHITE)$(BOLD)Appuyez sur Ctrl+C pour arrêter$(RESET)                  $(CYAN)$(BOLD)║$(RESET)"
	@echo "$(CYAN)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@cd $(FRONT_DIR) && npm run dev || (echo "" && echo "$(YELLOW)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)" && echo "$(YELLOW)$(BOLD) ║                        👋 ARRÊT PROPRE 👋                    ║$(RESET)" && echo "$(YELLOW)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)" && echo "$(YELLOW)$(BOLD) ║                                                              ║$(RESET)" && echo "$(YELLOW)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Serveurs arrêtés correctement$(RESET)                            $(YELLOW)$(BOLD)║$(RESET)" && echo "$(YELLOW)$(BOLD) ║$(RESET)  $(CYAN)$(BOLD)⚡ Tapez 'make' pour relancer le menu$(RESET)                       $(YELLOW)$(BOLD)║$(RESET)" && echo "$(YELLOW)$(BOLD) ║                                                              ║$(RESET)" && echo "$(YELLOW)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)" && echo "")

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
	@echo "$(RED)$(BOLD) ╔════════════════════════════════════════════════════════════$(RESET)"
	@echo "$(RED)$(BOLD) ║                    🧹 NETTOYAGE COMPLET                    $(RESET)"
	@echo "$(RED)$(BOLD) ╠════════════════════════════════════════════════════════════$(RESET)"
	@echo "$(RED)$(BOLD) ║                                                            $(RESET)"
	@echo "$(YELLOW) ║  🔫 Libération des ports...                               $(RESET)"
ifeq ($(OS),Windows_NT)
	@$(KILL_PORTS) > nul 2>&1
else
	@$(KILL_3001) > /dev/null 2>&1
	@$(KILL_3002) > /dev/null 2>&1
endif
	@$(WAIT) > /dev/null 2>&1
	@echo "$(GREEN) ║  ✓ Port 3001 libéré                                       $(RESET)"
	@echo "$(GREEN) ║  ✓ Port 3002 libéré                                       $(RESET)"
	@echo "$(RED)$(BOLD) ║                                                            $(RESET)"
	@echo "$(YELLOW) ║  🗑️  Suppression des fichiers build...                    $(RESET)"
ifeq ($(OS),Windows_NT)
	@if exist "$(BACK_DIR)\dist" rmdir /S /Q "$(BACK_DIR)\dist" 2>nul
	@if exist "$(FRONT_DIR)\dist" rmdir /S /Q "$(FRONT_DIR)\dist" 2>nul
else
	@$(RM) $(BACK_DIR)/dist 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/dist 2>/dev/null || true
endif
	@echo "$(GREEN) ║  ✓ Fichiers build supprimés                               $(RESET)"
	@echo "$(RED)$(BOLD) ║                                                            $(RESET)"
	@echo "$(YELLOW) ║  📁 Suppression des node_modules...                       $(RESET)"
ifeq ($(OS),Windows_NT)
	@if exist "$(BACK_DIR)\node_modules" rmdir /S /Q "$(BACK_DIR)\node_modules" 2>nul
	@if exist "$(FRONT_DIR)\node_modules" rmdir /S /Q "$(FRONT_DIR)\node_modules" 2>nul
else
	@$(RM) $(BACK_DIR)/node_modules 2>/dev/null || true
	@$(RM) $(FRONT_DIR)/node_modules 2>/dev/null || true
endif
	@echo "$(GREEN) ║  ✓ node_modules supprimés                                 $(RESET)"
	@echo "$(RED)$(BOLD) ║                                                            $(RESET)"
	@echo "$(GREEN)$(BOLD) ║                    ✨ NETTOYAGE TERMINÉ !                  $(RESET)"
	@echo "$(RED)$(BOLD) ║                                                            $(RESET)"
	@echo "$(RED)$(BOLD) ╚════════════════════════════════════════════════════════════$(RESET)"

status:
	@echo ""
	@echo "$(BLUE)$(BOLD) ╔══════════════════════════════════════════════════════════════╗$(RESET)"
	@echo "$(BLUE)$(BOLD) ║                      📊 ÉTAT DES PORTS 📊                    ║$(RESET)"
	@echo "$(BLUE)$(BOLD) ╠══════════════════════════════════════════════════════════════╣$(RESET)"
	@echo "$(BLUE)$(BOLD) ║                                                              ║$(RESET)"
ifeq ($(OS),Windows_NT)
	@netstat -ano | findstr :3000 > nul && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3000: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3000: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
	@netstat -ano | findstr :3001 > nul && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3001: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3001: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
	@netstat -ano | findstr :3002 > nul && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3002: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3002: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
else
	@lsof -i:3000 > /dev/null 2>&1 && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3000: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3000: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
	@lsof -i:3001 > /dev/null 2>&1 && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3001: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3001: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
	@lsof -i:3002 > /dev/null 2>&1 && echo "$(BLUE)$(BOLD) ║$(RESET)  $(RED)$(BOLD)❌ Port 3002: OCCUPÉ$(RESET)                                    $(BLUE)$(BOLD)║$(RESET)" || echo "$(BLUE)$(BOLD) ║$(RESET)  $(GREEN)$(BOLD)✅ Port 3002: libre$(RESET)                                       $(BLUE)$(BOLD)║$(RESET)"
endif
	@echo "$(BLUE)$(BOLD) ║                                                              ║$(RESET)"
	@echo "$(BLUE)$(BOLD) ╚══════════════════════════════════════════════════════════════╝$(RESET)"

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
ifeq ($(OS),Windows_NT)
	@powershell -Command "& { if (Test-Path 'backend/database.sqlite') { Remove-Item 'backend/database.sqlite' -Force; Write-Host 'Database file deleted' -ForegroundColor Green } else { Write-Host 'No database file found' -ForegroundColor Yellow } }"
	@powershell -Command "& { Get-ChildItem 'backend' -Filter '*.db' -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item $_.FullName -Force; Write-Host \"Deleted: $$($_.Name)\" -ForegroundColor Red } }"
	@powershell -Command "& { Get-ChildItem 'backend' -Filter '*.sqlite*' -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item $_.FullName -Force; Write-Host \"Deleted: $$($_.Name)\" -ForegroundColor Red } }"
else
	@rm -f $(BACK_DIR)/database.sqlite $(BACK_DIR)/*.db $(BACK_DIR)/*.sqlite* 2>/dev/null || true
	@echo "$(GREEN) ✓ Database files removed$(RESET)"
endif
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

.PHONY: help dev install clean nuke status kill-ports reset-db