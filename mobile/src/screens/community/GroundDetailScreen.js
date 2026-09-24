import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
import DreamHeader from "../../components/DreamHeader";
import {
  BackGlyph,
  HeaderIconBtn,
  ShareGlyph,
} from "../../components/HeaderIcon";

const TEAL = "#00A651";
const RED = "#E01A22";
const STAR = "#F5A623";
const PAGE = "#F5F5F5";

const TABS = ["About", "Photos", "Reviews", "Matches", "Tournaments"];

const { width: SCREEN_W } = Dimensions.get("window");
const PHOTO_W = SCREEN_W - 72;

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

const SAMPLE_MATCHES = [
  ["Sunday Smashers vs North XI", "20-Sep-2026 • 20 Ov."],
  ["Evening League - Match 8", "14-Sep-2026 • 16 Ov."],
  ["Corporate Cup - Semi Final", "07-Sep-2026 • 20 Ov."],
];

const SAMPLE_TOURNAMENTS = [
  ["Monsoon Cup 2026", "20-Sep-2026 • 12 teams"],
  ["Weekend Bash", "07-Sep-2026 • 8 teams"],
];

const PHOTO_TILES = ["#7A9A5E", "#6B8A52", "#5F7D4C", "#8AA86B", "#74905A"];

const FACILITY_ICONS = {
  Umpires: "🧑‍⚖️",
  Scorers: "📋",
  "Drinking Water": "🥤",
  Balls: "⚾",
  "Turf Wicket": "🌱",
  "Cement Wicket": "🧱",
  "Dressing Room": "👕",
  Parking: "🅿️",
  Floodlights: "💡",
  Nets: "🥅",
  Canteen: "🍽",
};

function GroundDiagram() {
  return (
    <View style={styles.diagram}>
      <View style={styles.diagramInner} />
      <View style={styles.pitch} />
      <Text style={styles.arrowUp}>↑</Text>
      <Text style={styles.arrowLeft}>←</Text>
      <Text style={styles.arrowRight}>→</Text>
      <View style={styles.dimLabel}>
        <Text style={styles.dimText}>55 - 60</Text>
        <Text style={styles.dimText}>(Approx)</Text>
      </View>
    </View>
  );
}

