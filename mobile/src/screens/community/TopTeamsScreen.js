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
  TEAM_BALL_TABS,
  TOP_TEAMS_LEATHER,
  TOP_TEAMS_TENNIS,
  initialsOf,
} from "../../data/cricLeaderboardData";

const RED = "#E01A22";
const TEAL = "#199A8E";
const TEAL_DARK = "#128076";

// Screenshot 4 — Top teams + Dream11 header
// Tabs: Leather ball | Tennis ball, empty state jab filter me kuch na mile

function EmptyArt() {
  return (
    <View style={styles.art}>
      <View style={styles.artHead}>
        <Text style={styles.artBack}>←</Text>
        <Text style={styles.artFilter}>∇</Text>
      </View>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.artRow}>
          <View style={styles.artDot} />
          <View>
            <View style={[styles.artLine, { width: 90 }]} />
            <View style={[styles.artLine, { width: 190, marginTop: 6 }]} />
          </View>
        </View>
      ))}
      <Text style={styles.artArrow}>⤴</Text>
    </View>
  );
}

function TeamRow({ item, index }) {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: item.bg }]}>
        <Text style={styles.avatarText}>{initialsOf(item.name)}</Text>
      </View>
      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name} <Text style={styles.city}>({item.city})</Text>
        </Text>
        <Text style={styles.stat}>
          <Text style={styles.dim}>Matches: </Text>
          <Text style={styles.valDark}>{item.matches}</Text>
          <Text style={styles.dim}> | Wins: </Text>
          <Text style={styles.valDark}>{item.wins}</Text>
        </Text>
      </View>
      <Text style={styles.rank}>{index + 1}</Text>
    </View>
  );
}

export default function TopTeamsScreen({ navigation }) {
  const [ball, setBall] = useState("Leather ball");
  const [infoOpen, setInfoOpen] = useState(false);

  const list = useMemo(
    () => (ball === "Leather ball" ? TOP_TEAMS_LEATHER : TOP_TEAMS_TENNIS),
    [ball]
  );

  const shareBoard = () => {
    Share.share({ message: `Top teams (${ball}) on CricState!` }).catch(
      () => {}
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Top teams
        </Text>
        <View style={styles.headerRight}>
          <HeaderIconBtn onPress={() => setInfoOpen(true)} label="Info">
            <Text style={styles.qGlyph}>?</Text>
          </HeaderIconBtn>
          <HeaderIconBtn onPress={shareBoard} label="Share">
            <ShareGlyph />
          </HeaderIconBtn>
          <View style={styles.filterBtn}>
            <Text style={styles.filterGlyph}>∇</Text>
          </View>
        </View>
      </DreamHeader>

      <View style={styles.tabs}>
        {TEAM_BALL_TABS.map((t) => (
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

      <Text style={styles.sub} numberOfLines={1}>
        <Text style={styles.subTeal}>Most Matches Played</Text> in{" "}
        <Text style={styles.subTeal}>
          New Bongaigaon Railway Colony (2026, ...
        </Text>
      </Text>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <EmptyArt />
          <Text style={styles.emptyText}>
            Sorry, we could not find any teams matching your criteria. Please
            choose different filters or reset filters.
          </Text>
          <TouchableOpacity
            style={styles.tennisBtn}
            activeOpacity={0.85}
            onPress={() => setBall("Tennis ball")}
          >
            <Text style={styles.tennisText}>Show Tennis ball teams</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TeamRow item={item} index={index} />
          )}
        />
      )}

      <Modal
        visible={infoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.dimCenter}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Top teams</Text>
            <Text style={styles.infoBody}>
              Teams are ranked by matches played in the selected region and
              ball type. Change the filter to see more teams.
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
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginLeft: 12,
  },
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
    alignItems: "center",
    justifyContent: "center",
  },
  filterGlyph: { color: TEAL, fontSize: 30, fontWeight: "800", marginTop: -4 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabText: { fontSize: 19, color: "#777" },
  tabTextOn: { color: "#111", fontWeight: "500" },
  tabUnder: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "70%",
    backgroundColor: RED,
    borderRadius: 2,
  },
  sub: { fontSize: 17, paddingHorizontal: 14, paddingVertical: 12, color: "#333" },
  subTeal: { color: TEAL_DARK, fontWeight: "500" },
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
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  mid: { flex: 1 },
  name: { fontSize: 18, fontWeight: "600", color: "#111" },
  city: { fontSize: 15, color: "#9A9A9A", fontWeight: "400", fontStyle: "italic" },
  stat: { fontSize: 15, marginTop: 4 },
  dim: { color: "#777" },
  valDark: { color: "#111", fontWeight: "600" },
  rank: { fontSize: 38, fontWeight: "300", color: "#111", marginLeft: 8 },
  empty: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 90 },
  art: {
    width: 300,
    borderWidth: 3,
    borderColor: "#E4E4E4",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingBottom: 12,
  },
  artHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  artBack: { fontSize: 22, color: "#9A9A9A" },
  artFilter: { fontSize: 22, color: "#9A9A9A" },
  artRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#F0F0F0",
  },
  artDot: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EDEDED", marginRight: 12 },
  artLine: { height: 10, borderRadius: 5, backgroundColor: "#EDEDED" },
  artArrow: { position: "absolute", top: 28, right: 30, fontSize: 64, color: "#111" },
  emptyText: { fontSize: 17, color: "#9A9A9A", textAlign: "center", marginTop: 22, lineHeight: 24 },
  tennisBtn: {
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 18,
  },
  tennisText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dimCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
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
