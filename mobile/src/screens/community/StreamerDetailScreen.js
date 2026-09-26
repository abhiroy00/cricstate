import { useState } from "react";
import {
  Modal,
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
import { useListingReviews } from "../../hooks/useListingReviews";
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

const TABS = ["About", "Reviews", "Match videos"];

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
  { name: "Amit Verma", text: "Very professional setup. Stream quality was excellent throughout the match." },
  { name: "Rohit Sharma", text: "Multi-camera coverage and live scores worked flawlessly." },
  { name: "Vikas Yadav", text: "Reached on time, good communication. Highly recommended." },
];

const SAMPLE_VIDEOS = [
  ["Shubhkamna Night Cup - Final", "20-Sep-2026 • 2:14:30"],
  ["City T20 League - Semi Final", "14-Sep-2026 • 1:48:10"],
  ["Weekend Bash - Match 12", "07-Sep-2026 • 58:42"],
  ["Corporate Clash - Highlights", "31-Aug-2026 • 12:05"],
];

export default function StreamerDetailScreen({ navigation, route }) {
  const { streamer, city = "Delhi" } = route?.params || {};
  const [tab, setTab] = useState("About");
  const [myReviews, setMyReviews] = useState([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const insets = useSafeAreaInsets();
  const { apiReviews, agg, submit: submitApiReview } = useListingReviews(
    streamer?.backendId || null
  );

  if (!streamer) return null;

  const rating = typeof streamer.rating === "number" ? streamer.rating : 0;
  const reviews = streamer.reviews ?? 0;
  // Real backend aggregate wins when opened from an API row.
  const effAvg =
    agg && agg.count > 0 && agg.avg != null
      ? agg.avg
      : reviews > 0
        ? rating
        : 0;
  const effCount = agg ? agg.count + myReviews.length : reviews + myReviews.length;
  const videosLabel = streamer.videos > 0 ? String(streamer.videos) : "-";

  const submitReview = async () => {
    if (stars < 1) return;
    const text = reviewText.trim() || "Good experience.";
    const entry = { name: "You", text };
    setStars(0);
    setReviewText("");
    setRateOpen(false);
    if (streamer.backendId) {
      try {
        await submitApiReview(stars, text);
        return;
      } catch {
        // Offline — keep the local copy below.
      }
    }
    setMyReviews((p) => [entry, ...p]);
  };

  const shareProfile = () => {
    Share.share({ message: `${streamer.name} - Live streamer in ${city}: ${rating.toFixed(1)} rated (${reviews} reviews)` }).catch(() => {});
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
          <View style={[styles.logo, { backgroundColor: streamer.bg }]}>
            <Text style={[styles.logoText, { color: streamer.fg || "#fff" }]}>
              {streamer.initials}
            </Text>
          </View>
          <Text style={styles.name}>{streamer.name}</Text>
          <Text style={styles.role}>Live streamers</Text>
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
              {streamer.fee || "—"}
            </Text>
            <Text style={styles.rating}>{effAvg.toFixed(1)}</Text>
            <Stars value={effAvg} size={20} />
            <Text style={styles.revCount}>({effCount})</Text>
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
              <Text style={styles.value}>{city}</Text>

              <Text style={[styles.label, styles.gap]}>Streamed videos</Text>
              <Text style={styles.value}>{videosLabel}</Text>

              <Text style={[styles.label, styles.gap]}>More details</Text>
              <Text style={styles.details}>
                <Text style={styles.detailsBold}>{streamer.short || streamer.name} </Text>
                {streamer.desc}
              </Text>
              <Text style={styles.call}>Call / WhatsApp: {streamer.phone}</Text>

              <Text style={[styles.label, styles.gap]}>Charges</Text>
              <Text style={styles.value}>{streamer.charges}</Text>

              <Text style={[styles.label, styles.gap]}>Handles</Text>
              <View style={styles.handles}>
                <View style={styles.yt}>
                  <Text style={styles.ytPlay}>▶</Text>
                </View>
                <View style={styles.fb}>
                  <Text style={styles.fbText}>f</Text>
                </View>
              </View>
            </View>
          )}

          {tab === "Reviews" && (
            <View style={styles.card}>
              <View style={styles.revHead}>
                <Text style={styles.revBig}>{effAvg.toFixed(1)}</Text>
                <View>
                  <Stars value={effAvg} size={18} />
                  <Text style={styles.revCountDark}>{effCount} ratings</Text>
                </View>
              </View>
              {apiReviews.map((r) => (
                <View key={`api-${r.id}`} style={styles.revItem}>
                  <Text style={styles.revName}>User</Text>
                  <Stars value={r.rating} size={14} />
                  {r.text ? <Text style={styles.revText}>{r.text}</Text> : null}
                </View>
              ))}
              {myReviews.map((r, i) => (
                <View key={`m-${i}`} style={styles.revItem}>
                  <Text style={styles.revName}>{r.name}</Text>
                  <Stars value={5} size={14} />
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
              <TouchableOpacity
                style={styles.writeBtn}
                activeOpacity={0.85}
                onPress={() => setRateOpen(true)}
              >
                <Text style={styles.writeText}>Write a review</Text>
              </TouchableOpacity>
            </View>
          )}

          {tab === "Match videos" && (
            <View style={styles.card}>
              {SAMPLE_VIDEOS.map(([title, meta]) => (
                <View key={title} style={styles.videoRow}>
                  <View style={[styles.thumb, { backgroundColor: streamer.bg }]}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
                    <Text style={styles.videoMeta}>{meta} • {city}</Text>
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
            <Text style={styles.rateTitle}>Rate {streamer.name}</Text>
            <View style={styles.rateStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} hitSlop={8} onPress={() => setStars(s)} activeOpacity={0.7}>
                  <Text style={[styles.rateStar, s <= stars && styles.rateStarOn]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.rateInput}
              multiline
              placeholder="Share your experience (optional)"
              value={reviewText}
              onChangeText={setReviewText}
            />
            <View style={styles.rateRow}>
              <TouchableOpacity style={styles.rateCancel} onPress={() => setRateOpen(false)} activeOpacity={0.8}>
                <Text style={styles.rateCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rateSubmit} onPress={submitReview} activeOpacity={0.85}>
                <Text style={styles.rateSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  rateRow: { flexDirection: "row", alignItems: "center", alignSelf: "stretch", marginTop: 12, gap: 8 },
  rate: { flex: 1, color: "#fff", fontSize: 20 },
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
  videoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12 },
  thumb: { width: 96, height: 64, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  playIcon: { color: "#fff", fontSize: 22 },
  videoTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  videoMeta: { fontSize: 13, color: "#8A8A8A", marginTop: 4 },
  writeBtn: {
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  writeText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  rateDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  rateBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: "100%" },
  rateTitle: { fontSize: 17, fontWeight: "800", color: "#111" },
  rateStars: { flexDirection: "row", marginTop: 12, gap: 6 },
  rateStar: { fontSize: 34, color: "#DDD" },
  rateStarOn: { color: STAR },
  rateInput: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    minHeight: 80,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    textAlignVertical: "top",
  },
  rateRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 14, gap: 10 },
  rateCancel: { paddingHorizontal: 16, paddingVertical: 10 },
  rateCancelText: { fontSize: 15, color: "#777", fontWeight: "600" },
  rateSubmit: { backgroundColor: TEAL, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  rateSubmitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
