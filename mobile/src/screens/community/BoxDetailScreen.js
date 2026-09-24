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

const TABS = ["About", "Reviews", "Slots"];

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
  { name: "Amit Verma", text: "Good nets and bowling machine. Slots start on time." },
  { name: "Rohit Sharma", text: "Nice indoor setup for evening practice with friends." },
];

export default function BoxDetailScreen({ navigation, route }) {
  const { box, city = "Delhi" } = route?.params || {};
  const [tab, setTab] = useState("About");
  const [myReviews, setMyReviews] = useState([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const insets = useSafeAreaInsets();

  if (!box) return null;

  const hasRating = typeof box.rating === "number";
  const rating = hasRating ? box.rating : 0;
  const reviews = box.reviews ?? 0;
  const totalReviews = reviews + myReviews.length;
  const avgRating =
    totalReviews > 0
      ? ((hasRating ? rating * reviews : 0) + myReviews.reduce((s, r) => s + r.stars, 0)) / totalReviews
      : 0;

  const shareBox = () => {
    Share.share({ message: `${box.name} - Box cricket & nets in ${box.location || city}` }).catch(() => {});
  };

  const submitReview = () => {
    if (stars < 1) return;
    setMyReviews((p) => [{ name: "You", stars, text: reviewText.trim() || "Good experience." }, ...p]);
    setStars(0);
    setReviewText("");
    setRateOpen(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <View style={{ flex: 1 }} />
<HeaderIconBtn onPress={shareBox} label="Share">
  <ShareGlyph />
</HeaderIconBtn>
      </DreamHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <View style={styles.profile}>
          <View style={[styles.logo, { backgroundColor: box.bg }]}>
            <Text style={[styles.logoText, { color: box.fg || "#fff" }]}>{box.initials}</Text>
          </View>
          <Text style={styles.name}>{box.name}</Text>
          <Text style={styles.role}>(Box cricket venue)</Text>
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
            {hasRating ? (
              <>
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
                <Stars value={rating} size={22} />
                <Text style={styles.revCount}>({reviews})</Text>
              </>
            ) : (
              <>
                <Stars value={0} size={22} />
                <Text style={styles.revCount}>(0)</Text>
              </>
            )}
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
              <Text style={styles.value}>
                {box.location && box.location !== city ? `${box.location}, ${city}` : city}
              </Text>
              <Text style={[styles.label, styles.gap]}>More details</Text>
              <Text style={styles.details}>
                <Text style={styles.detailsBold}>{box.name} </Text>
                {box.desc}
              </Text>
              {!!box.phone && <Text style={styles.call}>Call / WhatsApp: {box.phone}</Text>}
              <Text style={[styles.label, styles.gap]}>Charges</Text>
              <Text style={styles.value}>{box.charges}</Text>
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

          {tab === "Slots" && (
            <View style={styles.card}>
              {(box.slots || []).map((s) => (
                <View key={s} style={styles.slotRow}>
                  <Text style={styles.slotBall}>🕐</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.slotTime}>{s}</Text>
                    <Text style={styles.slotMeta}>{box.charges} • {box.location || city}</Text>
                  </View>
                </View>
              ))}
              {(!box.slots || box.slots.length === 0) && (
                <Text style={styles.emptyText}>No slots listed yet.</Text>
              )}
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
  logo: { width: 104, height: 104, borderRadius: 20, alignItems: "center", justifyContent: "center", overflow: "hidden" },
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
  page: { backgroundColor: PAGE, padding: 14, minHeight: 320 },
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
  revHead: { flexDirection: "row", alignItems: "center", paddingBottom: 12, gap: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  revBig: { fontSize: 42, fontWeight: "700", color: "#111" },
  revCountDark: { fontSize: 13, color: "#8A8A8A", marginTop: 4 },
  revItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 6 },
  revName: { fontSize: 15, fontWeight: "700", color: "#111" },
  revText: { fontSize: 14, color: "#555", lineHeight: 20 },
  emptyWrap: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyText: { fontSize: 17, color: "#333", textAlign: "center", lineHeight: 24 },
  centerWrap: { alignItems: "center", paddingVertical: 16 },
  writeBtn: { backgroundColor: "#0E6B62", borderRadius: 8, paddingHorizontal: 34, paddingVertical: 14, marginTop: 18 },
  writeText: { color: "#fff", fontSize: 18, fontWeight: "500" },
  slotRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12 },
  slotBall: { fontSize: 26 },
  slotTime: { fontSize: 16, fontWeight: "600", color: "#111" },
  slotMeta: { fontSize: 13, color: "#8A8A8A", marginTop: 2 },
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
