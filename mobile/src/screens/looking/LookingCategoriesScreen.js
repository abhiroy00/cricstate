import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";

const TILES = [
  { label: "Teams for my tournament", emoji: "👥", formKey: "tournament-teams" },
  { label: "Tournaments to join", emoji: "🏆", formKey: "tournaments-join" },
  { label: "Opponent teams", emoji: "⚔️", formKey: "opponent" },
  { label: "Teams to join", emoji: "🤝", formKey: "teams-join" },
  { label: "Players for my team", emoji: "🧍", formKey: "players" },
  { label: "Cricket grounds", emoji: "🏟️", formKey: "grounds" },
  { label: "Umpires", emoji: "🧢", formKey: "umpires" },
  { label: "Scorers", emoji: "📋", formKey: "scorers" },
  { label: "Commentators", emoji: "🎙️", formKey: "commentators" },
  { label: "Live streamers", emoji: "🔴", formKey: "live" },
];

export default function LookingCategoriesScreen({ navigation }) {
  const pick = (tile) => {
    if (tile.formKey === "live") {
      navigation.navigate("LiveStreamers");
      return;
    }
    navigation.navigate("LookingForm", { formKey: tile.formKey });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>What are you looking for?</Text>
        <View style={{ width: 36 }} />
      </DreamHeader>

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
    backgroundColor: "#9A3412",
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
