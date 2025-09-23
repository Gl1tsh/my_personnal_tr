// src/game.ts
import { getGameMode } from './gameState';
import { socket } from '../socket';

// ==================== Types pour organiser les données ====================
interface Paddle {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  score: number;// Score
}

interface Ball {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  speed_x: number;   // Vitesse horizontale
  speed_y: number;   // Vitesse verticale
}

// ==================== Configuration du Pong ====================
const CANVAS_WIDTH = 800;         // Largeur du canvas
const CANVAS_HEIGHT = 600;        // Hauteur du canvas
const PADDLE_WIDTH = 10;          // Largeur des paddles
const PADDLE_HEIGHT = 100;        // Hauteur des paddles
const BALL_SIZE = 10;             // Taille de la balle
const PADDLE_SPEED = 3;           // Vitesse des paddles
const BALL_SPEED = 3;             // Vitesse de la balle (fixe, pas de changement)
const WINNING_SCORE = 3; // Score pour gagner la partie

// ==================== État du jeu ====================
const INITIAL_PADDLE_Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2; // Position verticale initiale des paddles
const BALL_CENTER_X = CANVAS_WIDTH / 2;                        // Centre horizontal de la balle
const BALL_CENTER_Y = CANVAS_HEIGHT / 2;                       // Centre vertical de la balle
const SCORE_LEFT_X = CANVAS_WIDTH / 4;                         // Position X du score gauche
const SCORE_RIGHT_X = 3 * CANVAS_WIDTH / 4;                    // Position X du score droit
const PADDLE_MAX_Y = CANVAS_HEIGHT - PADDLE_HEIGHT;            // Limite supérieure des paddles
const RIGHT_PADDLE_STARTING_X_POSITION = CANVAS_WIDTH - PADDLE_WIDTH; // Position horizontale initiale du paddle droit
const TARGET_POSITION_OFFSET = PADDLE_HEIGHT / 2;              // Décalage pour centrer la position cible du bot
const LEFT_PADDLE_EDGE = PADDLE_WIDTH;                         // Bord gauche du paddle gauche
const RIGHT_PADDLE_EDGE = CANVAS_WIDTH - PADDLE_WIDTH;         // Bord droit du paddle droit
let leftPaddle: Paddle = { x: 0, y: INITIAL_PADDLE_Y, score: 0 };
let rightPaddle: Paddle = { x: RIGHT_PADDLE_STARTING_X_POSITION, y: INITIAL_PADDLE_Y, score: 0 };
let ball: Ball = { x: BALL_CENTER_X, y: BALL_CENTER_Y, speed_x: BALL_SPEED, speed_y: BALL_SPEED };
let gameRunning = false;    // Jeu en cours
let gamePaused = false;     // Jeu en pause
let animationFrameId: number; // ID de l'animation
let botDelay = 300;         // Délai initial du bot en ms (0.3 seconde, facile)
let lastReceivedState: any = null; // For remote client
let countdown: number | null = null; // Countdown before game starts

// Stocker les touches
const keys: Set<string> = new Set();

// Canvas et contexte
const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

// Écouter les touches
window.addEventListener('keydown', (e) => keys.add(e.key));
window.addEventListener('keyup', (e) => keys.delete(e.key));

