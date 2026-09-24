import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn, ShareGlyph } from "../../components/HeaderIcon";
import {
  BALL_TABS,
  SKILL_PILLS,
  boardFor,
  initialsOf,
  subtitleFor,
} from "../../data/cricLeaderboardData";

const RED = "#E01A22";
const TEAL = "#199A8E";
const TEAL_DARK = "#128076";

// Screenshots 2-3 — CricHeroes batting leaderboard + Dream11 header
// Tabs: Leather | Tennis | Box cricket, Pills: Batting | Bowling | Fielding

function Avatar({ item }) {
  return (
    <View style={styles.avatarWrap}>
      <View style={[styles.avatar, { backgroundColor: item.bg }]}>
        <Text style={styles.avatarText}>{initialsOf(item.name)}</Text>
      </View>
      {item.pro && (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      )}
    </View>
  );
}

function StatLine({ item, skill }) {
  if (skill === "Bowling") {
    return (
      <Text style={styles.stat}>
        <Text style={styles.dim}>Inn: </Text>
        <Text style={styles.val}>{item.inn}</Text>
        <Text style={styles.dim}> | Wkts: </Text>
        <Text style={styles.valDark}>{item.runs}</Text>
        <Text style={styles.dim}> | Avg: </Text>
        <Text style={styles.val}>{item.avg}</Text>
        <Text style={styles.dim}> | Eco: </Text>
        <Text style={styles.val}>{item.sr}</Text>
      </Text>
    );
  }
  if (skill === "Fielding") {
    return (
      <Text style={styles.stat}>
        <Text style={styles.dim}>Inn: </Text>
        <Text style={styles.val}>{item.inn}</Text>
        <Text style={styles.dim}> | Catches: </Text>
        <Text style={styles.valDark}>{item.runs}</Text>
        <Text style={styles.dim}> | Avg: </Text>
        <Text style={styles.val}>{item.avg}</Text>
      </Text>
    );
  }
  return (
    <Text style={styles.stat}>
      <Text style={styles.dim}>Inn: </Text>
      <Text style={styles.val}>{item.inn}</Text>
      <Text style={styles.dim}> | Runs: </Text>
      <Text style={styles.valDark}>{item.runs}</Text>
      <Text style={styles.dim}> | Avg: </Text>
      <Text style={styles.val}>{item.avg}</Text>
      <Text style={styles.dim}> | SR: </Text>
      <Text style={styles.val}>{item.sr}</Text>
    </Text>
  );
}

function RankRow({ item, index, skill }) {
  return (
    <View style={styles.row}>
      <Avatar item={item} />
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name} <Text style={styles.city}>({item.city})</Text>
        </Text>
        <StatLine item={item} skill={skill} />
      </View>
      <Text style={styles.rank}>{index + 1}</Text>
    </View>
  );
}

