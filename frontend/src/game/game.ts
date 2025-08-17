// src/game.ts

// === Constantes du jeu ===
const CANVAS_WIDTH = 800;         // Largeur du canvas
const CANVAS_HEIGHT = 600;        // Hauteur du canvas
const PADDLE_WIDTH = 10;          // Largeur des paddles
const PADDLE_HEIGHT = 100;        // Hauteur des paddles
const BALL_SIZE = 10;             // Taille de la balle
const PADDLE_SPEED = 2;           // Vitesse des paddles
const BALL_SPEED = 2;             // Vitesse de la balle (fixe, pas de changement)

// === Types pour organiser les données ===
interface Paddle {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  score: number;// Score
}

interface Ball {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  dx: number;   // Vitesse horizontale
  dy: number;   // Vitesse verticale
}

// === Variables globales ===
const INITIAL_PADDLE_Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2; // Position verticale initiale des paddles
const BALL_CENTER_X = CANVAS_WIDTH / 2;                        // Centre horizontal de la balle
const BALL_CENTER_Y = CANVAS_HEIGHT / 2;                       // Centre vertical de la balle
const SCORE_LEFT_X = CANVAS_WIDTH / 4;                         // Position X du score gauche
const SCORE_RIGHT_X = 3 * CANVAS_WIDTH / 4;                    // Position X du score droit
const PADDLE_MAX_Y = CANVAS_HEIGHT - PADDLE_HEIGHT;            // Limite supérieure des paddles
let leftPaddle: Paddle = { x: 0, y: INITIAL_PADDLE_Y, score: 0 };
let rightPaddle: Paddle = { x: CANVAS_WIDTH - PADDLE_WIDTH, y: INITIAL_PADDLE_Y, score: 0 };
let ball: Ball = { x: BALL_CENTER_X, y: BALL_CENTER_Y, dx: BALL_SPEED, dy: BALL_SPEED };
let gameRunning = false;    // Jeu en cours
let gamePaused = false;     // Jeu en pause
let animationFrameId: number; // ID de l'animation
let botDelay = 300;         // Délai initial du bot en ms (0.3 seconde, facile)

// Stocker les touches
const keys: Set<string> = new Set();

// Canvas et contexte
const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Écouter les touches
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// === Fonctions simples ===

// Dessiner le jeu
function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(ball.x - BALL_SIZE / 2, ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
  ctx.font = '30px Arial';
  ctx.fillText(leftPaddle.score.toString(), SCORE_LEFT_X, 50);
  ctx.fillText(rightPaddle.score.toString(), SCORE_RIGHT_X, 50);
}

// Mettre à jour le jeu
function update() {
  if (!gameRunning || gamePaused) return;

  // Déplacer la balle dans les deux directions
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Rebondir sur les murs
  if (ball.y < 0 || ball.y > CANVAS_HEIGHT) ball.dy = -ball.dy;

  // Collisions avec les paddles
  if (ball.x < PADDLE_WIDTH && ball.y > leftPaddle.y && ball.y < leftPaddle.y + PADDLE_HEIGHT) {
    ball.dx = -ball.dx;
  }
  if (ball.x > CANVAS_WIDTH - PADDLE_WIDTH && ball.y > rightPaddle.y && ball.y < rightPaddle.y + PADDLE_HEIGHT) {
    ball.dx = -ball.dx;
  }

  // Points et reset
  if (ball.x < 0) {
    rightPaddle.score++;
    adjustBotDifficulty();
    resetBall();
  }
  if (ball.x > CANVAS_WIDTH) {
    leftPaddle.score++;
    adjustBotDifficulty();
    resetBall();
  }

  handleInput(); // Joueur
  moveBot();     // Bot
  draw();
  animationFrameId = requestAnimationFrame(update);
}

// Réinitialiser la balle et les paddles après un goal
function resetBall() {
  ball.x = BALL_CENTER_X;
  ball.y = BALL_CENTER_Y;
  ball.dx = -ball.dx; // Inverser la direction horizontale
  ball.dy = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED; // Direction verticale aléatoire
  leftPaddle.y = INITIAL_PADDLE_Y;  // Réinitialiser le paddle gauche
  rightPaddle.y = INITIAL_PADDLE_Y; // Réinitialiser le paddle droit
}

