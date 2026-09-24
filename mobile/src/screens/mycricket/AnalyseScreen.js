import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#EA580C";
const RED_DARK = "#A31212";
const TEAL = "#1FA89B";
const DARK = "#101010";
const DARK_CARD = "#161616";

const TABS = ["Batting", "Bowling", "Compare", "Face off"];

function SectionHead({ title }) {
  return (
    <View style={styles.secHead}>
      <Text style={styles.secTitle}>{title}</Text>
      <View style={styles.helpCircle}>
        <Text style={styles.helpText}>?</Text>
      </View>
      <View style={styles.secSpacer} />
      <Text style={styles.shareIcon}>➦</Text>
    </View>
  );
}

function LockBlock({ bold, sub, onPro }) {
  return (
    <View style={styles.lockWrap}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.lockBold}>{bold}</Text>
      <Text style={styles.lockSub}>{sub}</Text>
      <TouchableOpacity style={styles.proBtn} activeOpacity={0.85} onPress={onPro}>
        <Text style={styles.proBtnText}>PRO starting at ₹199</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChartSkeleton() {
  return (
    <View style={styles.chartBox}>
      <View style={styles.chartY} />
      <View style={styles.chartX} />
      <View style={styles.chartLine} />
      <Text style={styles.chartYLabel}>Runs</Text>
      <Text style={styles.chartXLabel}>Balls</Text>
    </View>
  );
}

export default function AnalyseScreen({ navigation, route }) {
  const [tab, setTab] = useState("Batting");
  const name = route?.params?.name || "Nishant Giri";
  const goPro = () => navigation?.navigate("ProBenefits");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name}
        </Text>
        <TouchableOpacity hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.headerIcon}>⌕</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.headerIcon}>⧩</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>1</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile strip */}
        <View style={styles.profile}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
          <View style={styles.blobC} />
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🏏</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Batting style</Text>
            <Text style={styles.profileLabel}>Batting order</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <TouchableOpacity key={t} onPress={() => setTab(t)} activeOpacity={0.7} style={styles.tab}>
                <Text style={[styles.tabLabel, !active && styles.tabLabelDim]}>{t}</Text>
                {active && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Locked sections */}
        <View style={styles.dark}>
          <SectionHead title="Current form" />
          <LockBlock
            bold="Are you in form? Find out."
            sub="See your form over the last 5 innings."
            onPro={goPro}
          />

          <SectionHead title="Playing style" />
          <View style={styles.dropdownRow}>
            <Text style={styles.dropdownText}>All Innings</Text>
            <Text style={styles.dropdownArrow}>▾</Text>
          </View>
          <View>
            <ChartSkeleton />
            <LockBlock bold="Go PRO to unlock" sub="See how you build your game." onPro={goPro} />
          </View>

          <SectionHead title="Shots analysis" />
          <LockBlock bold="Go PRO to unlock" sub="See your scoring zones." onPro={goPro} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.bottomCta} activeOpacity={0.85} onPress={goPro}>
        <Text style={styles.bottomCtaText}>Become a PRO</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RED,
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 4,
    marginRight: 4,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
  },
  countBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    backgroundColor: DARK,
  },
  content: {
    paddingBottom: 24,
  },
  profile: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 22,
    overflow: "hidden",
  },
  blobA: {
    position: "absolute",
    left: -50,
    top: -70,
    width: 220,
    height: 260,
    borderRadius: 110,
    backgroundColor: RED_DARK,
    opacity: 0.7,
  },
  blobB: {
    position: "absolute",
    right: -60,
    top: -40,
    width: 200,
    height: 240,
    borderRadius: 100,
    backgroundColor: RED_DARK,
    opacity: 0.55,
  },
  blobC: {
    position: "absolute",
    left: 90,
    bottom: -90,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: RED_DARK,
    opacity: 0.5,
  },
  avatar: {
    width: 150,
    height: 170,
    backgroundColor: "#37474F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarEmoji: {
    fontSize: 64,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 22,
    justifyContent: "center",
  },
  profileLabel: {
    color: "#fff",
    fontSize: 17,
    marginVertical: 14,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 14,
  },
  tabLabel: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  tabLabelDim: {
    color: "#777",
  },
  tabUnderline: {
    marginTop: 10,
    height: 3,
    width: "70%",
    backgroundColor: RED,
    borderRadius: 2,
  },
  dark: {
    backgroundColor: DARK,
  },
  secHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DARK_CARD,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 2,
  },
  secTitle: {
    color: "#fff",
    fontSize: 19,
  },
  helpCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#888",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  helpText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
  secSpacer: {
    flex: 1,
  },
  shareIcon: {
    color: "#ccc",
    fontSize: 24,
  },
  lockWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  lockIcon: {
    fontSize: 90,
    opacity: 0.85,
  },
  lockBold: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  lockSub: {
    color: "#bbb",
    fontSize: 16,
    textAlign: "center",
    marginTop: 6,
  },
  proBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    paddingHorizontal: 26,
    paddingVertical: 12,
    marginTop: 16,
  },
  proBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  dropdownText: {
    color: "#666",
    fontSize: 16,
  },
  dropdownArrow: {
    color: "#666",
    fontSize: 16,
  },
  chartBox: {
    height: 150,
    marginHorizontal: 30,
    marginTop: 10,
    opacity: 0.25,
  },
  chartY: {
    position: "absolute",
    left: 20,
    top: 0,
    bottom: 20,
    width: 1,
    backgroundColor: "#555",
  },
  chartX: {
    position: "absolute",
    left: 20,
    right: 0,
    bottom: 20,
    height: 1,
    backgroundColor: "#555",
  },
  chartLine: {
    position: "absolute",
    left: 20,
    top: 30,
    width: "85%",
    height: 2,
    backgroundColor: "#8a6d1c",
    transform: [{ rotate: "-18deg" }],
  },
  chartYLabel: {
    position: "absolute",
    left: 0,
    top: 60,
    color: "#666",
    fontSize: 12,
    transform: [{ rotate: "-90deg" }],
  },
  chartXLabel: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    color: "#666",
    fontSize: 12,
  },
  bottomCta: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomCtaText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "500",
  },
});
