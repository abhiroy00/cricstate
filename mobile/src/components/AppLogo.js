import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const GOLD = "#FFC42E";
const NAVY_DEEP = "#5A0A0E";

/**
 * AppLogo — header wala premium animated badge.
 * - Full logo visible (contain, crop nahi hota)
 * - Gold ring + soft glow (breathing pulse)
 * - Har ~3s me diagonal shine sweep
 * - Dabane pe spring bounce + halka wiggle
 */
export default function AppLogo({ size = 40, onPress, glow = true }) {
  const breathe = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  // Breathing glow loop
  useEffect(() => {
    if (!glow) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, glow]);

  // Shine sweep loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(shine, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1700),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);

  const pressIn = () => {
    Animated.spring(press, {
      toValue: 0.88,
      friction: 6,
      tension: 450,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(press, {
      toValue: 1,
      friction: 5,
      tension: 320,
      useNativeDriver: true,
    }).start();
    // halka wiggle taaki logo alive lage
    Animated.sequence([
      Animated.timing(wiggle, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(wiggle, {
        toValue: -1,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.timing(wiggle, {
        toValue: 0,
        duration: 130,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const glowOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.85],
  });
  const glowScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 1.4, size * 1.6],
  });
  const rotate = wiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-7deg", "7deg"],
  });

  const radius = size * 0.32;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={6}
      accessibilityLabel="CricState home"
      style={styles.touch}
    >
      <Animated.View
        style={[
          styles.glowWrap,
          {
            width: size,
            height: size,
            borderRadius: radius,
            opacity: glow ? glowOpacity : 0,
            transform: [{ scale: glowScale }],
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: radius,
            transform: [{ scale: press }, { rotate }],
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            { borderRadius: radius - 2, width: size - 4, height: size - 4 },
          ]}
        >
          <Image
            source={require("../../assets/app-logo.png")}
            style={{ width: size - 4, height: size - 4, borderRadius: radius - 2 }}
            resizeMode="contain"
          />
          <Animated.View
            style={[
              styles.shine,
              {
                width: size * 0.55,
                transform: [{ translateX: shineX }, { rotate: "18deg" }],
              },
            ]}
            pointerEvents="none"
          />
          <View style={styles.topGloss} pointerEvents="none" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glowWrap: {
    position: "absolute",
    backgroundColor: "rgba(255,196,46,0.45)",
    shadowColor: GOLD,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  badge: {
    backgroundColor: "#fff",
    borderWidth: 1.8,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    overflow: "hidden",
  },
  inner: {
    overflow: "hidden",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shine: {
    position: "absolute",
    top: -8,
    bottom: -8,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  topGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "42%",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
});

// Navy deep export taaki header me text ke saath match kare
export { NAVY_DEEP };
