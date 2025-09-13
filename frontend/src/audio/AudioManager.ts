export class AudioManager {
    private static instance: AudioManager;
    private bgMusic: HTMLAudioElement | null;
    private musicBtn: HTMLElement | null;
    private musicMessage: HTMLElement | null;
    private isMusicPlaying: boolean = false;

    private constructor() {
        this.bgMusic = document.getElementById('bgMusic') as HTMLAudioElement;
        this.musicBtn = document.getElementById('toggleMusic');
        this.musicMessage = document.getElementById('musicMessage');
        this.initializeAudio();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private initializeAudio(): void {
        if (!this.bgMusic) return;

        // Set initial volume
        this.bgMusic.volume = 0.3;
        
        // Audio events
        this.bgMusic.addEventListener('loadeddata', () => {
            console.log('Music loaded successfully');
            if (this.musicBtn) this.musicBtn.style.display = 'block';
            if (this.musicMessage) this.musicMessage.style.display = 'block';

            // Try autoplay
            const playPromise = this.bgMusic?.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Music started automatically');
                        this.updateMusicButtonStyle(true);
                        this.isMusicPlaying = true;
                    })
                    .catch(() => {
                        console.log('Autoplay prevented by browser, waiting for user interaction');
                        if (this.musicMessage) {
                            this.musicMessage.textContent = "Click to start music";
                        }
                    });
            }
        });

        this.bgMusic.addEventListener('error', (e) => {
            console.error('Error loading music:', e);
        });

        // Music button click handler
        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', async () => {
                try {
                    if (this.isMusicPlaying) {
                        await this.pauseMusic();
                    } else {
                        await this.playMusic();
                    }
                } catch (error) {
                    console.error('Error with music control:', error);
                }
            });
        }

        // Preload audio
        this.bgMusic.load();
    }

    private updateMusicButtonStyle(isPlaying: boolean): void {
        if (!this.musicBtn) return;

        if (isPlaying) {
            this.musicBtn.classList.remove('text-white/60');
            this.musicBtn.classList.add('text-white/90');
        } else {
            this.musicBtn.classList.remove('text-white/90');
            this.musicBtn.classList.add('text-white/60');
        }
    }

    public async playMusic(): Promise<void> {
        if (!this.bgMusic) return;

        try {
            const playPromise = this.bgMusic.play();
            if (playPromise !== undefined) {
                await playPromise;
                console.log('Music started playing');
                this.updateMusicButtonStyle(true);
                this.isMusicPlaying = true;
            }
        } catch (error) {
            console.error('Error playing music:', error);
            if (this.musicMessage) {
                this.musicMessage.textContent = "Click to enable music";
            }
        }
    }

    public async pauseMusic(): Promise<void> {
        if (!this.bgMusic) return;

        await this.bgMusic.pause();
        this.updateMusicButtonStyle(false);
        this.isMusicPlaying = false;
    }

    public setVolume(volume: number): void {
        if (!this.bgMusic) return;
        this.bgMusic.volume = Math.max(0, Math.min(1, volume));
    }

    public isPlaying(): boolean {
        return this.isMusicPlaying;
    }
}
