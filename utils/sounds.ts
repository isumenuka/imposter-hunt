/**
 * Sound Manager for Imposter Hunt
 * Loads and plays MP3 sound files from the /sound folder
 */

const MUTE_KEY = 'imposter-hunt-muted';

class SoundManager {
    private muted: boolean = false;
    private sounds: Map<string, HTMLAudioElement> = new Map();

    constructor() {
        // Load mute preference from localStorage
        const savedMuted = localStorage.getItem(MUTE_KEY);
        this.muted = savedMuted === 'true';

        // Preload all sound files
        this.preloadSounds();
    }

    /**
     * Preload all MP3 sound files
     */
    private preloadSounds() {
        const soundFiles = {
            'reveal': '/sound/Imposter and Innocent  Reveal.mp3',
            'innocentVictory': '/sound/Innocent Victory Sound.mp3',
            'imposterVictory': '/sound/Imposter Victory Sound.mp3'
        };

        Object.entries(soundFiles).forEach(([key, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audio.volume = 0.5; // Set to 50% volume by default
            this.sounds.set(key, audio);
        });
    }

    /**
     * Play a sound by key
     */
    private playSound(key: string, volume: number = 0.5) {
        if (this.muted) return;

        const audio = this.sounds.get(key);
        if (!audio) {
            console.warn(`Sound "${key}" not found`);
            return;
        }

        // Clone the audio to allow overlapping plays
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = volume;

        // Play and clean up
        clone.play().catch(err => {
            console.warn('Audio play failed:', err);
        });
    }

    /**
     * Innocent Reveal Sound - Uplifting, reassuring
     * Uses the same reveal sound for both roles
     */
    playInnocentReveal() {
        this.playSound('reveal', 0.6);
    }

    /**
     * Imposter Reveal Sound - Dramatic, suspenseful
     * Uses the same reveal sound for both roles
     */
    playImposterReveal() {
        this.playSound('reveal', 0.6);
    }

    /**
     * Victory Sound - Triumphant fanfare for innocents
     */
    playVictory() {
        this.playSound('innocentVictory', 0.65);
    }

    /**
     * Defeat Sound - For when imposters win
     */
    playDefeat() {
        this.playSound('imposterVictory', 0.65);
    }

    /**
     * Click Sound - Subtle UI feedback
     */
    playClick() {
        // Use the reveal sound at very low volume for clicks
        this.playSound('reveal', 0.15);
    }

    /**
     * Set mute state
     */
    setMuted(muted: boolean) {
        this.muted = muted;
        localStorage.setItem(MUTE_KEY, String(muted));
    }

    /**
     * Get mute state
     */
    isMuted(): boolean {
        return this.muted;
    }

    /**
     * Toggle mute state
     */
    toggleMute(): boolean {
        this.muted = !this.muted;
        localStorage.setItem(MUTE_KEY, String(this.muted));

        // Play a test sound if unmuting
        if (!this.muted) {
            this.playClick();
        }

        return this.muted;
    }
}

// Export singleton instance
export const soundManager = new SoundManager();
