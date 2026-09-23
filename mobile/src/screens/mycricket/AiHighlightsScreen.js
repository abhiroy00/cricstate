import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEAL = "#199A8E";
const TEAL_DARK = "#0E6B64";
const RED = "#C81E1E";

const PLANS = [
  { key: "player-highlights", title: "Player\nhighlights", sub: "", oldPrice: "₹49", price: "₹29" },
  { key: "match-highlights", title: "Match\nhighlights", sub: "", oldPrice: "₹99", price: "₹49" },
  {
    key: "player-pass",
    title: "Player pass",
    sub: "For 10 player highlights",
    oldPrice: "₹290",
    price: "₹249",
  },
  {
    key: "match-pass",
    title: "Match pass",
    sub: "Top 10 match highlights",
    oldPrice: "₹490",
    price: "₹449",
  },
];

function PhoneVideoMock() {
  return (
    <View style={styles.phoneFrame}>
      <View style={styles.phoneField}>
        <View style={styles.phonePitch} />
        <View style={[styles.fielder, { left: 26, top: 44 }]} />
        <View style={[styles.fielder, { left: 150, top: 52, backgroundColor: "#1a3a6b" }]} />
        <View style={[styles.fielder, { left: 210, top: 40, backgroundColor: "#1a73e8" }]} />
        <View style={[styles.fielder, { left: 120, top: 66 }]} />
        <View style={styles.stumps} />
        <Text style={styles.sixBadge}>6</Text>
      </View>
      <View style={styles.scoreBar}>
        <View style={styles.scoreLeft}>
          <Text style={styles.scoreTeam}>PCC</Text>
          <Text style={styles.scoreMid}>21-0 / (2.0)</Text>
          <Text style={styles.scoreTeam}>FCC</Text>
        </View>
        <View style={styles.scoreRight}>
          <Text style={styles.scoreName}>ROHIT</Text>
          <Text style={styles.scoreRuns}>12-0 (1)</Text>
        </View>
      </View>
    </View>
  );
}

function StripThumb() {
  return (
    <View style={styles.strip}>
      <View style={styles.stripStumps}>
        <View style={styles.stripStump} />
        <View style={styles.stripStump} />
        <View style={styles.stripStump} />
      </View>
      <View style={styles.stripPlayer} />
      <View style={styles.stripBat} />
    </View>
  );
}

function Hero({ onCta }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroGrey}>Turn your match into a</Text>
      <Text style={styles.heroRed}>story worth sharing.</Text>
      <Text style={styles.heroSub}>
        Automatically crafted highlight videos of your live streamed matches, powered by AI.
      </Text>
      <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85} onPress={onCta}>
        <Text style={styles.heroBtnText}>Get your highlights</Text>
      </TouchableOpacity>

      <View style={styles.stripWrap}>
        <StripThumb />
      </View>
      <PhoneVideoMock />
      <View style={[styles.stripWrap, styles.stripFaded]}>
        <StripThumb />
      </View>

      <Text style={styles.trustText}>
        Over 6,80,000+ AI highlights generated.{"\n"}Trusted by 15,000+ players and organizers.
      </Text>
    </View>
  );
}

