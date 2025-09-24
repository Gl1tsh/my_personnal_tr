// src/game/gameDraw.ts
import { CANVAS_WIDTH, CANVAS_HEIGHT, BALL_SIZE, SCORE_LEFT_X, SCORE_RIGHT_X, PADDLE_WIDTH, PADDLE_HEIGHT, RIGHT_PADDLE_STARTING_X_POSITION, gameState, getGameMode } from './gameState';
import { socket } from '../socket';
import { ctx } from './game';

// Dessiner le jeu
export function draw() {
  if (!ctx)
    return;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'white';
  const mode = getGameMode();
  const isHost = !localStorage.getItem('gameHost') || localStorage.getItem('gameHost') === socket.id;
  if (mode === '1v1-remote' && !isHost) {
    // Mirror: draw rightPaddle as left, leftPaddle as right
    ctx.fillRect(0, gameState.rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(RIGHT_PADDLE_STARTING_X_POSITION, gameState.leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - gameState.ball.x - BALL_SIZE / 2, gameState.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
    ctx.font = '20px Arial';
    ctx.fillText(gameState.rightPaddle.score.toString(), SCORE_LEFT_X, 50);
    ctx.fillText(gameState.leftPaddle.score.toString(), SCORE_RIGHT_X, 50);
  } else {
    ctx.fillRect(gameState.leftPaddle.x, gameState.leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(gameState.rightPaddle.x, gameState.rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(gameState.ball.x - BALL_SIZE / 2, gameState.ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
    ctx.font = '20px Arial';
    ctx.fillText(gameState.leftPaddle.score.toString(), SCORE_LEFT_X, 50);
    ctx.fillText(gameState.rightPaddle.score.toString(), SCORE_RIGHT_X, 50);
  }

  // Display countdown if active
  if (gameState.countdown !== null) {
    ctx.font = '80px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.countdown.toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.textAlign = 'left'; // Reset
    ctx.fillStyle = 'white'; // Reset
  }
}