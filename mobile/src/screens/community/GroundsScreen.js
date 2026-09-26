import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { createListing, listListings } from "../../services/engagementService";
import {
  BackGlyph,
  FilterGlyph,
  HeaderIconBtn,
  SearchGlyph,
} from "../../components/HeaderIcon";
import { RoleGlyph } from "../../components/RoleIcon";

const RED = "#E01A22";
const TEAL = "#00A651";
const BASE_COUNT = 93;
const CARD_W = Dimensions.get("window").width - 30;

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

const SEED = [
  {
    id: "g1", name: "Heaven Cricket Graund", address: "Burari, Delhi, India",
    rating: 4.0, reviews: 1, location: "Delhi", pitch: "Turf", matches: 18,
    fee: "₹3000-4500", views: 403, bg: "#6B7F5E", emoji: "🏟",
    mapLink: "https://maps.app.goo.gl/uk5aPJqox5up2LZb6?g_st=com.google.maps.preview.copy",
    facilities: ["Umpires", "Scorers", "Drinking Water", "Balls"],
    feesDetail: "₹3000-4500/match",
  },
  {
    id: "g2", name: "08 yamuna cricket ground", address: "Yamuna Bank, Delhi, India",
    rating: null, reviews: 0, location: "Delhi", pitch: "Turf", matches: 0,
    fee: "₹3000-4500", views: 388, bg: "#5C7A4E", emoji: "🏟",
    mapLink: "https://maps.app.goo.gl/yamuna-bank-delhi-ground",
    facilities: ["Turf Wicket", "Nets"],
    feesDetail: "₹3000-4500/match",
  },
  {
    id: "g3", name: "Green Park Ground", address: "Mayur Vihar, Delhi, India",
    rating: 4.2, reviews: 6, location: "Delhi", pitch: "Turf", matches: 42,
    fee: "₹4000-6000", views: 764, bg: "#3E7C4F", emoji: "🏏",
    mapLink: "https://maps.app.goo.gl/green-park-mayur-vihar",
    facilities: ["Turf Wicket", "Floodlights", "Dressing Room", "Canteen"],
    feesDetail: "₹4000-6000/match",
  },
  {
    id: "g4", name: "City Sports Complex", address: "Dwarka, Delhi, India",
    rating: 3.9, reviews: 4, location: "Delhi", pitch: "Cement", matches: 25,
    fee: "₹2500-4000", views: 421, bg: "#7A8A5E", emoji: "🏟",
    mapLink: "https://maps.app.goo.gl/city-sports-dwarka",
    facilities: ["Cement Wicket", "Nets", "Parking"],
    feesDetail: "₹2500-4000/match",
  },
];

