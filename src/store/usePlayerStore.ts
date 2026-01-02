import { create } from 'zustand';
import { getAudioInstance } from '@/lib/audioManager';

interface PlayerState {
    isPlaying: boolean;
    volume: number;
    progress: number;
    currentStyleId: string | null;
    mixUrl: string | null;
    isAutoMode: boolean;

    // Actions
    initPlayer: (mixUrl: string, startPosition: number, volume: number) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setStyle: (styleId: string, mixUrl: string) => void;
    setAutoMode: (auto: boolean) => void;
    seek: (seconds: number) => void;
    stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    currentStyleId: null,
    mixUrl: null,
    isAutoMode: false,

    initPlayer: (mixUrl, startPosition, volume) => {
        const audio = getAudioInstance();
        if (!audio) return;

        // stop previous
        audio.pause();

        console.log("[PlayerStore] Init with URL:", mixUrl);
        if (!mixUrl) {
            console.error("[PlayerStore] No mixUrl provided!");
            return;
        }

        audio.src = mixUrl;
        audio.volume = volume;
        audio.loop = true;

        // Event listeners
        audio.onplay = () => set({ isPlaying: true });
        audio.onpause = () => set({ isPlaying: false });
        audio.ontimeupdate = () => {
            set({ progress: Math.floor(audio.currentTime) });
        };

        // Seek once loaded
        const onLoaded = () => {
            if (startPosition > 0) {
                audio.currentTime = startPosition;
            }
            audio.removeEventListener('loadedmetadata', onLoaded);
        };
        audio.addEventListener('loadedmetadata', onLoaded);

        set({ mixUrl, volume, currentStyleId: get().currentStyleId });
    },

    togglePlay: () => {
        const audio = getAudioInstance();
        console.log("[PlayerStore] Toggle Play. Audio:", !!audio, "Src:", audio?.src);

        const { mixUrl, progress } = get();

        // 1. Check if we have a valid mix URL in store
        if (!mixUrl) {
            console.error("[PlayerStore] Cannot play: No mix URL loaded");
            return;
        }

        // 2. Auto-recover: if audio.src is empty/invalid but we have a mixUrl, load it
        if (!audio.src || audio.src === window.location.href) {
            console.log("[PlayerStore] Audio source missing, auto-loading from state:", mixUrl);
            audio.src = mixUrl;
            audio.currentTime = progress;
            audio.loop = true;
        }

        if (get().isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(console.error);
        }
    },

    setVolume: (volume) => {
        const audio = getAudioInstance();
        if (audio) audio.volume = volume;
        set({ volume });
    },

    setProgress: (progress) => set({ progress }),

    setStyle: (styleId, mixUrl) => {
        set({ currentStyleId: styleId, mixUrl });
    },

    setAutoMode: (auto) => set({ isAutoMode: auto }),

    seek: (seconds) => {
        const audio = getAudioInstance();
        if (audio) {
            audio.currentTime = seconds;
            set({ progress: seconds });
        }
    },

    stop: () => {
        const audio = getAudioInstance();
        if (audio) {
            audio.pause();
            audio.removeAttribute('src'); // Safer than empty string
            set({ isPlaying: false, progress: 0 });
        }
    }
}));
