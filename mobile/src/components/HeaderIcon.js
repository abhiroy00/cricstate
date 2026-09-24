import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";

const WHITE = "#FFFFFF";
const GOLD = "#FFC42E";
const GLASS = "rgba(255,255,255,0.16)";
const GLASS_BORDER = "rgba(255,255,255,0.28)";

/**
 * HeaderIconBtn — glassy round button + press bounce.
 * Koi external library nahi, sirf Animated.
 */
export function HeaderIconBtn({ onPress, children, badge, dot, label }) {
  const scale = useRef(new Animated.Value(1)).current;
  const badgePop = useRef(new Animated.Value(1)).current;

  // Badge count badle to pop animation
  useEffect(() => {
    if (!badge) return;
    Animated.sequence([
      Animated.spring(badgePop, { toValue: 1.35, friction: 5, tension: 400, useNativeDriver: true }),
      Animated.spring(badgePop, { toValue: 1, friction: 6, tension: 300, useNativeDriver: true }),
    ]).start();
  }, [badge, badgePop]);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.82, friction: 6, tension: 400, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 320, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={8}
      accessibilityLabel={label}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <Animated.View style={[styles.btn, { transform: [{ scale }] }]}>
        <View style={styles.hit} pointerEvents="none">
          {children}
        </View>
        {dot && <PulsingDot />}
        {badge > 0 && (
          <Animated.View style={[styles.badge, { transform: [{ scale: badgePop }] }]}>
            <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function PulsingDot() {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(p, { toValue: 0, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [p]);
  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] }),
          transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
        },
      ]}
    />
  );
}

/* ---------------- Glyphs (pure View, white stroke) ---------------- */

export function MenuGlyph() {
  return (
    <View style={glyph.menuBox}>
      <View style={[glyph.bar, { width: 19 }]} />
      <View style={[glyph.bar, { width: 13, alignSelf: "flex-start", opacity: 0.75 }]} />
      <View style={[glyph.bar, { width: 19 }]} />
      <View style={glyph.menuDot} />
    </View>
  );
}

export function SearchGlyph() {
  return (
    <View style={glyph.searchBox}>
      <View style={glyph.searchCircle}>
        <View style={glyph.searchShine} />
      </View>
      <View style={glyph.searchHandle} />
    </View>
  );
}

export function ChatGlyph() {
  return (
    <View style={glyph.chatBox}>
      <View style={glyph.chatBubble}>
        <View style={glyph.chatLine} />
        <View style={[glyph.chatLine, { width: 9 }]} />
      </View>
      <View style={glyph.chatTail} />
    </View>
  );
}

export function FilterGlyph({ active }) {
  const rows = [
    { line: 20, knob: 4 },
    { line: 20, knob: 12 },
    { line: 20, knob: 8 },
  ];
  return (
    <View style={glyph.filterBox}>
      {rows.map((r, i) => (
        <View key={i} style={glyph.filterRow}>
          <View style={glyph.filterLine} />
          <View style={[glyph.filterKnob, { left: r.knob, backgroundColor: active ? GOLD : WHITE }]} />
        </View>
      ))}
    </View>
  );
}

