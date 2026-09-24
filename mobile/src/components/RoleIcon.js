import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * RoleIcon — Community ke har element ke liye Dream11-style icon.
 * Gradient tile (red/navy) + white glyph + gold accents.
 * role: scorers | umpires | commentators | streamers | organisers |
 *       academies | grounds | box (fallback: cricket)
 */

const WHITE = "#FFFFFF";
const GOLD = "#FFC42E";
const RED = "#E01A22";
const RED_DARK = "#A60E14";
const NAVY = "#2A2C6E";
const NAVY_DEEP = "#0E0F30";

const TONES = {
  red: [RED, RED_DARK],
  navy: [NAVY, NAVY_DEEP],
};

function Scaled({ size, children }) {
  const s = size / 30;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 30, height: 30, transform: [{ scale: s }] }}>{children}</View>
    </View>
  );
}

function ScorerGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.board}>
        <View style={g.cell} />
        <View style={g.divider} />
        <View style={g.cell} />
      </View>
      <View style={g.legs}>
        <View style={g.leg} />
        <View style={g.leg} />
      </View>
    </View>
  );
}

function UmpireGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.crown} />
      <View style={g.brim} />
      <View style={g.uHead} />
      <View style={g.uBody} />
    </View>
  );
}

function CommentatorGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.micHead}>
        <View style={g.grill} />
        <View style={g.grill} />
      </View>
      <View style={g.micNeck} />
      <View style={g.micBase} />
    </View>
  );
}

function StreamerGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.liveRect} />
      <View style={g.play} />
      <View style={g.liveDot} />
    </View>
  );
}

function OrganiserGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.cup} />
      <View style={g.stem} />
      <View style={g.tBase} />
    </View>
  );
}

function AcademyGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.flagRow}>
        <View style={g.pole} />
        <View style={g.flag} />
      </View>
      <View style={g.aBase} />
    </View>
  );
}

function GroundGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.ring}>
        <View style={g.stumps}>
          <View style={g.stump} />
          <View style={g.stump} />
          <View style={g.stump} />
        </View>
      </View>
      <View style={g.gBall} />
    </View>
  );
}

function BoxGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.cube}>
        <View style={g.netH} />
        <View style={g.netV} />
      </View>
    </View>
  );
}

function CricketGlyph() {
  return (
    <View style={g.box30}>
      <View style={g.bat} />
      <View style={g.cBall} />
    </View>
  );
}

const GLYPHS = {
  scorers: ScorerGlyph,
  umpires: UmpireGlyph,
  commentators: CommentatorGlyph,
  streamers: StreamerGlyph,
  organisers: OrganiserGlyph,
  academies: AcademyGlyph,
  grounds: GroundGlyph,
  box: BoxGlyph,
};

export function normalizeRole(role) {
  const k = String(role || "").toLowerCase().trim();
  if (GLYPHS[k]) return k;
  if (k.includes("umpire")) return "umpires";
  if (k.includes("comment")) return "commentators";
  if (k.includes("stream")) return "streamers";
  if (k.includes("organis")) return "organisers";
  if (k.includes("academ")) return "academies";
  if (k.includes("ground")) return "grounds";
  if (k.includes("box") || k.includes("net")) return "box";
  if (k.includes("scor")) return "scorers";
  return "cricket";
}

/** Bare glyph (banners/photo backgrounds ke upar) */
export function RoleGlyph({ role, size = 30 }) {
  const G = GLYPHS[normalizeRole(role)] || CricketGlyph;
  return (
    <Scaled size={size}>
      <G />
    </Scaled>
  );
}

/** Gradient tile + glyph (list avatars ke liye) */
export default function RoleIcon({ role, size = 52, tone = "red", style }) {
  const G = GLYPHS[normalizeRole(role)] || CricketGlyph;
  const colors = TONES[tone] || TONES.red;
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          borderWidth: 1.5,
          borderColor: GOLD,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Scaled size={size * 0.62}>
        <G />
      </Scaled>
    </LinearGradient>
  );
}

