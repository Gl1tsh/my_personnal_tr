// src/game/gameState.ts

export type GameMode = 'solo' | '1v1-local' | '1v1-remote' | 'tournament';

export let currentGameMode: GameMode | null = null;

export function setGameMode(mode: GameMode) {
    currentGameMode = mode;
}

export function getGameMode(): GameMode | null {
    return currentGameMode;
}

// ==================== Types pour organiser les données ====================
export interface Paddle {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  score: number;// Score
}

export interface Ball {
  x: number;    // Position horizontale
  y: number;    // Position verticale
  speed_x: number;   // Vitesse horizontale
  speed_y: number;   // Vitesse verticale
}

// ==================== Configuration du Pong ====================
export const CANVAS_WIDTH = 800;         // Largeur du canvas
export const CANVAS_HEIGHT = 600;        // Hauteur du canvas
export const PADDLE_WIDTH = 10;          // Largeur des paddles
export const PADDLE_HEIGHT = 100;        // Hauteur des paddles
export const BALL_SIZE = 10;             // Taille de la balle
export const PADDLE_SPEED = 3;           // Vitesse des paddles
export const BALL_SPEED = 3;             // Vitesse de la balle (fixe, pas de changement)
export const WINNING_SCORE = 3; // Score pour gagner la partie

// ==================== État du jeu ====================
export const INITIAL_PADDLE_Y = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2; // Position verticale initiale des paddles
export const BALL_CENTER_X = CANVAS_WIDTH / 2;                        // Centre horizontal de la balle
export const BALL_CENTER_Y = CANVAS_HEIGHT / 2;                       // Centre vertical de la balle
export const SCORE_LEFT_X = CANVAS_WIDTH / 4;                         // Position X du score gauche
export const SCORE_RIGHT_X = 3 * CANVAS_WIDTH / 4;                    // Position X du score droit
export const PADDLE_MAX_Y = CANVAS_HEIGHT - PADDLE_HEIGHT;            // Limite supérieure des paddles
export const RIGHT_PADDLE_STARTING_X_POSITION = CANVAS_WIDTH - PADDLE_WIDTH; // Position horizontale initiale du paddle droit
export const TARGET_POSITION_OFFSET = PADDLE_HEIGHT / 2;              // Décalage pour centrer la position cible du bot
export const LEFT_PADDLE_EDGE = PADDLE_WIDTH;                         // Bord gauche du paddle gauche
export const RIGHT_PADDLE_EDGE = CANVAS_WIDTH - PADDLE_WIDTH;         // Bord droit du paddle droit

export const gameState = {
  leftPaddle: { x: 0, y: INITIAL_PADDLE_Y, score: 0 } as Paddle,
  rightPaddle: { x: RIGHT_PADDLE_STARTING_X_POSITION, y: INITIAL_PADDLE_Y, score: 0 } as Paddle,
  ball: { x: BALL_CENTER_X, y: BALL_CENTER_Y, speed_x: BALL_SPEED, speed_y: BALL_SPEED } as Ball,
  gameRunning: false,
  gamePaused: false,
  animationFrameId: 0 as number,
  botDelay: 300,
  lastReceivedState: null as any,
  countdown: null as number | null,
  keys: new Set<string>()
};