export function BellGlyph({ ring = false }) {
  const swing = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!ring) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(swing, { toValue: 1, duration: 320, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(swing, { toValue: -1, duration: 380, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(1800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ring, swing]);

  const rotate = swing.interpolate({ inputRange: [-1, 1], outputRange: ["-14deg", "14deg"] });
  return (
    <Animated.View style={[glyph.bellBox, ring && { transform: [{ rotate }] }]}>
      <View style={glyph.bellDome} />
      <View style={glyph.bellRim} />
      <View style={glyph.bellClapper} />
    </Animated.View>
  );
}

export function TargetGlyph() {
  return (
    <View style={glyph.targetBox}>
      <View style={glyph.targetOuter}>
        <View style={glyph.targetInner}>
          <View style={glyph.targetDot} />
        </View>
      </View>
      <View style={[glyph.targetTick, { top: -1 }]} />
      <View style={[glyph.targetTick, { bottom: -1 }]} />
      <View style={[glyph.targetTickH, { left: -1 }]} />
      <View style={[glyph.targetTickH, { right: -1 }]} />
    </View>
  );
}

export function BackGlyph() {
  return (
    <View style={glyph.backBox}>
      <View style={[glyph.backBar, { transform: [{ rotate: "-45deg" }], top: 6.5 }]} />
      <View style={[glyph.backBar, { transform: [{ rotate: "45deg" }], top: 12.5 }]} />
      <View style={glyph.backStem} />
    </View>
  );
}

export function PencilGlyph() {
  return (
    <View style={glyph.pencilBox}>
      <View style={glyph.pencilBody} />
      <View style={glyph.pencilTip} />
    </View>
  );
}

export function ShareGlyph() {
  return (
    <View style={glyph.shareBox}>
      <View style={glyph.shareTray} />
      <View style={glyph.shareShaft} />
      <View style={[glyph.shareHead, glyph.shareHeadL]} />
      <View style={[glyph.shareHead, glyph.shareHeadR]} />
    </View>
  );
}

export function BagGlyph() {
  return (
    <View style={glyph.bagBox}>
      <View style={glyph.bagHandle} />
      <View style={glyph.bagBody}>
        <View style={glyph.bagStripe} />
        <View style={glyph.bagTag} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
    // halki depth taaki navy pe uthe
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  hit: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -6,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: GOLD,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    zIndex: 3,
    shadowColor: "#5A0A0E",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  badgeText: {
    color: "#5A0A0E",
    fontSize: 10.5,
    fontWeight: "900",
  },
  dot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GOLD,
    borderWidth: 1.5,
    borderColor: "#fff",
    zIndex: 3,
  },
});

const glyph = StyleSheet.create({
  // Menu — modern asymmetric hamburger + gold dot
  menuBox: {
    width: 22,
    gap: 4.5,
    alignItems: "flex-end",
    paddingRight: 1,
  },
  bar: {
    height: 2.6,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  menuDot: {
    position: "absolute",
    right: -1,
    top: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  // Search — bold ring + handle + shine
  searchBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  searchCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2.6,
    borderColor: WHITE,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 2,
  },
  searchShine: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  searchHandle: {
    position: "absolute",
    right: 1.5,
    bottom: 1.5,
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    transform: [{ rotate: "45deg" }],
  },
  // Chat — bubble + tail + lines
  chatBox: {
    width: 24,
    height: 22,
    alignItems: "center",
  },
  chatBubble: {
    width: 21,
    height: 15,
    borderRadius: 8,
    borderWidth: 2.2,
    borderColor: WHITE,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 4,
    gap: 2.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chatLine: {
    width: 11,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  chatTail: {
    width: 7,
    height: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRightWidth: 2.2,
    borderBottomWidth: 2.2,
    borderColor: WHITE,
    transform: [{ rotate: "45deg" }],
    marginTop: -4.5,
    marginLeft: -7,
  },
  // Filter — 3 sliders, active pe gold knobs
  filterBox: {
    width: 22,
    gap: 5,
  },
  filterRow: {
    height: 4,
    justifyContent: "center",
  },
  filterLine: {
    height: 2.4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  filterKnob: {
    position: "absolute",
    width: 8.5,
    height: 8.5,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)",
  },
  // Bell — dome + rim + clapper, ring=true pe swing
  bellBox: {
    width: 22,
    alignItems: "center",
  },
  bellDome: {
    width: 15,
    height: 13,
    borderWidth: 2.4,
    borderBottomWidth: 0,
    borderColor: WHITE,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bellRim: {
    width: 20,
    height: 3.4,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  bellClapper: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginTop: 1.5,
  },
  // Target — crosshair + rings
  targetBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  targetOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 2.2,
    borderColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  targetInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  targetDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  targetTick: {
    position: "absolute",
    width: 2.2,
    height: 4,
    borderRadius: 1,
    backgroundColor: WHITE,
  },
  targetTickH: {
    position: "absolute",
    width: 4,
    height: 2.2,
    borderRadius: 1,
    backgroundColor: WHITE,
  },
  // Back — chevron + stem (modern arrow)
  backBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  backBar: {
    position: "absolute",
    left: 4,
    width: 10,
    height: 2.8,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  backStem: {
    width: 14,
    height: 2.8,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginLeft: 4,
  },
  // Pencil — edit profile, diagonal body + gold tip
  pencilBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pencilBody: {
    width: 4.5,
    height: 16,
    borderRadius: 2,
    backgroundColor: WHITE,
    transform: [{ rotate: "45deg" }],
  },
  pencilTip: {
    position: "absolute",
    left: 5,
    bottom: 3.5,
    width: 7,
    height: 7,
    borderRadius: 1.5,
    backgroundColor: GOLD,
    transform: [{ rotate: "45deg" }],
  },
  // Share — tray + up arrow, gold head (bilkul app family jaisa)
  shareBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  shareTray: {
    width: 17,
    height: 10,
    borderWidth: 2.2,
    borderTopWidth: 0,
    borderColor: WHITE,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  shareShaft: {
    position: "absolute",
    left: 10.6,
    top: 5,
    width: 2.8,
    height: 11,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
  shareHead: {
    position: "absolute",
    top: 3.2,
    width: 7.5,
    height: 2.8,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  shareHeadL: {
    left: 5.8,
    transform: [{ rotate: "-42deg" }],
  },
  shareHeadR: {
    right: 5.8,
    transform: [{ rotate: "42deg" }],
  },
  // Bag — shopping bag + handle + gold tag
  bagBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 1,
  },
  bagHandle: {
    width: 11,
    height: 8,
    borderWidth: 2.2,
    borderBottomWidth: 0,
    borderColor: WHITE,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: -3,
  },
  bagBody: {
    width: 19,
    height: 14,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 2.2,
    borderColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bagStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GOLD,
  },
  bagTag: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: WHITE,
    marginTop: 3,
  },
});
