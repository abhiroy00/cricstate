import { useEffect, useMemo, useState } from "react";
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
import { createListing, listListings } from "../../services/engagementService";
import {
  BackGlyph,
  FilterGlyph,
  HeaderIconBtn,
  SearchGlyph,
} from "../../components/HeaderIcon";
import RoleIcon from "../../components/RoleIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

const SEED = [
  {
    id: "b1", name: "NexGen NetZ", location: "Delhi",
    rating: 3.3, reviews: 9, bg: "#101A2E", fg: "#4DB8FF", initials: "NZ",
    phone: "9811012345", fee: "₹1200/slot onwards", charges: "1200/slot onwards",
    desc: "runs indoor cricket nets with bowling machines and night slots for practice.",
    slots: ["06-08 AM", "05-07 PM", "07-09 PM", "09-11 PM"],
  },
  {
    id: "b2", name: "THE MCG  Indoor Cricket Nets", location: "Delhi",
    rating: 2.6, reviews: 5, bg: "#1E5B3E", fg: "#fff", initials: "MCG",
    phone: "9811023456", fee: "₹1000/slot onwards", charges: "1000/slot onwards",
    desc: "offers box cricket and net practice with coaching support on weekends.",
    slots: ["06-09 AM", "04-06 PM", "06-08 PM", "08-10 PM"],
  },
  {
    id: "b3", name: "SmashBox Arena", location: "New Delhi",
    rating: 4.4, reviews: 14, bg: "#5B1E1E", fg: "#FFD166", initials: "SB",
    phone: "9811034567", fee: "₹1500/slot onwards", charges: "1500/slot onwards",
    desc: "hosts 6-a-side box tournaments with floodlights and live scoring.",
    slots: ["07-09 AM", "06-08 PM", "08-10 PM"],
  },
  {
    id: "b4", name: "TurboBox Cricket", location: "Noida",
    rating: null, reviews: 0, bg: "#0E9E9B", fg: "#fff", initials: "TB",
    phone: "9811045678", fee: "₹900/slot onwards", charges: "900/slot onwards",
    desc: "is a new box cricket venue. Slots will open soon.",
    slots: ["06-08 AM", "06-08 PM"],
  },
];

const SORT_OPTIONS = [
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

function BoxCard({ item, onPress, tone }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress?.(item)}>
      <View style={styles.cardTop}>
        <RoleIcon role="box" size={88} tone={tone} style={{ marginRight: 14 }} />
        <View style={styles.mid}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {item.location}
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

export default function BoxCricketScreen({ navigation, route }) {
  const [city, setCity] = useState(route?.params?.city || "Delhi");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [list, setList] = useState(SEED);

  // Real box-cricket listings from backend, merged above bundled seeds.
  useEffect(() => {
    let alive = true;
    listListings({ category: "Box Cricket", limit: 50 })
      .then((page) => {
        if (!alive || !page?.items?.length) return;
        const remote = page.items.map((l) => ({
          id: `api-${l.id}`,
          backendId: l.id,
          name: l.name,
          location: l.city || "",
          rating: l.avg_rating,
          reviews: l.review_count || 0,
          bg: "#101A2E",
          fg: "#4DB8FF",
          initials: l.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
          phone: l.contact || "",
          fee: "₹-/slot onwards",
          charges: "-/slot onwards",
          desc: l.description || "",
          slots: [],
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
      (b) => !q || b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
    );
    if (sortKey === "rating") out = [...out].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortKey === "az") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === "za") out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    return out;
  }, [list, query, sortKey]);

  const submitReg = () => {
    if (!regName.trim() || regPhone.trim().length < 10) return;
    const nm = regName.trim();
    // Persist to backend directory in background; board updates instantly.
    createListing({
      category: "Box Cricket",
      name: nm,
      city: city || null,
      description: "is a new box cricket venue. Slots will open soon.",
      contact: regPhone.trim(),
    }).catch(() => {});
    setList((p) => [
      {
        id: `x-${Date.now()}`, name: nm, location: city,
        rating: null, reviews: 0, bg: "#0E9E9B", fg: "#fff",
        initials: nm.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
        phone: regPhone.trim(), fee: "₹-/slot onwards", charges: "-/slot onwards",
        desc: "is a new box cricket venue. Slots will open soon.",
        slots: ["06-08 AM", "06-08 PM"],
      },
      ...p,
    ]);
    setRegName("");
    setRegPhone("");
    setRegOpen(false);
  };

  const openBox = (item) => {
    navigation?.navigate?.("BoxDetail", { box: item, city });
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
            placeholder="Search venues..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.subRow}>
        <Text style={styles.subTitle} numberOfLines={1}>
          Box Cricket & Nets
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
        ListEmptyComponent={<Text style={styles.empty}>No venues found in {city} yet.</Text>}
        renderItem={({ item, index }) => (
          <BoxCard item={item} onPress={openBox} tone={index % 2 ? "navy" : "red"} />
        )}
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
            <Text style={styles.regTitle}>Register venue</Text>
            <Text style={styles.regSub}>{city} • Box cricket & nets</Text>
            <Text style={styles.regLabel}>Venue name</Text>
            <TextInput
              style={styles.regInput}
              placeholder="e.g. SmashBox Arena"
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
  logoText: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  mid: { flex: 1, justifyContent: "center" },
  name: { fontSize: 22, fontWeight: "500", color: "#222" },
  location: { fontSize: 16, color: "#555", marginTop: 4 },
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