function Plans({ selected, onSelect, onCta }) {
  return (
    <View style={styles.plansWrap}>
      <Text style={styles.plansTitle}>Choose your plan</Text>
      <View style={styles.plansGrid}>
        {PLANS.map((p) => {
          const active = p.key === selected;
          return (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.85}
              onPress={() => onSelect(p.key)}
              style={[styles.planCard, active && styles.planCardActive]}
            >
              {active && (
                <View style={styles.planCheck}>
                  <Text style={styles.planCheckText}>✓</Text>
                </View>
              )}
              <Text style={[styles.planTitle, active && styles.planTitleActive]}>{p.title}</Text>
              {!!p.sub && <Text style={styles.planSub}>{p.sub}</Text>}
              <View style={styles.priceRow}>
                <Text style={[styles.oldPrice, active && styles.oldPriceActive]}>{p.oldPrice}</Text>
                <Text style={[styles.price, active && styles.priceActive]}>{p.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={styles.getStarted} activeOpacity={0.85} onPress={onCta}>
        <Text style={styles.getStartedText}>Get started</Text>
      </TouchableOpacity>
      <Text style={styles.offerText}>Limited time offer! Get highlights at a discounted price.</Text>
    </View>
  );
}

function PlayerHighlightsCard({ onSample }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.batsmanArt}>
        <Text style={styles.batsmanEmoji}>🏏</Text>
      </View>
      <View style={styles.featureBody}>
        <Text style={styles.featureTitle}>Player Highlights</Text>
        <Text style={styles.featureSub}>Your innings. In one complete video.</Text>
        <Text style={styles.bullet}>• All boundaries compiled together</Text>
        <Text style={styles.bullet}>• Wickets in sequence</Text>
        <Text style={styles.bullet}>• Skip the manual editing</Text>
        <TouchableOpacity style={styles.sampleBtn} activeOpacity={0.85} onPress={onSample}>
          <Text style={styles.sampleBtnText}>View sample highlights</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MatchHighlightsCard() {
  return (
    <View style={styles.featureCard}>
      <View style={styles.teamArt}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.teamMan}>
            <View style={styles.teamHead} />
            <View style={styles.teamBody} />
          </View>
        ))}
      </View>
      <View style={styles.featureBody}>
        <Text style={styles.featureTitle}>Match Highlights</Text>
        <Text style={styles.featureSub}>Every big moment. In one video.</Text>
        <Text style={styles.bullet}>• Turning points auto-detected</Text>
        <Text style={styles.bullet}>• Ready to share with your team</Text>
      </View>
    </View>
  );
}

