import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.js";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

// ── Default sound URLs ─────────────────────────────────────────────────────
const DEFAULT_STARTUP_SOUND = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/m-e-o-w.mp3";
const DEFAULT_PING_SOUND    = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/discord_ping_sound_effect.mp3";

let patches = [];

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

async function playSound(url: string, volume: number = 1.0) {
    try {
        // Use HTMLAudioElement which is available in the JS runtime
        const audio = new (global as any).Audio(url);
        audio.volume = volume;
        audio.play();
    } catch (e) {
        try {
            // Fallback: fetch the audio and use discord's sound module
            const SoundModule = findByProps("playSound", "createAudioPlayer");
            if (SoundModule?.createAudioPlayer) {
                const player = SoundModule.createAudioPlayer({ uri: url });
                player.volume = volume;
                player.play();
            } else if (SoundModule?.playSound) {
                SoundModule.playSound(url, volume);
            }
        } catch (err) {
            console.log("[SoundFX] Failed to play sound:", err);
        }
    }
}

export default {
    onLoad: () => {
        // ── Startup sound ──────────────────────────────────────────────────
        if (storage.StartupSoundEnabled !== false) {
            setTimeout(() => {
                playSound(getStartupURL(), getVolume("StartupVolume"));
            }, 1000);
        }

        // ── Ping sound ─────────────────────────────────────────────────────
        if (storage.PingSoundEnabled !== false) {
            try {
                const FluxDispatcher = findByProps("dispatch", "subscribe");
                const UserStore = findByProps("getCurrentUser");

                const handler = (event) => {
                    if (!event?.message) return;
                    const currentUser = UserStore?.getCurrentUser?.();
                    if (currentUser && event.message.author?.id === currentUser.id) return;
                    // Only ping if the message mentions the user or is a DM
                    const isDM = !event.message.guild_id;
                    const isMention = event.message.mentions?.some(
                        (m) => m.id === currentUser?.id
                    );
                    if (!isDM && !isMention) return;
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
