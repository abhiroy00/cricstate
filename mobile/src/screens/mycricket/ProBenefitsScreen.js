import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const BG = "#141414";
const CARD = "#1F2A2E";
const TEAL = "#00A651";
const TEAL_BRIGHT = "#1FA89B";
const RED = "#E01A22";

const PRIVILEGES = [
  { icon: "📊", text: "Track your\nprogress" },
  { icon: "🏏", text: "Check your stats" },
  { icon: "✨", text: "Get your AI\ninsights" },
  { icon: "🏆", text: "Know your ranking" },
  { icon: "🚫", text: "No full screen ads" },
  { icon: "🛍️", text: "Get store\ndiscounts" },
  { icon: "🎖️", text: "PRO club access", proClub: true },
  { icon: "🎨", text: "Personalize your\napp" },
];

const PLANS = [
  { key: "3m", title: "3 Months", price: "₹199", sub: "₹66 per month" },
  { key: "1y", title: "1 Year", price: "₹399", sub: "₹33 per month", popular: true },
  { key: "life", title: "Lifetime", price: "₹3,999", sub: "Free PRO T-Shirt" },
];

const PHONE_STATS = [
  ["1519", "Mat"],
  ["1230", "Inns"],
  ["247", "NO"],
  ["17750", "Runs"],
  ["92", "HS"],
  ["18.06", "Avg"],
  ["156.29", "SR"],
  ["127", "30s"],
  ["59", "50s"],
  ["0", "100s"],
  ["1376", "4s"],
  ["1112", "6s"],
  ["148", "Ducks"],
  ["978", "Won"],
  ["510", "Loss"],
];