export default function AiHighlightsScreen({ navigation, route }) {
  const from = route?.params?.from || "YOUR";
  const [plan, setPlan] = useState("player-highlights");

  const goSample = () => navigation?.navigate("StartMatch");
  const goHighlightsTab = () => navigation?.navigate("MyCricketHome", { section: "HIGHLIGHTS" });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={styles.redStrip} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[0]}
      >
        {/* floating white bar — back + AI Highlights + Get started (sticks on scroll) */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBox}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>✨ AI Highlights</Text>
          <TouchableOpacity
            style={styles.topBarCta}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate("StartMatch")}
          >
            <Text style={styles.topBarCtaText}>Get started</Text>
          </TouchableOpacity>
        </View>

        <Hero onCta={goHighlightsTab} />
        <Plans selected={plan} onSelect={setPlan} onCta={goSample} />
        <View style={styles.storyWrap}>
          <Text style={styles.storyTitle}>
            Every innings has a story.{"\n"}Every match has turning points.
          </Text>
          <PlayerHighlightsCard onSample={goSample} />
          <MatchHighlightsCard />
          {from === "DOWNLOADS" && (
            <Text style={styles.dlNote}>Your downloaded highlights will appear here.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RED,
  },
  redStrip: {
    height: 6,
    backgroundColor: RED,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  backBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 26,
    color: "#111",
    fontWeight: "600",
  },
  topBarTitle: {
    flex: 1,
    fontSize: 22,
    color: "#111",
    fontWeight: "600",
    marginLeft: 12,
  },
  topBarCta: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  topBarCtaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroGrey: {
    fontSize: 34,
    color: "#777",
    textAlign: "center",
    lineHeight: 40,
  },
  heroRed: {
    fontSize: 34,
    color: RED,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 42,
  },
  heroSub: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  heroBtn: {
    backgroundColor: TEAL,
    borderRadius: 24,
    paddingHorizontal: 34,
    paddingVertical: 13,
    marginTop: 20,
  },
  heroBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  stripWrap: {
    width: "100%",
    marginTop: 28,
  },
  stripFaded: {
    opacity: 0.45,
    marginTop: 12,
  },
  strip: {
    height: 84,
    borderRadius: 12,
    backgroundColor: "#d9c39a",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: "#eee",
  },
  stripStumps: {
    flexDirection: "row",
    marginBottom: 18,
  },
  stripStump: {
    width: 4,
    height: 34,
    backgroundColor: "#e8a34c",
    marginRight: 4,
    borderRadius: 2,
  },
  stripPlayer: {
    width: 44,
    height: 60,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginLeft: 30,
    marginBottom: 8,
    opacity: 0.9,
  },
  stripBat: {
    width: 8,
    height: 44,
    backgroundColor: "#c98f4e",
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 14,
    transform: [{ rotate: "18deg" }],
  },
  phoneFrame: {
    width: "100%",
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#222",
    overflow: "hidden",
    backgroundColor: "#7cb342",
  },
  phoneField: {
    height: 190,
    backgroundColor: "#7cb342",
  },
  phonePitch: {
    position: "absolute",
    left: 110,
    top: 30,
    width: 90,
    height: 150,
    backgroundColor: "#c9a86a",
    borderRadius: 4,
    opacity: 0.9,
  },
  fielder: {
    position: "absolute",
    width: 14,
    height: 22,
    borderRadius: 7,
    backgroundColor: "#0d47a1",
  },
  stumps: {
    position: "absolute",
    left: 190,
    top: 90,
    width: 10,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  sixBadge: {
    position: "absolute",
    right: 14,
    top: 8,
    fontSize: 34,
    fontWeight: "800",
    color: "rgba(255,255,255,0.75)",
  },
  scoreBar: {
    backgroundColor: "#111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTopWidth: 3,
    borderTopColor: "#f39c12",
  },
  scoreLeft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f39c12",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreTeam: {
    fontSize: 9,
    fontWeight: "700",
    color: "#111",
  },
  scoreMid: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111",
    marginHorizontal: 6,
  },
  scoreRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreName: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "600",
    marginRight: 12,
  },
  scoreRuns: {
    fontSize: 9,
    color: "#fff",
  },
  trustText: {
    fontSize: 15,
    color: "#777",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 22,
  },
  plansWrap: {
    backgroundColor: "#f4f4f4",
    marginTop: 26,
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  plansTitle: {
    fontSize: 26,
    color: "#111",
    textAlign: "center",
    fontWeight: "500",
  },
  plansGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 22,
  },
  planCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    minHeight: 130,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  planCardActive: {
    backgroundColor: TEAL,
    borderColor: TEAL_DARK,
  },
  planCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  planCheckText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: "800",
  },
  planTitle: {
    fontSize: 19,
    color: "#111",
    lineHeight: 23,
  },
  planTitleActive: {
    color: "#fff",
  },
  planSub: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 14,
  },
  oldPrice: {
    fontSize: 15,
    color: "#888",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  oldPriceActive: {
    color: "rgba(255,255,255,0.8)",
  },
  price: {
    fontSize: 26,
    color: "#111",
    fontWeight: "700",
  },
  priceActive: {
    color: "#fff",
  },
  getStarted: {
    backgroundColor: TEAL,
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  getStartedText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  offerText: {
    color: TEAL,
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
  storyWrap: {
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  storyTitle: {
    fontSize: 24,
    color: "#111",
    textAlign: "center",
    lineHeight: 32,
    fontWeight: "500",
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  batsmanArt: {
    height: 200,
    backgroundColor: "#bcd7f5",
    alignItems: "center",
    justifyContent: "center",
  },
  batsmanEmoji: {
    fontSize: 90,
  },
  featureBody: {
    padding: 18,
  },
  featureTitle: {
    fontSize: 26,
    color: "#111",
    fontWeight: "500",
  },
  featureSub: {
    fontSize: 15,
    color: "#888",
    marginTop: 4,
  },
  bullet: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
  },
  sampleBtn: {
    backgroundColor: TEAL,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },
  sampleBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  teamArt: {
    height: 150,
    backgroundColor: "#8fbf6f",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 14,
  },
  teamMan: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  teamHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#5d4037",
  },
  teamBody: {
    width: 30,
    height: 44,
    borderRadius: 6,
    backgroundColor: "#f5f5f5",
    marginTop: 4,
  },
  dlNote: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 22,
  },
});
