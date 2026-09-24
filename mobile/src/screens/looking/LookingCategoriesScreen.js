import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#D71920";

const TILES = [
  { label: "Teams for my tournament", emoji: "👥", type: "Player", need: "Players for tournament" },
  { label: "Tournaments to join", emoji: "🏆", type: "Player", need: "Tournament to join" },
  { label: "Opponent teams", emoji: "⚔️", type: "Opponent", need: "" },
  { label: "Teams to join", emoji: "🤝", type: "Player", need: "Team to join" },
  { label: "Players for my team", emoji: "🧍", type: "Player", need: "" },
  { label: "Cricket grounds", emoji: "🏟️", type: "Player", need: "Cricket ground" },
  { label: "Umpires", emoji: "🧢", type: "Umpire", need: "" },
  { label: "Scorers", emoji: "📋", type: "Scorer", need: "" },
  { label: "Commentators", emoji: "🎙️", type: "Player", need: "Commentator" },
  { label: "Live streamers", emoji: "🔴", type: "Player", need: "Live streamer" },
];

export default function LookingCategoriesScreen({ navigation }) {
  const pick = (tile) => {
    navigation.navigate("LookingMain", {
      compose: { type: tile.type, need: tile.need },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={12}
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What are you looking for?</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {TILES.map((t) => (
            <TouchableOpacity
              key={t.label}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() => pick(t)}
            >
              <Text style={styles.tileEmoji}>{t.emoji}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.adBox}>
          <Text style={styles.adBrand}>FortuneGems</Text>
          <Text style={styles.adSub}>Sponsored • Play responsibly</Text>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 12,
  },
  tile: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    paddingVertical: 26,
    paddingHorizontal: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileEmoji: {
    fontSize: 52,
    color: "#111",
  },
  tileLabel: {
    fontSize: 15,
    color: "#111",
    marginTop: 12,
    textAlign: "center",
  },
  adBox: {
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#7A0E14",
    padding: 20,
    alignItems: "center",
  },
  adBrand: {
    color: "#FFD23F",
    fontSize: 22,
    fontWeight: "900",
  },
  adSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
});
