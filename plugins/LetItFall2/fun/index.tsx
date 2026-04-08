import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.tsx";
import { storage } from "@vendetta/plugin";

const { View, Animated, Dimensions, Easing } = ReactNative;
const { width: sw, height: sh } = Dimensions.get("window");

// this ensures reactive performance mode
const perfMode = !!storage.snowPerformance;

const configs = {
    stars:     { emoji: "\u2605", colors: ["#ffffff","#e8f4fd","#aed6f1","#f9e79f"], size: [8,6],   duration: [18000,10000], sway: [10,20], swayDur: [4000,4000], rock: 20 },
    leaves:    { emoji: "🍂",    colors: ["#e8a87c","#d46a2a","#c0392b","#e67e22","#a93226"], size: [14,8], duration: [18000,10000], sway: [25,40], swayDur: [2000,2000], rock: 35 },
    rain:      { emoji: "|",     colors: ["#74b9ff","#0984e3","#a8d8ea","#ddefff"], size: [6,2],   duration: [4000,3000],   sway: [2,3],   swayDur: [8000,4000], rock: 0  },
    sun:       { emoji: "☀️",    colors: ["#f9ca24","#f0932b","#ffdd59"],           size: [16,8],  duration: [20000,12000], sway: [15,20], swayDur: [5000,4000], rock: 15 },
    christmas: { emojis: ["❄️","🌀","☃️","🏔️","\u2605"], colors: ["#ffffff","#aed6f1","#e8f4fd"], size: [14,8], duration: [16000,8000], sway: [20,30], swayDur: [3000,2000], rock: 25 },
    halloween: { emojis: ["🎃","🍭","🍬","🕯️","🕸️"], colors: ["#e67e22","#8e44ad","#2c3e50","#f39c12"], size: [16,8], duration: [14000,8000], sway: [20,30], swayDur: [2500,2000], rock: 30 },
    custom:    { colors: ["#ffffff"], size: [20,8], duration: [16000,8000], sway: [15,25], swayDur: [3000,2000], rock: 20 },
};

function getPool() {
    if (storage.modeChristmas) return Array(45).fill("christmas");
    if (storage.modeHalloween) return Array(45).fill("halloween");
    if (storage.modeCustom && storage.customImageURL) return Array(45).fill("custom");

    const pool = [];
    if (storage.particleStars  !== false) for (let i = 0; i < 3; i++) pool.push("stars");
    if (storage.particleLeaves !== false) for (let i = 0; i < 2; i++) pool.push("leaves");
    if (storage.particleRain   === true)  for (let i = 0; i < 2; i++) pool.push("rain");
    if (storage.particleSun    === true)  for (let i = 0; i < 1; i++) pool.push("sun");
    if (pool.length === 0) pool.push("stars");
    return pool;
}

let patches = [];
const particles = [];
let ready = false;

// rain splash
const splashes: { id: number; x: number; anim: Animated.Value; opacity: Animated.Value }[] = [];
let splashId = 0;

function splash(x: number) {
    const id = splashId++;
    const anim = new Animated.Value(0);
    const opacity = new Animated.Value(1);

    splashes.push({ id, x, anim, opacity });

    Animated.parallel([
        Animated.timing(anim, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
        }),
        Animated.timing(opacity, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
        }),
    ]).start(() => {
        const i = splashes.findIndex(s => s.id === id);
        if (i !== -1) splashes.splice(i, 1);
    });
}

function getEmoji(type, index) {
    const cfg = configs[type];
    if (cfg.emojis) return cfg.emojis[index % cfg.emojis.length];
    return cfg.emoji;
}

function makeParticle(index, scatter = false) {
    const pool = getPool();
    const type = pool[index % pool.length];
    const cfg = configs[type];

    const startY = scatter ? Math.random() * sh : -50;
    const y = new Animated.Value(startY);
    const sway = new Animated.Value(0);
    const rot = !perfMode ? new Animated.Value(0) : null;
    const x = Math.random() * sw;

    const size = perfMode
        ? 3 + Math.random() * 4
        : cfg.size[0] + Math.random() * cfg.size[1];

    return {
        id: index,
        type,
        isCustom: type === "custom",
        emoji: getEmoji(type, index),
        x,
        size,
        duration: cfg.duration[0] + Math.random() * cfg.duration[1],
        y,
        sway,
        rot,
        startY,
        opacity: !perfMode ? 0.6 + Math.random() * 0.4 : 1,
        rotation: Math.random() * 360,
        shouldRock: !perfMode && Math.random() > 0.3,
        rockSpeed: 1800 + Math.random() * 4000,
        rockDir: Math.random() > 0.5 ? 1 : -1,
        swayAmp: cfg.sway[0] + Math.random() * cfg.sway[1],
        swayDur: cfg.swayDur[0] + Math.random() * cfg.swayDur[1],
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        rockRange: cfg.rock,
    };
}