// ==================== INITIALISATION and UPDATE ====================
// Dessiner le jeu
function draw() {
  if (!ctx)
    return;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = 'white';
  ctx.fillRect(leftPaddle.x, leftPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(rightPaddle.x, rightPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillRect(ball.x - BALL_SIZE / 2, ball.y - BALL_SIZE / 2, BALL_SIZE, BALL_SIZE);
  ctx.font = '30px Arial';
  ctx.fillText(leftPaddle.score.toString(), SCORE_LEFT_X, 50);
  ctx.fillText(rightPaddle.score.toString(), SCORE_RIGHT_X, 50);

  // Display countdown if active
  if (countdown !== null) {
    ctx.font = '80px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText(countdown.toString(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.textAlign = 'left'; // Reset
    ctx.fillStyle = 'white'; // Reset
  }
}

// Mettre à jour le texte d'instructions selon le mode
function updateInstructions() {
  const messageElement = document.querySelector('.tracking-wider.font-light') as HTMLParagraphElement;
  if (messageElement) {
    const mode = getGameMode();
    if (mode === 'solo') {
      messageElement.innerHTML = 'Utilisez W/S pour déplacer votre paddle';
    } else if (mode === '1v1-local') {
      messageElement.innerHTML = 'Joueur 1: W/S &nbsp;&nbsp;|&nbsp;&nbsp; Joueur 2: ↑/↓';
    }
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
  updateInstructions(); // Mettre à jour les instructions dès l'initialisation
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  startButton.addEventListener('click', startGame);
  const pauseButton = document.getElementById('pauseGameButton') as HTMLButtonElement;
  pauseButton.addEventListener('click', pauseGame);
  const resetButton = document.getElementById('resetGameButton') as HTMLButtonElement;
  resetButton.addEventListener('click', resetGame);
}

// Gérer les touches du joueur
function handleInput() {
  const mode = getGameMode();
  const gameHost = localStorage.getItem('gameHost');
  const isHost = !gameHost || gameHost === socket.id;

  if (mode === 'solo') {
    // Contrôles du joueur (gauche)
    if (keys.has('w') && leftPaddle.y > 0)
      leftPaddle.y -= PADDLE_SPEED;
    if (keys.has('s') && leftPaddle.y < PADDLE_MAX_Y)
      leftPaddle.y += PADDLE_SPEED;
  } else if (mode === '1v1-local') {
    // Contrôles du joueur 1 (gauche)
    if (keys.has('w') && leftPaddle.y > 0)
      leftPaddle.y -= PADDLE_SPEED;
    if (keys.has('s') && leftPaddle.y < PADDLE_MAX_Y)
      leftPaddle.y += PADDLE_SPEED;
    // Contrôles du joueur 2 (droite)
    if (keys.has('ArrowUp') && rightPaddle.y > 0)
      rightPaddle.y -= PADDLE_SPEED;
    if (keys.has('ArrowDown') && rightPaddle.y < PADDLE_MAX_Y)
      rightPaddle.y += PADDLE_SPEED;
  } else if (mode === '1v1-remote') {
    if (isHost) {
      // Host controls left paddle
      if (keys.has('w') && leftPaddle.y > 0)
        leftPaddle.y -= PADDLE_SPEED;
      if (keys.has('s') && leftPaddle.y < PADDLE_MAX_Y)
        leftPaddle.y += PADDLE_SPEED;
    } else {
      // Client controls right paddle
      if (keys.has('ArrowUp') && rightPaddle.y > 0)
        rightPaddle.y -= PADDLE_SPEED;
      if (keys.has('ArrowDown') && rightPaddle.y < PADDLE_MAX_Y)
        rightPaddle.y += PADDLE_SPEED;
    }
  }
}


// Mettre à jour le jeu
function update() {
  if (!gameRunning || gamePaused)
    return;

  const mode = getGameMode();
  const gameHost = localStorage.getItem('gameHost');
  const isHost = !gameHost || gameHost === socket.id;

  if (mode === '1v1-remote' && !isHost) {
    // Client: use received state
    if (lastReceivedState) {
      leftPaddle = lastReceivedState.leftPaddle;
      rightPaddle = lastReceivedState.rightPaddle;
      ball = lastReceivedState.ball;
      gameRunning = lastReceivedState.gameRunning;
      gamePaused = lastReceivedState.gamePaused;
      countdown = lastReceivedState.countdown || null;
    }
    if (countdown !== null) {
      // During countdown, just draw and continue loop
      draw();
      animationFrameId = requestAnimationFrame(update);
      return;
    }
    handleInput(); // Only handle right paddle
    // Send my paddle position to host
    socket.emit('game_update', { rightPaddle });
    draw();
    animationFrameId = requestAnimationFrame(update);
    return;
  }

  if (countdown !== null) {
    // During countdown, just draw and continue loop
    draw();
    animationFrameId = requestAnimationFrame(update);
    return;
  }

  // Host logic...

  // Vérifier si un joueur a gagné
  if (leftPaddle.score >= WINNING_SCORE || rightPaddle.score >= WINNING_SCORE) {
    endGame();
    return; // Arrêter la mise à jour
  }

  // Déplacer la balle dans les deux directions
  ball.x += ball.speed_x;
  ball.y += ball.speed_y;

  // Rebondir sur les murs
  if (ball.y < 0 || ball.y > CANVAS_HEIGHT)
    ball.speed_y = -ball.speed_y;

  // Collisions avec les paddles
  if (ball.x < LEFT_PADDLE_EDGE && ball.y > leftPaddle.y && ball.y < leftPaddle.y + PADDLE_HEIGHT) {
    ball.speed_x = -ball.speed_x;
  }
  if (ball.x > RIGHT_PADDLE_EDGE && ball.y > rightPaddle.y && ball.y < rightPaddle.y + PADDLE_HEIGHT) {
    ball.speed_x = -ball.speed_x;
  }

  // Points et reset
  if (ball.x < 0) {
    rightPaddle.score++;
    if (mode === 'solo') adjustBotDifficulty();
    resetBall();
  }
  if (ball.x > CANVAS_WIDTH) {
    leftPaddle.score++;
    if (mode === 'solo') adjustBotDifficulty();
    resetBall();
  }

  handleInput(); // Joueur
  if (mode === 'solo') moveBot();     // Bot

  // For remote, send state
  if (mode === '1v1-remote' && isHost) {
    const gameState = {
      leftPaddle,
      rightPaddle,
      ball,
      gameRunning,
      gamePaused,
      countdown
    };
    socket.emit('game_update', gameState);
  }

  draw();
  animationFrameId = requestAnimationFrame(update);
}

// ==================== START and PAUSE ====================
// Lancer le jeu
function startGame() {
  if (!gameRunning) {
    const mode = getGameMode();
    if (!mode) {
      console.error('Mode de jeu non défini');
      return;
    }

    resetGameState(); // Reset complet (scores, positions, botDelay)
    gameRunning = true;
    gamePaused = false;
    const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
    messageElement.classList.add('hidden');

    // Configurer le jeu selon le mode
    if (mode === 'solo') {
      console.log('Mode solo démarré, délai bot:', botDelay);
      isBotEnabled = true;
    } else if (mode === '1v1-local') {
      console.log('Mode 1v1 local démarré');
      // Désactiver le bot pour le mode 1v1 local
      isBotEnabled = false;
    } else if (mode === '1v1-remote') {
      console.log('Mode 1v1 remote démarré');
      isBotEnabled = false;
      const gameHost = localStorage.getItem('gameHost');
      if (gameHost && gameHost !== socket.id) {
        // I'm client, join the game
        socket.emit('join_game', gameHost);
        socket.on('game_started', (data) => {
          console.log('Joined game with host:', data.hostId);
          // Start game as client
          gameRunning = true;
          update(); // Start the update loop
        });
        socket.on('game_update', (data) => {
          lastReceivedState = data;
          if (data.countdown !== undefined) {
            countdown = data.countdown;
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
          gameRunning = true;
          startCountdown();
        });
        socket.on('game_update', (data) => {
          if (data.rightPaddle) {
            rightPaddle = data.rightPaddle;
          }
        });
      }
      // Don't call update here for remote
      (document.getElementById('startGameButton') as HTMLButtonElement).disabled = true;
      (document.getElementById('pauseGameButton') as HTMLButtonElement).disabled = false;
      messageElement.classList.remove('text-green-400', 'text-red-400');
      return; // Don't call update at the end
    } else if (mode === 'tournament') {
      // À implémenter plus tard
      console.log('Mode tournoi pas encore implémenté');
      return;
    }

    startCountdown();
    (document.getElementById('startGameButton') as HTMLButtonElement).disabled = true;
    (document.getElementById('pauseGameButton') as HTMLButtonElement).disabled = false;
    messageElement.classList.remove('text-green-400', 'text-red-400');
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

// Démarrer le countdown avant le jeu
function startCountdown() {
  countdown = 3;
  draw();
  // Send initial countdown state for remote
  if (getGameMode() === '1v1-remote' && localStorage.getItem('gameHost') === socket.id) {
    const gameState = {
      leftPaddle,
      rightPaddle,
      ball,
      gameRunning,
      gamePaused,
      countdown
    };
    socket.emit('game_update', gameState);
  }
  const interval = setInterval(() => {
    if (countdown !== null && countdown > 0) {
      countdown--;
      draw();
      // Send updated countdown for remote
      if (getGameMode() === '1v1-remote' && localStorage.getItem('gameHost') === socket.id) {
        const gameState = {
          leftPaddle,
          rightPaddle,
          ball,
          gameRunning,
          gamePaused,
          countdown
        };
        socket.emit('game_update', gameState);
      }
    }
    if (countdown === 0) {
      clearInterval(interval);
      countdown = null;
      update();
    }
  }, 1000);
}

// ==================== RESET, CLEAN and END ====================
// Réinitialiser la balle et les paddles après un goal
function resetBall() {
  ball.x = BALL_CENTER_X;
  ball.y = BALL_CENTER_Y;
  ball.speed_x = -ball.speed_x; // Inverser la direction horizontale
  ball.speed_y = Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED; // Direction verticale aléatoire
  leftPaddle.y = INITIAL_PADDLE_Y;  // Réinitialiser le paddle gauche
  rightPaddle.y = INITIAL_PADDLE_Y; // Réinitialiser le paddle droit
}

// Réinitialiser l'état
function resetGameState() {
  leftPaddle = { x: 0, y: INITIAL_PADDLE_Y, score: 0 };
  rightPaddle = { x: RIGHT_PADDLE_STARTING_X_POSITION, y: INITIAL_PADDLE_Y, score: 0 };
  ball = { x: BALL_CENTER_X, y: BALL_CENTER_Y, speed_x: BALL_SPEED, speed_y: BALL_SPEED };
  gameRunning = false;
  botDelay = 300; // Réinitialiser le délai du bot
  countdown = null; // Reset countdown
  if (animationFrameId)
    cancelAnimationFrame(animationFrameId);
}

// Réinitialiser le jeu
function resetGame() {
  resetGameState(); // Reset complet
  gamePaused = false;
  const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
  messageElement.classList.add('hidden');
  messageElement.classList.remove('text-green-400', 'text-red-400');
  (document.getElementById('pauseGameButton') as HTMLButtonElement).textContent = 'Pause';
  (document.getElementById('pauseGameButton') as HTMLButtonElement).disabled = false; // Réactiver "Pause"
  (document.getElementById('startGameButton') as HTMLButtonElement).disabled = false; // Réactiver "Start Game"
  draw();
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
    pauseButton.disabled = false;
    pauseButton.removeEventListener('click', pauseGame);
  }
  const resetButton = document.getElementById('resetGameButton') as HTMLButtonElement;
  if (resetButton) {
    resetButton.disabled = false;
    resetButton.removeEventListener('click', resetGame);
  }
}

// Terminer la partie et afficher le message
function endGame() {
  gameRunning = false;
  const messageElement = document.getElementById('gameMessageWinOrLose') as HTMLDivElement;
  messageElement.classList.remove('hidden');
  if (leftPaddle.score >= WINNING_SCORE) {
    messageElement.textContent = 'YOU WIN !';
    messageElement.classList.add('text-green-400');
  } else if (rightPaddle.score >= WINNING_SCORE) {
    messageElement.textContent = 'Sale merde tu viens de perdre contre un bot nul a chier en plus, tu merite vraiment de nettoyer le cul des vieux dans un EMS';
    messageElement.classList.add('text-red-400');
  }
  (document.getElementById('startGameButton') as HTMLButtonElement).disabled = false; // Réactiver Start Game pour relancer
}

// ==================== BOT ====================
// Faire bouger le bot
let isBotEnabled = true;

function moveBot() {
  if (!gameRunning || gamePaused || !isBotEnabled)
    return;

  // Position cible : centre du paddle aligné avec la balle
  const targetVerticalPosition = ball.y - TARGET_POSITION_OFFSET;

  // Simuler un délai (si le temps est écoulé, bouger)
  if (Math.random() < 0.2 * (1000 / botDelay)) { // Probabilité ajustée
    console.log('Bot bouge, targetY:', targetVerticalPosition, 'currentY:', rightPaddle.y); // Débogage
    if (targetVerticalPosition > rightPaddle.y && rightPaddle.y < PADDLE_MAX_Y) {
      rightPaddle.y += PADDLE_SPEED;
    } else if (targetVerticalPosition < rightPaddle.y && rightPaddle.y > 0) {
      rightPaddle.y -= PADDLE_SPEED;
    }
  }
}

// Ajuster la difficulté du bot par intervalles de score
function adjustBotDifficulty() {
  const totalScore = leftPaddle.score + rightPaddle.score;
  if (totalScore == 1) {
    botDelay = 280; // Facile (0-4 points)
  } else if (totalScore == 2) {
    botDelay = 260; // Moyen (5-9 points, augmenté pour être moins dur)
  } else {
    botDelay = 250; // Difficile (10+ points, fixé pour éviter l'inbattabilité)
  }
  console.log('Nouveau délai du bot:', botDelay); // Débogage
}