export function groundFeeValue(fee = "") {
  const m = String(fee).replace(/,/g, "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 999999;
}

const SORT_OPTIONS = [
  { key: "matches", label: "Matches Played - High to Low" },
  { key: "rating", label: "Ratings - High to Low" },
  { key: "az", label: "Name - A to Z" },
  { key: "za", label: "Name - Z to A" },
];

function SortRow({ label, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.sortRow} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.sortLabel, selected && styles.sortLabelOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetaRow({ parts }) {
  const items = parts.filter(Boolean);
  return (
    <View style={styles.metaRow}>
      {items.map((p, i) => (
        <View key={i} style={styles.metaItem}>
          {i > 0 && <Text style={styles.metaSep}>|</Text>}
          <Text style={styles.metaText}>{p}</Text>
        </View>
      ))}
    </View>
  );
}

function cardPhotos(item) {
  return [
    { bg: item.bg, emoji: item.emoji },
    { bg: "#3E5A3E", emoji: "🏏" },
    { bg: "#7A8A5E", emoji: "🏟" },
  ];
}

function GroundCard({ item, onPress }) {
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const photos = cardPhotos(item);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => {
        const n = (i + 1) % photos.length;
        listRef.current?.scrollToOffset({ offset: n * CARD_W, animated: true });
        return n;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [photos.length]);
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress?.(item)}>
      <View>
        <FlatList
          ref={listRef}
          data={photos}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const w = e.nativeEvent.layoutMeasurement.width;
            if (w > 0) setIndex(Math.round(e.nativeEvent.contentOffset.x / w));
          }}
          renderItem={({ item: p }) => (
            <View style={[styles.banner, { backgroundColor: p.bg }]}>
              <RoleGlyph role="grounds" size={76} />
              <View style={styles.bannerShade} />
            </View>
          )}
        />
        <View style={styles.cardDots}>
          {photos.map((_, i) => (
            <View key={i} style={i === index ? styles.cardDotOn : styles.cardDot} />
          ))}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {typeof item.rating === "number" && (
          <View style={styles.ratingRow}>
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>{`${item.rating.toFixed(1)}/5`}</Text>
            </View>
            <Text style={styles.reviews}>{item.reviews} Review(s)</Text>
          </View>
        )}
        <MetaRow
          parts={[
            item.location,
            item.pitch,
            item.matches > 0 ? `Matches played: ${item.matches}` : null,
          ]}
        />
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.fee}>{item.fee}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function GroundsScreen({ navigation, route }) {
  const [city, setCity] = useState(route?.params?.city || "Delhi");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [list, setList] = useState(SEED);

  // Real ground listings from backend, merged above bundled seeds.
  useEffect(() => {
    let alive = true;
    listListings({ category: "Grounds", limit: 50 })
      .then((page) => {
        if (!alive || !page?.items?.length) return;
        const remote = page.items.map((l) => ({
          id: `api-${l.id}`,
          backendId: l.id,
          name: l.name,
          address: l.city || "",
          rating: l.avg_rating,
          reviews: l.review_count || 0,
          location: l.city || "",
          pitch: "-",
          matches: 0,
          fee: "-",
          views: 0,
          bg: "#6B7F5E",
          emoji: "🏟",
          mapLink: "",
          facilities: [],
          feesDetail: "-",
        }));
        setList((p) => [...remote, ...p.filter((e) => !String(e.id).startsWith("api-"))]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const [regOpen, setRegOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const insets = useSafeAreaInsets();

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = list.filter(
      (g) => !q || g.name.toLowerCase().includes(q) || g.address.toLowerCase().includes(q)
    );
    if (sortKey === "matches") out = [...out].sort((a, b) => (b.matches || 0) - (a.matches || 0));
    else if (sortKey === "rating") out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortKey === "az") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === "za") out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    return out;
  }, [list, query, sortKey]);

  const submitReg = () => {
    if (!regName.trim() || regPhone.trim().length < 10) return;
    const nm = regName.trim();
    // Persist to backend directory in background; board updates instantly.
    createListing({
      category: "Grounds",
      name: nm,
      city: city || null,
      description: "Cricket ground available for matches and practice.",
      contact: regPhone.trim(),
    }).catch(() => {});
    setList((p) => [
      {
        id: `x-${Date.now()}`, name: nm, address: `${city}, India`,
        rating: null, reviews: 0, location: city, pitch: "Turf", matches: 0,
        fee: "₹-/--", views: 0, bg: "#0E9E9B", emoji: "🏟",
        mapLink: "", facilities: [], feesDetail: "-",
      },
      ...p,
    ]);
    setRegName("");
    setRegPhone("");
    setRegOpen(false);
  };

  const openGround = (item) => {
    navigation?.navigate?.("GroundDetail", { ground: item, city });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Community
        </Text>
        <View style={styles.headerRight}>
<HeaderIconBtn onPress={() => setSearchOn((v) => !v)} label="Search">
  <SearchGlyph />
</HeaderIconBtn>
<HeaderIconBtn
  onPress={() => { setQuery(""); setSearchOn(false); }}
  label="Clear filters"
  badge={query ? 1 : 0}
>
  <FilterGlyph active={!!query} />
</HeaderIconBtn>
        </View>
      </DreamHeader>

      {searchOn && (
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search grounds..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.subRow}>
        <Text style={styles.subTitle} numberOfLines={1}>
          Grounds ({BASE_COUNT + list.length})
        </Text>
        <TouchableOpacity style={styles.registerBtn} activeOpacity={0.85} onPress={() => setRegOpen(true)}>
          <Text style={styles.registerPlus}>⊕</Text>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      <View style={styles.nearRow}>
        <Text style={styles.nearText}>
          <Text style={styles.nearBold}>Nearby </Text>
          <Text style={styles.nearCity} onPress={() => setCityOpen(true)}>
            {city} (change)
          </Text>
        </Text>
        <View style={styles.nearIcons}>
          <TouchableOpacity hitSlop={10} onPress={() => setCityOpen(true)}>
            <Text style={styles.targetIcon}>◎</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={10} onPress={() => setSortOpen(true)}>
            <Text style={[styles.sortIcon, sortKey && { color: TEAL }]}>⇅</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: 16 + insets.bottom }]}
        ListEmptyComponent={<Text style={styles.empty}>No grounds found in {city} yet.</Text>}
        renderItem={({ item }) => <GroundCard item={item} onPress={openGround} />}
      />

      <Modal visible={sortOpen} transparent animationType="slide" onRequestClose={() => setSortOpen(false)}>
        <View style={styles.dimBottom}>
          <Pressable style={styles.backdrop} onPress={() => setSortOpen(false)} />
          <View style={[styles.regSheet, { paddingBottom: 28 + insets.bottom }]}>
            <Text style={styles.sortTitle}>Sort by</Text>
            {SORT_OPTIONS.map((o) => (
              <SortRow
                key={o.key}
                label={o.label}
                selected={sortKey === o.key}
                onPress={() => {
                  setSortKey(o.key);
                  setSortOpen(false);
                }}
              />
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={cityOpen} transparent animationType="fade" onRequestClose={() => setCityOpen(false)}>
        <View style={styles.dim}>
          <Pressable style={styles.backdrop} onPress={() => setCityOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose city</Text>
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.cityRow}
                activeOpacity={0.8}
                onPress={() => {
                  setCity(c);
                  setCityOpen(false);
                }}
              >
                <Text style={[styles.cityRowText, c === city && styles.cityRowOn]}>{c}</Text>
                {c === city && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={regOpen} transparent animationType="slide" onRequestClose={() => setRegOpen(false)}>
        <View style={styles.dimBottom}>
          <Pressable style={styles.backdrop} onPress={() => setRegOpen(false)} />
          <View style={styles.regSheet}>
            <View style={styles.handle} />
            <Text style={styles.regTitle}>Register ground</Text>
            <Text style={styles.regSub}>{city} • Cricket ground</Text>
            <Text style={styles.regLabel}>Ground name</Text>
            <TextInput
              style={styles.regInput}
              placeholder="e.g. Green Park Ground"
              value={regName}
              onChangeText={setRegName}
            />
            <Text style={styles.regLabel}>Phone number</Text>
            <TextInput
              style={styles.regInput}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={regPhone}
              onChangeText={setRegPhone}
            />
            <TouchableOpacity
              style={[styles.regSubmit, (!regName.trim() || regPhone.trim().length < 10) && styles.regSubmitOff]}
              activeOpacity={0.85}
              onPress={submitReg}
            >
              <Text style={styles.regSubmitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },
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
  headerTitle: { color: "#fff", fontSize: 21, fontWeight: "700", flex: 1, marginLeft: 8 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: 6, marginLeft: 4 },
  headerIcon: { color: "#fff", fontSize: 24, fontWeight: "600" },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  filterBadgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: { fontSize: 20, color: "#777", marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: "#111" },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  subTitle: { fontSize: 19, fontWeight: "600", color: "#111", flex: 1 },
  registerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    gap: 6,
  },
  registerPlus: { color: "#fff", fontSize: 18, fontWeight: "700" },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#E5E5E5" },
  nearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  nearText: { fontSize: 17, color: "#111" },
  nearBold: { fontWeight: "700" },
  nearCity: { color: TEAL, fontWeight: "600" },
  nearIcons: { flexDirection: "row", alignItems: "center", gap: 18 },
  targetIcon: { fontSize: 26, color: "#111" },
  sortIcon: { fontSize: 28, color: "#111", fontWeight: "400" },
  list: { paddingHorizontal: 14, paddingTop: 4 },
  empty: { fontSize: 15, color: "#777", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  banner: { width: CARD_W, height: 170, alignItems: "center", justifyContent: "center" },
  bannerEmoji: { fontSize: 72 },
  bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.22)" },
  cardDots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  cardDotOn: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  cardDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.6)", marginTop: 1 },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, gap: 6 },
  name: { fontSize: 21, fontWeight: "400", color: "#222" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ratingPill: {
    borderWidth: 1.2,
    borderColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 3,
    backgroundColor: "#fff",
  },
  ratingText: { color: TEAL, fontSize: 15, fontWeight: "600" },
  reviews: { fontSize: 16, color: "#333" },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaSep: { color: "#DDD", fontSize: 16, marginHorizontal: 12 },
  metaText: { fontSize: 17, color: "#333" },
  cardFoot: {
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fee: { fontSize: 21, color: RED, fontWeight: "700" },
  dim: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  dimBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: "#111", marginBottom: 6 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  cityRowText: { fontSize: 16, color: "#111" },
  cityRowOn: { color: TEAL, fontWeight: "700" },
  tick: { fontSize: 18, color: TEAL, fontWeight: "800" },
  regSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginBottom: 4,
  },
  regTitle: { fontSize: 20, fontWeight: "800", color: "#111", marginTop: 8 },
  regSub: { fontSize: 14, color: "#8A8A8A", marginTop: 4 },
  regLabel: { fontSize: 14, fontWeight: "700", color: "#111", marginTop: 14 },
  regInput: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111",
    marginTop: 6,
  },
  regSubmit: { backgroundColor: TEAL, borderRadius: 10, paddingVertical: 13, alignItems: "center", marginTop: 18 },
  regSubmitOff: { opacity: 0.5 },
  regSubmitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  sortTitle: { fontSize: 24, fontWeight: "700", color: RED, textAlign: "center", marginVertical: 14 },
  sortRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 4, gap: 14 },
  radio: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D5D5D5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioOn: { borderColor: TEAL },
  radioDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: TEAL },
  sortLabel: { fontSize: 19, color: "#333" },
  sortLabelOn: { color: "#111", fontWeight: "600" },
});
