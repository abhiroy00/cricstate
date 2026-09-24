import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

const GOLD = "#FFC42E";
const GOLD_DEEP = "#E9A800";
const NAVY_DEEP = "#5A0A0E";

/**
 * Header wala PRO pill — gold color + pulse + shine sweep animation.
 * Navy header pe teal dab jata tha, gold sabse zyada attract karta hai.
 * Koi extra library nahi, sirf react-native Animated (native driver).
 */
export default function ProPill({ onPress, label = "PRO @ ₹199" }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const shineLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(shine, {
          toValue: 1,
          duration: 1050,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(shine, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
      ])
    );
    pulseLoop.start();
    shineLoop.start();
    return () => {
      pulseLoop.stop();
      shineLoop.stop();
    };
  }, [pulse, shine]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });
  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 130],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      hitSlop={6}
      style={styles.touch}
    >
      <Animated.View style={[styles.pill, { transform: [{ scale }] }]}>
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
        <Text style={styles.crown}>👑</Text>
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
        <Animated.View
          style={[
            styles.shine,
            { transform: [{ translateX: shineX }, { rotate: "18deg" }] },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    marginLeft: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GOLD,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GOLD_DEEP,
    paddingHorizontal: 11,
    paddingVertical: 6,
    overflow: "hidden",
    // Gold glow taaki navy header pe chamke
    shadowColor: GOLD,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 16,
  },
  crown: {
    fontSize: 13,
    marginRight: 4,
  },
  text: {
    color: NAVY_DEEP,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  shine: {
    position: "absolute",
    top: -6,
    bottom: -6,
    left: 0,
    width: 30,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