function animateRock(p) {
    if (perfMode || !p.shouldRock) return;
    const rock = (dir) => {
        Animated.timing(p.rot, {
            toValue: dir * p.rockRange,
            duration: p.rockSpeed,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
        }).start(({ finished }) => { if (finished) rock(-dir); });
    };
    rock(p.rockDir);
}

function animateSway(p) {
    if (perfMode) return;
    const go = (dir) => {
        Animated.timing(p.sway, {
            toValue: dir * p.swayAmp,
            duration: p.swayDur,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
        }).start(({ finished }) => { if (finished) go(-dir); });
    };
    go(Math.random() > 0.5 ? 1 : -1);
}

function animateParticle(p) {
    if (!perfMode) {
        animateRock(p);
        animateSway(p);
    }

    const loop = () => {
        p.y.setValue(-50);
        p.sway.setValue(0);
        Animated.timing(p.y, {
            toValue: sh + 50,
            duration: p.duration,
            useNativeDriver: true
        }).start(({ finished }) => {
            if (finished) {
                if (p.type === "rain" && !perfMode) splash(p.x);
                loop();
            }
        });
    };

    Animated.timing(p.y, {
        toValue: sh + 50,
        duration: p.duration * ((sh + 50 - p.startY) / (sh + 100)),
        useNativeDriver: true
    }).start(({ finished }) => {
        if (finished) {
            if (p.type === "rain" && !perfMode) splash(p.x);
            loop();
        }
    });
}

function init() {
    if (ready) return;
    ready = true;
    for (let i = 0; i < 45; i++) {
        const p = makeParticle(i, true);
        particles.push(p);
        animateParticle(p);
    }
}

// this shit need to be capitalized or it won't work
const Particle = React.memo(({ p }) => {
    if (!perfMode) {
        const rotDeg = p.rot.interpolate({
            inputRange: [-360, 360],
            outputRange: ["-360deg", "360deg"],
        });

        return (
            <Animated.View
                style={{
                    position: "absolute",
                    left: p.x,
                    top: 0,
                    opacity: p.opacity,
                    transform: [
                        { translateY: p.y },
                        { translateX: p.sway },
                        { rotate: p.shouldRock ? rotDeg : `${p.rotation}deg` }
                    ]
                }}
            >
                {p.isCustom && storage.customImageURL ? (
                    <ReactNative.Image
                        source={{ uri: storage.customImageURL }}
                        style={{ width: p.size, height: p.size }}
                        resizeMode="contain"
                    />
                ) : (
                    <ReactNative.Text style={{
                        fontSize: p.size,
                        color: p.color,
                        lineHeight: p.size * 1.3,
                        ...(p.type === "rain" ? { fontWeight: "100" } : {})
                    }}>
                        {p.emoji}
                    </ReactNative.Text>
                )}
            </Animated.View>
        );
    } else {
        return (
            <Animated.View
                style={{
                    position: "absolute",
                    left: p.x,
                    top: 0,
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    backgroundColor: p.color,
                    opacity: p.opacity,
                    transform: [{ translateY: p.y }]
                }}
            />
        );
    }
});

const SplashLayer = () => {
    const [, tick] = React.useReducer((x: number) => x + 1, 0);

    React.useEffect(() => {
        const t = setInterval(tick, 50);
        return () => clearInterval(t);
    }, []);

    return (
        <>
            {splashes.map(s => (
                <Animated.View
                    key={s.id}
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: s.x - 8,
                        width: 16,
                        height: 5,
                        opacity: s.opacity,
                        borderRadius: 3,
                        backgroundColor: "#74b9ff22",
                        borderWidth: 1,
                        borderColor: "#74b9ff99",
                        transform: [
                            { scaleX: s.anim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 2.2] }) },
                            { scaleY: s.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0.6, 0.2] }) }
                        ],
                    }}
                />
            ))}
        </>
    );
};

const Overlay = () => {
    React.useEffect(() => { init(); }, []);

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999,
            }}
        >
            {particles.map(p => (
                <Particle key={p.id} p={p} />
            ))}
            <SplashLayer />
        </View>
    );
};

export default {
    onLoad: () => {
        init();
        patches.push(
            before("render", General.View, (args) => {
                const [wrapper] = args;
                if (!wrapper || !Array.isArray(wrapper.style)) return;

                const hasFlexOne = wrapper.style.some(s => s?.flex === 1);
                if (!hasFlexOne) return;

                let child = wrapper.children;
                if (Array.isArray(child)) {
                    child = child.find(c => c?.type?.name === "NativeStackViewInner");
                }

                if (child?.type?.name !== "NativeStackViewInner") return;

                const routes = child?.props?.state?.routeNames;
                if (!routes?.includes("main") || !routes?.includes("modal")) return;

                const curr = Array.isArray(wrapper.children) ? wrapper.children : [wrapper.children];
                wrapper.children = [
                    ...curr,
                    React.createElement(Overlay, { key: "falling-overlay" })
                ];
            })
        );
    },
    onUnload: () => {
        for (const x of patches) x();
    },
    settings
};
