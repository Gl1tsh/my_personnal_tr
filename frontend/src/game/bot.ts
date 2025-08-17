// src/game/bot.ts

// Constantes spécifiques au bot
const MAX_REACTION_TIME = 1000;   // Temps max de réaction initial en ms (1 seconde)
const MIN_REACTION_TIME = 100;    // Temps min de réaction en ms (0.1 seconde)
const DIFFICULTY_STEP = 5;        // Points nécessaires pour réduire le temps
const TIME_REDUCTION = 0.9;       // Réduction de 10% du temps à chaque étape
const REACTION_VARIABILITY = 0.5; // Variabilité aléatoire (50% pour varier le delay)

// Interface pour le paddle contrôlé par le bot
interface Paddle {
  x: number;
  y: number;
  score: number;
}

// Interface pour la balle
interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

// Classe pour gérer le bot
export class Bot {
  private paddle: Paddle;
  private ball: Ball;
  private baseReactionTime: number;
  private canvasHeight: number;
  private paddleHeight: number;

  constructor(paddle: Paddle, ball: Ball, canvasHeight: number, paddleHeight: number) {
    this.paddle = paddle;
    this.ball = ball;
    this.canvasHeight = canvasHeight;
    this.paddleHeight = paddleHeight;
    this.baseReactionTime = MAX_REACTION_TIME; // Temps de réaction initial
    console.log('Bot créé, reactionTime initial:', this.baseReactionTime); // Débogage
  }

  // Ajuster la difficulté en fonction du score total
  adjustDifficulty(totalScore: number) {
    const steps = Math.floor(totalScore / DIFFICULTY_STEP);
    this.baseReactionTime = Math.max(MIN_REACTION_TIME, MAX_REACTION_TIME * Math.pow(TIME_REDUCTION, steps));
    console.log('Difficulté ajustée, nouveau reactionTime:', this.baseReactionTime); // Débogage
  }

  // Faire bouger le bot
  move() {
    // Position cible : aligner le centre du paddle avec la balle
    const targetY = this.ball.y - this.paddleHeight / 2;

    // Temps de réaction aléatoire pour ce mouvement
    const randomDelay = this.baseReactionTime * (1 - REACTION_VARIABILITY + Math.random() * REACTION_VARIABILITY * 2);

    // Probabilité de réaction ajustée pour plus de mouvement
    if (Math.random() < (1000 / randomDelay) * 0.1) { // Ajusté pour plus de réactivité (0.1 au lieu de 0.05)
      console.log('Bot tente de bouger, targetY:', targetY, 'currentY:', this.paddle.y); // Débogage
      if (targetY > this.paddle.y && this.paddle.y < this.canvasHeight - this.paddleHeight) {
        this.paddle.y += PADDLE_SPEED; // Bouger vers le bas
      } else if (targetY < this.paddle.y && this.paddle.y > 0) {
        this.paddle.y -= PADDLE_SPEED; // Bouger vers le haut
      }
    }
  }
}