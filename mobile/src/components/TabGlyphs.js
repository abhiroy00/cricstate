import { StyleSheet, View } from "react-native";

/**
 * TabGlyphs — bottom-tab ke liye clean vector-style icons (pure View).
 * Dream11 jaisa sharp look: active pe brand-red, inactive pe grey.
 * `color` prop se stroke milta hai, gold accents hamesha gold.
 */

const GOLD = "#FFC42E";

export function HomeGlyph({ color }) {
  return (
    <View style={g.homeBox}>
      <View
        style={[
          g.roof,
          { borderBottomColor: color },
        ]}
      />
      <View style={[g.homeBody, { backgroundColor: color }]}>
        <View style={g.door} />
      </View>
    </View>
  );
}

export function SearchTabGlyph({ color, active }) {
  return (
    <View style={g.searchBox}>
      <View style={[g.ring, { borderColor: color }]} />
      <View
        style={[g.handle, { backgroundColor: active ? GOLD : color }]}
      />
    </View>
  );
}

export function CricketGlyph({ color, onRed }) {
  return (
    <View style={g.ckBox}>
      <View style={[g.bat, { backgroundColor: onRed ? "#fff" : color }]} />
      <View style={g.ball} />
    </View>
  );
}

export function CommunityGlyph({ color }) {
  return (
    <View style={g.cmBox}>
      <View style={[g.head, g.headL, { backgroundColor: color }]} />
      <View style={[g.body, g.bodyL, { backgroundColor: color }]} />
      <View style={[g.head, g.headR, { backgroundColor: color }]} />
      <View style={[g.body, g.bodyR, { backgroundColor: color }]} />
    </View>
  );
}

export function StoreTabGlyph({ color, active }) {
  return (
    <View style={g.stBox}>
      <View style={[g.trayHandle, { borderColor: color }]} />
      <View style={[g.tray, { borderColor: color }]}>
        <View style={[g.stripe, { backgroundColor: active ? GOLD : color }]} />
      </View>
    </View>
  );
}

const g = StyleSheet.create({
  // Home — triangle roof + body + door cutout
  homeBox: {
    width: 26,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  homeBody: {
    width: 15,
    height: 12,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -1,
  },
  door: {
    width: 6,
    height: 8,
    backgroundColor: "#fff",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  // Search — ring + handle
  searchBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2.6,
  },
  handle: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 8,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  // Cricket — tilted bat + gold ball
  ckBox: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  bat: {
    width: 6.5,
    height: 21,
    borderRadius: 3.5,
    transform: [{ rotate: "32deg" }],
  },
  ball: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GOLD,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.15)",
  },
  // Community — two heads + shoulders
  cmBox: {
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  head: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 0,
  },
  headL: {
    left: 4,
  },
  headR: {
    right: 4,
    top: 2,
  },
  body: {
    position: "absolute",
    width: 15,
    height: 10,
    borderRadius: 5,
    bottom: 0,
  },
  bodyL: {
    left: 0,
  },
  bodyR: {
    right: 0,
  },
  // Store — basket + handle + stripe
  stBox: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  trayHandle: {
    width: 11,
    height: 8,
    borderWidth: 2.2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginBottom: -2,
  },
  tray: {
    width: 20,
    height: 14,
    borderRadius: 3,
    borderWidth: 2.2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  stripe: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
