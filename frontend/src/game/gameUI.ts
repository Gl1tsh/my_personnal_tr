// src/game/gameUI.ts
import { WINNING_SCORE, gameState, getGameMode, PADDLE_SPEED, PADDLE_MAX_Y } from './gameState';
import { socket } from '../socket';
import { resetGameState } from './gameLogic';
import { draw } from './gameDraw';
import { update } from './gameLogic';
import { cleanupGame } from './game';

// Mettre à jour le texte d'instructions selon le mode
export function updateInstructions() {
  const messageElement = document.querySelector('.tracking-wider.font-light') as HTMLParagraphElement;
  if (messageElement) {
    const mode = getGameMode();
    if (mode === 'solo') {
      messageElement.innerHTML = 'Utilisez W/S pour déplacer votre paddle';
    } else if (mode === '1v1-local') {
      messageElement.innerHTML = 'Joueur 1: W/S &nbsp;&nbsp;|&nbsp;&nbsp; Joueur 2: ↑/↓';
    } else if (mode === '1v1-remote') {
      messageElement.innerHTML = 'Utilisez W/S pour déplacer votre paddle';
    }
  }
}

// Démarrer le countdown avant le jeu
export function startCountdown() {
  gameState.countdown = 3;
  draw();
  // Send initial countdown state for remote
  if (getGameMode() === '1v1-remote' && localStorage.getItem('gameHost') === socket.id) {
    const gameStateToSend = {
      leftPaddle: gameState.leftPaddle,
      rightPaddle: gameState.rightPaddle,
      ball: gameState.ball,
      gameRunning: gameState.gameRunning,
      gamePaused: gameState.gamePaused,
      countdown: gameState.countdown
    };
    socket.emit('game_update', gameStateToSend);
  }
  const interval = setInterval(() => {
    if (gameState.countdown !== null && gameState.countdown > 0) {
      gameState.countdown--;
      draw();
      // Send updated countdown for remote
      if (getGameMode() === '1v1-remote' && localStorage.getItem('gameHost') === socket.id) {
        const gameStateToSend = {
          leftPaddle: gameState.leftPaddle,
          rightPaddle: gameState.rightPaddle,
          ball: gameState.ball,
          gameRunning: gameState.gameRunning,
          gamePaused: gameState.gamePaused,
          countdown: gameState.countdown
        };
        socket.emit('game_update', gameStateToSend);
      }
    }
    if (gameState.countdown === 0) {
      clearInterval(interval);
      gameState.countdown = null;
      update();
      // Send final countdown state for remote
      if (getGameMode() === '1v1-remote' && localStorage.getItem('gameHost') === socket.id) {
        const gameStateToSend = {
          leftPaddle: gameState.leftPaddle,
          rightPaddle: gameState.rightPaddle,
          ball: gameState.ball,
          gameRunning: gameState.gameRunning,
          gamePaused: gameState.gamePaused,
          countdown: gameState.countdown
        };
        socket.emit('game_update', gameStateToSend);
      }
    }
  }, 1000);
}

// Lancer le jeu
export function startGame() {
  if (!gameState.gameRunning) {
    const mode = getGameMode();
    if (!mode) {
      console.error('Mode de jeu non défini');
      return;
    }

    resetGameState(); // Reset complet (scores, positions, botDelay)
    gameState.gameRunning = true;
    gameState.gamePaused = false;
    const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
    messageElement.classList.add('hidden');

    // Configurer le jeu selon le mode
    if (mode === 'solo') {
      console.log('Mode solo démarré, délai bot:', gameState.botDelay);
      // isBotEnabled = true; // Need to handle
    } else if (mode === '1v1-local') {
      console.log('Mode 1v1 local démarré');
      // Désactiver le bot pour le mode 1v1 local
      // isBotEnabled = false;
    } else if (mode === '1v1-remote') {
      console.log('Mode 1v1 remote démarré');
      // isBotEnabled = false;
      const gameHost = localStorage.getItem('gameHost');
      if (gameHost && gameHost !== socket.id) {
        // I'm client, join the game
        socket.emit('join_game', gameHost);
        socket.on('game_started', (data) => {
          console.log('Joined game with host:', data.hostId);
          // Start game as client
          gameState.gameRunning = true;
          update(); // Start the update loop
        });
        socket.on('game_update', (data) => {
          gameState.lastReceivedState = data;
          if (data.countdown !== undefined) {
            gameState.countdown = data.countdown;
          }
        });
        socket.on('join_failed', (reason) => {
          console.error('Failed to join game:', reason);
          alert('Failed to join game: ' + reason);
        });
      } else {
        // I'm host, wait for client
        console.log('Waiting for opponent to join...');
        socket.on('game_joined', (data) => {
          console.log('Opponent joined:', data.clientId);
          // Start game
          gameState.gameRunning = true;
          startCountdown();
        });
        socket.on('game_update', (data) => {
          if (data.input) {
            if (data.input.up && gameState.rightPaddle.y > 0) gameState.rightPaddle.y -= PADDLE_SPEED;
            if (data.input.down && gameState.rightPaddle.y < PADDLE_MAX_Y) gameState.rightPaddle.y += PADDLE_SPEED;
          }
        });
      }
      // Don't call update here for remote
      (document.getElementById('startGameButton') as HTMLButtonElement).disabled = true;
      messageElement.classList.remove('text-green-400', 'text-red-400');
      return; // Don't call update at the end
    } else if (mode === 'tournament') {
      // À implémenter plus tard
      console.log('Mode tournoi pas encore implémenté');
      return;
    }

    startCountdown();
    (document.getElementById('startGameButton') as HTMLButtonElement).disabled = true;
    messageElement.classList.remove('text-green-400', 'text-red-400');
  }
}

