import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

// Screenshot 1 — CricHeroes leaderboards home
// 2-column white cards: Overall | Women's | Team + Dream11 red gradient header

function PodiumSingle() {
  return (
    <View style={icon.box}>
      <Text style={icon.star}>☆</Text>
      <View style={icon.podiumRow}>
        <View style={[icon.bar, { height: 18 }]} />
        <View style={[icon.bar, { height: 28 }]} />
        <View style={[icon.bar, { height: 14 }]} />
      </View>
    </View>
  );
}

function WomenGlyph() {
  return (
    <View style={icon.box}>
      <View style={icon.wHead} />
      <View style={icon.wHair} />
      <View style={icon.wBody}>
        <View style={icon.wNeck} />
      </View>
    </View>
  );
}

function PodiumTeam() {
  return (
    <View style={icon.box}>
      <View style={icon.starRow}>
        <Text style={icon.starSm}>☆</Text>
        <Text style={icon.starLg}>☆</Text>
        <Text style={icon.starSm}>☆</Text>
      </View>
      <View style={icon.podiumRow}>
        <View style={[icon.bar, { height: 18 }]} />
        <View style={[icon.bar, { height: 28 }]} />
        <View style={[icon.bar, { height: 18 }]} />
      </View>
    </View>
  );
}

function MenuCard({ label, onPress, children }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {children}
      <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CricLeaderboardsHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          CricHeroes leaderboards
        </Text>
        <View style={{ width: 40 }} />
      </DreamHeader>

      <View style={styles.body}>
        <View style={styles.grid}>
          <MenuCard
            label="Overall"
            onPress={() =>
              navigation?.navigate?.("CricLeaderboardDetail", { type: "overall" })
            }
          >
            <PodiumSingle />
          </MenuCard>
          <MenuCard
            label="Women's"
            onPress={() =>
              navigation?.navigate?.("CricLeaderboardDetail", { type: "womens" })
            }
          >
            <WomenGlyph />
          </MenuCard>
          <MenuCard
            label="Team"
            onPress={() => navigation?.navigate?.("TopTeams")}
          >
            <PodiumTeam />
          </MenuCard>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    paddingBottom: 17,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  body: { flex: 1, backgroundColor: "#F5F5F5", padding: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47.5%",
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 34,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardLabel: { fontSize: 21, color: "#111", marginTop: 12, fontWeight: "400" },
});

const icon = StyleSheet.create({
  box: { height: 76, alignItems: "center", justifyContent: "flex-end" },
  star: { fontSize: 34, color: "#111", fontWeight: "300", marginBottom: 2 },
  starRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginBottom: 2 },
  starSm: { fontSize: 18, color: "#111" },
  starLg: { fontSize: 28, color: "#111", marginBottom: -2 },
  podiumRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderBottomWidth: 3,
    borderColor: "#111",
    paddingBottom: 0,
  },
  bar: {
    width: 22,
    borderWidth: 2.5,
    borderColor: "#111",
    borderBottomWidth: 0,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginHorizontal: 1.5,
    backgroundColor: "#fff",
  },
  wHead: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  wHair: {
    position: "absolute",
    top: 2,
    right: 8,
    width: 10,
    height: 22,
    borderRadius: 5,
    borderWidth: 2.5,
    borderColor: "#111",
    backgroundColor: "#fff",
  },
  wBody: {
    width: 52,
    height: 26,
    borderWidth: 2.5,
    borderColor: "#111",
    borderRadius: 8,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  wNeck: { width: 20, height: 8, borderWidth: 2, borderColor: "#111", borderRadius: 4 },
});
