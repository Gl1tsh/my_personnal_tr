// src/pages/game_modes.ts
import { setGameMode } from '../game/gameState';
import { initGame } from '../game/game';

export function initGameModesPage() {
    const content = `
    <div class="min-h-[80vh] flex flex-col items-center justify-center">
        <div class="max-w-2xl w-full relative">
            <div class="absolute -inset-1.5 bg-white/5 blur rounded-lg"></div>
            <div class="relative glass-morphism p-12 rounded">
                <h1 class="text-4xl font-extralight tracking-wider text-center text-white/90 mb-12">SELECT GAME MODE</h1>
                <div class="space-y-6">
                    <button id="solo-mode" class="glass-button w-full py-6 text-xl tracking-wider">SOLO</button>
                    <button id="vs-mode" class="glass-button w-full py-6 text-xl tracking-wider">1 VS 1</button>
                    <button id="tournament-mode" class="glass-button w-full py-6 text-xl tracking-wider">TOURNAMENT</button>
                </div>
            </div>
        </div>
    </div>`;

    const gameModeSection = document.createElement('section');
    gameModeSection.id = 'game-modes';
    gameModeSection.className = 'page hidden';
    gameModeSection.innerHTML = content;

    const main = document.querySelector('main');
    if (main && !main.querySelector('#game-modes')) {
        main.appendChild(gameModeSection);
    }

    // Event listeners for the buttons
    const soloButton = document.getElementById('solo-mode');
    const vsButton = document.getElementById('vs-mode');
    const tournamentButton = document.getElementById('tournament-mode');

    if (soloButton) {
        soloButton.addEventListener('click', () => {
            // Set game mode to solo and navigate
            setGameMode('solo');
            window.history.pushState(null, '', '#game');
            const gameSection = document.getElementById('game');
            if (gameSection) {
                document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
                gameSection.classList.remove('hidden');
                // Initialize game but don't start automatically
                initGame();
            }
        });
    }

    if (vsButton) {
        vsButton.addEventListener('click', () => {
            // Set game mode to 1v1 (pas encore implémenté)
            setGameMode('1v1');
            alert('Le mode 1v1 sera bientôt disponible !');
        });
    }

    if (tournamentButton) {
        tournamentButton.addEventListener('click', () => {
            // Set game mode to tournament (pas encore implémenté)
            setGameMode('tournament');
            alert('Le mode tournoi sera bientôt disponible !');
        });
    }
}
