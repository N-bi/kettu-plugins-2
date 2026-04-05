import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import settings from "./settings.js";
import { storage } from "@vendetta/plugin";

const { View, Animated, Dimensions, Easing } = ReactNative;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PERFORMANCE_MODE = !!storage.SnowPerformance;

const PARTICLE_TYPES = ["star", "star", "star", "leaf", "leaf"];
const LEAF_COLORS = ["#E8A87C", "#D46A2A", "#C0392B", "#E67E22", "#A93226"];
const STAR_COLORS = ["#FFFFFF", "#E8F4FD", "#AED6F1", "#F9E79F"];

let patches = [];

const persistentParticles = [];
let initialized = false;

function createParticle(index, startFromCurrent = false) {
    const startY = startFromCurrent ? Math.random() * SCREEN_HEIGHT : -50;
    const animValue = new Animated.Value(startY);
    const swayValue = new Animated.Value(0);
    const rotationValue = !PERFORMANCE_MODE ? new Animated.Value(0) : null;
    const x = Math.random() * SCREEN_WIDTH;

    const type = PARTICLE_TYPES[index % PARTICLE_TYPES.length];
    const isLeaf = type === "leaf";

    let size;
    if (!PERFORMANCE_MODE) {
        size = isLeaf
            ? 8 + Math.random() * 8
            : 4 + Math.random() * 6;
    } else {
        size = 3 + Math.random() * 4;
    }

    const duration = isLeaf
        ? 18000 + Math.random() * 10000
        : 25000 + Math.random() * 15000;

    const opacity = !PERFORMANCE_MODE
        ? 0.6 + Math.random() * 0.4
        : 1;

    const rotation = Math.random() * 360;
    const shouldRotate = !PERFORMANCE_MODE && Math.random() > 0.3;
    const rotationSpeed = isLeaf
        ? 1800 + Math.random() * 2000
        : 5000 + Math.random() * 5000;
    const rotationDirection = Math.random() > 0.5 ? 1 : -1;

    const swayAmplitude = isLeaf
        ? 25 + Math.random() * 40
        : 10 + Math.random() * 20;
    const swayDuration = isLeaf
        ? 2000 + Math.random() * 2000
        : 4000 + Math.random() * 4000;

    const color = isLeaf
        ? LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
        : STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

    return {
        id: index,
        type,
        isLeaf,
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
    };
}

function startRotationAnimation(particle) {
    if (PERFORMANCE_MODE || !particle.shouldRotate) return;

    const rock = (dir) => {
        const target = dir * (particle.isLeaf ? 35 : 20);
        Animated.timing(particle.rotationValue, {
            toValue: target,
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
                {/* replaces images with eomjis wowowi*/}
                <ReactNative.Text style={{ fontSize: particle.size, color: particle.color, lineHeight: particle.size * 1.3 }}>
                    {particle.isLeaf ? "🍂" : "\u2605"}
                </ReactNative.Text>
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

          //If ViewBackground plugin
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
