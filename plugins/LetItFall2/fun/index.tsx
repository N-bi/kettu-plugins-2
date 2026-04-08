import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.js";
import { storage } from "@vendetta/plugin";

const { View, Animated, Dimensions, Easing } = ReactNative;
const { width: sw, height: sh } = Dimensions.get("window");

const perfMode = !!storage.SnowPerformance;

const configs = {
    stars:     { emoji: "\u2605", colors: ["#FFFFFF","#E8F4FD","#AED6F1","#F9E79F"], size: [8,6],   duration: [18000,10000], sway: [10,20], swayDur: [4000,4000], rock: 20 },
    leaves:    { emoji: "🍂",    colors: ["#E8A87C","#D46A2A","#C0392B","#E67E22","#A93226"], size: [14,8], duration: [18000,10000], sway: [25,40], swayDur: [2000,2000], rock: 35 },
    rain:      { emoji: "|",     colors: ["#74B9FF","#0984E3","#A8D8EA","#DDEFFF"], size: [6,2],   duration: [4000,3000],   sway: [2,3],   swayDur: [8000,4000], rock: 0  },
    sun:       { emoji: "☀️",    colors: ["#F9CA24","#F0932B","#FFDD59"],           size: [16,8],  duration: [20000,12000], sway: [15,20], swayDur: [5000,4000], rock: 15 },
    christmas: { emojis: ["❄️","🌀","☃️","🏔️","\u2605"], colors: ["#FFFFFF","#AED6F1","#E8F4FD"], size: [14,8], duration: [16000,8000], sway: [20,30], swayDur: [3000,2000], rock: 25 },
    halloween: { emojis: ["🎃","🍭","🍬","🕯️","🕸️"], colors: ["#E67E22","#8E44AD","#2C3E50","#F39C12"], size: [16,8], duration: [14000,8000], sway: [20,30], swayDur: [2500,2000], rock: 30 },
    custom:    { colors: ["#FFFFFF"], size: [20,8], duration: [16000,8000], sway: [15,25], swayDur: [3000,2000], rock: 20 },
};

function getPool() {
    if (storage.ModeChristmas) return Array(45).fill("christmas");
    if (storage.ModeHalloween) return Array(45).fill("halloween");
    if (storage.ModeCustom && storage.CustomImageURL) return Array(45).fill("custom");

    const pool = [];
    if (storage.ParticleStars  !== false) for (let i = 0; i < 3; i++) pool.push("stars");
    if (storage.ParticleLeaves !== false) for (let i = 0; i < 2; i++) pool.push("leaves");
    if (storage.ParticleRain   === true)  for (let i = 0; i < 2; i++) pool.push("rain");
    if (storage.ParticleSun    === true)  for (let i = 0; i < 1; i++) pool.push("sun");
    if (pool.length === 0) pool.push("stars");
    return pool;
}

let patches = [];
const particles = [];
let ready = false;

// splash stuff
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

    const duration = cfg.duration[0] + Math.random() * cfg.duration[1];
    const opacity = !perfMode ? 0.6 + Math.random() * 0.4 : 1;
    const rotation = Math.random() * 360;
    const shouldRock = !perfMode && Math.random() > 0.3;
    const rockSpeed = 1800 + Math.random() * 4000;
    const rockDir = Math.random() > 0.5 ? 1 : -1;
    const swayAmp = cfg.sway[0] + Math.random() * cfg.sway[1];
    const swayDur = cfg.swayDur[0] + Math.random() * cfg.swayDur[1];
    const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
    const emoji = getEmoji(type, index);
    const isCustom = type === "custom";

    return {
        id: index,
        type,
        isCustom,
        emoji,
        x,
        size,
        duration,
        y,
        sway,
        rot,
        startY,
        opacity,
        rotation,
        shouldRock,
        rockSpeed,
        rockDir,
        swayAmp,
        swayDur,
        color,
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
        }).start(({ finished }) => {
            if (finished) rock(-dir);
        });
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
        }).start(({ finished }) => {
            if (finished) go(-dir);
        });
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

const particle = React.memo(({ p }) => {
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
                {p.isCustom && storage.CustomImageURL ? (
                    <ReactNative.Image
                        source={{ uri: storage.CustomImageURL }}
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

const splashLayer = () => {
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
                        backgroundColor: "#74B9FF22",
                        borderWidth: 1,
                        borderColor: "#74B9FF99",
                        transform: [
                            {
                                scaleX: s.anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.1, 2.2],
                                })
                            },
                            {
                                scaleY: s.anim.interpolate({
                                    inputRange: [0, 0.3, 1],
                                    outputRange: [1, 0.6, 0.2],
                                })
                            }
                        ],
                    }}
                />
            ))}
        </>
    );
};

const overlay = () => {
    React.useEffect(() => { init(); }, []);

    return (
        <View
            pointerEvents="none"
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
            }}
        >
            {particles.map(p => (
                <particle key={p.id} p={p} />
            ))}
            <splashLayer />
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

                const curr = Array.isArray(wrapper.children)
                    ? wrapper.children
                    : [wrapper.children];

                wrapper.children = [
                    ...curr,
                    React.createElement(overlay, { key: "falling-overlay" })
                ];
            })
        );
    },
    onUnload: () => {
        for (const x of patches) x();
    },
    settings
};