// Mettre en pause ou reprendre
export function pauseGame() {
  if (gameState.gameRunning) {
    if (!gameState.gamePaused) {
      gameState.gamePaused = true;
      (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Resume';
    } else {
      gameState.gamePaused = false;
      (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Pause';
      update();
    }
  }
}

// Réinitialiser le jeu
export function resetGame() {
  resetGameState(); // Reset complet
  gameState.gamePaused = false;
  const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
  messageElement.classList.add('hidden');
  messageElement.classList.remove('text-green-400', 'text-red-400');
  (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Pause';
  (document.getElementById('pauseGameButton') as HTMLButtonElement).disabled = false; // Réactiver "Pause"
  (document.getElementById('startGameButton') as HTMLButtonElement).disabled = false; // Réactiver "Start Game"
  draw();
}

// Terminer la partie et afficher le message
export function endGame() {
  gameState.gameRunning = false;
  const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
  messageElement.classList.remove('hidden');
  const mode = getGameMode();
  const isHost = !localStorage.getItem('gameHost') || localStorage.getItem('gameHost') === socket.id;
  if (mode === '1v1-remote' && !isHost) {
    // For client, rightPaddle is theirs
    if (gameState.rightPaddle.score >= WINNING_SCORE) {
      messageElement.textContent = 'YOU WIN !';
      messageElement.classList.add('text-green-400');
    } else if (gameState.leftPaddle.score >= WINNING_SCORE) {
      messageElement.textContent = 'YOU LOSE !';
      messageElement.classList.add('text-red-400');
    }
  } else {
    if (gameState.leftPaddle.score >= WINNING_SCORE) {
      messageElement.textContent = 'YOU WIN !';
      messageElement.classList.add('text-green-400');
    } else if (gameState.rightPaddle.score >= WINNING_SCORE) {
      messageElement.textContent = 'YOU LOSE !';
      messageElement.classList.add('text-red-400');
    }
  }
  // Send final state for remote
  if (mode === '1v1-remote' && isHost) {
    const gameStateToSend = {
      leftPaddle: gameState.leftPaddle,
      rightPaddle: gameState.rightPaddle,
      ball: gameState.ball,
      gameRunning: gameState.gameRunning,
      gamePaused: gameState.gamePaused,
      countdown: gameState.countdown
    };
    socket.emit('game_update', gameStateToSend);
  }
  // Replace buttons with Leave button
  const buttonsDiv = document.querySelector('.flex.justify-center.gap-md') as HTMLDivElement;
  buttonsDiv.innerHTML = '<button id="leaveGameButton" class="btn btn-primary">Leave</button>';
  const leaveButton = document.getElementById('leaveGameButton') as HTMLButtonElement;
  leaveButton.addEventListener('click', () => {
    // Navigate to livechat
    window.history.pushState({ page: 'live-chat' }, '', '#live-chat');
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    const livechatSection = document.getElementById('live-chat');
    if (livechatSection) livechatSection.classList.remove('hidden');
    // Update nav
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const chatNavLink = document.querySelector('[data-page="live-chat"]');
    if (chatNavLink) chatNavLink.classList.add('active');
    // Cleanup game
    // cleanupGame(); // Need to import
  });
}