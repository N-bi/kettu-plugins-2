import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.js";
import { storage } from "@vendetta/plugin";

const { View, Animated, Dimensions, Easing } = ReactNative;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PERFORMANCE_MODE = !!storage.SnowPerformance;

const CONFIGS = {
    stars:     { emoji: "\u2605", colors: ["#FFFFFF","#E8F4FD","#AED6F1","#F9E79F"], size: [8,6],   duration: [18000,10000], sway: [10,20], swayDur: [4000,4000], rock: 20 },
    leaves:    { emoji: "🍂",    colors: ["#E8A87C","#D46A2A","#C0392B","#E67E22","#A93226"], size: [14,8], duration: [18000,10000], sway: [25,40], swayDur: [2000,2000], rock: 35 },
    rain:      { emoji: "💧",    colors: ["#74B9FF","#0984E3","#A8D8EA","#DDEFFF"], size: [8,4],   duration: [4000,3000],   sway: [4,6],   swayDur: [8000,4000], rock: 5  },
    sun:       { emoji: "☀️",    colors: ["#F9CA24","#F0932B","#FFDD59"],           size: [16,8],  duration: [20000,12000], sway: [15,20], swayDur: [5000,4000], rock: 15 },
    christmas: { emojis: ["❄️","🌀","☃️","🏔️","\u2605"], colors: ["#FFFFFF","#AED6F1","#E8F4FD"], size: [14,8], duration: [16000,8000], sway: [20,30], swayDur: [3000,2000], rock: 25 },
    halloween: { emojis: ["🎃","🍭","🍬","🕯️","🕸️"], colors: ["#E67E22","#8E44AD","#2C3E50","#F39C12"], size: [16,8], duration: [14000,8000], sway: [20,30], swayDur: [2500,2000], rock: 30 },
    custom:    { colors: ["#FFFFFF"], size: [20,8], duration: [16000,8000], sway: [15,25], swayDur: [3000,2000], rock: 20 },
};

function resolveActiveTypes() {
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
const persistentParticles = [];
let initialized = false;

function getEmoji(type, index) {
    const cfg = CONFIGS[type];
    if (cfg.emojis) return cfg.emojis[index % cfg.emojis.length];
    return cfg.emoji;
}

function createParticle(index, startFromCurrent = false) {
    const pool = resolveActiveTypes();
    const type = pool[index % pool.length];
    const cfg = CONFIGS[type];

    const startY = startFromCurrent ? Math.random() * SCREEN_HEIGHT : -50;
    const animValue = new Animated.Value(startY);
    const swayValue = new Animated.Value(0);
    const rotationValue = !PERFORMANCE_MODE ? new Animated.Value(0) : null;
    const x = Math.random() * SCREEN_WIDTH;

    const size = PERFORMANCE_MODE
        ? 3 + Math.random() * 4
        : cfg.size[0] + Math.random() * cfg.size[1];

    const duration = cfg.duration[0] + Math.random() * cfg.duration[1];
    const opacity = !PERFORMANCE_MODE ? 0.6 + Math.random() * 0.4 : 1;
    const rotation = Math.random() * 360;
    const shouldRotate = !PERFORMANCE_MODE && Math.random() > 0.3;
    const rotationSpeed = 1800 + Math.random() * 4000;
    const rotationDirection = Math.random() > 0.5 ? 1 : -1;
    const swayAmplitude = cfg.sway[0] + Math.random() * cfg.sway[1];
    const swayDuration = cfg.swayDur[0] + Math.random() * cfg.swayDur[1];
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
        animValue,
        swayValue,
        rotationValue,
        startY,
        opacity,
        rotation,
        shouldRotate,
        rotationSpeed,
        rotationDirection,
        swayAmplitude,
        swayDuration,
        color,
        rockRange: cfg.rock,
    };
}

