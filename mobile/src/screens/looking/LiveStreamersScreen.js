import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#D71920";
const TEAL = "#0FA3A3";

const STREAMERS = [
  {
    id: "1",
    name: "A1 Sports",
    videos: 1,
    rating: "1.0/5",
    ratingNum: 1.0,
    reviews: 1,
    emoji: "🔴",
    bg: "#F5F5F5",
    city: "New Delhi",
    live: false,
  },
  {
    id: "2",
    name: "Aditya Sports Network",
    videos: 129,
    rating: "4.6/5",
    ratingNum: 4.6,
    reviews: 7,
    emoji: "📹",
    bg: "#7A0E14",
    city: "New Delhi",
    live: false,
  },
  {
    id: "3",
    name: "Aman entertainments",
    videos: 12,
    rating: "1.0/5",
    ratingNum: 1.0,
    reviews: 1,
    emoji: "📷",
    bg: "#1A237E",
    city: "Mumbai",
    live: false,
  },
  {
    id: "4",
    name: "AWADH SPORTS",
    videos: 4159,
    rating: "4.6/5",
    ratingNum: 4.6,
    reviews: 79,
    emoji: "⭐",
    bg: "#101828",
    city: "Lucknow",
    live: true,
  },
];

const SORTS = ["Videos", "Rating", "Name"];

function StreamerCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={[styles.logo, { backgroundColor: item.bg }]}>
          <Text style={styles.logoEmoji}>{item.emoji}</Text>
          {item.live && (
            <View style={styles.liveTag}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <View style={styles.cardMid}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.videos}>Streamed Videos : {item.videos}</Text>
          <Text style={styles.city}>{item.city}</Text>
        </View>
      </View>
      <View style={styles.cardFoot}>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.reviews}>{item.reviews} Review(s)</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function LiveStreamersScreen({ navigation, route }) {
  const [cities, setCities] = useState(["New Delhi"]);
  const [query, setQuery] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [sort, setSort] = useState("Videos");
  const [sortIdx, setSortIdx] = useState(0);

  const locParam = route?.params?.locations;
  useEffect(() => {
    if (locParam) {
      setCities(locParam);
      navigation.setParams({ locations: null });
    }
  }, [locParam, navigation]);

  const liveCount = STREAMERS.filter((s) => s.live).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = STREAMERS.filter((s) => {
      if (cities.length > 0 && !cities.includes(s.city)) return false;
      if (q && !s.name.toLowerCase().includes(q)) return false;
      return true;
    });
    arr = [...arr];
    if (sort === "Videos") arr.sort((a, b) => b.videos - a.videos);
    else if (sort === "Rating") arr.sort((a, b) => b.ratingNum - a.ratingNum);
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [cities, query, sort]);

  const cycleSort = () => {
    const next = (sortIdx + 1) % SORTS.length;
    setSortIdx(next);
    setSort(SORTS[next]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={12}
          style={styles.iconBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Live streamer ({liveCount})
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => setSearchOn((v) => !v)}
          >
            <Text style={styles.headerIcon}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigation?.navigate?.("LiveFilter")}
          >
            <View>
              <Text style={styles.headerIcon}>⧩</Text>
              {cities.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{cities.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {searchOn && (
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search streamers..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.subRow}>
        <Text style={styles.subTitle}>Live streamers</Text>
        <TouchableOpacity
          style={styles.regBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation?.navigate?.("LookingForm", {
              formKey: "live",
              returnTo: "LiveStreamers",
            })
          }
        >
          <Text style={styles.regText}>⊕  Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.nearRow}>
        <Text style={styles.nearText}>
          Nearby{" "}
          <Text style={styles.nearCity}>
            {cities[0] || "All cities"}
            {cities.length > 0 ? " (change)" : ""}
          </Text>
        </Text>
        <TouchableOpacity hitSlop={10} onPress={cycleSort} activeOpacity={0.7}>
          <Text style={styles.sortIcon}>⇅</Text>
        </TouchableOpacity>
      </View>
      {sortIdx > 0 && (
        <Text style={styles.sortHint}>Sorted by {sort}</Text>
      )}

      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📹</Text>
            <Text style={styles.emptyTitle}>No streamers here yet</Text>
            <Text style={styles.emptySub}>
              Change location filter or register as a streamer.
            </Text>
          </View>
        }
        renderItem={({ item }) => <StreamerCard item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "500",
    flex: 1,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: "#777",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  regBtn: {
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  regText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  nearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  nearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  nearCity: {
    color: TEAL,
    fontWeight: "500",
  },
  sortIcon: {
    fontSize: 24,
    color: "#111",
  },
  sortHint: {
    fontSize: 12,
    color: "#999",
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 14,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    padding: 14,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  liveTag: {
    position: "absolute",
    bottom: 6,
    backgroundColor: RED,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  cardMid: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    color: "#333",
    fontWeight: "400",
  },
  videos: {
    fontSize: 15,
    color: "#888",
    marginTop: 10,
  },
  city: {
    fontSize: 13,
    color: "#AAA",
    marginTop: 4,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ratingPill: {
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 10,
  },
  ratingText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: "600",
  },
  reviews: {
    fontSize: 15,
    color: "#333",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
});
