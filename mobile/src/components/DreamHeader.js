import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { brand } from "../utils/theme";

/**
 * DreamHeader — Dream11-jaisa dynamic gradient header wrapper.
 * Red (top-left) → Deep Maroon (bottom-right) + neeche gold strip.
 * View ki jagah drop-in: <DreamHeader style={...}>...</DreamHeader>
 */
export default function DreamHeader({ children, style, goldStrip = true }) {
  return (
    <LinearGradient
      colors={[brand.red, brand.redDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, style]}
    >
      {children}
      {goldStrip && <View style={styles.goldStrip} pointerEvents="none" />}
    </LinearGradient>
  );
}

/**
 * DrawerProfileGradient — drawer top ke liye navy → maroon dynamic blend.
 */
export function DrawerProfileGradient({ children, style }) {
  return (
    <LinearGradient
      colors={[brand.navy, "#2A1A5E", brand.redDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.base, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  goldStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: brand.gold,
  },
});
