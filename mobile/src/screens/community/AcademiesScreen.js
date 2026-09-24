import { useMemo, useState } from "react";
import {
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
import {
  BackGlyph,
  FilterGlyph,
  HeaderIconBtn,
  SearchGlyph,
} from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";
const BASE_COUNT = 28;

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

const SEED = [
  {
    id: "a1", name: "Shahi Cricket Academy",
    address: "Pradhan Enclave Marg, Block B, Padhan Enclave, Burari, Delhi, 110084, India",
    fee: "₹2000/1m", rating: 5.0, reviews: 1, views: 1016,
    bg: "#8A9A8B", emoji: "🏏",
    facilities: ["Physical Training", "Turf Wicket", "Concrete Wicket", "Playing Kit"],
    ageGroup: "-", duration: "-", feesDetail: "₹2000/1months",
    coaches: [
      { name: "Ravi Shukla", exp: "10 yrs", role: "Head Coach • Batting" },
      { name: "Imran Sheikh", exp: "7 yrs", role: "Bowling Coach" },
    ],
  },
  {
    id: "a2", name: "AB Cricket Academy", address: "Daulatpur, Delhi",
    fee: "₹2000-5000", rating: null, reviews: 0, views: 342,
    bg: "#5C7A4E", emoji: "🏟",
    facilities: ["Turf Wicket", "Nets", "Playing Kit"],
    ageGroup: "U-14 to U-19", duration: "3 months", feesDetail: "₹2000-5000/month",
    coaches: [{ name: "Amit Bisht", exp: "8 yrs", role: "Head Coach" }],
  },
  {
    id: "a3", name: "Young Stars Academy", address: "Rohini, Delhi",
    fee: "₹1500/1m", rating: 4.0, reviews: 5, views: 587,
    bg: "#3E6B8A", emoji: "🏏",
    facilities: ["Physical Training", "Concrete Wicket", "Weekend Batches"],
    ageGroup: "U-12 to U-16", duration: "-", feesDetail: "₹1500/1month",
    coaches: [{ name: "Suresh Yadav", exp: "12 yrs", role: "Head Coach • All-round" }],
  },
  {
    id: "a4", name: "Elite Cricket Academy", address: "Dwarka, Delhi",
    fee: "₹3000/1m", rating: 4.8, reviews: 12, views: 1204,
    bg: "#7A5C8A", emoji: "🏆",
    facilities: ["Turf Wicket", "Bowling Machine", "Video Analysis", "Gym"],
    ageGroup: "U-14 to U-25", duration: "6 months", feesDetail: "₹3000/1month",
    coaches: [
      { name: "Vikram Rathore", exp: "15 yrs", role: "Head Coach" },
      { name: "Neha Singh", exp: "6 yrs", role: "Fitness Trainer" },
    ],
  },
];

export function feeValue(fee = "") {
  const m = String(fee).replace(/,/g, "").match(/\d+/);
  return m ? parseInt(m[0], 10) : 999999;
}

const SORT_OPTIONS = [
  { key: "rating", label: "Ratings - High to Low" },
  { key: "fees", label: "Fees - Low to High" },
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

function AcademyCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress?.(item)}>
      <View style={[styles.banner, { backgroundColor: item.bg }]}>
        <Text style={styles.bannerEmoji}>{item.emoji}</Text>
        <View style={styles.bannerShade} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.address} numberOfLines={2}>
          {item.address}
        </Text>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.fee}>{item.fee}</Text>
        <View style={styles.footRight}>
          {typeof item.rating === "number" && (
            <View style={styles.ratingPill}>
              <Text style={styles.ratingText}>{`${item.rating.toFixed(1)}/5`}</Text>
            </View>
          )}
          {typeof item.rating === "number" && (
            <Text style={styles.reviews}>{item.reviews} Review(s)</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function AcademiesScreen({ navigation, route }) {
  const [city, setCity] = useState(route?.params?.city || "Delhi");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [list, setList] = useState(SEED);
  const [regOpen, setRegOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const insets = useSafeAreaInsets();

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = list.filter(
      (a) => !q || a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q)
    );
    if (sortKey === "rating") out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortKey === "fees") out = [...out].sort((a, b) => feeValue(a.fee) - feeValue(b.fee));
    else if (sortKey === "az") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === "za") out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    return out;
  }, [list, query, sortKey]);

  const submitReg = () => {
    if (!regName.trim() || regPhone.trim().length < 10) return;
    const nm = regName.trim();
    setList((p) => [
      {
        id: `x-${Date.now()}`, name: nm, address: `${city}`, fee: "₹-/1m",
        rating: null, reviews: 0, views: 0, bg: "#0E9E9B", emoji: "🏏",
        facilities: [], ageGroup: "-", duration: "-", feesDetail: "-",
        coaches: [],
      },
      ...p,
    ]);
    setRegName("");
    setRegPhone("");
    setRegOpen(false);
  };

  const openAcademy = (item) => {
    navigation?.navigate?.("AcademyDetail", { academy: item, city });
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
            placeholder="Search academies..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.subRow}>
        <Text style={styles.subTitle} numberOfLines={1}>
          Find cricket academies ({BASE_COUNT + list.length})
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
        ListEmptyComponent={<Text style={styles.empty}>No academies found in {city} yet.</Text>}
        renderItem={({ item }) => <AcademyCard item={item} onPress={openAcademy} />}
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
            <Text style={styles.regTitle}>Register academy</Text>
            <Text style={styles.regSub}>{city} • Cricket academy</Text>
            <Text style={styles.regLabel}>Academy name</Text>
            <TextInput
              style={styles.regInput}
              placeholder="e.g. City Cricket Academy"
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
  subTitle: { fontSize: 18, fontWeight: "600", color: "#111", flex: 1 },
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
  banner: { height: 170, alignItems: "center", justifyContent: "center" },
  bannerEmoji: { fontSize: 72 },
  bannerShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  body: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 },
  name: { fontSize: 21, fontWeight: "400", color: "#222" },
  address: { fontSize: 16, color: "#555", marginTop: 2, lineHeight: 21 },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fee: { fontSize: 22, color: RED, fontWeight: "700" },
  footRight: { flexDirection: "row", alignItems: "center", gap: 10 },
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