// Ajuster la difficulté du bot par intervalles de score
function adjustBotDifficulty() {
  const totalScore = leftPaddle.score + rightPaddle.score;
  if (totalScore < 5) {
    botDelay = 280; // Facile (0-4 points)
  } else if (totalScore < 10) {
    botDelay = 260; // Moyen (5-9 points, augmenté pour être moins dur)
  } else {
    botDelay = 250; // Difficile (10+ points, fixé pour éviter l'inbattabilité)
  }
  console.log('Nouveau délai du bot:', botDelay); // Débogage
}

// Gérer les touches du joueur
function handleInput() {
  if (keys.has('w') && leftPaddle.y > 0) leftPaddle.y -= PADDLE_SPEED;
  if (keys.has('s') && leftPaddle.y < PADDLE_MAX_Y) leftPaddle.y += PADDLE_SPEED;
}

// Faire bouger le bot
function moveBot() {
  if (!gameRunning || gamePaused) return;

  // Position cible : centre du paddle aligné avec la balle
  const targetY = ball.y - PADDLE_HEIGHT / 2;

  // Simuler un délai (si le temps est écoulé, bouger)
  if (Math.random() < 0.2 * (1000 / botDelay)) { // Probabilité ajustée
    console.log('Bot bouge, targetY:', targetY, 'currentY:', rightPaddle.y); // Débogage
    if (targetY > rightPaddle.y && rightPaddle.y < PADDLE_MAX_Y) {
      rightPaddle.y += PADDLE_SPEED;
    } else if (targetY < rightPaddle.y && rightPaddle.y > 0) {
      rightPaddle.y -= PADDLE_SPEED;
    }
  }
}

// Lancer le jeu
function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    gamePaused = false;
    console.log('Jeu démarré, délai bot:', botDelay); // Débogage
    update();
    (document.getElementById('startGameButton') as HTMLButtonElement).disabled = true;
  }
}

// Mettre en pause ou reprendre
function pauseGame() {
  if (gameRunning) {
    if (!gamePaused) {
      gamePaused = true;
      (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Resume';
    } else {
      gamePaused = false;
      (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Pause';
      update();
    }
  }
}

// Réinitialiser le jeu
function resetGame() {
  if (gameRunning) {
    resetGameState();
    gamePaused = false;
    (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Pause';
    draw();
    (document.getElementById('startGameButton') as HTMLButtonElement).disabled = false;
  }
}

// Initialiser le jeu
export function initGame() {
  if (!canvas || !ctx) {
    console.error('Canvas ou contexte non trouvé');
    return;
  }
  resetGameState();
  draw();
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  startButton.addEventListener('click', startGame);
  const pauseButton = document.getElementById('pauseGameButton') as HTMLButtonElement;
  pauseButton.addEventListener('click', pauseGame);
  const resetButton = document.getElementById('resetGameButton') as HTMLButtonElement;
  resetButton.addEventListener('click', resetGame);
}

// Nettoyer
export function cleanupGame() {
  gameRunning = false;
  gamePaused = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  resetGameState();
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  if (startButton) {
    startButton.disabled = false;
    startButton.removeEventListener('click', startGame);
  }
  const pauseButton = document.getElementById('pauseGameButton') as HTMLButtonElement;
  if (pauseButton) {
    pauseButton.removeEventListener('click', pauseGame);
  }
  const resetButton = document.getElementById('resetGameButton') as HTMLButtonElement;
  if (resetButton) {
    resetButton.removeEventListener('click', resetGame);
  }
}

// Réinitialiser l'état
function resetGameState() {
  leftPaddle = { x: 0, y: INITIAL_PADDLE_Y, score: 0 };
  rightPaddle = { x: CANVAS_WIDTH - PADDLE_WIDTH, y: INITIAL_PADDLE_Y, score: 0 };
  ball = { x: BALL_CENTER_X, y: BALL_CENTER_Y, dx: BALL_SPEED, dy: BALL_SPEED };
  gameRunning = false;
  botDelay = 300; // Réinitialiser le délai du bot
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
}