function PhoneMock() {
  return (
    <View style={styles.phone}>
      <View style={styles.phoneHeader}>
        <Text style={styles.phoneBack}>←</Text>
        <Text style={styles.phoneName}>Chintan Shah</Text>
        <Text style={styles.phoneIcons}>💬 🏆 🔽</Text>
      </View>
      <View style={styles.phoneTabs}>
        {["Matches", "Stats", "Awards", "Badges", "Teams"].map((t) => (
          <Text key={t} style={[styles.phoneTab, t === "Stats" && styles.phoneTabActive]}>
            {t}
          </Text>
        ))}
      </View>
      <View style={styles.phonePills}>
        {["Batting", "Bowling", "Fielding", "Captain"].map((p) => (
          <View key={p} style={[styles.phonePill, p === "Batting" && styles.phonePillActive]}>
            <Text style={[styles.phonePillText, p === "Batting" && styles.phonePillTextActive]}>
              {p}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.phoneOverallRow}>
        <Text style={styles.phoneOverall}>Overall</Text>
        <View style={styles.phoneCompare}>
          <Text style={styles.phoneCompareText}>⛉ Compare</Text>
        </View>
      </View>
      <View style={styles.phoneGrid}>
        {PHONE_STATS.map(([v, l]) => (
          <View key={l} style={styles.phoneCell}>
            <Text style={styles.phoneCellValue}>{v}</Text>
            <Text style={styles.phoneCellLabel}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={styles.phoneBallRow}>
        <Text style={styles.phoneBall}>Leather Ball 🔴</Text>
        <Text style={styles.phoneWW}>ⓦ ww ▦</Text>
      </View>
      <View style={styles.phoneGrid}>
        {[
          ["10", "Mat"],
          ["9", "Inns"],
          ["5", "NO"],
          ["44", "Runs"],
          ["15*", "HS"],
          ["11", "Avg"],
        ].map(([v, l]) => (
          <View key={l + v} style={styles.phoneCell}>
            <Text style={styles.phoneCellValue}>{v}</Text>
            <Text style={styles.phoneCellLabel}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ProBenefitsScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState("3m");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>Why become PRO?</Text>
        <View style={styles.backBtn} />
      </DreamHeader>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.privHeader}>
          <View style={styles.privLine} />
          <View style={styles.proPill}>
            <Text style={styles.proPillText}>PRO</Text>
          </View>
          <Text style={styles.privTitle}> Privileges</Text>
          <View style={styles.privLine} />
        </View>

        <View style={styles.mainRow}>
          <View style={styles.phoneWrap}>
            <PhoneMock />
          </View>
          <View style={styles.privList}>
            {PRIVILEGES.map((p) => (
              <View key={p.text} style={styles.privCard}>
                {p.proClub ? (
                  <View style={styles.clubBadge}>
                    <Text style={styles.clubBadgeText}>PRO{"\n"}CLUB</Text>
                  </View>
                ) : (
                  <Text style={styles.privIcon}>{p.icon}</Text>
                )}
                <Text style={styles.privText}>{p.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.plansRow}>
          {PLANS.map((p) => {
            const active = p.key === selectedPlan;
            return (
              <TouchableOpacity
                key={p.key}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(p.key)}
                style={[styles.planCard, active && styles.planCardActive]}
              >
                {p.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
                {active && (
                  <View style={styles.planCheck}>
                    <Text style={styles.planCheckText}>✓</Text>
                  </View>
                )}
                <Text style={styles.planTitle}>{p.title}</Text>
                <View style={styles.planSpacer} />
                <Text style={styles.planPrice}>{p.price}</Text>
                <View style={styles.planSubWrap}>
                  <Text style={styles.planSub}>{p.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.terms}>
          By continuing, you accept all <Text style={styles.termsLink}>terms & conditions</Text> and{" "}
          <Text style={styles.termsLink}>privacy policy</Text>.
        </Text>

        <View style={styles.proofStrip}>
          <Text style={styles.proofText}>
            <Text style={styles.proofBold}>4.50 lakhs+</Text> cricketers now experiencing PRO
          </Text>
        </View>

        <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
          <Text style={styles.ctaText}>Become a better cricketer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
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
    backgroundColor: BG,
  },
  backBtn: {
    width: 40,
    padding: 4,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingBottom: 28,
  },
  privHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 6,
  },
  privLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2c3a3e",
  },
  proPill: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
  },
  proPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  privTitle: {
    color: "#ddd",
    fontSize: 17,
    marginRight: 10,
  },
  mainRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 16,
  },
  phoneWrap: {
    flex: 1,
    marginRight: 8,
  },
  phone: {
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#333",
    overflow: "hidden",
    paddingBottom: 10,
  },
  phoneHeader: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  phoneBack: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  phoneName: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  phoneIcons: {
    fontSize: 11,
  },
  phoneTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  phoneTab: {
    fontSize: 8,
    color: "#999",
  },
  phoneTabActive: {
    color: RED,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  phonePills: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
  },
  phonePill: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  phonePillActive: {
    backgroundColor: TEAL,
  },
  phonePillText: {
    fontSize: 8,
    color: "#666",
  },
  phonePillTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  phoneOverallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 2,
  },
  phoneOverall: {
    fontSize: 10,
    fontWeight: "700",
    color: "#222",
  },
  phoneCompare: {
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  phoneCompareText: {
    fontSize: 8,
    color: TEAL,
    fontWeight: "700",
  },
  phoneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
  },
  phoneCell: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: "#f0f0f0",
  },
  phoneCellValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#222",
  },
  phoneCellLabel: {
    fontSize: 7,
    color: "#999",
  },
  phoneBallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  phoneBall: {
    fontSize: 9,
    fontWeight: "600",
    color: "#333",
  },
  phoneWW: {
    fontSize: 9,
    color: TEAL,
  },
  privList: {
    flex: 1.05,
    marginLeft: 8,
    justifyContent: "space-between",
  },
  privCard: {
    backgroundColor: CARD,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2c3a3e",
  },
  privIcon: {
    fontSize: 24,
    width: 34,
    textAlign: "center",
  },
  clubBadge: {
    width: 34,
    alignItems: "center",
  },
  clubBadgeText: {
    color: TEAL_BRIGHT,
    fontSize: 8,
    fontWeight: "800",
    textAlign: "center",
    borderWidth: 1,
    borderColor: TEAL_BRIGHT,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  privText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 18,
  },
  plansRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 18,
  },
  planCard: {
    flex: 1,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 5,
    minHeight: 128,
  },
  planCardActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  popularBadge: {
    position: "absolute",
    top: -11,
    alignSelf: "center",
    backgroundColor: RED,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  planCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  planCheckText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  planTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  planSpacer: {
    flex: 1,
  },
  planPrice: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  planSubWrap: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    marginHorizontal: -12,
    marginBottom: -12,
    marginTop: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  planSub: {
    color: "#fff",
    fontSize: 11,
  },
  terms: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 18,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: TEAL_BRIGHT,
    textDecorationLine: "underline",
  },
  proofStrip: {
    backgroundColor: "#2b2b2b",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#3a3a3a",
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  proofText: {
    color: "#bbb",
    fontSize: 13,
    textAlign: "center",
  },
  proofBold: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  cta: {
    backgroundColor: TEAL_BRIGHT,
    borderRadius: 6,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
