import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

const TABS = [
  { key: "interest", label: "Your Interest", title: "Matches of your interest" },
  { key: "contacts", label: "Contacts", title: "Matches of your contacts" },
  { key: "nearby", label: "Nearby", title: "Matches near you" },
  { key: "popular", label: "Popular Cricketers", title: "Matches of popular cricketers" },
];

// Demo data — same look as screenshot 4 (popular cricketers)
const POPULAR_MATCHES = [
  {
    id: "p1",
    owner: "Match of Mr Bilal",
    type: "Individual Match",
    badge: "Live",
    badgeLive: true,
    meta: "06-Sep-26  |  20 Ov.  |  Delhi, Jangal Safari Cricket Ground",
    teamA: "Paharganj",
    scoreA: "134/10",
    oversA: "(17.0 Ov)",
    teamB: "Nizamuddin Cricket Club",
    scoreB: "80/4",
    oversB: "(11.1 Ov)",
    boldB: true,
    result: "Need 55 runs in 53 balls",
    links: ["Insights", "Squads"],
  },
  {
    id: "p2",
    owner: "Match of Amar",
    type: "League Matches, MCC FRIENDLY MATCHES 2026",
    badge: "Result",
    badgeLive: false,
    meta: "Today  |  20 Ov.  |  Gurugram ( Gurgaon ), MCC Dhankot Sect 99",
    teamA: "SEAWOLVES",
    scoreA: "178/6",
    oversA: "(20.0 Ov)",
    teamB: "Mahadev Bhakts",
    scoreB: "153/6",
    oversB: "(17.5 Ov)",
    boldA: true,
    result: "SEAWOLVES won by 25 runs",
    links: ["Insights", "Table", "Leaderboard"],
  },
  {
    id: "p3",
    owner: "Match of Ahaan Dabas",
    type: "Individual Match",
    badge: "Live",
    badgeLive: true,
    meta: "Today  |  30 Ov.  |  New Delhi, Maharaja Agrasen Adarsh",
    teamA: "Ahaan Dabas XI",
    scoreA: "210/6",
    oversA: "(28.0 Ov)",
    teamB: "Rohini Challengers",
    scoreB: "45/1",
    oversB: "(6.2 Ov)",
    boldA: true,
    result: "Need 166 runs in 142 balls",
    links: ["Insights", "Squads"],
  },
];

function PillsRow({ active, onChange }) {
  return (
    <View style={styles.pillsWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContent}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.8}
              onPress={() => onChange(t.key)}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skelCard}>
      <View style={styles.skelTop}>
        <View style={styles.skelBarShort} />
      </View>
      <View style={styles.skelBody}>
        <View style={styles.skelLineWide} />
        <View style={styles.skelLineMid} />
        <View style={styles.skelBadge} />
        <View style={styles.skelRow}>
          <View style={styles.skelLineSmall} />
          <View style={styles.skelMini} />
        </View>
        <View style={styles.skelRow}>
          <View style={styles.skelLineSmall} />
          <View style={styles.skelMini} />
        </View>
        <View style={styles.skelLineMid} />
      </View>
    </View>
  );
}

function NearbyIllustration() {
  return (
    <View style={styles.nearCard}>
      <View style={styles.nearTop}>
        <View style={styles.nearBarWide} />
        <View style={styles.nearBarMid} />
        <View style={styles.nearLive}>
          <Text style={styles.nearLiveText}>LIVE</Text>
        </View>
      </View>
      <View style={styles.nearMid}>
        <View style={styles.nearLine} />
        <View style={styles.nearMini} />
        <View style={styles.nearLine} />
        <View style={styles.nearMini} />
      </View>
      <View style={styles.nearBottom}>
        <View style={styles.nearBarLong} />
        <View style={styles.nearPin}>
          <Text style={styles.nearPinText}>⧉?</Text>
        </View>
      </View>
    </View>
  );
}

