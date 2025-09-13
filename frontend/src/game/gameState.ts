// src/game/gameState.ts

export type GameMode = 'solo' | '1v1-local' | '1v1-remote' | 'tournament';

export let currentGameMode: GameMode | null = null;

export function setGameMode(mode: GameMode) {
    currentGameMode = mode;
}

export function getGameMode(): GameMode | null {
    return currentGameMode;
}
