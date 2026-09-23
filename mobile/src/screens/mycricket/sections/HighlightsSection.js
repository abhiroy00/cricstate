import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TEAL = "#199A8E";
const PILL_BG = "#E9E7E7";

const FILTERS = [
  { key: "YOUR", label: "Your Highlights" },
  { key: "DOWNLOADS", label: "My downloads" },
];

function AiPlayIcon() {
  return (
    <View style={styles.iconWrap}>
      {/* circular arrow */}
      <View style={styles.iconRing} />
      <View style={styles.iconGap} />
      {/* play triangle */}
      <Text style={styles.iconPlay}>▶</Text>
      {/* sparkle */}
      <Text style={styles.iconSpark}>✦</Text>
    </View>
  );
}

export default function HighlightsSection({ navigation }) {
  const [filter, setFilter] = useState("YOUR");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* AI banner */}
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText} numberOfLines={2}>
          See how AI captures your best moments.
        </Text>
        <TouchableOpacity
          style={styles.topPill}
          activeOpacity={0.8}
          onPress={() => navigation?.navigate("AiHighlights", { from: filter })}
        >
          <Text style={styles.topPillText}>Explore</Text>
        </TouchableOpacity>
      </View>

      {/* Pills */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.emptyWrap}>
        <AiPlayIcon />
        <Text style={styles.emptyText}>
          Live stream your matches and let AI automatically create your best moments.
        </Text>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate("AiHighlights", { from: filter })}
        >
          <Text style={styles.ctaText}>See how it works</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 32,
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  topBannerText: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
    marginRight: 8,
  },
  topPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  topPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  filterPill: {
    backgroundColor: PILL_BG,
    borderRadius: 22,
    paddingHorizontal: 26,
    paddingVertical: 10,
    marginHorizontal: 6,
  },
  filterPillActive: {
    backgroundColor: TEAL,
  },
  filterText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 120,
  },
  iconWrap: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: "#777",
    borderRightColor: "transparent",
    transform: [{ rotate: "40deg" }],
  },
  iconGap: {
    position: "absolute",
  },
  iconPlay: {
    position: "absolute",
    fontSize: 26,
    color: "#777",
    marginLeft: 4,
  },
  iconSpark: {
    position: "absolute",
    top: 2,
    right: 8,
    fontSize: 34,
    color: "#777",
  },
  emptyText: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 26,
  },
  cta: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginTop: 18,
    width: 250,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