function PopularMatchCard({ m, navigation }) {
  return (
    <View style={styles.pmCard}>
      <View style={styles.pmOwnerWrap}>
        <Text style={styles.pmOwner}>{m.owner}</Text>
      </View>
      <View style={styles.pmBody}>
        <View style={styles.pmTypeRow}>
          <Text style={styles.pmType} numberOfLines={1}>
            {m.type}
          </Text>
          <View style={[styles.pmBadge, m.badgeLive ? styles.pmBadgeLive : styles.pmBadgeResult]}>
            <Text style={styles.pmBadgeText}>{m.badge}</Text>
          </View>
        </View>
        <Text style={styles.pmMeta} numberOfLines={2}>
          {m.meta}
        </Text>
        <View style={styles.pmDivider} />
        <View style={styles.pmTeamRow}>
          <Text style={[styles.pmTeam, (m.boldA || !m.boldB) && styles.pmTeamBold]} numberOfLines={1}>
            {m.teamA}
          </Text>
          <Text style={styles.pmScore} numberOfLines={1}>
            {m.scoreA} <Text style={styles.pmOvers}>{m.oversA}</Text>
          </Text>
        </View>
        <View style={styles.pmTeamRow}>
          <Text style={[styles.pmTeam, m.boldB && styles.pmTeamBold]} numberOfLines={1}>
            {m.teamB}
          </Text>
          <Text style={[styles.pmScore, m.boldB && styles.pmScoreBold]} numberOfLines={1}>
            {m.scoreB} <Text style={styles.pmOvers}>{m.oversB}</Text>
          </Text>
        </View>
        <View style={styles.pmDivider} />
        <Text style={styles.pmResult} numberOfLines={2}>
          {m.result}
        </Text>
        <View style={styles.pmLinksRow}>
          {m.links.map((l) => (
            <TouchableOpacity
              key={l}
              onPress={() => navigation?.navigate?.("MatchDetail", { matchId: m.id })}
            >
              <Text style={styles.pmLink}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

function AdBanner() {
  return (
    <View style={styles.adBanner}>
      <View style={styles.adLeft}>
        <Text style={styles.adTitle}>Uptime that powers{"\n"}every insight.</Text>
        <Text style={styles.adSub}>#WhenWorkMatters</Text>
      </View>
      <View style={styles.adRight}>
        <View style={styles.adCta}>
          <Text style={styles.adCtaText}>SPECTRA</Text>
        </View>
      </View>
    </View>
  );
}

export function AllMatchesBody({ navigation, initialTab = "nearby", tab: controlledTab, onTabChange }) {
  const [innerTab, setInnerTab] = useState(initialTab);
  const tab = controlledTab ?? innerTab;
  const setTab = (t) => {
    setInnerTab(t);
    onTabChange?.(t);
  };
  const [query, setQuery] = useState("");

  return (
    <View style={styles.body}>
      <PillsRow active={tab} onChange={setTab} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {tab === "interest" && (
          <View>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by Teams, Tournaments"
                placeholderTextColor="#aaa"
                style={styles.searchInput}
              />
            </View>
            {POPULAR_MATCHES.map((m) => (
              <PopularMatchCard key={m.id} m={m} navigation={navigation} />
            ))}
          </View>
        )}

        {tab === "contacts" && (
          <View style={styles.emptyWrap}>
            <SkeletonCard />
            <Text style={styles.emptyText}>Sync your contacts to see their matches here.</Text>
            <TouchableOpacity style={styles.tealBtn} activeOpacity={0.85}>
              <Text style={styles.tealBtnText}>Sync contacts</Text>
            </TouchableOpacity>
            <Text style={styles.finePrint}>
              *We never spam your contacts. You can delete your contacts from our servers anytime.
            </Text>
          </View>
        )}

        {tab === "nearby" && (
          <View style={styles.emptyWrap}>
            <NearbyIllustration />
            <Text style={styles.emptyText}>Check matches happening near you.</Text>
            <TouchableOpacity style={styles.tealBtn} activeOpacity={0.85}>
              <Text style={styles.tealBtnText}>Use current location</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.linkTeal}>Select location manually</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === "popular" && (
          <View>
            {POPULAR_MATCHES.map((m) => (
              <PopularMatchCard key={m.id} m={m} navigation={navigation} />
            ))}
          </View>
        )}

        <AdBanner />
      </ScrollView>
    </View>
  );
}

export default function AllMatchesScreen({ navigation, route }) {
  const initialTab = route?.params?.tab || "nearby";
  const [tab, setTab] = useState(initialTab);
  const activeTitle = (TABS.find((t) => t.key === tab) || TABS[2]).title;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activeTitle}
        </Text>
        <TouchableOpacity hitSlop={10} style={styles.headerRight}>
          <Text style={styles.headerRightIcon}>⧉</Text>
        </TouchableOpacity>
      </DreamHeader>
      <View style={styles.screenBody}>
        <AllMatchesBody navigation={navigation} tab={tab} onTabChange={setTab} />
      </View>
    </SafeAreaView>
  );
}

// (removed unused placeholder)

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RED,
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
    padding: 4,
    marginRight: 12,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  headerRight: {
    padding: 4,
    marginLeft: 12,
  },
  headerRightIcon: {
    color: "#fff",
    fontSize: 22,
  },
  screenBody: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  body: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  pillsWrap: {
    backgroundColor: "#f6f6f6",
    paddingVertical: 8,
  },
  pillsContent: {
    paddingHorizontal: 10,
  },
  pill: {
    borderWidth: 1.2,
    borderColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  pillActive: {
    backgroundColor: TEAL,
  },
  pillText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 22,
    color: "#888",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    paddingVertical: 0,
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 30,
    lineHeight: 22,
  },
  tealBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    paddingHorizontal: 40,
    paddingVertical: 13,
    marginTop: 18,
  },
  tealBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "500",
  },
  finePrint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 22,
    lineHeight: 18,
  },
  linkTeal: {
    fontSize: 16,
    color: TEAL,
    marginTop: 18,
    fontWeight: "500",
  },
  // skeleton (contacts tab)
  skelCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  skelTop: {
    backgroundColor: "#ececec",
    padding: 12,
  },
  skelBarShort: {
    width: 110,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d3d3d3",
  },
  skelBody: {
    padding: 14,
  },
  skelLineWide: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  skelLineMid: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
    width: "60%",
    marginTop: 8,
  },
  skelBadge: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 52,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#8a8a8a",
  },
  skelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  skelLineSmall: {
    width: "40%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  skelMini: {
    width: 60,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ddd",
  },
  // nearby illustration
  nearCard: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    overflow: "hidden",
  },
  nearTop: {
    backgroundColor: "#f0f0f0",
    padding: 12,
  },
  nearBarWide: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#d5d5d5",
    width: "75%",
  },
  nearBarMid: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#d5d5d5",
    width: "55%",
    marginTop: 7,
  },
  nearLive: {
    position: "absolute",
    right: 10,
    top: 12,
    backgroundColor: "#8a8a8a",
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  nearLiveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  nearMid: {
    padding: 14,
  },
  nearLine: {
    height: 9,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
    width: "60%",
    marginTop: 10,
  },
  nearMini: {
    position: "absolute",
    right: 14,
    width: 44,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  nearBottom: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  nearBarLong: {
    flex: 1,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#e0e0e0",
  },
  nearPin: {
    marginLeft: 10,
  },
  nearPinText: {
    fontSize: 22,
  },
  // popular match cards
  pmCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pmOwnerWrap: {
    backgroundColor: "#efefef",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pmOwner: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  pmBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pmTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pmType: {
    flex: 1,
    fontSize: 14,
    color: "#999",
    marginRight: 8,
  },
  pmBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  pmBadgeLive: {
    backgroundColor: "#EA580C",
  },
  pmBadgeResult: {
    backgroundColor: "#222",
  },
  pmBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  pmMeta: {
    fontSize: 14,
    color: "#999",
    marginTop: 6,
  },
  pmDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  pmTeamRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: 6,
  },
  pmTeam: {
    flex: 1,
    fontSize: 16,
    color: "#999",
    marginRight: 10,
  },
  pmTeamBold: {
    color: "#1a1a1a",
    fontWeight: "700",
  },
  pmScore: {
    fontSize: 17,
    color: "#999",
    fontWeight: "500",
  },
  pmScoreBold: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: 20,
  },
  pmOvers: {
    fontSize: 13,
    fontWeight: "400",
  },
  pmResult: {
    fontSize: 16,
    color: "#333",
    marginTop: 2,
  },
  pmLinksRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  pmLink: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "500",
    marginLeft: 20,
  },
  adBanner: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 40,
    backgroundColor: "#0d1b2a",
    borderWidth: 1,
    borderColor: "#c9a227",
    padding: 12,
    alignItems: "center",
  },
  adLeft: {
    flex: 1,
  },
  adTitle: {
    color: "#f5c518",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  adSub: {
    color: "#aaa",
    fontSize: 10,
    marginTop: 4,
  },
  adRight: {
    width: 110,
    alignItems: "center",
  },
  adCta: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adCtaText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
