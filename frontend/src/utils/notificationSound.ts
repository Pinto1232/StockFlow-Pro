/**
 * Notification Sound Utility
 * Handles playing notification sounds for various events
 */

export interface NotificationSoundOptions {
    volume?: number; // 0.0 to 1.0
    loop?: boolean;
    preload?: boolean;
}

export const SoundType = {
    CONNECTION: 'connection',
    NOTIFICATION: 'notification',
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning'
} as const;

export type SoundType = typeof SoundType[keyof typeof SoundType];

class NotificationSoundService {
    private audioContext: AudioContext | null = null;
    private sounds: Map<SoundType, HTMLAudioElement> = new Map();
    private isEnabled: boolean = true;
    private globalVolume: number = 0.5;

    constructor() {
        this.initializeAudioContext();
        this.loadDefaultSounds();
    }

    private initializeAudioContext(): void {
        try {
            // Create AudioContext for better browser compatibility
            const AudioContextConstructor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (AudioContextConstructor) {
                this.audioContext = new AudioContextConstructor();
            }
        } catch (error) {
            console.warn('AudioContext not supported:', error);
        }
    }

    private loadDefaultSounds(): void {
        // Define default sound URLs (you can replace these with custom sound files)
        const soundUrls = {
            [SoundType.CONNECTION]: this.generateTone(800, 0.2, 'sine'), // High pitch for connection
            [SoundType.NOTIFICATION]: this.generateTone(600, 0.3, 'sine'), // Medium pitch for notifications
            [SoundType.SUCCESS]: this.generateTone(523, 0.2, 'sine'), // C note for success
            [SoundType.ERROR]: this.generateTone(200, 0.5, 'sawtooth'), // Low harsh tone for errors
            [SoundType.WARNING]: this.generateTone(400, 0.3, 'triangle') // Warning tone
        };

        Object.entries(soundUrls).forEach(([type, url]) => {
            if (url) {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audio.volume = this.globalVolume;
                this.sounds.set(type as SoundType, audio);
            }
        });
    }

    private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): string | null {
        if (!this.audioContext) return null;

        try {
            const sampleRate = this.audioContext.sampleRate;
            const numSamples = duration * sampleRate;
            const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
            const channelData = buffer.getChannelData(0);

            for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;

                switch (type) {
                    case 'sine':
                        sample = Math.sin(2 * Math.PI * frequency * t);
                        break;
                    case 'sawtooth':
                        sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                        break;
                    case 'triangle':
                        sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                        break;
                    case 'square':
                        sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                        break;
                }

                // Apply envelope (fade in/out)
                const envelope = Math.min(t * 10, (duration - t) * 10, 1);
                channelData[i] = sample * envelope * 0.3; // Reduce volume
            }

            // Convert buffer to data URL
            const wav = this.bufferToWav(buffer);
            return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
        } catch (error) {
            console.warn('Error generating tone:', error);
            return null;
        }
    }

    private bufferToWav(buffer: AudioBuffer): ArrayBuffer {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const channelData = buffer.getChannelData(0);

        // WAV header
        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return arrayBuffer;
    }

    /**
     * Play a notification sound
     */
    public async playSound(type: SoundType, options: NotificationSoundOptions = {}): Promise<void> {
        if (!this.isEnabled) return;

        try {
            // Resume AudioContext if suspended (required by some browsers)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const audio = this.sounds.get(type);
            if (!audio) {
                console.warn(`Sound type ${type} not found`);
                return;
            }

            // Clone the audio element to allow overlapping sounds
            const audioClone = audio.cloneNode() as HTMLAudioElement;
            audioClone.volume = (options.volume ?? this.globalVolume) * this.globalVolume;
            audioClone.loop = options.loop ?? false;

            // Play the sound
            const playPromise = audioClone.play();
            if (playPromise !== undefined) {
                await playPromise;
            }

            // Clean up after playing (if not looping)
            if (!audioClone.loop) {
                audioClone.addEventListener('ended', () => {
                    audioClone.remove();
                });
            }
        } catch (error) {
            console.warn('Error playing notification sound:', error);
        }
    }

    /**
     * Play connection established sound
     */
    public async playConnectionSound(): Promise<void> {
        return this.playSound(SoundType.CONNECTION, { volume: 0.6 });
    }

    /**
     * Play notification received sound
     */
    public async playNotificationSound(): Promise<void> {
        return this.playSound(SoundType.NOTIFICATION, { volume: 0.7 });
    }

    /**
     * Play success sound
     */
    public async playSuccessSound(): Promise<void> {
        return this.playSound(SoundType.SUCCESS, { volume: 0.5 });
    }

    /**
     * Play error sound
     */
    public async playErrorSound(): Promise<void> {
        return this.playSound(SoundType.ERROR, { volume: 0.4 });
    }

    /**
     * Play warning sound
     */
    public async playWarningSound(): Promise<void> {
        return this.playSound(SoundType.WARNING, { volume: 0.5 });
    }

    /**
     * Enable/disable notification sounds
     */
    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        // Store preference in localStorage
        localStorage.setItem('notificationSoundsEnabled', enabled.toString());
    }

    /**
     * Check if sounds are enabled
     */
    public isEnabledState(): boolean {
        return this.isEnabled;
    }

    /**
     * Set global volume (0.0 to 1.0)
     */
    public setVolume(volume: number): void {
        this.globalVolume = Math.max(0, Math.min(1, volume));
        // Update all existing audio elements
        this.sounds.forEach(audio => {
            audio.volume = this.globalVolume;
        });
        // Store preference in localStorage
        localStorage.setItem('notificationSoundVolume', this.globalVolume.toString());
    }

    /**
     * Get current volume
     */
    public getVolume(): number {
        return this.globalVolume;
    }

    /**
     * Load custom sound file
     */
    public async loadCustomSound(type: SoundType, url: string): Promise<void> {
        try {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audio.volume = this.globalVolume;
            
            // Wait for the audio to load
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve);
                audio.addEventListener('error', reject);
            });

            this.sounds.set(type, audio);
        } catch (error) {
            console.error(`Error loading custom sound for ${type}:`, error);
        }
    }

    /**
     * Initialize from localStorage preferences
     */
    public initializeFromPreferences(): void {
        const enabledPref = localStorage.getItem('notificationSoundsEnabled');
        if (enabledPref !== null) {
            this.isEnabled = enabledPref === 'true';
        }

        const volumePref = localStorage.getItem('notificationSoundVolume');
        if (volumePref !== null) {
            const volume = parseFloat(volumePref);
            if (!isNaN(volume)) {
                this.setVolume(volume);
            }
        }
    }
}

// Create singleton instance
const notificationSoundService = new NotificationSoundService();

// Initialize from user preferences
notificationSoundService.initializeFromPreferences();

export default notificationSoundService;