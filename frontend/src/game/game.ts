// src/game.ts
import { updateInstructions } from './gameUI';
import { draw } from './gameDraw';
import { resetGameState } from './gameLogic';
import { startGame } from './gameUI';
import { gameState } from './gameState';

// Canvas et contexte
export const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Initialiser le jeu
export function initGame() {
  if (!canvas || !ctx) {
    console.error('Canvas ou contexte non trouvé');
    return;
  }
  resetGameState();
  draw();
  updateInstructions(); // Mettre à jour les instructions dès l'initialisation
  // Reset buttons to original state
  const buttonsDiv = document.querySelector('.flex.justify-center.gap-md') as HTMLDivElement;
  buttonsDiv.innerHTML = `
    <button id="startGameButton" class="btn btn-primary">Start Game</button>
  `;
  // Add event listener
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  startButton.addEventListener('click', startGame);
}

// Nettoyer
export function cleanupGame() {
  gameState.gameRunning = false;
  gameState.gamePaused = false;
  if (gameState.animationFrameId) cancelAnimationFrame(gameState.animationFrameId);
  resetGameState();
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  if (startButton) {
    startButton.disabled = false;
    startButton.removeEventListener('click', startGame);
  }
}