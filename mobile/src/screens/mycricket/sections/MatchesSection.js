import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { extractErrorMessage } from "../../../services/api";
import { listMatches } from "../../../services/matchService";
import { AllMatchesBody } from "../AllMatchesScreen";

const RED = "#C81E1E";
const TEAL = "#199A8E";
const PILL_BG = "#E9E7E7";

const FILTERS = [
  { key: "YOUR", label: "Your" },
  { key: "PLAYED", label: "Played" },
  { key: "NETWORK", label: "Network" },
  { key: "ALL", label: "All" },
];

const STATUS_LABEL = {
  SCHEDULED: "Upcoming",
  LIVE: "🔴 LIVE",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCardDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}-${MONTHS[d.getMonth()]}-${yy}`;
}

function matchTypeLabel(matchType) {
  if (!matchType) return "Individual Match";
  const t = String(matchType).toUpperCase();
  if (t.includes("TOURNAMENT")) return "Tournament Match";
  return "Individual Match";
}

function tossLineFor(item) {
  if (item?.toss_text) return item.toss_text;
  const winnerId = item?.toss_winner_team_id;
  const decision = item?.toss_decision;
  if (winnerId && decision) {
    const name =
      item?.team_a?.id === winnerId
        ? item?.team_a?.name
        : item?.team_b?.id === winnerId
          ? item?.team_b?.name
          : "Toss winner";
    const elected = String(decision).toLowerCase() === "field" ? "field" : "bat";
    return `${name} won the toss and elected to ${elected}`;
  }
  return item?.result_summary || "";
}

function MatchCard({ item, navigation }) {
  const isLive = item?.status === "LIVE";
  const dateStr = formatCardDate(item?.scheduled_at || item?.created_at);
  const metaBits = [dateStr, item?.overs_limit ? `${item.overs_limit} Ov.` : ""].filter(Boolean);
  const venue = item?.venue || item?.ground || "";
  const teamA = item?.team_a?.name || "Team A";
  const teamB = item?.team_b?.name || "Team B";
  const score = item?.score_text || item?.live_score || "";
  const toss = tossLineFor(item);

  return (
    <TouchableOpacity
      style={styles.mCard}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("MatchDetail", { matchId: item.id })}
    >
      <View style={styles.mTopRow}>
        <Text style={styles.mType}>{matchTypeLabel(item?.match_type)}</Text>
        {isLive && (
          <View style={styles.mLiveBadge}>
            <Text style={styles.mLiveText}>Live</Text>
          </View>
        )}
      </View>
      <Text style={styles.mMeta} numberOfLines={1}>
        {[metaBits.join("  |  "), venue].filter(Boolean).join("  |  ")}
      </Text>
      <View style={styles.mDivider} />
      <View style={styles.mTeamRow}>
        <Text style={styles.mTeamA} numberOfLines={1}>
          {teamA}
        </Text>
        {!!score && (
          <Text style={styles.mScore}>
            {score.split("(")[0].trim()}
            {score.includes("(") && <Text style={styles.mOvers}> ({score.split("(")[1]}</Text>}
          </Text>
        )}
      </View>
      <Text style={styles.mTeamB} numberOfLines={1}>
        {teamB}
      </Text>
      <View style={styles.mDivider} />
      {!!toss && (
        <Text style={styles.mToss} numberOfLines={2}>
          {toss}
        </Text>
      )}
      <View style={styles.mLinksRow}>
        <TouchableOpacity onPress={() => navigation.navigate("MatchDetail", { matchId: item.id })}>
          <Text style={styles.mLink}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("MatchDetail", { matchId: item.id })}>
          <Text style={[styles.mLink, styles.mLinkGap]}>Squads</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Demo cards exactly like the screenshot — shown in All tab when API has no matches.
const DEMO_ALL_MATCHES = [
  {
    id: "demo-1",
    match_type: "INDIVIDUAL",
    status: "LIVE",
    scheduled_at: "2026-09-13T10:00:00Z",
    overs_limit: 20,
    venue: "New Bongaigaon Railway Colony, Unio...",
    team_a: { name: "DELHI THUNDERS 11" },
    team_b: { name: "unbetable" },
    score_text: "176/8 (18.5 Ov)",
    toss_text: "DELHI THUNDERS 11 won the toss and elected to bat",
  },
  {
    id: "demo-2",
    match_type: "INDIVIDUAL",
    status: "LIVE",
    scheduled_at: "2026-09-06T10:00:00Z",
    overs_limit: 8,
    venue: "New Bongaigaon Railway Colony, Aali",
    team_a: { name: "THUNDER TITANS" },
    team_b: { name: "Elegant Elevan" },
    score_text: "",
    toss_text: "Elegant Elevan won the toss and elected to field (Ok)",
  },
];

function DemoAllMatches({ navigation }) {
  return (
    <View>
      {DEMO_ALL_MATCHES.map((m) => (
        <MatchCard key={m.id} item={m} navigation={navigation} />
      ))}
      <View style={styles.bydAd}>
        <View style={styles.bydLeft}>
          <View style={styles.bydCar} />
        </View>
        <View style={styles.bydCenter}>
          <Text style={styles.bydTitle}>CELEBRATE YOUR DREAMS</Text>
          <Text style={styles.bydLogo}>BYD</Text>
          <Text style={styles.bydSub}>Your upgrade to the extraordinary</Text>
        </View>
        <View style={styles.bydRight}>
          <View style={styles.bydCarSmall} />
          <View style={styles.bydFinance}>
            <Text style={styles.bydFinanceText}>Finance Scheme ROI starts from 7.77%*</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function BydAd() {
  return (
    <View style={styles.bydAd}>
      <View style={styles.bydLeft}>
        <View style={styles.bydCar} />
      </View>
      <View style={styles.bydCenter}>
        <Text style={styles.bydTitle}>CELEBRATE YOUR DREAMS</Text>
        <Text style={styles.bydLogo}>BYD</Text>
        <Text style={styles.bydSub}>Your upgrade to the extraordinary</Text>
      </View>
      <View style={styles.bydRight}>
        <View style={styles.bydCarSmall} />
        <View style={styles.bydFinance}>
          <Text style={styles.bydFinanceText}>Finance Scheme ROI starts from 7.77%*</Text>
        </View>
      </View>
    </View>
  );
}

function TutorialVideoCard() {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoInner}>
        {/* Left red wash */}
        <View style={styles.videoSide} />
        {/* Center preview */}
        <View style={styles.videoCenter}>
          <View style={styles.videoTopBar}>
            <Text style={styles.videoTopArrow}>←</Text>
            <Text style={styles.videoTopTitle}>Start A Match</Text>
            <Text style={styles.videoTopArrow}>▷</Text>
          </View>
          <Text style={styles.videoHeading}>Select Type of Match</Text>
          <View style={styles.videoOptions}>
            <View style={styles.videoOption}>
              <View style={styles.videoOptionIcon}>
                <Text style={styles.videoOptionEmoji}>🏆</Text>
              </View>
              <Text style={styles.videoOptionLabel}>Tournament</Text>
            </View>
            <View style={styles.videoOption}>
              <View style={styles.videoOptionIcon}>
                <Text style={styles.videoOptionEmoji}>👤</Text>
              </View>
              <Text style={styles.videoOptionLabel}>Individual</Text>
            </View>
          </View>
          <View style={styles.videoCaptionWrap}>
            <Text style={styles.videoCaption}>यहां पर हमें दो ऑप्शन शो कर रहे हैं अगर</Text>
          </View>
        </View>
        {/* Right red wash */}
        <View style={styles.videoSide} />
      </View>
    </View>
  );
}

function NetworkEmptyState({ navigation }) {
  const [following, setFollowing] = useState(false);

  return (
    <View>
      {/* Featured cricketer card */}
      <View style={styles.netProfileRow}>
        <View style={styles.netAvatar} />
        <View style={styles.netProfileInfo}>
          <Text style={styles.netName}>Shail Sheth</Text>
          <Text style={styles.netSub}>
            Ahmedabad <Text style={styles.netDot}>•</Text> 177 Views
          </Text>
          <Text style={styles.netRole}>Middle-order batter, LHB, Right-arm medium</Text>
        </View>
      </View>

      <View style={styles.netBtnRow}>
        <TouchableOpacity
          style={styles.netFollowBtn}
          activeOpacity={0.8}
          onPress={() => setFollowing((f) => !f)}
        >
          <Text style={styles.netFollowPlus}>{following ? "✓ " : "+  "}</Text>
          <Text style={styles.netFollowText}>{following ? "FOLLOWING" : "FOLLOW"}</Text>
        </TouchableOpacity>
        <View style={styles.netInsightsBtn}>
          <Text style={styles.netInsightsIcon}>▥ </Text>
          <Text style={styles.netInsightsText}>INSIGHTS</Text>
        </View>
      </View>

      <Text style={styles.netEmptyText}>
        You are not following any cricketer yet. Tap the follow button to remain updated
        automatically.
      </Text>

      <TouchableOpacity
        style={styles.netFindBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("FindCricketers")}
      >
        <Text style={styles.netFindBtnText}>Find cricketers</Text>
      </TouchableOpacity>

      {/* Bottom ad — CoinDCX style */}
      <View style={styles.coinAd}>
        <View style={styles.coinAdLeft}>
          <Text style={styles.coinAdBrand}>◈ CoinDCX</Text>
          <Text style={styles.coinAdTitle}>Choose a Regulated{"\n"}Local Platform</Text>
          <Text style={styles.coinAdSub}>⚠ Crypto products are unregulated</Text>
        </View>
        <View style={styles.coinAdRight}>
          <View style={styles.coinAdPhone} />
          <View style={[styles.coinAdPhone, styles.coinAdPhone2]} />
        </View>
      </View>
    </View>
  );
}

export default function MatchesSection({ navigation }) {
  const [filter, setFilter] = useState("PLAYED");
  const [audioLang, setAudioLang] = useState("Hindi");
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError("");
    try {
      const params = tab === "PLAYED" ? { status: "COMPLETED" } : {};
      const data = await listMatches(params);
      setMatches(data.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (filter === "NETWORK") {
        setLoading(false);
        setError("");
        setMatches([]);
        return;
      }
      load(filter);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])
  );

  const showEmpty = !loading && !error && matches && matches.length === 0;
  const isNetwork = filter === "NETWORK";
  const isAll = filter === "ALL";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Want to start a match? */}
      <View style={styles.startBanner}>
        <Text style={styles.startBannerText}>Want to start a match?</Text>
        <TouchableOpacity
          style={styles.startPill}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("StartMatch")}
        >
          <Text style={styles.startPillText}>Start</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills — Your / Played / Network / All */}
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
      <View style={styles.divider} />

      {isNetwork ? (
        <NetworkEmptyState navigation={navigation} />
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : matches && matches.length > 0 ? (
        <View>
          <FlatList
            data={matches}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <MatchCard item={item} navigation={navigation} />}
          />
          <BydAd />
        </View>
      ) : isAll ? (
        <AllMatchesBody navigation={navigation} initialTab="nearby" />
      ) : (
        <>
          {/* Audio language */}
          <View style={styles.langRow}>
            <Text style={styles.langLabel}>Audio language:</Text>
            <TouchableOpacity
              style={styles.langPicker}
              activeOpacity={0.7}
              onPress={() => setAudioLang((l) => (l === "Hindi" ? "English" : "Hindi"))}
            >
              <Text style={styles.langValue}>{audioLang}</Text>
              <Text style={styles.langArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TutorialVideoCard />

          <Text style={styles.emptyText}>
            Hey, you have not played any matches yet. Why don&apos;t you start one with your rival
            team?
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("StartMatch")}
            >
              <Text style={styles.ctaPrimaryText}>Start A Match</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaOutline}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("AllMatches")}
            >
              <Text style={styles.ctaOutlineText}>View All Matches</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {showEmpty && !isNetwork && !isAll && (
        <View style={styles.adBanner}>
          <View style={styles.adLeft}>
            <Text style={styles.adTag}>KONAMI</Text>
            <Text style={styles.adTitle}>Epic: Lamine Yamal{"\n"}Exp. 4,000 Training Program x22</Text>
            <View style={styles.adThumbRow}>
              <View style={styles.adThumb} />
              <View style={styles.adThumb} />
            </View>
          </View>
          <View style={styles.adRight}>
            <View style={styles.adPlayerCard}>
              <Text style={styles.adRating}>100 RWF</Text>
              <Text style={styles.adPlayer}>Lamine Yamal</Text>
            </View>
            <TouchableOpacity style={styles.adButton} activeOpacity={0.8}>
              <Text style={styles.adButtonText}>Learn more</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 24,
  },
  startBanner: {
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
  startBannerText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  startPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  startPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  filterPill: {
    backgroundColor: PILL_BG,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
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
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  error: {
    color: RED,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e5e4",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    color: RED,
    marginBottom: 4,
  },
  teams: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  result: {
    fontSize: 13,
    fontWeight: "600",
    color: "#084d37",
    marginTop: 6,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 26,
  },
  langLabel: {
    fontSize: 16,
    color: "#333",
  },
  langPicker: {
    flex: 1,
    marginLeft: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },
  langValue: {
    fontSize: 16,
    color: "#333",
  },
  langArrow: {
    fontSize: 12,
    color: "#bbb",
  },
  videoCard: {
    marginHorizontal: 22,
    marginTop: 22,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#A31616",
  },
  videoInner: {
    flexDirection: "row",
    height: 220,
  },
  videoSide: {
    flex: 1,
    backgroundColor: "#A31616",
    opacity: 0.9,
  },
  videoCenter: {
    width: 210,
    backgroundColor: "#fff",
  },
  videoTopBar: {
    backgroundColor: "#B71C1C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  videoTopArrow: {
    color: "#fff",
    fontSize: 12,
  },
  videoTopTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  videoHeading: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  videoOptions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  videoOption: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
    width: 85,
  },
  videoOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  videoOptionEmoji: {
    fontSize: 20,
  },
  videoOptionLabel: {
    fontSize: 9,
    marginTop: 4,
    color: "#333",
  },
  videoCaptionWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  videoCaption: {
    color: "#fff",
    fontSize: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 30,
    marginTop: 18,
  },
  ctaRow: {
    flexDirection: "row",
    paddingHorizontal: 22,
    marginTop: 18,
  },
  ctaPrimary: {
    flex: 1,
    backgroundColor: TEAL,
    borderRadius: 5,
    paddingVertical: 14,
    alignItems: "center",
    marginRight: 6,
  },
  ctaPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  ctaOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 5,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 6,
    backgroundColor: "#fff",
  },
  ctaOutlineText: {
    color: TEAL,
    fontSize: 16,
    fontWeight: "600",
  },
  adBanner: {
    flexDirection: "row",
    marginTop: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 8,
  },
  adLeft: {
    flex: 1,
  },
  adTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#C81E1E",
  },
  adTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111",
    marginTop: 2,
  },
  adThumbRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  adThumb: {
    width: 70,
    height: 70,
    backgroundColor: "#1a73e8",
    borderRadius: 4,
    marginRight: 6,
    opacity: 0.7,
  },
  adRight: {
    width: 190,
    alignItems: "center",
    justifyContent: "center",
  },
  adPlayerCard: {
    width: 110,
    height: 90,
    backgroundColor: "#ff9800",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  adRating: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },
  adPlayer: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  adButton: {
    backgroundColor: "#3c4043",
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  adButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // ---- Network tab ----
  netProfileRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: "flex-start",
  },
  netAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F1F0F0",
  },
  netProfileInfo: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 2,
  },
  netName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#777",
  },
  netSub: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  netDot: {
    fontStyle: "normal",
  },
  netRole: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    lineHeight: 18,
  },
  netBtnRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginTop: 18,
  },
  netFollowBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F1F0F0",
    borderRadius: 3,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  netFollowPlus: {
    color: TEAL,
    fontSize: 20,
    fontWeight: "700",
  },
  netFollowText: {
    color: TEAL,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  netInsightsBtn: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 3,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#fff",
  },
  netInsightsIcon: {
    color: "#D5D5D5",
    fontSize: 16,
  },
  netInsightsText: {
    color: "#D5D5D5",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  netEmptyText: {
    fontSize: 15,
    color: "#222",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 28,
    marginTop: 32,
  },
  netFindBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginHorizontal: 90,
    marginTop: 16,
    paddingVertical: 13,
    alignItems: "center",
  },
  netFindBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  coinAd: {
    flexDirection: "row",
    marginTop: 120,
    marginHorizontal: 12,
    backgroundColor: "#0A2472",
    borderRadius: 2,
    padding: 12,
    overflow: "hidden",
  },
  coinAdLeft: {
    flex: 1,
  },
  coinAdBrand: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  coinAdTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
    lineHeight: 19,
  },
  coinAdSub: {
    color: "#9fb3ff",
    fontSize: 9,
    marginTop: 6,
  },
  coinAdRight: {
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  coinAdPhone: {
    width: 60,
    height: 90,
    backgroundColor: "#20389e",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#4a63c6",
    marginLeft: -18,
  },
  coinAdPhone2: {
    marginTop: 10,
  },
  // ---- All-tab match cards (screenshot style) ----
  list: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  mCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  mTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mType: {
    fontSize: 14,
    color: "#999",
    fontWeight: "400",
  },
  mLiveBadge: {
    backgroundColor: "#E31E24",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  mLiveText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  mMeta: {
    fontSize: 13,
    color: "#999",
    marginTop: 6,
  },
  mDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  mTeamRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  mTeamA: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    letterSpacing: 0.2,
  },
  mScore: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginLeft: 10,
  },
  mOvers: {
    fontSize: 13,
    fontWeight: "400",
    color: "#444",
  },
  mTeamB: {
    fontSize: 15,
    color: "#999",
    marginTop: 8,
  },
  mToss: {
    fontSize: 14,
    color: "#333",
    lineHeight: 19,
  },
  mLinksRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  mLink: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "500",
  },
  mLinkGap: {
    marginLeft: 20,
  },
  // ---- BYD ad ----
  bydAd: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: "#2b2118",
    borderRadius: 2,
    overflow: "hidden",
    alignItems: "center",
  },
  bydLeft: {
    width: 90,
    height: 70,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  bydCar: {
    width: 70,
    height: 34,
    backgroundColor: "#333",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  bydCenter: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bydTitle: {
    color: "#e8c87a",
    fontSize: 8,
    letterSpacing: 1,
  },
  bydLogo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 4,
  },
  bydSub: {
    color: "#c9b98f",
    fontSize: 8,
  },
  bydRight: {
    width: 130,
    alignItems: "center",
    paddingRight: 6,
  },
  bydCarSmall: {
    width: 110,
    height: 34,
    backgroundColor: "#4a4a4a",
    borderRadius: 8,
  },
  bydFinance: {
    backgroundColor: "#1a3a6b",
    borderRadius: 3,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  bydFinanceText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "600",
  },
});
