// src/pages/game_modes.ts - Clean version
import { setGameMode } from '../game/gameState';
import { initGame } from '../game/game';

export function initGameModesPage() {
    console.log('🎮 Initializing Game Modes page...');
    
    // The page content is now in HTML, we just need to handle the buttons
    const soloButton = document.getElementById('solo-mode');
    const vsLocalButton = document.getElementById('vs-local-mode');
    const vsRemoteButton = document.getElementById('vs-remote-mode');

    if (soloButton) {
        soloButton.addEventListener('click', () => {
            console.log('🎯 Solo mode selected');
            setGameMode('solo');
            navigateToGame();
        });
    }

    if (vsLocalButton) {
        vsLocalButton.addEventListener('click', () => {
            console.log('🎯 1v1 Local mode selected');
            setGameMode('1v1-local');
            navigateToGame();
        });
    }

    if (vsRemoteButton) {
        vsRemoteButton.addEventListener('click', () => {
            console.log('🎯 1v1 Remote mode selected');
            setGameMode('1v1-remote');
            navigateToGame();
        });
    }

    console.log('✅ Game Modes page initialized');
}

/**
 * Navigate to game page and initialize game
 */
function navigateToGame() {
    // Update URL
    window.history.pushState({ page: 'game' }, '', '#game');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show game page
    const gameSection = document.getElementById('game');
    if (gameSection) {
        gameSection.classList.remove('hidden');
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const gameNavLink = document.querySelector('[data-page="game"]');
        if (gameNavLink) {
            gameNavLink.classList.add('active');
        }
        
        // Initialize game
        initGame();
        console.log('🎮 Navigated to game page');
    } else {
        console.error('❌ Game section not found');
    }
}
