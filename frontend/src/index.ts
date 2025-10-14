// src/index.ts - Clean and modern version

import './style.css';
import { initGame, cleanupGame } from './game/game';
import { initHomePage } from './pages/home';
import { initChatPage } from './pages/livechat.js';
import { initLoginPage } from './pages/login.js';
import { initSignupPage } from './pages/signup.js';
import { initGameModesPage } from './pages/game_modes';
import { initProfilePage } from './pages/profile';

// Global window interface
declare global {
  interface Window {
    startPong: () => void;
  }
}

// Available pages
const pages = [
  'home',
  'game',
  'game-modes',
  'live-chat',
  'login',
  'signup',
  'profile',
] as const;
type Page = (typeof pages)[number];

/**
 * Show specified page and hide all others
 */
function showPage(page: string) {
  pages.forEach((p) => {
    const element = document.getElementById(p);
    if (element) {
      element.classList.toggle('hidden', p !== page);
    }
  });
  
  // Update active navigation link
  updateActiveNavLink(page);
}

/**
 * Update active navigation link styling
 */
function updateActiveNavLink(activePage: string) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === activePage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Initialize all page modules
 */
async function initPages() {
  try {
    initHomePage();
    await initChatPage(); // Maintenant async
    initLoginPage();
    initSignupPage();
    initGameModesPage();
    initProfilePage();
    console.log('✅ All pages initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing pages:', error);
  }
}

/**
 * Setup navigation event handlers
 */
function initNavigation() {
  const links = document.querySelectorAll<HTMLElement>('[data-page]');
  
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.page as Page;
      if (target && pages.includes(target)) {
        navigateTo(target);
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.slice(1) as Page;
    if (pages.includes(hash)) {
      navigateTo(hash, false);
    } else {
      navigateTo('home', false);
    }
  });
  
  console.log('✅ Navigation initialized');
}

/**
 * Navigate to a specific page
 */
export function navigateTo(page: string, updateHistory = true) {
  if (!pages.includes(page as Page)) {
    console.warn(`⚠️ Unknown page: ${page}, redirecting to home`);
    page = 'home';
  }

  // Contrôle d'accès : live-chat et profile nécessitent d'être authentifié
  const protectedPages = ['live-chat', 'profile'];
  const token = sessionStorage.getItem('authToken');
  if (protectedPages.includes(page) && !token) {
    console.warn(`🔒 Accès refusé à ${page} (non authentifié), redirection vers login.`);
    page = 'login';
    if (updateHistory) {
      window.history.pushState({ page }, '', `#${page}`);
    }
    showPage(page);
    return;
  }

  // Update URL if needed
  if (updateHistory) {
    window.history.pushState({ page }, '', `#${page}`);
  }

  // Show the target page
  showPage(page);

  // Handle page-specific initialization
  const currentPage = page.split('/')[0];
  switch (currentPage) {
    case 'game':
      initGame();
      break;
    case 'profile':
      initProfilePage();
      break;
    default:
      cleanupGame(); // Clean up game when leaving game page
      break;
  }

  console.log(`📍 Navigated to: ${page}`);
}

/**
 * Application initialization
 */
async function initApp() {
  console.log('🚀 Initializing Transcendance...');
  
  try {
    // Initialize all page modules
    await initPages();

    // Setup navigation
    initNavigation();

    // Get initial page from URL or default to home
    const initialPage = window.location.hash.slice(1) || 'home';
    navigateTo(initialPage, false);

    console.log('✅ Transcendance initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
  }
}

// Global function for external access
window.startPong = () => {
  const startButton = document.getElementById('startGameButton') as HTMLButtonElement;
  if (startButton) {
    startButton.click();
    console.log('🎮 Pong game started via global function');
  } else {
    console.warn('⚠️ Start game button not found');
  }
};



// Toggle la navbar : affiche Login OU Profile selon l'état de connexion
function updateNavAuthLinks() {
  const loginNav = document.querySelector('.nav-link[data-page="login"]') as HTMLElement;
  const profileNav = document.querySelector('.nav-link[data-page="profile"]') as HTMLElement;
  if (!loginNav || !profileNav) return;
  const token = sessionStorage.getItem('authToken');
  if (token) {
    loginNav.style.display = 'none';
    profileNav.style.display = '';
  } else {
    loginNav.style.display = '';
    profileNav.style.display = 'none';
  }
}

// Rendre accessible globalement pour les autres modules (login/logout)
// @ts-ignore
window.updateNavAuthLinks = updateNavAuthLinks;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
    updateNavAuthLinks();
  });
} else {
  initApp();
  updateNavAuthLinks();
}

// Mettre à jour dynamiquement lors du login/logout
window.addEventListener('storage', updateNavAuthLinks);

export { };
