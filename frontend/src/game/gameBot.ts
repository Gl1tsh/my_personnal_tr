// src/game/gameBot.ts
import { TARGET_POSITION_OFFSET, PADDLE_MAX_Y, PADDLE_SPEED, gameState } from './gameState';

// Faire bouger le bot
export function moveBot() {
  // Position cible : centre du paddle aligné avec la balle
  const targetVerticalPosition = gameState.ball.y - TARGET_POSITION_OFFSET;

  // Simuler un délai (si le temps est écoulé, bouger)
  if (Math.random() < 0.2 * (1000 / gameState.botDelay)) { // Probabilité ajustée
    if (targetVerticalPosition > gameState.rightPaddle.y && gameState.rightPaddle.y < PADDLE_MAX_Y) {
      gameState.rightPaddle.y += PADDLE_SPEED;
    } else if (targetVerticalPosition < gameState.rightPaddle.y && gameState.rightPaddle.y > 0) {
      gameState.rightPaddle.y -= PADDLE_SPEED;
    }
  }
}

// Ajuster la difficulté du bot par intervalles de score
export function adjustBotDifficulty() {
  const totalScore = gameState.rightPaddle.score + gameState.leftPaddle.score;
  if (totalScore == 1) {
    gameState.botDelay = 280; // Facile (0-4 points)
  } else if (totalScore == 2) {
    gameState.botDelay = 260; // Moyen (5-9 points, augmenté pour être moins dur)
  } else {
    gameState.botDelay = 250; // Difficile (10+ points, fixé pour éviter l'inbattabilité)
  }
}