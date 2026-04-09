import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.tsx";
import { storage } from "@vendetta/plugin";

const { View, Animated, Dimensions, Easing } = ReactNative;
const { width: sw, height: sh } = Dimensions.get("window");

const perfMode = !!storage.snowPerformance;

const configs = {
    stars:     { emoji: "\u2605", colors: ["#ffffff","#e8f4fd","#aed6f1","#f9e79f"], size: [8,6],   duration: [18000,10000], sway: [15,20], swayDur: [4000,4000], rock: 20 },
    leaves:    { emoji: "🍂",    colors: ["#e8a87c","#d46a2a","#c0392b","#e67e22","#a93226"], size: [14,8], duration: [18000,10000], sway: [30,40], swayDur: [2500,2000], rock: 35 },
    rain:      { emoji: "|",     colors: ["#74b9ff","#0984e3","#a8d8ea","#ddefff"], size: [18,2],  duration: [900,600],     sway: [0,0],    swayDur: [0,0],    rock: 0  },
    sun:       { emoji: "☀️",    colors: ["#f9ca24","#f0932b","#ffdd59"],           size: [16,8],  duration: [20000,12000], sway: [15,20], swayDur: [5000,4000], rock: 15 },
    christmas: { emojis: ["❄️","\u2605"], colors: ["#ffffff","#aed6f1"], size: [14,8], duration: [16000,8000], sway: [20,30], swayDur: [3000,2000], rock: 25 },
    halloween: { emojis: ["🎃","🍭"], colors: ["#e67e22","#8e44ad"], size: [16,8], duration: [14000,8000], sway: [20,30], swayDur: [2500,2000], rock: 30 },
};

function getPool() {
    if (storage.modeChristmas) return Array(45).fill("christmas");
    if (storage.modeHalloween) return Array(45).fill("halloween");
    const pool = [];
    if (storage.particleStars  !== false) for (let i = 0; i < 3; i++) pool.push("stars");
    if (storage.particleLeaves !== false) for (let i = 0; i < 2; i++) pool.push("leaves");
    if (storage.particleRain   === true)  for (let i = 0; i < 5; i++) pool.push("rain"); 
    if (storage.particleSun    === true)  for (let i = 0; i < 1; i++) pool.push("sun");
    return pool.length ? pool : ["stars"];
}

let patches = [];
const particles = [];
let ready = false;

function animateSway(p) {
    if (p.swayAmp === 0) return;
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

function animateRock(p) {
    if (p.rockRange === 0) return;
    const rock = (dir) => {
        Animated.timing(p.rot, {
            toValue: dir * p.rockRange,
            duration: 2000 + Math.random() * 3000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
        }).start(({ finished }) => { if (finished) rock(-dir); });
    };
    rock(Math.random() > 0.5 ? 1 : -1);
}

function makeParticle(index, scatter = false) {
    const pool = getPool();
    const type = pool[index % pool.length];
    const cfg = configs[type];
    const isRain = type === "rain";

    const drift = isRain ? 180 : 0; 
    const startX = isRain ? (Math.random() * (sw + drift)) : (Math.random() * sw);
    const startY = scatter ? (Math.random() * sh) : -60;

    return {
        id: index,
        type,
        emoji: (cfg.emojis ? cfg.emojis[index % cfg.emojis.length] : cfg.emoji),
        x: new Animated.Value(startX),
        y: new Animated.Value(startY),
        sway: new Animated.Value(0),
        rot: new Animated.Value(0),
        size: cfg.size[0] + Math.random() * cfg.size[1],
        duration: cfg.duration[0] + Math.random() * cfg.duration[1],
        opacity: isRain ? 0.4 : (0.6 + Math.random() * 0.4),
        drift,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        swayAmp: cfg.sway[0],
        swayDur: cfg.swayDur[0],
        rockRange: cfg.rock,
    };
}

function animateParticle(p) {
    const isRain = p.type === "rain";
    
    if (!perfMode && !isRain) {
        animateSway(p);
        animateRock(p);
    }

    const loop = () => {
        const nextStartX = isRain ? (Math.random() * (sw + p.drift)) : (Math.random() * sw);
        p.x.setValue(nextStartX);
        p.y.setValue(-60);
        
        Animated.parallel([
            Animated.timing(p.y, { toValue: sh + 50, duration: p.duration, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(p.x, { toValue: nextStartX - p.drift, duration: p.duration, useNativeDriver: true, easing: Easing.linear })
        ]).start(({ finished }) => { if (finished) loop(); });
    };

    loop();
}

const Particle = React.memo(({ p }) => {
    const isRain = p.type === "rain";
    const rotation = p.rot.interpolate({
        inputRange: [-100, 100],
        outputRange: ["-100deg", "100deg"]
    });

    return (
        <Animated.View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                opacity: p.opacity,
                transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { translateX: p.sway }, 
                    { rotate: isRain ? "20deg" : rotation }, 
                    { scaleX: isRain ? 0.15 : 1 },
                    { scaleY: isRain ? 1.8 : 1 }
                ]
            }}
        >
            <ReactNative.Text style={{
                fontSize: p.size,
                color: p.color,
                fontWeight: isRain ? "900" : "400",
            }}>
                {p.emoji}
            </ReactNative.Text>
        </Animated.View>
    );
});

const Overlay = () => {
    React.useEffect(() => {
        if (!ready) {
            ready = true;
            for (let i = 0; i < 50; i++) {
                const p = makeParticle(i, true);
                particles.push(p);
                animateParticle(p);
            }
        }
    }, []);

    return (
        <View pointerEvents="none" style={{ ...ReactNative.StyleSheet.absoluteFillObject, zIndex: 9999 }}>
            {particles.map(p => <Particle key={p.id} p={p} />)}
        </View>
    );
};

export default {
    onLoad: () => {
        patches.push(
            before("render", General.View, (args) => {
                const [wrapper] = args;
                if (!wrapper?.style?.some?.(s => s?.flex === 1)) return;
                let child = Array.isArray(wrapper.children) ? wrapper.children.find(c => c?.type?.name === "NativeStackViewInner") : wrapper.children;
                if (child?.type?.name !== "NativeStackViewInner") return;
                
                const curr = Array.isArray(wrapper.children) ? wrapper.children : [wrapper.children];
                wrapper.children = [...curr, React.createElement(Overlay, { key: "rain-overlay" })];
            })
        );
    },
    onUnload: () => { for (const x of patches) x(); },
    settings
};