const g = StyleSheet.create({
  box30: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  // Scorer — board + legs
  board: {
    flexDirection: "row",
    width: 22,
    height: 13,
    borderRadius: 2,
    borderWidth: 2.2,
    borderColor: WHITE,
    overflow: "hidden",
  },
  cell: {
    flex: 1,
  },
  divider: {
    width: 2.2,
    backgroundColor: GOLD,
  },
  legs: {
    flexDirection: "row",
    marginTop: 2,
    gap: 8,
  },
  leg: {
    width: 2.4,
    height: 7,
    borderRadius: 1.5,
    backgroundColor: WHITE,
  },
  // Umpire — hat + head + shoulders
  crown: {
    width: 13,
    height: 6,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
  brim: {
    width: 22,
    height: 2.6,
    borderRadius: 1.5,
    backgroundColor: WHITE,
    marginTop: 1,
  },
  uHead: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: WHITE,
    marginTop: 2,
  },
  uBody: {
    width: 18,
    height: 7,
    borderRadius: 4,
    backgroundColor: WHITE,
    marginTop: 1.5,
  },
  // Commentator — mic
  micHead: {
    width: 11,
    height: 13,
    borderRadius: 6,
    borderWidth: 2.4,
    borderColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  grill: {
    width: 5,
    height: 1.8,
    borderRadius: 1,
    backgroundColor: GOLD,
  },
  micNeck: {
    width: 2.4,
    height: 4,
    backgroundColor: WHITE,
  },
  micBase: {
    width: 13,
    height: 2.6,
    borderRadius: 1.5,
    backgroundColor: WHITE,
  },
  // Streamer — live rect + play
  liveRect: {
    width: 21,
    height: 15,
    borderRadius: 4,
    borderWidth: 2.4,
    borderColor: WHITE,
  },
  play: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: GOLD,
    marginLeft: 2,
  },
  liveDot: {
    position: "absolute",
    top: -1,
    right: 1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    borderWidth: 1,
    borderColor: WHITE,
  },
  // Organiser — gold trophy
  cup: {
    width: 15,
    height: 11,
    borderRadius: 3,
    borderWidth: 2.4,
    borderColor: GOLD,
  },
  stem: {
    width: 2.6,
    height: 5,
    backgroundColor: WHITE,
  },
  tBase: {
    width: 13,
    height: 2.8,
    borderRadius: 1.5,
    backgroundColor: WHITE,
  },
  // Academy — flag
  flagRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pole: {
    width: 2.6,
    height: 21,
    borderRadius: 1.5,
    backgroundColor: WHITE,
  },
  flag: {
    width: 11,
    height: 8,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: GOLD,
  },
  aBase: {
    width: 16,
    height: 2.8,
    borderRadius: 1.5,
    backgroundColor: WHITE,
    marginTop: 1,
    marginLeft: -11,
  },
  // Ground — ring + stumps + ball
  ring: {
    width: 25,
    height: 16,
    borderRadius: 12,
    borderWidth: 2.4,
    borderColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  stumps: {
    flexDirection: "row",
    gap: 2.5,
  },
  stump: {
    width: 2.2,
    height: 8,
    borderRadius: 1,
    backgroundColor: WHITE,
  },
  gBall: {
    position: "absolute",
    right: 1,
    top: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  // Box — nets cube
  cube: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2.4,
    borderColor: WHITE,
    alignItems: "center",
    justifyContent: "center",
  },
  netH: {
    position: "absolute",
    width: 13,
    height: 1.4,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  netV: {
    position: "absolute",
    width: 1.4,
    height: 13,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  // Cricket fallback — bat + ball
  bat: {
    width: 5,
    height: 20,
    borderRadius: 2.5,
    backgroundColor: WHITE,
    transform: [{ rotate: "32deg" }],
  },
  cBall: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GOLD,
  },
});
