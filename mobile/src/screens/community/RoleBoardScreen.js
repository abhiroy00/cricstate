import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import FilterSheet from "../../components/FilterSheet";
import { ROLES } from "./roleData";

const RED = "#EA580C";
const TEAL = "#0FA3A3";
const DEFAULT_SCOPE = "New Bongaigaon Railway Colony - September";

function initialsOf(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function roleEntryToPerson(item = {}, rank = 1) {
  return {
    id: String(item.id ?? rank),
    name: item.name ?? "Unknown",
    initials: item.initials || initialsOf(item.name),
    bg: item.bg || "#6E7F80",
    matches: item.matches ?? 0,
    points: item.points ?? 0,
    rate: item.rate || [item.feeDay, item.feeMatch].filter(Boolean).join(", "),
    medal: item.medal ?? true,
  };
}

function RankCard({ item, rank, unit, onContact, onOpen }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onOpen?.(item)}>
      <View style={styles.cardTop}>
        <View style={[styles.photo, { backgroundColor: item.bg }]}>
          <Text style={styles.photoEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.cardMid}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name} <Text style={styles.medal}>🏵</Text>
          </Text>
          <Text style={styles.stat}>
            {unit}: <Text style={styles.statNum}>{item.matches}</Text>
          </Text>
          <Text style={styles.stat}>
            Total points = <Text style={styles.points}>{item.points}</Text>
          </Text>
        </View>
        <Text style={styles.rank}>{rank}</Text>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.fee}>
          {item.feeDay}, {item.feeMatch}
        </Text>
        <TouchableOpacity hitSlop={10} onPress={() => onContact?.(item)}>
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function RoleBoardScreen({ navigation, route }) {
  const roleKey = route?.params?.role || "scorers";
  const role = ROLES[roleKey] || ROLES.scorers;
  const cityParam = route?.params?.city;
  const initialScope = cityParam ? `${cityParam} - September` : DEFAULT_SCOPE;

  const [entries, setEntries] = useState(role.seed);
  const [filtered, setFiltered] = useState(true);
  const [scope, setScope] = useState(initialScope);
  const [expanded, setExpanded] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [badge, setBadge] = useState(4);
  const [infoOpen, setInfoOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const boardCity = cityParam || "India";

  const newEntry = route?.params?.newEntry;
  useEffect(() => {
    if (newEntry) {
      setEntries((p) => [...p, { ...newEntry, id: `x-${Date.now()}` }]);
      navigation.setParams({ newEntry: null });
    }
  }, [newEntry, navigation]);

  useEffect(() => {
    setEntries(role.seed);
    setFiltered(true);
    setScope(route?.params?.city ? `${route.params.city} - September` : DEFAULT_SCOPE);
    setExpanded(false);
  }, [roleKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => b.points - a.points)
      .filter((e) => !q || e.name.toLowerCase().includes(q));
  }, [entries, query]);

  const shown = expanded ? ranked : ranked.slice(0, 4);

  const shareBoard = () => {
    Share.share({
      message: `${role.topOf} ${scope}: ${ranked
        .slice(0, 3)
        .map((e, i) => `${i + 1}. ${e.name} (${e.points} pts)`)
        .join(", ")}`,
    }).catch(() => {});
  };

  const openPerson = (item, index) => {
    const mapped = roleEntryToPerson(item, index + 1);
    navigation?.navigate?.("ProfileDetail", {
      person: { ...mapped, id: String(index + 1) },
      role: roleKey,
      city: boardCity,
      title: role.title,
    });
  };

  const contactPerson = () => {
    navigation?.navigate?.("DirectMessages");
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
          {filtered ? "Community" : role.title}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => setSearchOn((v) => !v)}
          >
            <Text style={styles.headerIcon}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn} onPress={shareBoard}>
            <Text style={styles.headerIcon}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => setSheetOpen(true)}
          >
            <View>
              <Text style={styles.headerIcon}>⧩</Text>
              {badge > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {searchOn && !filtered && (
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${role.title.toLowerCase()}...`}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      )}

      <View style={styles.titleRow}>
        <Text style={styles.titleText} numberOfLines={1}>
          {role.topOf} <Text style={styles.titleAccent}>{filtered ? scope : "India - All"}</Text>
        </Text>
        <TouchableOpacity hitSlop={10} onPress={() => setInfoOpen(true)}>
          <Text style={styles.infoIcon}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pillRow}>
        <View style={styles.allPill}>
          <Text style={styles.allText}>All</Text>
        </View>
      </View>

      {filtered ? (
        <View style={styles.empty}>
          <View style={styles.emptyArt}>
            <View style={styles.emptyDot} />
            <View style={styles.emptyTriangle} />
            <View style={styles.emptyLines}>
              <View style={styles.emptyLine} />
              <View style={[styles.emptyLine, styles.emptyLineShort]} />
            </View>
          </View>
          <Text style={styles.emptyText}>
            Sorry, leaderboard data not found.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.85}
            onPress={() => {
              setFiltered(false);
              setBadge(1);
            }}
          >
            <Text style={styles.resetText}>Reset filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <RankCard
              item={item}
              rank={index + 1}
              unit={role.unit}
              onContact={contactPerson}
              onOpen={(tapped) => openPerson(tapped, index)}
            />
          )}
        />
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.viewBtn}
          activeOpacity={0.8}
          onPress={() => {
            if (filtered) {
              setFiltered(false);
              setBadge(1);
            } else {
              setExpanded((v) => !v);
            }
          }}
        >
          <Text style={styles.viewText}>
            {filtered ? "View all" : expanded ? "Show less" : "View all"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.regBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation?.navigate?.("AddRole", { role: roleKey })
          }
        >
          <Text style={styles.regText}>Register</Text>
        </TouchableOpacity>
      </View>

      <FilterSheet
        visible={sheetOpen}
        initialCat="LOCATION"
        onClose={() => setSheetOpen(false)}
        onApply={(f) => {
          const n =
            (f.locations?.length || 0) +
            (f.types?.length || 0) +
            (f.balls?.length || 0);
          setBadge(n);
          if (n === 0) {
            setFiltered(false);
          } else {
            setFiltered(true);
            setScope(
              f.locations?.[0]
                ? `${f.locations[0]} - September`
                : DEFAULT_SCOPE
            );
          }
        }}
      />

      <Modal
        visible={infoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.infoDim}>
          <Pressable style={styles.infoBackdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Leaderboard</Text>
            <Text style={styles.infoBody}>
              Members are ranked by points earned from {role.title.toLowerCase()}{" "}
              assignments in the selected region and month.
            </Text>
            <TouchableOpacity
              style={styles.infoBtn}
              onPress={() => setInfoOpen(false)}
            >
              <Text style={styles.infoBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 21,
    fontWeight: "700",
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  titleText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  titleAccent: {
    color: TEAL,
    fontWeight: "500",
  },
  infoIcon: {
    fontSize: 22,
    color: "#BBB",
    marginLeft: 8,
  },
  pillRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  allPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  allText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 16,
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
    alignItems: "center",
    padding: 12,
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  photoEmoji: {
    fontSize: 52,
  },
  cardMid: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    color: "#333",
  },
  medal: {
    fontSize: 18,
  },
  stat: {
    fontSize: 15,
    color: "#555",
    marginTop: 6,
  },
  statNum: {
    color: "#111",
    fontWeight: "600",
  },
  points: {
    color: TEAL,
    fontWeight: "600",
  },
  rank: {
    fontSize: 44,
    fontWeight: "300",
    color: "#111",
    marginLeft: 8,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fee: {
    fontSize: 15,
    color: "#888",
  },
  chatIcon: {
    fontSize: 24,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
  },
  emptyArt: {
    width: 280,
    height: 190,
    borderWidth: 3,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    paddingTop: 18,
    overflow: "visible",
  },
  emptyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D9D9D9",
  },
  emptyTriangle: {
    width: 0,
    height: 0,
    marginTop: 14,
    borderLeftWidth: 52,
    borderRightWidth: 52,
    borderBottomWidth: 78,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#D9D9D9",
  },
  emptyLines: {
    marginTop: 14,
    alignItems: "center",
  },
  emptyLine: {
    width: 190,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E2E2",
    marginTop: 0,
  },
  emptyLineShort: {
    width: 130,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 18,
    color: "#111",
    marginTop: 20,
  },
  resetBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 36,
    paddingVertical: 13,
    marginTop: 16,
  },
  resetText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
  },
  viewBtn: {
    flex: 1,
    backgroundColor: "#EFEFEF",
    paddingVertical: 18,
    alignItems: "center",
  },
  viewText: {
    fontSize: 19,
    color: "#111",
  },
  regBtn: {
    flex: 1,
    backgroundColor: TEAL,
    paddingVertical: 18,
    alignItems: "center",
  },
  regText: {
    fontSize: 19,
    color: "#fff",
  },
  infoDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  infoBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  infoBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  infoBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
    marginTop: 8,
  },
  infoBtn: {
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 14,
  },
  infoBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
