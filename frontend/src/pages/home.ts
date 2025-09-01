// src/pages/home.ts
export function initHomePage() {
    const content = `
        <div class="flex flex-col mt-16">
            <div class="mb-12 relative">
                <div class="flex justify-center">
                    <div class="relative flex items-center">
                        <h1 class="absolute right-full mr-8 text-4xl font-light tracking-[0.2em] whitespace-nowrap glow-text">
                            <div>
                                <span>W</span><span>E</span><span>L</span><span>C</span><span>O</span><span>M</span><span>E</span>
                                <span>&nbsp;</span>
                                <span>T</span><span>O</span>
                            </div>
                            <div class="mt-2">
                                <span>T</span><span>R</span><span>A</span><span>N</span><span>S</span><span>C</span><span>E</span>
                                <span>N</span><span>D</span><span>A</span><span>N</span><span>C</span><span>E</span>
                            </div>
                        </h1>
                        <img src="/assets/sphere_3.gif" alt="Transcendance Logo" class="w-[500px] h-[500px] object-contain"/>
                    </div>
                </div>
            </div>

            <div class="flex justify-center space-x-12">
                <button data-page="live-chat" class="glass-button">LIVE CHAT</button>
                <button data-page="game-modes" class="glass-button">PLAY GAME</button>
                <button data-page="board" class="glass-button">LEADERBOARD</button>
            </div>
        </div>
    `;

    const homePage = document.getElementById('home');
    if (homePage) {
        homePage.innerHTML = content;
    }

    // Add click handlers for the navigation buttons
    const buttons = document.querySelectorAll('button[data-page]');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const target = button.getAttribute('data-page');
            if (target) {
                window.history.pushState(null, '', `#${target}`);
                document.querySelectorAll('.page').forEach(page => 
                    page.classList.add('hidden')
                );
                const targetPage = document.getElementById(target);
                if (targetPage) {
                    targetPage.classList.remove('hidden');
                }
            }
        });
    });
}
