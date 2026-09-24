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

const RED = "#D71920";
const TEAL = "#0E9E9B";
const BASE_COUNT = 6190;

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

const SEED = [
  {
    id: "o1", name: "Tinku Haroli", location: "Firozpur", tournaments: 464,
    rating: null, reviews: 0, bg: "#2E3B4E", fg: "#fff", initials: "TH",
    phone: "9811011111", fee: "₹5000/team onwards", charges: "5000/team onwards",
    desc: "organises leather and tennis ball tournaments across Punjab with live scoring and trophies.",
  },
  {
    id: "o2", name: "Mayank", location: "New Delhi", tournaments: 354,
    rating: null, reviews: 0, bg: "#2E3B4E", fg: "#fff", initials: "M",
    phone: null, fee: null, charges: null,
    desc: null,
  },
  {
    id: "o3", name: "Saiyad Safvan  ( Noddy)", location: "Jaipur", tournaments: 290,
    rating: 4.5, reviews: 17, bg: "#3E7C4F", fg: "#fff", initials: "SS",
    phone: "9811033333", fee: "₹7000/team onwards", charges: "7000/team onwards",
    desc: "hosts pink-city cups with day-night matches, pro umpires and live streaming.",
  },
  {
    id: "o4", name: "WDZ", location: "Nagpur", tournaments: 222,
    rating: 5.0, reviews: 10, bg: "#111111", fg: "#4DD06D", initials: "WDZ",
    phone: "9811044444", fee: "₹8000/team onwards", charges: "8000/team onwards",
    desc: "organises corporate and open tournaments in Vidarbha with quality grounds and prizes.",
  },
  {
    id: "o5", name: "BuddiesUnited", location: "Coimbatore", tournaments: 180,
    rating: 4.2, reviews: 8, bg: "#111111", fg: "#F5C518", initials: "BU",
    phone: "9811055555", fee: "₹6000/team onwards", charges: "6000/team onwards",
    desc: "conducts friends-cup and charity tournaments in Tamil Nadu with family-friendly venues.",
  },
];

const SORT_OPTIONS = [
  { key: "tournaments", label: "Tournaments - High to Low" },
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

function OrganiserCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress?.(item)}>
      <View style={styles.cardTop}>
        <View style={[styles.logo, { backgroundColor: item.bg }]}>
          <Text style={[styles.logoText, { color: item.fg || "#fff" }]} numberOfLines={2}>
            {item.initials}
          </Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={styles.tournaments}>
            Tournaments Organised : <Text style={styles.tournamentsNum}>{item.tournaments}</Text>
          </Text>
        </View>
      </View>
      {typeof item.rating === "number" && (
        <View style={styles.cardFoot}>
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{`${item.rating.toFixed(1)}/5`}</Text>
          </View>
          <Text style={styles.reviews}>{item.reviews} Review(s)</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function OrganisersScreen({ navigation, route }) {
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
      (o) => !q || o.name.toLowerCase().includes(q) || o.location.toLowerCase().includes(q)
    );
    if (sortKey === "tournaments") out = [...out].sort((a, b) => (b.tournaments || 0) - (a.tournaments || 0));
    else if (sortKey === "rating") out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortKey === "az") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === "za") out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    return out;
  }, [list, query, sortKey]);

  const submitReg = () => {
    if (!regName.trim() || regPhone.trim().length < 10) return;
    const nm = regName.trim();
    setList((p) => [
      {
        id: `x-${Date.now()}`,
        name: nm,
        location: city,
        tournaments: 0,
        rating: null,
        reviews: 0,
        bg: "#0E9E9B",
        fg: "#fff",
        initials: nm.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
        phone: regPhone.trim(),
        fee: "₹-/team onwards",
        charges: "-/team onwards",
        desc: "is a new tournament organiser. Tournaments will appear here soon.",
      },
      ...p,
    ]);
    setRegName("");
    setRegPhone("");
    setRegOpen(false);
  };

  const openOrganiser = (item) => {
    navigation?.navigate?.("OrganiserDetail", { organiser: item, city });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity hitSlop={12} style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Community
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn} onPress={() => setSearchOn((v) => !v)}>
            <Text style={styles.headerIcon}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn}>
            <View>
              <Text style={styles.headerIcon}>⧩</Text>
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>1</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {searchOn && (
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search organisers..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.subRow}>
        <Text style={styles.subTitle} numberOfLines={1}>
          Tournament organisers ({BASE_COUNT + list.length})
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
        <TouchableOpacity hitSlop={10} onPress={() => setSortOpen(true)}>
          <Text style={[styles.sortIcon, sortKey && { color: TEAL }]}>⇅</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: 16 + insets.bottom }]}
        ListEmptyComponent={<Text style={styles.empty}>No organisers found in {city} yet.</Text>}
        renderItem={({ item }) => <OrganiserCard item={item} onPress={openOrganiser} />}
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
            <Text style={styles.regTitle}>Register as organiser</Text>
            <Text style={styles.regSub}>{city} • Tournaments</Text>
            <Text style={styles.regLabel}>Organisation / your name</Text>
            <TextInput
              style={styles.regInput}
              placeholder="e.g. City Cricket League"
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
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  sortIcon: { fontSize: 28, color: "#111", fontWeight: "400" },
  list: { paddingHorizontal: 14, paddingTop: 4 },
  empty: { fontSize: 15, color: "#777", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", padding: 14 },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#EEE",
    paddingHorizontal: 6,
  },
  logoText: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  mid: { flex: 1, justifyContent: "center" },
  name: { fontSize: 22, fontWeight: "500", color: "#222" },
  location: { fontSize: 16, color: "#555", marginTop: 2 },
  tournaments: { fontSize: 16, color: "#8A8A8A", marginTop: 10 },
  tournamentsNum: { color: "#111", fontWeight: "600" },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#F4F4F4",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
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
