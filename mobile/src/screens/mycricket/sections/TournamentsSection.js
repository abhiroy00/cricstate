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

import { useAuth } from "../../../hooks/useAuth";
import { extractErrorMessage } from "../../../services/api";
import { listTournaments } from "../../../services/tournamentService";

const RED = "#EA580C";
const TEAL = "#199A8E";
const PILL_BG = "#E9E7E7";

const FILTERS = [
  { key: "YOUR", label: "Your" },
  { key: "PARTICIPATE", label: "Participate" },
  { key: "NETWORK", label: "Network" },
  { key: "ALL", label: "All" },
];

function TrustCard() {
  return (
    <View style={styles.trustCard}>
      {/* abstract grey shapes */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />
      <Text style={styles.trustText}>
        Why thousands of organisers trust{"\n"}
        CricState for their <Text style={styles.trustRed}>tournaments?</Text>
      </Text>
    </View>
  );
}

const MONTHS_S = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRangeDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_S[d.getMonth()]}, ${d.getFullYear()}`;
}

function dateRangeLabel(item) {
  const s = formatRangeDate(item?.start_date);
  const e = formatRangeDate(item?.end_date);
  if (s && e) return `${s}  to ${e}`;
  return s || e || "";
}

function isOngoingStatus(status) {
  const s = String(status || "").toUpperCase();
  return s === "ONGOING" || s === "LIVE";
}

// ---- Participate empty state (screenshot 18.02.02) ----
function PhoneMockup() {
  return (
    <View style={styles.phoneBody}>
      <View style={styles.phoneNotch} />
      <View style={styles.phoneScreen}>
        <View style={styles.mockHeader}>
          <Text style={styles.mockMenu}>☰</Text>
          <Text style={styles.mockBrand}>CricHeroes</Text>
          <Text style={styles.mockFilter}>⧩</Text>
        </View>
        <View style={styles.mockTabs}>
          <Text style={styles.mockTab}>NAMENTS</Text>
          <Text style={styles.mockTab}>MATCHES</Text>
          <Text style={styles.mockTabActive}>TOURNA</Text>
        </View>
        {[0, 1].map((i) => (
          <View key={i} style={styles.mockCard}>
            <View style={styles.mockOngoing}>
              <Text style={styles.mockOngoingText}>ONGOING</Text>
            </View>
            <View style={styles.mockImg}>
              <Text style={styles.mockImgIcon}>🖼️</Text>
            </View>
            <View style={styles.mockBarRow}>
              <View>
                <View style={styles.mockBar} />
                <View style={[styles.mockBar, styles.mockBarShort]} />
              </View>
              <View style={styles.mockFollow}>
                <Text style={styles.mockFollowText}>FOLLOW</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      {/* hand-drawn style arrow pointing to filter icon */}
      <Text style={styles.mockArrow}>⤴</Text>
    </View>
  );
}

function ParticipateEmpty({ onReset }) {
  return (
    <View style={styles.partWrap}>
      <PhoneMockup />
      <Text style={styles.partText}>
        No tournaments found matching your filters. Try changing the location or resetting filters.
      </Text>
      <TouchableOpacity style={styles.partResetBtn} activeOpacity={0.85} onPress={onReset}>
        <Text style={styles.partResetText}>Reset filters</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Network follow UI (screenshot 18.13.04) ----
function FollowCardMockup() {
  return (
    <View style={styles.followMockWrap}>
      <View style={styles.followMockCard}>
        {/* top image placeholder */}
        <View style={styles.followMockImg} />
        <View style={styles.followMockDivider} />
        {/* bottom row: text bars + FOLLOW */}
        <View style={styles.followMockRow}>
          <View>
            <View style={styles.followMockBar} />
            <View style={[styles.followMockBar, styles.followMockBarShort]} />
          </View>
          <View style={styles.followMockFollow}>
            <Text style={styles.followMockFollowText}>FOLLOW</Text>
          </View>
        </View>
      </View>
      {/* hand-drawn arrow pointing at FOLLOW button */}
      <Text style={styles.followMockArrow}>↗</Text>
    </View>
  );
}

function NetworkFollowEmpty({ onStart }) {
  return (
    <View style={styles.followWrap}>
      <FollowCardMockup />
      <Text style={styles.followTitle}>Follow tournament</Text>
      <Text style={styles.followSub}>
        You&apos;re not following any tournaments yet. Tap follow to stay updated.
      </Text>
      <TouchableOpacity style={styles.followCta} activeOpacity={0.85} onPress={onStart}>
        <Text style={styles.followCtaText}>Start following</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Tournament banner card (screenshots 18.03.34 / 1.jpeg) ----
const POSTER_BG = ["#1a1a1a", "#2b2b2b", "#101d42"];

function PosterArt({ item, index }) {
  const posterType = item?.posterType;
  if (posterType === "kapl") {
    // Light dotted poster with cricket illustration circles
    return (
      <View style={[styles.poster, styles.posterKapl]}>
        <View style={styles.kaplDots} />
        <View style={[styles.kaplCircle, styles.kaplBat]}>
          <Text style={styles.kaplEmoji}>🏏</Text>
        </View>
        <View style={[styles.kaplCircle, styles.kaplMan]}>
          <Text style={styles.kaplEmoji}>🏃</Text>
        </View>
        <View style={[styles.kaplCircle, styles.kaplStump]}>
          <Text style={styles.kaplEmoji}>🥅</Text>
        </View>
        <View style={styles.posterShade} />
        <Text style={styles.posterTitle} numberOfLines={2}>
          {item?.name}
        </Text>
      </View>
    );
  }
  if (posterType === "fever") {
    // Dark navy poster with CRICKET FEVER graphic + helmet
    return (
      <View style={[styles.poster, styles.posterFever]}>
        <Text style={styles.feverTitle}>
          <Text style={styles.feverCyan}>CRICKET </Text>
          <Text style={styles.feverWhite}>FEVER</Text>
        </Text>
        <View style={styles.feverUnderline} />
        <View style={styles.feverHelmet}>
          <Text style={styles.feverHelmetEmoji}>⛑️</Text>
        </View>
        <Text style={styles.posterTitle} numberOfLines={2}>
          {item?.name}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.poster, { backgroundColor: POSTER_BG[index % POSTER_BG.length] }]}>
      <Text style={styles.posterGiant} numberOfLines={1}>
        {(item?.name || "T").split(" ")[0].toUpperCase()}
      </Text>
      <View style={styles.posterShade} />
      <Text style={styles.posterTitle} numberOfLines={2}>
        {item?.name}
      </Text>
    </View>
  );
}

function TournamentBannerCard({ item, index, navigation, showCrown = false }) {
  const [following, setFollowing] = useState(false);
  const ongoing = isOngoingStatus(item?.status);

  return (
    <TouchableOpacity
      style={styles.tCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("TournamentDetail", { tournamentId: item.id })}
    >
      <View>
        <PosterArt item={item} index={index} />
        {showCrown && (
          <View style={styles.crownBadge}>
            <Text style={styles.crownText}>♛</Text>
          </View>
        )}
        <View style={[styles.statusPill, ongoing ? styles.statusOngoing : styles.statusOther]}>
          <Text style={styles.statusPillText}>{ongoing ? "Ongoing" : item?.status || ""}</Text>
        </View>
      </View>
      <View style={styles.tInfo}>
        <View style={styles.tDateRow}>
          <Text style={styles.tDates}>{dateRangeLabel(item)}</Text>
          <TouchableOpacity hitSlop={8} onPress={() => setFollowing((f) => !f)}>
            <Text style={styles.tFollow}>{following ? "Following" : "Follow"}</Text>
          </TouchableOpacity>
        </View>
        {!!item?.location && (
          <Text style={styles.tLoc} numberOfLines={1}>
            {item.location}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function CoinAd() {
  return (
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
  );
}

const DEMO_TOURNAMENTS = [
  {
    id: "demo-t1",
    name: "KAPL",
    status: "ONGOING",
    start_date: "2025-10-12",
    end_date: "2026-12-31",
    location: "New Bongaigaon Railway Colony",
    posterType: "kapl",
  },
  {
    id: "demo-t2",
    name: "Mini IPL Season 1",
    status: "ONGOING",
    start_date: "2025-12-01",
    end_date: "2026-12-31",
    location: "New Bongaigaon Railway Colony",
    posterType: "fever",
  },
];

export default function TournamentsSection({ navigation }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("YOUR");
  const [audioLang, setAudioLang] = useState("Hindi");
  const [tournaments, setTournaments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (tab) => {
      // Participate tab is a fixed no-result UI (image 18.02.02) — no API call,
      // so the illustration + Reset filters button always shows instantly.
      if (tab === "PARTICIPATE" || tab === "NETWORK") {
        setLoading(false);
        setError("");
        setTournaments([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await listTournaments(
          tab === "YOUR" ? { organizerId: user.id, limit: 100 } : { limit: 100 }
        );
        setTournaments(data.items);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  useFocusEffect(
    useCallback(() => {
      load(filter);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])
  );

  const isEmpty = !loading && !error && tournaments && tournaments.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Host banner */}
      <View style={styles.hostBanner}>
        <Text style={styles.hostBannerText}>Want to host a tournament?</Text>
        <TouchableOpacity
          style={styles.hostPill}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("CreateTournament")}
        >
          <Text style={styles.hostPillText}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : filter === "PARTICIPATE" ? (
        // Fixed no-result UI exactly like image 18.02.02
        <ParticipateEmpty onReset={() => setFilter("ALL")} />
      ) : filter === "NETWORK" ? (
        // Fixed follow UI exactly like image 18.13.04
        <NetworkFollowEmpty onStart={() => setFilter("ALL")} />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : tournaments && tournaments.length > 0 ? (
        <View>
          <FlatList
            data={tournaments}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.bannerList}
            renderItem={({ item, index }) => (
              <TournamentBannerCard item={item} index={index} navigation={navigation} />
            )}
          />
          <CoinAd />
        </View>
      ) : filter === "ALL" && !(tournaments && tournaments.length > 0) ? (
        <View>
          <FlatList
            data={DEMO_TOURNAMENTS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.bannerList}
            renderItem={({ item, index }) => (
              <TournamentBannerCard item={item} index={index} navigation={navigation} />
            )}
          />
          <CoinAd />
        </View>
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

          <TrustCard />

          <Text style={styles.emptyText}>
            It seems you have not played any tournaments yet. You know, you can host your own
            tournament too!
          </Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaPrimary}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("CreateTournament")}
            >
              <Text style={styles.ctaPrimaryText}>Register</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaOutline}
              activeOpacity={0.85}
              onPress={() => setFilter("ALL")}
            >
              <Text style={styles.ctaOutlineText}>View All Tournaments</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {isEmpty && <View style={{ height: 60 }} />}
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
  hostBanner: {
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
  hostBannerText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  hostPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  hostPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  filterPill: {
    backgroundColor: PILL_BG,
    borderRadius: 22,
    paddingHorizontal: 20,
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
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  meta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 60,
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
  trustCard: {
    marginHorizontal: 22,
    marginTop: 22,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  blob1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#eeeeee",
    top: -80,
    left: -60,
  },
  blob2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#f1f1f1",
    bottom: -180,
    right: -60,
  },
  blob3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f5f5f5",
    top: 20,
    right: 30,
  },
  trustText: {
    fontSize: 19,
    color: "#111",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "400",
  },
  trustRed: {
    color: RED,
    fontWeight: "500",
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
    flex: 1.4,
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
    fontSize: 15,
    fontWeight: "600",
  },
  // ---- Banner result cards (screenshot 18.03.34) ----
  bannerList: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  tCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    marginHorizontal: 12,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  poster: {
    height: 175,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  posterGiant: {
    position: "absolute",
    fontSize: 92,
    fontWeight: "900",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 2,
  },
  crownBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#B71C1C",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  crownText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  statusPill: {
    position: "absolute",
    top: 10,
    right: 10,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
    zIndex: 3,
  },
  statusOngoing: {
    backgroundColor: "#EA580C",
  },
  statusOther: {
    backgroundColor: "#616161",
  },
  statusPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  posterShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  posterTitle: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    zIndex: 2,
  },
  tInfo: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tDates: {
    fontSize: 14,
    color: "#999",
  },
  tFollow: {
    fontSize: 15,
    color: TEAL,
    fontWeight: "500",
  },
  tLoc: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  // ---- Participate empty (screenshot 18.02.02) ----
  partWrap: {
    alignItems: "center",
    paddingTop: 18,
    paddingHorizontal: 24,
  },
  phoneBody: {
    width: 210,
    height: 300,
    borderRadius: 18,
    backgroundColor: "#E8E8E8",
    padding: 10,
    position: "relative",
  },
  phoneNotch: {
    width: 70,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
    alignSelf: "center",
    marginBottom: 8,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 4,
    overflow: "hidden",
    padding: 8,
  },
  mockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mockMenu: {
    fontSize: 14,
    color: "#888",
  },
  mockBrand: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  mockFilter: {
    fontSize: 14,
    color: "#555",
  },
  mockTabs: {
    flexDirection: "row",
    marginTop: 6,
  },
  mockTab: {
    fontSize: 8,
    color: "#bbb",
    marginRight: 10,
  },
  mockTabActive: {
    fontSize: 8,
    color: "#555",
    fontWeight: "700",
    marginRight: 10,
  },
  mockCard: {
    backgroundColor: "#F4F4F4",
    borderRadius: 4,
    marginTop: 8,
    padding: 8,
    position: "relative",
  },
  mockOngoing: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#9e9e9e",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  mockOngoingText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "700",
  },
  mockImg: {
    height: 60,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  mockImgIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  mockBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  mockBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D5D5D5",
  },
  mockBarShort: {
    width: 70,
    marginTop: 5,
  },
  mockFollow: {
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mockFollowText: {
    fontSize: 8,
    color: "#999",
    fontWeight: "700",
  },
  mockArrow: {
    position: "absolute",
    right: 6,
    top: 28,
    fontSize: 64,
    fontWeight: "900",
    color: "#111",
    transform: [{ rotate: "-12deg" }],
  },
  partText: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 26,
    paddingHorizontal: 8,
  },
  partResetBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginTop: 18,
    width: 210,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  partResetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // ---- Network follow UI (screenshot 18.13.04) ----
  followWrap: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  followMockWrap: {
    position: "relative",
    alignItems: "center",
  },
  followMockCard: {
    width: 250,
    borderWidth: 5,
    borderColor: "#CFCFCF",
    backgroundColor: "#fff",
  },
  followMockImg: {
    height: 90,
    backgroundColor: "#fff",
  },
  followMockDivider: {
    height: 4,
    backgroundColor: "#CFCFCF",
  },
  followMockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  followMockBar: {
    width: 120,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5D5D5",
  },
  followMockBarShort: {
    width: 90,
    marginTop: 8,
  },
  followMockFollow: {
    backgroundColor: TEAL,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  followMockFollowText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  followMockArrow: {
    position: "absolute",
    right: 18,
    bottom: -52,
    fontSize: 64,
    fontWeight: "900",
    color: "#111",
  },
  followTitle: {
    fontSize: 16,
    color: "#333",
    marginTop: 66,
  },
  followSub: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
  },
  followCta: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginTop: 18,
    width: 210,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  followCtaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  // ---- 1.jpeg poster variants ----
  posterKapl: {
    backgroundColor: "#f2f2f2",
  },
  kaplDots: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 150,
    height: 175,
    backgroundColor: "#e9e9e9",
    opacity: 0.6,
  },
  kaplCircle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  kaplBat: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#2a9d8f",
    right: 120,
    top: 30,
  },
  kaplMan: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#e0e0e0",
    right: 46,
    top: 22,
  },
  kaplStump: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#e78fb3",
    right: -12,
    top: 44,
  },
  kaplEmoji: {
    fontSize: 44,
  },
  posterFever: {
    backgroundColor: "#0d1330",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 24,
  },
  feverTitle: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 1,
    zIndex: 2,
  },
  feverCyan: {
    color: "#29b6f6",
  },
  feverWhite: {
    color: "#fff",
  },
  feverUnderline: {
    width: 120,
    height: 8,
    backgroundColor: "#c2185b",
    marginTop: 4,
    zIndex: 2,
  },
  feverHelmet: {
    position: "absolute",
    right: 30,
    top: 30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#c2185b",
    alignItems: "center",
    justifyContent: "center",
  },
  feverHelmetEmoji: {
    fontSize: 52,
  },
  // ---- CoinDCX ad ----
  coinAd: {
    flexDirection: "row",
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 12,
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
});
