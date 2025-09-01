// src/index.ts

import './style.css';

import { AudioManager } from './audio/AudioManager';
import { EntranceScreen } from './entrance/EntranceScreen';
import { initGame, cleanupGame } from './game/game';
import { initHomePage } from './pages/home';
import { initChatPage } from './pages/livechat.js';
import { initLoginPage } from './pages/login.js';
import { initSignupPage } from './pages/signup.js';
import { initGameModesPage } from './pages/game_modes';
import { initProfilePage } from './pages/profile';

// Expose startPong() to window
declare global {
  interface Window {
    startPong: () => void;
  }
}
export {}; // Force TS module mode

// All app pages
const pages = [
  'home',
  'game',
  'game-modes',
  'live-chat',
  'board',
  'room',
  'create_room',
  'login',
  'signup',
  'profile',
] as const;
type Page = (typeof pages)[number];

// Show requested page and hide others
function showPage(page: string) {
  pages.forEach((p) => {
    const element = document.getElementById(p);
    if (element) {
      element.classList.toggle('hidden', p !== page);
    }
  });
}

// Initialize basic pages
function initPages() {
  initHomePage();
  initChatPage();
  initLoginPage();
  initSignupPage();
  initGameModesPage();
  initProfilePage();
}

// Handle navbar clicks
function initNav() {
  const links = document.querySelectorAll<HTMLElement>('[data-page]');
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.page as Page;
      if (target) {
        navigateTo(target);
      }
    });
  });

  // Handle back/forward
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.slice(1) as Page;
    if (pages.includes(hash)) {
      navigateTo(hash, false);
    }
  });
}

// Change page and update URL (pushState by default)
export function navigateTo(page: string, push = true) {
  if (push) {
    window.history.pushState(null, '', `#${page}`);
  }
  showPage(page.split('/')[0]);
  // Specific initialization for different pages
  const currentPage = page.split('/')[0];
  if (currentPage === 'game') {
    initGame(); // Initialize game when navigating to #game
  } else {
    cleanupGame(); // Stop game when leaving #game
  }
  
  if (currentPage === 'profile') {
    initProfilePage(); // Initialize profile when navigating to #profile
  }
}

// App startup
window.addEventListener('DOMContentLoaded', () => {
  // Initialize audio manager
  const audioManager = AudioManager.getInstance();

  // Initialize entrance screen with audio callback
  new EntranceScreen(async () => {
    await audioManager.playMusic();
  });

  // Initialize all pages
  initPages();

  // Initialize navigation
  initNav();

  // Note: navigateTo is now called by EntranceScreen after the entrance animation
});

// Replace window.startPong
window.startPong = () => {
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  if (startButton) {
    startButton.click(); // Simulate click on Start Game button
  } else {
    console.log('Start Game button not found');
  }
};