export default function CricLeaderboardDetailScreen({ navigation, route }) {
  const type = route?.params?.type === "womens" ? "womens" : "overall";
  const [ball, setBall] = useState("Leather");
  const [skill, setSkill] = useState("Batting");
  const [infoOpen, setInfoOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const full = useMemo(() => boardFor(type, skill), [type, skill]);
  const list = useMemo(() => {
    if (ball === "Tennis") return full.slice(0, 5);
    if (ball === "Box cricket") return full.slice(0, 3);
    return full;
  }, [full, ball]);

  const title = type === "womens" ? "Women's leaderboard" : "Leaderboard";

  const shareBoard = () => {
    Share.share({
      message: `${title} — ${subtitleFor(skill)}: ${list
        .slice(0, 3)
        .map((e, i) => `${i + 1}. ${e.name}`)
        .join(", ")}`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>
          <HeaderIconBtn onPress={() => setInfoOpen(true)} label="Info">
            <Text style={styles.qGlyph}>?</Text>
          </HeaderIconBtn>
          <HeaderIconBtn onPress={shareBoard} label="Share">
            <ShareGlyph />
          </HeaderIconBtn>
          <TouchableOpacity
            hitSlop={10}
            onPress={() => setFilterOpen(true)}
            activeOpacity={0.7}
            style={styles.filterBtn}
          >
            <Text style={styles.filterGlyph}>∇</Text>
            {ball !== "Leather" && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
      </DreamHeader>

      <View style={styles.tabs}>
        {BALL_TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => setBall(t)}
          >
            <Text style={[styles.tabText, ball === t && styles.tabTextOn]}>
              {t}
            </Text>
            {ball === t && <View style={styles.tabUnder} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.pills}>
        {SKILL_PILLS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.pill, skill === p && styles.pillOn]}
            activeOpacity={0.8}
            onPress={() => setSkill(p)}
          >
            <Text style={[styles.pillText, skill === p && styles.pillTextOn]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sub}>
        <Text style={styles.subTeal}>
          {skill === "Batting"
            ? "Most runs"
            : skill === "Bowling"
              ? "Most wickets"
              : "Most catches"}
        </Text>{" "}
        in <Text style={styles.subDark}>India (All Time, All Overs)</Text>
      </Text>

      <FlatList
        data={list}
        keyExtractor={(i) => `${type}-${skill}-${ball}-${i.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <RankRow item={item} index={index} skill={skill} />
        )}
      />

      {/* Filter sheet — ball type */}
      <Modal
        visible={filterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setFilterOpen(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Filter by ball type</Text>
            {BALL_TABS.map((t) => (
              <TouchableOpacity
                key={t}
                style={styles.sheetRow}
                activeOpacity={0.8}
                onPress={() => {
                  setBall(t);
                  setFilterOpen(false);
                }}
              >
                <Text style={[styles.sheetText, ball === t && styles.sheetOn]}>
                  {t}
                </Text>
                {ball === t && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Info — ranking kaise banti hai */}
      <Modal
        visible={infoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.dimCenter}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setInfoOpen(false)}
          />
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>How ranking works</Text>
            <Text style={styles.infoBody}>
              Ranks are based on {skill.toLowerCase()} stats in India across all
              time and all overs for {ball.toLowerCase()} cricket.
            </Text>
            <TouchableOpacity
              style={styles.infoBtn}
              activeOpacity={0.85}
              onPress={() => setInfoOpen(false)}
            >
              <Text style={styles.infoBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 15,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerTitle: { flex: 1, color: "#fff", fontSize: 22, fontWeight: "800", marginLeft: 8 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  qGlyph: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    borderWidth: 2,
    borderColor: "#fff",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 21,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  filterGlyph: { color: TEAL, fontSize: 30, fontWeight: "800", marginTop: -4 },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RED,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 17, color: "#777" },
  tabTextOn: { color: "#111", fontWeight: "600" },
  tabUnder: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "80%",
    backgroundColor: RED,
    borderRadius: 2,
  },
  pills: { flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 12 },
  pill: {
    backgroundColor: "#E9E9EE",
    borderRadius: 20,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  pillOn: { backgroundColor: TEAL },
  pillText: { fontSize: 17, color: "#111" },
  pillTextOn: { color: "#fff", fontWeight: "500" },
  sub: { fontSize: 16, paddingHorizontal: 14, paddingVertical: 8, fontWeight: "600" },
  subTeal: { color: TEAL_DARK },
  subDark: { color: "#333", fontWeight: "400" },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarWrap: { marginRight: 12 },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  proBadge: {
    position: "absolute",
    top: -4,
    left: -6,
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  proText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  mid: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600", color: "#111" },
  city: { fontSize: 15, color: "#9A9A9A", fontWeight: "400", fontStyle: "italic" },
  stat: { fontSize: 15, marginTop: 4, lineHeight: 20 },
  dim: { color: "#777" },
  val: { color: "#333" },
  valDark: { color: "#111", fontWeight: "600" },
  rank: { fontSize: 38, fontWeight: "300", color: "#111", marginLeft: 8, minWidth: 34, textAlign: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: "#111", marginBottom: 6 },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  sheetText: { fontSize: 16, color: "#111" },
  sheetOn: { color: TEAL_DARK, fontWeight: "700" },
  tick: { fontSize: 18, color: TEAL_DARK, fontWeight: "800" },
  dimCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  infoBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%" },
  infoTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  infoBody: { fontSize: 15, lineHeight: 22, color: "#444", marginTop: 8 },
  infoBtn: {
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  infoBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
