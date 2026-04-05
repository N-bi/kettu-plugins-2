import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.js";
import { storage } from "@vendetta/plugin";

const { Audio } = ReactNative;

const DEFAULT_STARTUP_SOUND = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/m-e-o-w.mp3";
const DEFAULT_PING_SOUND    = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/discord_ping_sound_effect.mp3";

let patches = [];
let startupSound = null;
let pingSound = null;

async function playSound(url: string, volume: number = 1.0) {
    try {
        const { Sound } = require("react-native-sound");
        const sound = new Sound(url, "", (error) => {
            if (error) return;
            sound.setVolume(volume);
            sound.play(() => sound.release());
        });
    } catch (e) {
        try {
            const audio = new Audio.Sound();
            await audio.loadAsync({ uri: url });
            await audio.setVolumeAsync(volume);
            await audio.playAsync();
            audio.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) audio.unloadAsync();
            });
        } catch (err) {
            console.log("[SoundFX] Failed to play sound:", err);
        }
    }
}

function getStartupURL() {
    return (storage.CustomStartupURL && storage.CustomStartupURL.trim())
        ? storage.CustomStartupURL.trim()
        : DEFAULT_STARTUP_SOUND;
}

function getPingURL() {
    return (storage.CustomPingURL && storage.CustomPingURL.trim())
        ? storage.CustomPingURL.trim()
        : DEFAULT_PING_SOUND;
}

function getVolume(key: string) {
    const v = storage[key];
    if (typeof v === "number") return Math.min(1, Math.max(0, v));
    return 1.0;
}

export default {
    onLoad: () => {
        
        if (storage.StartupSoundEnabled !== false) {
            setTimeout(() => {
                playSound(getStartupURL(), getVolume("StartupVolume"));
            }, 500); // small delay so Discord finishes rendering first
        }

        
        if (storage.PingSoundEnabled !== false) {
            try {
                const { FluxDispatcher } = require("@vendetta/metro/common");
                const handler = (event) => {
                    
                    if (!event || !event.message) return;
                    const { message } = event;
                    const currentUser = require("@vendetta/metro/common").UserStore?.getCurrentUser?.();
                    if (currentUser && message.author?.id === currentUser.id) return;
                    playSound(getPingURL(), getVolume("PingVolume"));
                };

                FluxDispatcher.subscribe("MESSAGE_CREATE", handler);
                patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", handler));
            } catch (e) {
                console.log("[SoundFX] Could not patch ping sound:", e);
            }
        }
    },
    onUnload: () => {
        for (const x of patches) x();
    },
    settings,
};
