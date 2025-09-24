// src/game/gameInput.ts
import { gameState, PADDLE_SPEED, PADDLE_MAX_Y, getGameMode } from './gameState';
import { socket } from '../socket';

// Écouter les touches
window.addEventListener('keydown', (e) => gameState.keys.add(e.key));
window.addEventListener('keyup', (e) => gameState.keys.delete(e.key));

// Gérer les touches du joueur
export function handleInput() {
  const mode = getGameMode();
  const gameHost = localStorage.getItem('gameHost');
  const isHost = !gameHost || gameHost === socket.id;

  if (mode === 'solo') {
    // Contrôles du joueur (gauche)
    if (gameState.keys.has('w') && gameState.leftPaddle.y > 0)
      gameState.leftPaddle.y -= PADDLE_SPEED;
    if (gameState.keys.has('s') && gameState.leftPaddle.y < PADDLE_MAX_Y)
      gameState.leftPaddle.y += PADDLE_SPEED;
  } else if (mode === '1v1-local') {
    // Contrôles du joueur 1 (gauche)
    if (gameState.keys.has('w') && gameState.leftPaddle.y > 0)
      gameState.leftPaddle.y -= PADDLE_SPEED;
    if (gameState.keys.has('s') && gameState.leftPaddle.y < PADDLE_MAX_Y)
      gameState.leftPaddle.y += PADDLE_SPEED;
    // Contrôles du joueur 2 (droite)
    if (gameState.keys.has('ArrowUp') && gameState.rightPaddle.y > 0)
      gameState.rightPaddle.y -= PADDLE_SPEED;
    if (gameState.keys.has('ArrowDown') && gameState.rightPaddle.y < PADDLE_MAX_Y)
      gameState.rightPaddle.y += PADDLE_SPEED;
  } else if (mode === '1v1-remote') {
    if (isHost) {
      // Host controls left paddle
      if (gameState.keys.has('w') && gameState.leftPaddle.y > 0)
        gameState.leftPaddle.y -= PADDLE_SPEED;
      if (gameState.keys.has('s') && gameState.leftPaddle.y < PADDLE_MAX_Y)
        gameState.leftPaddle.y += PADDLE_SPEED;
    } else {
      // Client controls right paddle with W/S
      if (gameState.keys.has('w') && gameState.rightPaddle.y > 0)
        gameState.rightPaddle.y -= PADDLE_SPEED;
      if (gameState.keys.has('s') && gameState.rightPaddle.y < PADDLE_MAX_Y)
        gameState.rightPaddle.y += PADDLE_SPEED;
    }
  }
}