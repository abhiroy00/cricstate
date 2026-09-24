import { useState } from "react";
import {
  FlatList,
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

const TEAL = "#0E9E9B";
const TEAL_LIGHT = "#45B8AC";
const RED = "#D71920";
const STAR = "#F5A623";
const PAGE = "#FFFFFF";

const TABS = ["About", "Photos", "Reviews"];

function Stars({ value = 0, size = 16 }) {
  const full = Math.round(value);
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={[styles.star, { fontSize: size, color: s <= full ? STAR : "#CFCFCF" }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

const SAMPLE_REVIEWS = [
  { name: "Amit Verma", text: "Good turf and proper boundaries. Matches start on time." },
  { name: "Rohit Sharma", text: "Decent ground for weekend games. Parking is easy." },
];

const SAMPLE_PHOTOS = ["🏟", "🏏", "🏆", "🌱", "🥇", "🏏"];

export default function GroundDetailScreen({ navigation, route }) {
  const { ground, city = "Delhi" } = route?.params || {};
  const [tab, setTab] = useState("About");
  const [myReviews, setMyReviews] = useState([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const insets = useSafeAreaInsets();

  if (!ground) return null;

  const hasRating = typeof ground.rating === "number";
  const rating = hasRating ? ground.rating : 0;
  const reviews = ground.reviews ?? 0;
  const totalReviews = reviews + myReviews.length;
  const avgRating =
    totalReviews > 0
      ? ((hasRating ? rating * reviews : 0) + myReviews.reduce((s, r) => s + r.stars, 0)) / totalReviews
      : 0;

  const shareGround = () => {
    Share.share({ message: `${ground.name} - Cricket ground: ${ground.address}` }).catch(() => {});
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <View style={[styles.banner, { backgroundColor: ground.bg }]}>
          <Text style={styles.bannerEmoji}>{ground.emoji}</Text>
          <View style={styles.bannerShade} />
          <View style={styles.topRow}>
            <TouchableOpacity hitSlop={12} style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <Text style={styles.views}>👥 {ground.views} Views</Text>
            <TouchableOpacity hitSlop={12} style={styles.shareBtn} onPress={shareGround}>
              <Text style={styles.shareIcon}>↗</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dots}>
            <View style={styles.dotOn} />
            <View style={styles.dot} />
          </View>
          <View style={styles.infoOverlay}>
            <Text style={styles.name} numberOfLines={2}>
              {ground.name}
            </Text>
            <Text style={styles.address} numberOfLines={2}>
              {ground.address}
            </Text>
            <View style={styles.feeRow}>
              <Text style={styles.fee}>{ground.fee}</Text>
              <View style={styles.feeRight}>
                {hasRating && (
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>{`${rating.toFixed(1)}/5`}</Text>
                  </View>
                )}
                {hasRating && <Text style={styles.reviews}>{reviews} Review(s)</Text>}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.action}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate?.("DirectMessages")}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} activeOpacity={0.8} onPress={shareGround}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Location</Text>
          </TouchableOpacity>
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
            <View>
              <Text style={styles.secTitle}>Facilities:</Text>
              {(ground.facilities || []).map((f) => (
                <Text key={f} style={styles.bullet}>
                  • {f}
                </Text>
              ))}
              {(!ground.facilities || ground.facilities.length === 0) && (
                <Text style={styles.plain}>-</Text>
              )}
              <Text style={[styles.secTitle, styles.secGap]}>Pitch type:</Text>
              <Text style={styles.plain}>{ground.pitch || "-"}</Text>
              <Text style={[styles.secTitle, styles.secGap]}>Matches played:</Text>
              <Text style={styles.plain}>{ground.matches > 0 ? ground.matches : "-"}</Text>
              <View style={styles.divider} />
              <Text style={styles.secTitle}>Fees:</Text>
              <Text style={styles.bullet}>• {ground.feesDetail || ground.fee}</Text>
            </View>
          )}

          {tab === "Photos" && (
            <FlatList
              data={SAMPLE_PHOTOS}
              keyExtractor={(_, i) => String(i)}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 10 }}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <View style={[styles.photoBox, { backgroundColor: ground.bg }]}>
                  <Text style={styles.photoEmoji}>{item}</Text>
                </View>
              )}
            />
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
              <View>
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
                <View style={styles.centerWrap}>
                  <TouchableOpacity style={styles.writeBtn} activeOpacity={0.85} onPress={() => setRateOpen(true)}>
                    <Text style={styles.writeText}>Write a review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  safe: { flex: 1, backgroundColor: "#141414" },
  banner: { height: 300 },
  bannerEmoji: { fontSize: 110, textAlign: "center", marginTop: 30 },
  bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  topRow: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 6 },
  backBtn: { padding: 6 },
  backArrow: { color: "#fff", fontSize: 30, fontWeight: "400" },
  views: { color: "#fff", fontSize: 17, marginRight: 8 },
  shareBtn: { padding: 8 },
  shareIcon: { color: "#fff", fontSize: 26, fontWeight: "600" },
  dots: { position: "absolute", top: 118, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 8 },
  dotOn: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff", opacity: 0.9 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff", opacity: 0.5, marginTop: 2 },
  infoOverlay: { position: "absolute", left: 16, right: 16, bottom: 12 },
  name: { color: "#fff", fontSize: 25, fontWeight: "500" },
  address: { color: TEAL_LIGHT, fontSize: 16, marginTop: 2, lineHeight: 21 },
  feeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  fee: { color: "#fff", fontSize: 21 },
  feeRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingPill: { borderWidth: 1.2, borderColor: "#fff", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 3 },
  ratingText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  reviews: { color: "#fff", fontSize: 16 },
  actions: { flexDirection: "row", backgroundColor: "#141414", paddingVertical: 14 },
  action: { flex: 1, alignItems: "center", gap: 6 },
  actionIcon: { fontSize: 30, color: "#fff" },
  actionText: { color: "#fff", fontSize: 17 },
  tabs: { flexDirection: "row", backgroundColor: "#fff" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: RED },
  tabText: { fontSize: 17, color: "#8A8A8A" },
  tabTextOn: { color: "#111", fontWeight: "500" },
  page: { backgroundColor: PAGE, padding: 22, minHeight: 320 },
  secTitle: { fontSize: 21, color: "#111", fontWeight: "400" },
  secGap: { marginTop: 24 },
  bullet: { fontSize: 18, color: "#333", marginTop: 6 },
  plain: { fontSize: 18, color: "#333", marginTop: 6 },
  divider: { height: 1, backgroundColor: "#E0E0E0", marginVertical: 24 },
  starRow: { flexDirection: "row", gap: 2 },
  star: { fontWeight: "700" },
  photoBox: { flex: 1, height: 150, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  photoEmoji: { fontSize: 56 },
  revHead: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  revBig: { fontSize: 42, fontWeight: "700", color: "#111" },
  revCountDark: { fontSize: 13, color: "#8A8A8A", marginTop: 4 },
  revItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 6 },
  revName: { fontSize: 15, fontWeight: "700", color: "#111" },
  revText: { fontSize: 14, color: "#555", lineHeight: 20 },
  emptyWrap: { alignItems: "center", paddingTop: 40, paddingHorizontal: 24 },
  emptyText: { fontSize: 17, color: "#333", textAlign: "center", lineHeight: 24 },
  centerWrap: { alignItems: "center", paddingVertical: 16 },
  writeBtn: { backgroundColor: "#0E6B62", borderRadius: 8, paddingHorizontal: 34, paddingVertical: 14, marginTop: 18 },
  writeText: { color: "#fff", fontSize: 18, fontWeight: "500" },
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