export default function GroundDetailScreen({ navigation, route }) {
  const { ground, city = "Delhi" } = route?.params || {};
  const [tab, setTab] = useState("About");
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoRef = useRef(null);
  const [myReviews, setMyReviews] = useState([]);
  const [rateOpen, setRateOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const insets = useSafeAreaInsets();

  const photos =
    ground?.photos?.length
      ? ground.photos
      : [0, 1, 2, 3, 4].map((i) => ({ bg: ground?.bg, emoji: ground?.emoji, key: `p-${i}` }));

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

  useEffect(() => {
    if (!photos.length) return;
    const t = setInterval(() => {
      setPhotoIndex((i) => {
        const n = (i + 1) % photos.length;
        photoRef.current?.scrollToOffset({ offset: n * (PHOTO_W + 12), animated: true });
        return n;
      });
    }, 3500);
    return () => clearInterval(t);
  }, [photos.length]);

  const submitReview = () => {
    if (stars < 1) return;
    setMyReviews((p) => [{ name: "You", stars, text: reviewText.trim() || "Good experience." }, ...p]);
    setStars(0);
    setReviewText("");
    setRateOpen(false);
  };

  if (!ground) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {ground.name}
        </Text>
<HeaderIconBtn onPress={shareGround} label="Share">
  <ShareGlyph />
</HeaderIconBtn>
      </DreamHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        <FlatList
          ref={photoRef}
          data={photos}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          snapToInterval={PHOTO_W + 12}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setPhotoIndex(Math.round(x / (PHOTO_W + 12)));
          }}
          renderItem={({ item }) => (
            <View style={[styles.photo, { backgroundColor: item.bg || ground.bg }]}>
              <Text style={styles.photoEmoji}>{item.emoji || ground.emoji}</Text>
            </View>
          )}
        />
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View key={i} style={i === photoIndex ? styles.dotOn : styles.dot} />
          ))}
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.name}>{ground.name}</Text>
          <View style={styles.metaLine}>
            {hasRating && (
              <View style={styles.ratingPill}>
                <Text style={styles.ratingPillText}>{`${rating.toFixed(1)}/5`}</Text>
              </View>
            )}
            {hasRating && <Text style={styles.reviewsText}>{reviews} Review(s)</Text>}
            {hasRating && <Text style={styles.metaSep}>|</Text>}
            <Text style={styles.eye}>👁</Text>
            <Text style={styles.viewsText}>{ground.views} Views</Text>
          </View>
          {!!ground.mapLink && (
            <View style={styles.mapRow}>
              <Text style={styles.pin}>📍</Text>
              <Text style={styles.mapLink} numberOfLines={2}>
                {ground.mapLink}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.outlineBtn}
            activeOpacity={0.8}
            onPress={() => navigation?.navigate?.("DirectMessages")}
          >
            <Text style={styles.outlineIcon}>💬</Text>
            <Text style={styles.outlineText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            activeOpacity={0.8}
            onPress={() => setTab("Matches")}
          >
            <Text style={styles.outlineIcon}>📊</Text>
            <Text style={styles.outlineText}>Insights</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabs}
        >
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
        </ScrollView>

        <View style={styles.page}>
          {tab === "About" && (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Ground info</Text>
                <View style={styles.cardUnderline} />
                <GroundDiagram />
                <Text style={[styles.plain, styles.secGap]}>Available pitch type</Text>
                <View style={styles.pitchRow}>
                  {(ground.pitch ? String(ground.pitch).split(",") : []).map((p) => (
                    <View key={p.trim()} style={styles.pitchPill}>
                      <Text style={styles.pitchText}>{p.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={[styles.card, styles.secGap]}>
                <Text style={styles.cardTitle}>Facilities</Text>
                <View style={styles.cardUnderline} />
                <View style={styles.facRow}>
                  {(ground.facilities || []).map((f) => (
                    <View key={f} style={styles.facItem}>
                      <Text style={styles.facIcon}>{FACILITY_ICONS[f] || "✓"}</Text>
                      <Text style={styles.facLabel} numberOfLines={2}>
                        {f}
                      </Text>
                    </View>
                  ))}
                </View>
                {(!ground.facilities || ground.facilities.length === 0) && (
                  <Text style={styles.plain}>-</Text>
                )}
              </View>
              <View style={[styles.card, styles.secGap]}>
                <Text style={styles.secTitle}>Fees:</Text>
                <Text style={styles.bullet}>• {ground.feesDetail || ground.fee}</Text>
              </View>
            </View>
          )}

          {tab === "Photos" && (
            <FlatList
              data={PHOTO_TILES}
              keyExtractor={(_, i) => `ph-${i}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }) => (
                <View style={[styles.gridPhoto, { backgroundColor: item }]}>
                  <View style={styles.gridShade} />
                  <View style={styles.gridRing} />
                  <View style={styles.gridStrip} />
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
                <View style={styles.centerWrap}>
                  <TouchableOpacity style={styles.writeBtn} activeOpacity={0.85} onPress={() => setRateOpen(true)}>
                    <Text style={styles.writeText}>Write a review</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

          {tab === "Matches" && (
            <View style={styles.card}>
              {SAMPLE_MATCHES.map(([m, d]) => (
                <View key={m} style={styles.rowItem}>
                  <Text style={styles.rowBall}>🏏</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{m}</Text>
                    <Text style={styles.rowMeta}>
                      {d} • {ground.location || city}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {tab === "Tournaments" && (
            <View style={styles.card}>
              {SAMPLE_TOURNAMENTS.map(([m, d]) => (
                <View key={m} style={styles.rowItem}>
                  <Text style={styles.rowBall}>🏆</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{m}</Text>
                    <Text style={styles.rowMeta}>
                      {d} • {ground.location || city}
                    </Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
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
  backBtn: { padding: 6 },
  backArrow: { color: "#fff", fontSize: 26, fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 21, fontWeight: "700", flex: 1, textAlign: "center" },
  shareIcon: { color: "#fff", fontSize: 26, fontWeight: "600" },
  photoList: { paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  photo: {
    width: PHOTO_W,
    height: 210,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  photoEmoji: { fontSize: 84 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 10 },
  dotOn: { width: 12, height: 12, borderRadius: 6, backgroundColor: RED },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#BDBDBD", marginTop: 1.5 },
  titleBlock: { paddingHorizontal: 18, paddingTop: 12 },
  name: { fontSize: 25, fontWeight: "400", color: "#111" },
  metaLine: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" },
  ratingPill: { backgroundColor: STAR, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4 },
  ratingPillText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  reviewsText: { fontSize: 16, color: TEAL },
  metaSep: { color: "#DDD", fontSize: 18 },
  eye: { fontSize: 20, color: "#8A8A8A" },
  viewsText: { fontSize: 16, color: "#555" },
  mapRow: { flexDirection: "row", marginTop: 10, gap: 8 },
  pin: { fontSize: 26 },
  mapLink: { flex: 1, fontSize: 16, color: TEAL, lineHeight: 22 },
  btnRow: { flexDirection: "row", paddingHorizontal: 18, marginTop: 16, gap: 12 },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.4,
    borderColor: TEAL,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
  },
  outlineIcon: { fontSize: 22, color: TEAL },
  outlineText: { fontSize: 18, color: TEAL, fontWeight: "500" },
  tabsScroll: { marginTop: 18, backgroundColor: "#fff" },
  tabs: { flexDirection: "row", paddingHorizontal: 8 },
  tab: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 3, borderBottomColor: "transparent" },
  tabOn: { borderBottomColor: RED },
  tabText: { fontSize: 18, color: "#8A8A8A" },
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
  cardTitle: { fontSize: 21, color: "#111" },
  cardUnderline: { width: 62, height: 3, backgroundColor: TEAL, marginTop: 6, borderRadius: 2 },
  pitchRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  pitchPill: { backgroundColor: "#F0F0F0", borderRadius: 18, paddingHorizontal: 20, paddingVertical: 9 },
  pitchText: { fontSize: 16, color: "#333" },
  facRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  facItem: { width: "25%", alignItems: "center", paddingVertical: 8 },
  facIcon: { fontSize: 44 },
  facLabel: { fontSize: 14, color: "#8A8A8A", marginTop: 8, textAlign: "center" },
  diagram: {
    height: 230,
    backgroundColor: "#4CAF50",
    borderRadius: 115,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  diagramInner: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 14,
    bottom: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
  },
  pitch: { width: 48, height: 120, backgroundColor: "#D9B98A", borderRadius: 4 },
  arrowUp: { position: "absolute", top: 30, color: "#fff", fontSize: 34, fontWeight: "700" },
  arrowLeft: { position: "absolute", left: 44, bottom: 40, color: "#fff", fontSize: 30, fontWeight: "700" },
  arrowRight: { position: "absolute", right: 44, bottom: 40, color: "#fff", fontSize: 30, fontWeight: "700" },
  dimLabel: { position: "absolute", bottom: 24, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 6, paddingHorizontal: 18, paddingVertical: 6, alignItems: "center" },
  dimText: { color: "#fff", fontSize: 17 },
  secTitle: { fontSize: 19, color: "#111", fontWeight: "500" },
  secGap: { marginTop: 20 },
  bullet: { fontSize: 16, color: "#333", marginTop: 6 },
  plain: { fontSize: 16, color: "#333", marginTop: 6 },
  starRow: { flexDirection: "row", gap: 2 },
  star: { fontWeight: "700" },
  gridPhoto: {
    flex: 1,
    height: 190,
    borderRadius: 6,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  gridShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.18)" },
  gridRing: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 22,
    bottom: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
  },
  gridStrip: { width: 30, height: 90, backgroundColor: "rgba(217,185,138,0.9)", borderRadius: 3 },
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
  rowItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12 },
  rowBall: { fontSize: 28 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  rowMeta: { fontSize: 13, color: "#8A8A8A", marginTop: 2 },
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
