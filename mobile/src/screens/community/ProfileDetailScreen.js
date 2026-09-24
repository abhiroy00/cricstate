import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const RED = "#EA580C";
const TEAL = "#0E9E9B";
const INK = "#1A1A1A";
const DARK = "#141414";
const GREY = "#8A8A8A";
const CYAN_HEAD = "#DDF3F3";
const PAGE = "#F4F4F4";
const STAR = "#F5A623";

const TABS = ["About", "Reviews", "Achievements", "Matches"];

function ShareIcon() {
  return (
    <View style={styles.shareWrap}>
      <View style={styles.shareDotTop} />
      <View style={styles.shareDotMid} />
      <View style={styles.shareDotBot} />
      <View style={[styles.shareBar, styles.shareBarTop]} />
      <View style={[styles.shareBar, styles.shareBarBot]} />
    </View>
  );
}

function FilterIcon({ count }) {
  return (
    <View style={{ width: 28, height: 26 }}>
      <View style={styles.funnelTop} />
      <View style={styles.funnelV}>
        <View style={[styles.funnelArm, { transform: [{ rotate: "38deg" }] }]} />
        <View style={[styles.funnelArm, { transform: [{ rotate: "-38deg" }] }]} />
      </View>
      <View style={styles.funnelStem} />
      {count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function MedalBig() {
  return (
    <View style={styles.medalWrap}>
      <View style={styles.medalRibbonL} />
      <View style={styles.medalRibbonR} />
      <View style={styles.medalRing}>
        <Text style={styles.medalStar}>★</Text>
      </View>
    </View>
  );
}

function Stars({ size = 20 }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={[styles.star, { fontSize: size }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

function RankCard({ head, headRight, icon, rank, city }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardHeadText}>{head}</Text>
        {headRight}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View>
          <Text style={styles.rankText}>#{rank} in</Text>
          <View style={styles.cityRow}>
            <Text style={styles.pin}>📍</Text>
            <Text style={styles.cityText}>{city}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const REVIEWS = [
  { name: "Amit Verma", text: "Very professional. Live scoring was accurate throughout the match." },
  { name: "Rohit Sharma", text: "Reached on time and handled the full tournament without any issues." },
  { name: "Vikas Yadav", text: "Good communication and fair decisions. Highly recommended." },
];

const ACHIEVEMENTS = [
  ["🏆", "Ranked #1 in city leaderboard"],
  ["🏅", "500+ rating points milestone"],
  ["⭐", "Maintained 4.5+ player rating"],
];

const MATCHES = [
  ["Shubhkamna Night Cup", "20-Sep-2026"],
  ["City T20 League", "14-Sep-2026"],
  ["Weekend Bash", "07-Sep-2026"],
  ["Corporate Clash", "31-Aug-2026"],
];

export default function ProfileDetailScreen({ navigation, route }) {
  const { person, role = "scorers", city = "Delhi", title = "Scorers" } =
    route?.params || {};
  const [tab, setTab] = useState("About");
  const insets = useSafeAreaInsets();

  if (!person) return null;

  const singular = role.replace(/s$/, "");
  const roleLabel = singular.charAt(0).toUpperCase() + singular.slice(1);
  const safePerson = {
    ...person,
    initials:
      person.initials ||
      String(person.name || "C")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    rate:
      person.rate ||
      [person.feeDay, person.feeMatch].filter(Boolean).join(", ") ||
      "—",
  };
  const idNum = parseInt(safePerson.id, 10) || 1;
  const rating = (4.6 + ((idNum * 7) % 4) * 0.1).toFixed(1);
  const reviewCount = 40 + ((safePerson.matches * 13) % 160);
  const allTime = idNum + 2;
  const totalMatches = safePerson.matches * 24 + 154;
  const exp = `${(idNum % 4) + 2} yrs`;
  const matchesLabel =
    role === "scorers"
      ? "Matches scored"
      : role === "umpires"
        ? "Matches umpired"
        : role === "commentators"
          ? "Matches covered"
          : "Matches";
  const lastDateLabel =
    role === "scorers"
      ? "Last date of scoring"
      : role === "umpires"
        ? "Last date of umpiring"
        : role === "commentators"
          ? "Last date of commentary"
          : "Last active date";

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
        <View style={{ flex: 1 }} />
        <TouchableOpacity hitSlop={12} style={styles.headerBtn}>
          <ShareIcon />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn}>
          <FilterIcon count={5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <View style={styles.profile}>
          <View style={[styles.photo, { backgroundColor: safePerson.bg }]}>
            <Text style={styles.photoText}>{safePerson.initials}</Text>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{safePerson.name}</Text>
            <MedalBig />
          </View>
          <Text style={styles.role}>
            ({roleLabel} - {city})
          </Text>
          <TouchableOpacity
            style={styles.msgBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("DirectMessages")}
          >
            <Text style={styles.msgIcon}>💬</Text>
            <Text style={styles.msgText}>Message</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.rateRow}>
            <Text style={styles.rate} numberOfLines={1}>
              {safePerson.rate}
            </Text>
            <Text style={styles.rating}>{rating}</Text>
            <Stars size={19} />
            <Text style={styles.revCount}>({reviewCount})</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabOn]}
              activeOpacity={0.8}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.page}>
          {tab === "About" && (
            <>
              <RankCard
                head="All time ranking"
                headRight={
                  <View style={styles.infoCircle}>
                    <Text style={styles.infoText}>i</Text>
                  </View>
                }
                icon="🏆"
                rank={allTime}
                city={city}
              />
              <RankCard
                head="SEP 2026 RANK"
                headRight={
                  <View style={styles.pastRow}>
                    <Text style={styles.pastText}>Past rankings</Text>
                    <Text style={styles.pastArrow}>›</Text>
                  </View>
                }
                icon="⭐"
                rank={safePerson.id}
                city={city}
              />
              <View style={styles.card}>
                <View style={[styles.cardHead, styles.cardHeadGrey]}>
                  <Text style={styles.cardHeadText}>{roleLabel} details</Text>
                </View>
                <View style={styles.detailBody}>
                  <Text style={styles.detailLabel}>
                    {matchesLabel}
                  </Text>
                  <Text style={styles.detailVal}>{totalMatches}</Text>
                  <Text style={[styles.detailLabel, styles.detailGap]}>
                    {lastDateLabel}
                  </Text>
                  <Text style={styles.detailVal}>24-09-2026</Text>
                  <Text style={[styles.detailLabel, styles.detailGap]}>
                    Experience
                  </Text>
                  <Text style={styles.detailVal}>{exp}</Text>
                </View>
              </View>
            </>
          )}

          {tab === "Reviews" && (
            <View style={styles.card}>
              <View style={styles.revHead}>
                <Text style={styles.revBig}>{rating}</Text>
                <View>
                  <Stars size={18} />
                  <Text style={styles.revCountDark}>
                    {reviewCount} ratings
                  </Text>
                </View>
              </View>
              {REVIEWS.map((r) => (
                <View key={r.name} style={styles.revItem}>
                  <Text style={styles.revName}>{r.name}</Text>
                  <Stars size={14} />
                  <Text style={styles.revText}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === "Achievements" && (
            <View style={styles.card}>
              {ACHIEVEMENTS.map(([emoji, text]) => (
                <View key={text} style={styles.achRow}>
                  <Text style={styles.achEmoji}>{emoji}</Text>
                  <Text style={styles.achText}>{text}</Text>
                </View>
              ))}
            </View>
          )}

          {tab === "Matches" && (
            <View style={styles.card}>
              {MATCHES.map(([m, d]) => (
                <View key={m} style={styles.matchRow}>
                  <Text style={styles.matchBall}>🏏</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchName}>{m}</Text>
                    <Text style={styles.matchDate}>
                      {d} • {city}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.screenTag}>
          {title} • {city}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK,
  },
  header: {
    backgroundColor: DARK,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "400",
  },
  headerBtn: {
    padding: 8,
  },
  shareWrap: {
    width: 26,
    height: 24,
  },
  shareDotTop: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareDotMid: {
    position: "absolute",
    top: 9,
    left: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareDotBot: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareBar: {
    position: "absolute",
    height: 2.2,
    borderRadius: 1,
    backgroundColor: "#fff",
  },
  shareBarTop: {
    top: 5,
    left: 7,
    width: 12,
    transform: [{ rotate: "-24deg" }],
  },
  shareBarBot: {
    bottom: 5,
    left: 7,
    width: 12,
    transform: [{ rotate: "24deg" }],
  },
  funnelTop: {
    width: 24,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  funnelV: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
    gap: 10,
  },
  funnelArm: {
    width: 13,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  funnelStem: {
    width: 2.6,
    height: 9,
    borderRadius: 2,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 1,
  },
  filterBadge: {
    position: "absolute",
    top: -9,
    right: -9,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  /* Dark profile block */
  profile: {
    backgroundColor: DARK,
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  photo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "400",
  },
  role: {
    color: "#E0E0E0",
    fontSize: 18,
    marginTop: 6,
  },
  msgBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 10,
    marginTop: 14,
    gap: 10,
  },
  msgIcon: {
    fontSize: 22,
  },
  msgText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3A",
    alignSelf: "stretch",
    marginTop: 16,
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: 12,
    gap: 8,
  },
  rate: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
  },
  rating: {
    color: "#fff",
    fontSize: 18,
  },
  starRow: {
    flexDirection: "row",
    gap: 2,
  },
  star: {
    color: STAR,
  },
  revCount: {
    color: "#9E9E9E",
    fontSize: 17,
  },

  /* Medal */
  medalWrap: {
    width: 30,
    height: 32,
    alignItems: "center",
  },
  medalRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  medalStar: {
    fontSize: 11,
    color: TEAL,
    fontWeight: "800",
  },
  medalRibbonL: {
    position: "absolute",
    bottom: 0,
    left: 5,
    width: 6,
    height: 13,
    backgroundColor: TEAL,
    borderRadius: 1,
    transform: [{ rotate: "14deg" }],
  },
  medalRibbonR: {
    position: "absolute",
    bottom: 0,
    right: 5,
    width: 6,
    height: 13,
    backgroundColor: TEAL,
    borderRadius: 1,
    transform: [{ rotate: "-14deg" }],
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabOn: {
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 17,
    color: GREY,
  },
  tabTextOn: {
    color: INK,
    fontWeight: "700",
  },

  /* Page */
  page: {
    backgroundColor: PAGE,
    padding: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHead: {
    backgroundColor: CYAN_HEAD,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardHeadGrey: {
    backgroundColor: "#EEEEEE",
  },
  cardHeadText: {
    fontSize: 17,
    fontWeight: "600",
    color: INK,
  },
  infoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.8,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 15,
    fontWeight: "700",
    color: INK,
  },
  pastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pastText: {
    fontSize: 16,
    color: INK,
  },
  pastArrow: {
    fontSize: 26,
    color: INK,
    lineHeight: 26,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 16,
  },
  cardIcon: {
    fontSize: 64,
  },
  rankText: {
    fontSize: 24,
    color: INK,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  pin: {
    fontSize: 24,
  },
  cityText: {
    fontSize: 20,
    color: TEAL,
    fontWeight: "500",
  },
  detailBody: {
    padding: 16,
  },
  detailLabel: {
    fontSize: 15,
    color: GREY,
  },
  detailGap: {
    marginTop: 18,
  },
  detailVal: {
    fontSize: 19,
    color: INK,
    marginTop: 2,
  },

  /* Reviews */
  revHead: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  revBig: {
    fontSize: 42,
    fontWeight: "700",
    color: INK,
  },
  revCountDark: {
    fontSize: 13,
    color: GREY,
    marginTop: 4,
  },
  revItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 6,
  },
  revName: {
    fontSize: 15,
    fontWeight: "700",
    color: INK,
  },
  revText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },

  /* Achievements + matches */
  achRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
  },
  achEmoji: {
    fontSize: 30,
  },
  achText: {
    fontSize: 15,
    color: INK,
    flex: 1,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
  },
  matchBall: {
    fontSize: 28,
  },
  matchName: {
    fontSize: 15,
    fontWeight: "600",
    color: INK,
  },
  matchDate: {
    fontSize: 13,
    color: GREY,
    marginTop: 2,
  },
  screenTag: {
    textAlign: "center",
    fontSize: 12,
    color: "#BBB",
    paddingVertical: 8,
    backgroundColor: PAGE,
  },
});
