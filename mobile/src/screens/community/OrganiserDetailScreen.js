import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import {
  BackGlyph,
  HeaderIconBtn,
  ShareGlyph,
} from "../../components/HeaderIcon";

const DARK = "#141414";
const TEAL = "#00A651";
const RED = "#E01A22";
const STAR = "#F5A623";
const PAGE = "#F4F4F4";

const TABS = ["About", "Reviews", "Tournaments"];

function Stars({ value = 0, size = 20 }) {
  const full = Math.round(value);
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={[styles.star, { fontSize: size, color: s <= full ? STAR : "#5A5A5A" }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const SAMPLE_REVIEWS = [
  { name: "Amit Verma", text: "Well managed tournament. Grounds and scheduling were excellent." },
  { name: "Rohit Sharma", text: "Fair umpiring and prizes on time. Will play again." },
  { name: "Vikas Yadav", text: "Good communication throughout the league. Highly recommended." },
];

const SAMPLE_TOURNAMENTS = [
  { name: "Cricket Fever", from: "20 Sep, 2026", to: "20 Sep, 2026", bg: "#D8E8CF", emoji: "🏏" },
  { name: "cricket Cup", from: "13 Sep, 2026", to: "13 Sep, 2026", bg: "#43A047", emoji: "🏏" },
  { name: "Cricket L block", from: "06 Sep, 2026", to: "06 Sep, 2026", bg: "#9FD8CB", emoji: "🏏" },
];

export default function OrganiserDetailScreen({ navigation, route }) {
  const { organiser, city = "Delhi" } = route?.params || {};
  const [tab, setTab] = useState("About");
  const [myReviews, setMyReviews] = useState([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const insets = useSafeAreaInsets();

  if (!organiser) return null;

  const hasRating = typeof organiser.rating === "number";
  const rating = hasRating ? organiser.rating : 0;
  const reviews = organiser.reviews ?? 0;
  const totalReviews = reviews + myReviews.length;
  const avgRating =
    totalReviews > 0
      ? ((hasRating ? rating * reviews : 0) + myReviews.reduce((s, r) => s + r.stars, 0)) / totalReviews
      : 0;

  const submitReview = () => {
    if (stars < 1) return;
    setMyReviews((p) => [{ name: "You", stars, text: reviewText.trim() || "Good experience." }, ...p]);
    setStars(0);
    setReviewText("");
    setRateOpen(false);
  };
  const tourLabel = organiser.tournaments > 0 ? String(organiser.tournaments) : "-";
  const locLine =
    organiser.location && organiser.location !== city
      ? `${organiser.location}, ${city}`
      : city;
  const hasDetails = !!organiser.desc;

  const shareProfile = () => {
    Share.share({
      message: `${organiser.name} - Tournament organiser in ${organiser.location || city}: ${organiser.tournaments} tournaments`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <View style={{ flex: 1 }} />
<HeaderIconBtn onPress={shareProfile} label="Share">
  <ShareGlyph />
</HeaderIconBtn>
      </DreamHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <View style={styles.profile}>
          <View style={[styles.logo, { backgroundColor: organiser.bg }]}>
            <Text style={[styles.logoText, { color: organiser.fg || "#fff" }]}>
              {organiser.initials}
            </Text>
          </View>
          <Text style={styles.name}>{organiser.name}</Text>
          <Text style={styles.role}>(Tournament organiser)</Text>
          <TouchableOpacity
            style={styles.msgBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("DirectMessages")}
          >
            <Text style={styles.msgIcon}>💬</Text>
            <Text style={styles.msgText}>Message</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.ratingRow}>
            {hasRating && <Text style={styles.rating}>{rating.toFixed(1)}</Text>}
            <Stars value={rating} size={22} />
            <Text style={styles.revCount}>({reviews})</Text>
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
              <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.page}>
          {tab === "About" && (
            <View style={styles.card}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{locLine}</Text>

              <Text style={[styles.label, styles.gap]}>Tournaments organised</Text>
              <Text style={styles.value}>{tourLabel}</Text>

              <Text style={[styles.label, styles.gap]}>More details</Text>
              {hasDetails ? (
                <>
                  <Text style={styles.details}>
                    <Text style={styles.detailsBold}>{organiser.name} </Text>
                    {organiser.desc}
                  </Text>
                  {!!organiser.phone && (
                    <Text style={styles.call}>Call / WhatsApp: {organiser.phone}</Text>
                  )}
                  {!!organiser.charges && (
                    <>
                      <Text style={[styles.label, styles.gap]}>Charges</Text>
                      <Text style={styles.value}>{organiser.charges}</Text>
                    </>
                  )}
                  <Text style={[styles.label, styles.gap]}>Handles</Text>
                  <View style={styles.handles}>
                    <View style={styles.yt}>
                      <Text style={styles.ytPlay}>▶</Text>
                    </View>
                    <View style={styles.fb}>
                      <Text style={styles.fbText}>f</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.value}>-</Text>
              )}
            </View>
          )}

          {tab === "Reviews" &&
            (totalReviews === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>
                  No reviews yet. Be the first one to write a review.
                </Text>
                <TouchableOpacity style={styles.writeBtn} activeOpacity={0.85} onPress={() => setRateOpen(true)}>
                  <Text style={styles.writeText}>Write a review</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <View style={styles.revHead}>
                    <Text style={styles.revBig}>{avgRating.toFixed(1)}</Text>
                    <View>
                      <Stars value={avgRating} size={18} />
                      <Text style={styles.revCountDark}>{totalReviews} ratings</Text>
                    </View>
                  </View>
                  {myReviews.map((r, i) => (
                    <View key={`m-${i}`} style={styles.revItem}>
                      <Text style={styles.revName}>{r.name}</Text>
                      <Stars value={r.stars} size={14} />
                      <Text style={styles.revText}>{r.text}</Text>
                    </View>
                  ))}
                  {SAMPLE_REVIEWS.map((r) => (
                    <View key={r.name} style={styles.revItem}>
                      <Text style={styles.revName}>{r.name}</Text>
                      <Stars value={5} size={14} />
                      <Text style={styles.revText}>{r.text}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.centerWrap}>
                  <TouchableOpacity style={styles.writeBtn} activeOpacity={0.85} onPress={() => setRateOpen(true)}>
                    <Text style={styles.writeText}>Write a review</Text>
                  </TouchableOpacity>
                </View>
              </>
            ))}

          {tab === "Tournaments" && (
            <View>
              {SAMPLE_TOURNAMENTS.map((t) => (
                <View key={t.name} style={styles.tCard}>
                  <View style={[styles.tBanner, { backgroundColor: t.bg }]}>
                    <Text style={styles.tEmoji}>{t.emoji}</Text>
                    <View style={styles.tShade} />
                    <View style={styles.pastPill}>
                      <Text style={styles.pastText}>Past</Text>
                    </View>
                    <Text style={styles.tName} numberOfLines={1}>
                      {t.name}
                    </Text>
                  </View>
                  <View style={styles.tInfo}>
                    <Text style={styles.tDates}>
                      {t.from} <Text style={styles.tTo}> to {t.to}</Text>
                    </Text>
                    <Text style={styles.tCity}>{organiser.location || city}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={rateOpen} transparent animationType="fade" onRequestClose={() => setRateOpen(false)}>
        <View style={styles.rateDim}>
          <View style={styles.rateBox}>
            <View style={styles.ratePad}>
              <Text style={styles.rateTitle}>Rate and review</Text>
              <Text style={styles.rateUser}>CricHeroes</Text>
              <View style={styles.bigStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} hitSlop={8} onPress={() => setStars(s)}>
                    <Text style={[styles.bigStar, { color: s <= stars ? STAR : "#E6E6E6" }]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.rateHint}>Tap a star to rate</Text>
              <TextInput
                style={styles.rateInput}
                placeholder="Write a review"
                placeholderTextColor="#777"
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
            </View>
            <View style={styles.rateFoot}>
              <TouchableOpacity style={styles.laterBtn} activeOpacity={0.8} onPress={() => setRateOpen(false)}>
                <Text style={styles.laterText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, stars < 1 && styles.submitOff]}
                activeOpacity={0.85}
                onPress={submitReview}
              >
                <Text style={styles.submitText}>Submit review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.adBar, { paddingBottom: insets.bottom }]}>
        <Text style={styles.adText}>Looking for your own app?</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
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
    backgroundColor: DARK,
  },
  backBtn: { padding: 6 },
  backArrow: { color: "#fff", fontSize: 30, fontWeight: "400" },
  headerBtn: { padding: 8 },
  shareIcon: { color: "#fff", fontSize: 26, fontWeight: "600" },
  profile: { backgroundColor: DARK, alignItems: "center", paddingTop: 6, paddingHorizontal: 16, paddingBottom: 14 },
  logo: { width: 104, height: 104, borderRadius: 52, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoText: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  name: { color: "#fff", fontSize: 22, fontWeight: "400", marginTop: 16, textAlign: "center" },
  role: { color: "#E0E0E0", fontSize: 18, marginTop: 4 },
  msgBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginTop: 14,
    gap: 10,
  },
  msgIcon: { fontSize: 22 },
  msgText: { color: "#fff", fontSize: 18 },
  divider: { height: 1, backgroundColor: "#3A3A3A", alignSelf: "stretch", marginTop: 18 },
  ratingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 14, gap: 10 },
  rating: { color: "#fff", fontSize: 18 },
  starRow: { flexDirection: "row", gap: 2 },
  star: { fontWeight: "700" },
  revCount: { color: "#fff", fontSize: 17 },
  tabs: { flexDirection: "row", backgroundColor: "#fff" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: RED },
  tabText: { fontSize: 17, color: "#8A8A8A" },
  tabTextOn: { color: "#111", fontWeight: "500" },
  page: { backgroundColor: PAGE, padding: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontSize: 16, color: "#9A9A9A" },
  gap: { marginTop: 22 },
  value: { fontSize: 19, color: "#111", marginTop: 4 },
  details: { fontSize: 20, color: "#111", lineHeight: 27, marginTop: 6 },
  detailsBold: { fontWeight: "800" },
  call: { fontSize: 20, fontWeight: "800", color: "#111", marginTop: 18 },
  handles: { flexDirection: "row", alignItems: "center", gap: 22, marginTop: 10 },
  yt: { width: 46, height: 32, borderRadius: 8, backgroundColor: "#FF0000", alignItems: "center", justifyContent: "center" },
  ytPlay: { color: "#fff", fontSize: 16 },
  fb: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1877F2", alignItems: "center", justifyContent: "center" },
  fbText: { color: "#fff", fontSize: 26, fontWeight: "800" },
  revHead: { flexDirection: "row", alignItems: "center", paddingBottom: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  revBig: { fontSize: 42, fontWeight: "700", color: "#111" },
  revCountDark: { fontSize: 13, color: "#8A8A8A", marginTop: 4 },
  revItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 6 },
  revName: { fontSize: 15, fontWeight: "700", color: "#111" },
  revText: { fontSize: 14, color: "#555", lineHeight: 20 },
  tourRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12 },
  thumb: { width: 56, height: 56, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  trophy: { fontSize: 26 },
  tourTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  tourMeta: { fontSize: 13, color: "#8A8A8A", marginTop: 4 },
  adBar: { backgroundColor: "#D9F2F2", alignItems: "center", paddingTop: 12 },
  adText: { fontSize: 18, color: "#111" },
  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyText: { fontSize: 17, color: "#333", textAlign: "center", lineHeight: 24 },
  centerWrap: { alignItems: "center", paddingVertical: 16 },
  writeBtn: { backgroundColor: "#0E6B62", borderRadius: 8, paddingHorizontal: 34, paddingVertical: 14, marginTop: 18 },
  writeText: { color: "#fff", fontSize: 18, fontWeight: "500" },
  tCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tBanner: { height: 150, alignItems: "center", justifyContent: "center" },
  tEmoji: { fontSize: 84, opacity: 0.9 },
  tShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.28)" },
  pastPill: { position: "absolute", top: 12, right: 12, backgroundColor: "#2B2B2B", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 7 },
  pastText: { color: "#fff", fontSize: 15 },
  tName: { position: "absolute", left: 14, bottom: 12, color: "#fff", fontSize: 22, fontWeight: "500" },
  tInfo: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#fff" },
  tDates: { fontSize: 17, color: "#8A8A8A" },
  tTo: { color: "#B5B5B5" },
  tCity: { fontSize: 16, color: "#8A8A8A", marginTop: 2 },
  rateDim: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: 32 },
  rateBox: { backgroundColor: "#fff", borderRadius: 4, width: "100%", overflow: "hidden" },
  ratePad: { padding: 22 },
  rateTitle: { fontSize: 23, color: RED, fontWeight: "400" },
  rateUser: { fontSize: 19, color: "#111", marginTop: 16 },
  bigStars: { flexDirection: "row", gap: 6, marginTop: 10 },
  bigStar: { fontSize: 44, fontWeight: "700" },
  rateHint: { fontSize: 16, fontStyle: "italic", color: "#CFCFCF", marginTop: 6 },
  rateInput: {
    borderWidth: 1,
    borderColor: "#CFCFCF",
    borderRadius: 4,
    minHeight: 110,
    textAlignVertical: "top",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    color: "#111",
    marginTop: 14,
  },
  rateFoot: { flexDirection: "row" },
  laterBtn: { flex: 1, backgroundColor: "#fff", paddingVertical: 17, alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEE" },
  laterText: { fontSize: 18, color: "#777" },
  submitBtn: { flex: 1.2, backgroundColor: TEAL, paddingVertical: 17, alignItems: "center" },
  submitOff: { opacity: 0.6 },
  submitText: { fontSize: 18, color: "#fff", fontWeight: "500" },
});
