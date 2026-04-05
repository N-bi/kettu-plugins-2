import { ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import settings from "./settings.js";

const { DCDSoundManager } = ReactNative.NativeModules;

// ── Default URLs ───────────────────────────────────────────────────────────
const DEFAULT_STARTUP_URL = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/m-e-o-w.mp3";
const DEFAULT_PING_URL    = "https://raw.githubusercontent.com/N-bi/kettu-plugins-2/master/plugins/sounds%2B/discord_ping_sound_effect.mp3";

const STARTUP_SOUND_ID = 6971;
const PING_SOUND_ID    = 6972;

let patches = [];

// ── Sound state ────────────────────────────────────────────────────────────
let startupPlaying = false;
let startupTimeout = null;
let startupDuration = -1;
let startupPrepared = false;

let pingPlaying = false;
let pingTimeout = null;
let pingDuration = -1;
let pingPrepared = false;

function getStartupURL() {
    return (storage.CustomStartupURL && storage.CustomStartupURL.trim())
        ? storage.CustomStartupURL.trim()
        : DEFAULT_STARTUP_URL;
}

function getPingURL() {
    return (storage.CustomPingURL && storage.CustomPingURL.trim())
        ? storage.CustomPingURL.trim()
        : DEFAULT_PING_URL;
}

function getVolume(key) {
    const v = storage[key];
    return typeof v === "number" ? Math.min(1, Math.max(0, v)) : 1.0;
}

// ── Prepare + play ─────────────────────────────────────────────────────────
function prepareSound(url, soundId) {
    return new Promise((resolve) => {
        DCDSoundManager.prepare(url, "music", soundId, (error, sound) => {
            resolve(sound);
        });
    });
}

async function playStartupSound() {
    if (startupPlaying) {
        if (startupTimeout != null) clearTimeout(startupTimeout);
        DCDSoundManager.stop(STARTUP_SOUND_ID);
        startupPlaying = false;
    }
    startupPlaying = true;
    await DCDSoundManager.play(STARTUP_SOUND_ID);
    startupTimeout = setTimeout(() => {
        startupPlaying = false;
        DCDSoundManager.stop(STARTUP_SOUND_ID);
        startupTimeout = null;
    }, startupDuration);
}

async function playPingSound() {
    if (pingPlaying) {
        if (pingTimeout != null) clearTimeout(pingTimeout);
        DCDSoundManager.stop(PING_SOUND_ID);
        pingPlaying = false;
    }
    pingPlaying = true;
    await DCDSoundManager.play(PING_SOUND_ID);
    pingTimeout = setTimeout(() => {
        pingPlaying = false;
        DCDSoundManager.stop(PING_SOUND_ID);
        pingTimeout = null;
    }, pingDuration);
}

export default {
    onLoad: () => {
        // ── Startup sound ──────────────────────────────────────────────────
        if (storage.StartupSoundEnabled !== false && !startupPrepared) {
            prepareSound(getStartupURL(), STARTUP_SOUND_ID).then((sound: any) => {
                startupPrepared = true;
                startupDuration = sound?.duration ?? 3000;
                playStartupSound();
            });
        }

        // ── Ping sound ─────────────────────────────────────────────────────
        if (storage.PingSoundEnabled !== false && !pingPrepared) {
            prepareSound(getPingURL(), PING_SOUND_ID).then((sound: any) => {
                pingPrepared = true;
                pingDuration = sound?.duration ?? 2000;
            });

            try {
                const FluxDispatcher = findByProps("dispatch", "subscribe", "unsubscribe");

                const handler = (event) => {
    if (!event?.message) return;
    if (pingPrepared) playPingSound();
};
                FluxDispatcher.subscribe("MESSAGE_CREATE", handler);
                patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_CREATE", handler));
            } catch (e) {
                console.log("[SoundFX] Could not subscribe to MESSAGE_CREATE:", e);
            }
        }
    },

    onUnload: () => {
        // Stop and clean up sounds
        if (startupTimeout) clearTimeout(startupTimeout);
        if (pingTimeout) clearTimeout(pingTimeout);
        if (startupPrepared) DCDSoundManager.stop(STARTUP_SOUND_ID);
        if (pingPrepared) DCDSoundManager.stop(PING_SOUND_ID);
        startupPrepared = false;
        pingPrepared = false;
        for (const x of patches) x();
    },

    settings,
};
