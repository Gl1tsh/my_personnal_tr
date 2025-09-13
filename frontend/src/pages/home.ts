// src/pages/home.ts - Clean version
export function initHomePage() {
    console.log('🏠 Initializing Home page...');
    
    // The home page content is now in HTML, we just need to handle the buttons
    const chatButton = document.querySelector('[data-page="live-chat"]') as HTMLButtonElement;
    const gameButton = document.querySelector('[data-page="game-modes"]') as HTMLButtonElement;

    // Add click handlers that work with the new navigation system
    if (chatButton) {
        chatButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🗨️ Navigating to chat from home');
            navigateToPage('live-chat');
        });
    }

    if (gameButton) {
        gameButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎮 Navigating to game modes from home');
            navigateToPage('game-modes');
        });
    }

    console.log('✅ Home page initialized');
}

/**
 * Navigate to a specific page using the modern navigation system
 */
function navigateToPage(pageName: string) {
    // Update URL
    window.history.pushState({ page: pageName }, '', `#${pageName}`);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === pageName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        console.log(`📍 Successfully navigated to: ${pageName}`);
    } else {
        console.error(`❌ Page not found: ${pageName}`);
    }
}
