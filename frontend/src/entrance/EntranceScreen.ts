export class EntranceScreen {
    // Configuration des temps de transition (en millisecondes)
    private static FADE_DURATION: number = 1000;      // Durée de la transition d'opacité
    private static CONTENT_DELAY: number = 1000;      // Délai avant l'apparition du contenu

    private enterScreen: HTMLElement | null;
    private enterButton: HTMLElement | null;
    private mainContent: HTMLElement | null;
    private navbar: HTMLElement | null;
    private onEnterCallback: () => Promise<void>;

    constructor(onEnterCallback: () => Promise<void>) {
        this.enterScreen = document.getElementById('enterScreen');
        this.enterButton = document.getElementById('enterButton');
        this.mainContent = document.querySelector('main');
        this.navbar = document.querySelector('nav');
        this.onEnterCallback = onEnterCallback;

        if (!this.enterScreen || !this.enterButton || !this.mainContent || !this.navbar) {
            console.error('Required entrance screen elements not found');
            return;
        }

        this.initialize();
    }

    private initialize(): void {
        if (!this.mainContent || !this.navbar) return;

        // Initially hide main content and navbar
        this.mainContent.style.opacity = '0';
        this.navbar.style.opacity = '0';
        this.mainContent.style.transition = `opacity ${EntranceScreen.FADE_DURATION}ms`;
        this.navbar.style.transition = `opacity ${EntranceScreen.FADE_DURATION}ms`;

        // Handle ENTER button click
        if (this.enterButton) {
            this.enterButton.addEventListener('click', () => this.handleEnter());
        }
    }

    private async handleEnter(): Promise<void> {
        if (!this.enterScreen || !this.mainContent || !this.navbar) return;

        try {
            // Add fade out effect
            this.enterScreen.classList.add('fade-out');
            
            // Call the callback (for music, etc.)
            await this.onEnterCallback();

            // After animation, show content and remove entrance screen
            setTimeout(() => {
                this.enterScreen?.remove();
                
                if (this.mainContent && this.navbar) {
                    this.mainContent.style.opacity = '1';
                    this.navbar.style.opacity = '1';
                }
                
                // Show HOME page
                document.querySelectorAll('.page').forEach(page => 
                    page.classList.add('hidden')
                );
                
                const homePage = document.getElementById('home');
                if (homePage) {
                    homePage.classList.remove('hidden');
                }
            }, EntranceScreen.CONTENT_DELAY);
        } catch (error) {
            console.error('Error during entrance sequence:', error);
        }
    }
}
