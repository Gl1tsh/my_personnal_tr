// src/game/gameLogic.ts
import { BALL_CENTER_X, BALL_CENTER_Y, BALL_SPEED, INITIAL_PADDLE_Y, RIGHT_PADDLE_STARTING_X_POSITION, LEFT_PADDLE_EDGE, RIGHT_PADDLE_EDGE, WINNING_SCORE, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, gameState, getGameMode } from './gameState';
import { socket } from '../socket';
import { draw } from './gameDraw';
import { handleInput } from './gameInput';
import { moveBot, adjustBotDifficulty } from './gameBot';
import { endGame } from './gameUI';

// Réinitialiser la balle et les paddles après un goal
export function resetBall() {
  gameState.ball.x = BALL_CENTER_X;
  gameState.ball.y = BALL_CENTER_Y;
  gameState.ball.speed_x = -gameState.ball.speed_x; // Inverser la direction horizontale
  gameState.ball.speed_y = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED; // Direction verticale aléatoire
  gameState.leftPaddle.y = INITIAL_PADDLE_Y;  // Réinitialiser le paddle gauche
  gameState.rightPaddle.y = INITIAL_PADDLE_Y; // Réinitialiser le paddle droit
}

// Réinitialiser l'état
export function resetGameState() {
  gameState.leftPaddle = { x: 0, y: INITIAL_PADDLE_Y, score: 0 };
  gameState.rightPaddle = { x: RIGHT_PADDLE_STARTING_X_POSITION, y: INITIAL_PADDLE_Y, score: 0 };
  gameState.ball = { x: BALL_CENTER_X, y: BALL_CENTER_Y, speed_x: BALL_SPEED, speed_y: BALL_SPEED };
  gameState.gameRunning = false;
  gameState.botDelay = 300; // Réinitialiser le délai du bot
  gameState.countdown = null; // Reset countdown
  if (gameState.animationFrameId)
    cancelAnimationFrame(gameState.animationFrameId);
}

// Mettre à jour le jeu
export function update() {
  if (!gameState.gameRunning || gameState.gamePaused)
    return;

  const mode = getGameMode();
  const gameHost = localStorage.getItem('gameHost');
  const isHost = !gameHost || gameHost === socket.id;

  if (mode === '1v1-remote' && !isHost) {
    // Client: use received state
    if (gameState.lastReceivedState) {
      gameState.leftPaddle = gameState.lastReceivedState.leftPaddle;
      gameState.rightPaddle = gameState.lastReceivedState.rightPaddle;
      gameState.ball = gameState.lastReceivedState.ball;
      gameState.gameRunning = gameState.lastReceivedState.gameRunning;
      gameState.gamePaused = gameState.lastReceivedState.gamePaused;
      gameState.countdown = gameState.lastReceivedState.countdown || null;
    }
    if (gameState.countdown !== null) {
      // During countdown, just draw and continue loop
      draw();
      gameState.animationFrameId = requestAnimationFrame(update);
      return;
    }
    // If game ended, trigger endGame
    if (!gameState.gameRunning) {
      endGame();
      return;
    }
    // Send input for right paddle
    const input = {
      up: gameState.keys.has('w'),
      down: gameState.keys.has('s')
    };
    socket.emit('game_update', { input });
    draw();
    gameState.animationFrameId = requestAnimationFrame(update);
    return;
  }

  if (gameState.countdown !== null) {
    // During countdown, just draw and continue loop
    draw();
    gameState.animationFrameId = requestAnimationFrame(update);
    return;
  }

  // Host logic...

  // Vérifier si un joueur a gagné
  if (gameState.leftPaddle.score >= WINNING_SCORE || gameState.rightPaddle.score >= WINNING_SCORE) {
    endGame();
    return; // Arrêter la mise à jour
  }

  // Déplacer la balle dans les deux directions
  gameState.ball.x += gameState.ball.speed_x;
  gameState.ball.y += gameState.ball.speed_y;

  // Rebondir sur les murs
  if (gameState.ball.y < 0 || gameState.ball.y > CANVAS_HEIGHT)
    gameState.ball.speed_y = -gameState.ball.speed_y;

  // Collisions avec les paddles
  if (gameState.ball.x < LEFT_PADDLE_EDGE && gameState.ball.y > gameState.leftPaddle.y && gameState.ball.y < gameState.leftPaddle.y + PADDLE_HEIGHT) {
    gameState.ball.speed_x = -gameState.ball.speed_x;
  }
  if (gameState.ball.x > RIGHT_PADDLE_EDGE && gameState.ball.y > gameState.rightPaddle.y && gameState.ball.y < gameState.rightPaddle.y + PADDLE_HEIGHT) {
    gameState.ball.speed_x = -gameState.ball.speed_x;
  }

  // Points et reset
  if (gameState.ball.x < 0) {
    gameState.rightPaddle.score++;
    if (mode === 'solo') adjustBotDifficulty();
    resetBall();
  }
  if (gameState.ball.x > CANVAS_WIDTH) {
    gameState.leftPaddle.score++;
    if (mode === 'solo') adjustBotDifficulty();
    resetBall();
  }

  handleInput(); // Joueur
  if (mode === 'solo') moveBot();     // Bot

  // For remote, send state
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

  draw();
  gameState.animationFrameId = requestAnimationFrame(update);
}