function startRotationAnimation(particle) {
    if (PERFORMANCE_MODE || !particle.shouldRotate) return;

    const rock = (dir) => {
        Animated.timing(particle.rotationValue, {
            toValue: dir * particle.rockRange,
            duration: particle.rotationSpeed,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
        }).start(({ finished }) => {
            if (finished) rock(-dir);
        });
    };

    rock(particle.rotationDirection);
}

function startSwayAnimation(particle) {
    if (PERFORMANCE_MODE) return;

    const sway = (dir) => {
        Animated.timing(particle.swayValue, {
            toValue: dir * particle.swayAmplitude,
            duration: particle.swayDuration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
        }).start(({ finished }) => {
            if (finished) sway(-dir);
        });
    };

    sway(Math.random() > 0.5 ? 1 : -1);
}

function startParticleAnimation(particle) {
    if (!PERFORMANCE_MODE) {
        startRotationAnimation(particle);
        startSwayAnimation(particle);
    }

    const animate = () => {
        particle.animValue.setValue(-50);
        particle.swayValue.setValue(0);
        Animated.timing(particle.animValue, {
            toValue: SCREEN_HEIGHT + 50,
            duration: particle.duration,
            useNativeDriver: true
        }).start(({ finished }) => {
            if (finished) {
                animate();
            }
        });
    };

    Animated.timing(particle.animValue, {
        toValue: SCREEN_HEIGHT + 50,
        duration: particle.duration * ((SCREEN_HEIGHT + 50 - particle.startY) / (SCREEN_HEIGHT + 100)),
        useNativeDriver: true
    }).start(({ finished }) => {
        if (finished) {
            animate();
        }
    });
}

function initializeParticles() {
    if (initialized) return;
    initialized = true;

    for (let i = 0; i < 45; i++) {
        const particle = createParticle(i, true);
        persistentParticles.push(particle);
        startParticleAnimation(particle);
    }
}

const ParticleItem = React.memo(({ particle }) => {
    if (!PERFORMANCE_MODE) {
        const animatedRotation = particle.rotationValue.interpolate({
            inputRange: [-360, 360],
            outputRange: ["-360deg", "360deg"],
        });

        return (
            <Animated.View
                style={{
                    position: "absolute",
                    left: particle.x,
                    top: 0,
                    opacity: particle.opacity,
                    transform: [
                        { translateY: particle.animValue },
                        { translateX: particle.swayValue },
                        { rotate: particle.shouldRotate ? animatedRotation : `${particle.rotation}deg` }
                    ]
                }}
            >
                {particle.isCustom && storage.CustomImageURL ? (
                    <ReactNative.Image
                        source={{ uri: storage.CustomImageURL }}
                        style={{ width: particle.size, height: particle.size }}
                        resizeMode="contain"
                    />
                ) : (
                    <ReactNative.Text style={{ fontSize: particle.size, color: particle.color, lineHeight: particle.size * 1.3 }}>
                        {particle.emoji}
                    </ReactNative.Text>
                )}
            </Animated.View>
        );
    } else {
        return (
            <Animated.View
                style={{
                    position: "absolute",
                    left: particle.x,
                    top: 0,
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: particle.color,
                    opacity: particle.opacity,
                    transform: [{ translateY: particle.animValue }]
                }}
            />
        );
    }
});

const FallingParticles = () => {
    React.useEffect(() => {
        initializeParticles();
    }, []);

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
          {persistentParticles.map(particle => (
              <ParticleItem key={particle.id} particle={particle} />
          ))}
        </View>
    );
};

export default {
  onLoad: () => {
    initializeParticles();
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

          const currentChildren = Array.isArray(wrapper.children)
              ? wrapper.children
              : [wrapper.children];

          wrapper.children = [
              ...currentChildren,
              React.createElement(FallingParticles, { key: "persistent-overlay" })
          ];
      })
    );

  },
  onUnload: () => {
	  for (const x of patches) x();
  },
  settings
}
