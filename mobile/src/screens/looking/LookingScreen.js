import { useEffect, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";

import { useAuth } from "../../hooks/useAuth";
import { useLooking } from "./LookingContext";
import FilterSheet from "../../components/FilterSheet";

// FilterSheet TYPE -> post type mapping (unmapped sheet options are ignored)
const SHEET_TYPE_MAP = {
  Opponent: ["Opponent"],
  "Team to Join": ["Player"],
  Player: ["Player"],
  Umpire: ["Umpire"],
  Scorer: ["Scorer"],
};

const RED = "#D71920";
const TEAL = "#0FA3A3";

const FILTER_CHIPS = ["Opponent", "Team to join", "Player", "Umpire"];

const POST_TYPES = ["Player", "Opponent", "Umpire", "Scorer"];

function LookingHeader({ onMenu, onTarget, onMessage, onFilter, filterCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onMenu}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Text style={styles.logoBall}>🏏</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={styles.proBtn}>
          <Text style={styles.proBtnText}>PRO @ ₹199</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onTarget}>
          <Text style={styles.headerIcon}>⌖</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onMessage}>
          <Text style={styles.headerIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onFilter}>
          <View>
            <Text style={styles.headerIcon}>⧩</Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LookingCard({ item, onContact }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
          <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
          {item.pro && (
            <View style={styles.proTag}>
              <Text style={styles.proTagText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardText}>
          <Text style={styles.cardAuthor}>{item.line.split(" is looking")[0]}</Text>
          <Text> is looking for a </Text>
          <Text style={styles.cardNeed}>
            {item.need} ({item.needDetail})
          </Text>
          <Text> to join his team.</Text>
        </Text>
        <Text style={styles.personIcon}>♡</Text>
      </View>

      {item.bullets.map((b) => (
        <Text key={b} style={styles.bullet}>
          {"\u25CF"} {b}
        </Text>
      ))}

      <View style={styles.cardFoot}>
        <View style={styles.footLeft}>
          <Text style={styles.time}>{item.time}</Text>
          <Text style={styles.ball}>🔴</Text>
        </View>
        <View style={styles.footMid}>
          <Text style={styles.pin}>📍</Text>
          <Text style={styles.km}>{item.km}</Text>
        </View>
        <TouchableOpacity
          style={styles.contactBtn}
          activeOpacity={0.7}
          onPress={() => onContact?.(item)}
        >
          <Text style={styles.contactIcon}>💬</Text>
          <Text style={styles.contactText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Bottom sheet with invisible outside-tap catcher (panel-bahar-tap pattern)
function Sheet({ visible, onClose, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetDim}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />
        <View style={styles.sheetBox}>{children}</View>
      </View>
    </Modal>
  );
}

export default function LookingScreen({ navigation, route }) {
  const { user } = useAuth();
  const { posts, addPost } = useLooking();
  const [chip, setChip] = useState(null);
  const [myOnly, setMyOnly] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [sheetFilter, setSheetFilter] = useState({
    locations: [],
    types: [],
    balls: [],
  });
  const [postOpen, setPostOpen] = useState(false);
  const [contactFor, setContactFor] = useState(null);
  const [draftType, setDraftType] = useState("Player");
  const [draftNeed, setDraftNeed] = useState("");
  const [draftDetail, setDraftDetail] = useState("");

  // Categories grid se aayi choice -> composer kholo
  const composeParam = route?.params?.compose;
  useEffect(() => {
    if (composeParam) {
      setDraftType(composeParam.type || "Player");
      setDraftNeed(composeParam.need || "");
      setPostOpen(true);
      navigation.setParams({ compose: null });
    }
  }, [composeParam, navigation]);

  const firstName = user?.full_name?.split(" ")?.[0] || "You";
  const sheetCount =
    (sheetFilter.locations?.length || 0) +
    (sheetFilter.types?.length || 0) +
    (sheetFilter.balls?.length || 0);
  const filterCount = sheetCount + (chip ? 1 : 0) + (myOnly ? 1 : 0);
  const locLabel =
    sheetFilter.locations?.[0] || "New Bongaigaon Railway Colony";

  const sheetTypes = (() => {
    const sel = sheetFilter.types || [];
    if (sel.length === 0) return null;
    const mapped = sel.flatMap((t) => SHEET_TYPE_MAP[t] || []);
    return mapped.length > 0 ? mapped : null;
  })();
  const visiblePosts = posts.filter((p) => {
    if (myOnly && !p.mine) return false;
    if (sheetTypes && !sheetTypes.includes(p.type)) return false;
    if (chip === "Opponent" && p.type !== "Opponent") return false;
    if (chip === "Team to join" && p.type !== "Player") return false;
    if (chip === "Player" && p.type !== "Player") return false;
    if (chip === "Umpire" && p.type !== "Umpire") return false;
    return true;
  });

  const openDrawer = () =>
    navigation?.dispatch?.(DrawerActions.openDrawer());

  const clearFilters = () => {
    setChip(null);
    setMyOnly(false);
    setSheetFilter({ locations: [], types: [], balls: [] });
  };

  const submitPost = () => {
    const need = draftNeed.trim() || draftType;
    const detail = draftDetail.trim() || "Open";
    const name = user?.full_name || "Your team";
    addPost({
      author: firstName,
      team: "My Team",
      mine: true,
      pro: false,
      avatarEmoji: "🧑🏽",
      avatarBg: "#3A3A3A",
      need: draftType === "Opponent" ? "Opponent" : need,
      needDetail: detail,
      line: `${name} is looking for a ${need} (${detail}) to join his team.`,
      bullets: [`${need} (${detail})`],
      time: "Just now",
      km: "-- KM",
      type: draftType,
    });
    setDraftNeed("");
    setDraftDetail("");
    setDraftType("Player");
    setPostOpen(false);
    setMyOnly(true);
  };

  const contact = (kind, item) => {
    const msg = encodeURIComponent(
      `Hi ${item?.author || ""}, I saw your Looking post on CricState.`
    );
    const url =
      kind === "call"
        ? "tel:+919999999999"
        : kind === "whatsapp"
          ? `https://wa.me/919999999999?text=${msg}`
          : null;
    if (url) Linking.openURL(url).catch(() => {});
    else navigation?.navigate?.("DirectMessages");
    setContactFor(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LookingHeader
        onMenu={openDrawer}
        onTarget={() => {}}
        onMessage={() => navigation?.navigate?.("DirectMessages")}
        onFilter={() => setFilterVisible(true)}
        filterCount={filterCount}
      />

      <View style={styles.subRow}>
        <Text style={styles.subTitle}>
          Looking for <Text style={styles.subAccent}>Umpire?</Text>
        </Text>
        <View style={styles.subBtns}>
          <TouchableOpacity
            style={styles.pillBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("LookingCategories")}
          >
            <Text style={styles.pillBtnText}>⊕  Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pillBtn, myOnly && styles.pillBtnOn]}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("YourPosts")}
          >
            <Text style={styles.pillBtnText}>○  You</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.locRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.locScroll}
        >
          <Text style={styles.locText}>{locLabel}</Text>
          <View style={styles.locDivider} />
          {FILTER_CHIPS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, chip === c && styles.chipOn]}
              activeOpacity={0.8}
              onPress={() => setChip((p) => (p === c ? null : c))}
            >
              <Text style={[styles.chipText, chip === c && styles.chipTextOn]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filterCount > 0 && (
        <View style={styles.activeRow}>
          <Text style={styles.activeText} numberOfLines={1}>
            {myOnly
              ? "*Showing only your posts"
              : sheetCount > 0
                ? `*${sheetCount} filter${sheetCount > 1 ? "s" : ""} applied`
                : `*Filtered: ${chip}`}
          </Text>
          <TouchableOpacity hitSlop={8} onPress={clearFilters}>
            <Text style={styles.clearLink}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={visiblePosts}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptySub}>
              Be the first to post what you are looking for.
            </Text>
            <TouchableOpacity
              style={styles.pillBtn}
              activeOpacity={0.85}
              onPress={() => navigation?.navigate?.("LookingCategories")}
            >
              <Text style={styles.pillBtnText}>⊕  Post</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <LookingCard item={item} onContact={setContactFor} />
        )}
      />

      {/* Post composer */}
      <Sheet visible={postOpen} onClose={() => setPostOpen(false)}>
        <Text style={styles.sheetTitle}>Post what you're looking for</Text>
        <Text style={styles.sheetLabel}>I need</Text>
        <View style={styles.typeRow}>
          {POST_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, draftType === t && styles.chipOn]}
              onPress={() => setDraftType(t)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  draftType === t && styles.chipTextOn,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="e.g. Bowler, Opponent team, Umpire"
          value={draftNeed}
          onChangeText={setDraftNeed}
        />
        <TextInput
          style={styles.input}
          placeholder="e.g. Right-arm medium, T20 Sunday"
          value={draftDetail}
          onChangeText={setDraftDetail}
        />
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={submitPost}
        >
          <Text style={styles.submitText}>Post</Text>
        </TouchableOpacity>
      </Sheet>

      {/* Contact sheet */}
      <Sheet visible={!!contactFor} onClose={() => setContactFor(null)}>
        <Text style={styles.sheetTitle}>
          Contact {contactFor?.author || ""}
        </Text>
        <Text style={styles.sheetSub}>
          {contactFor?.team || ""} • {contactFor?.need || ""} (
          {contactFor?.needDetail || ""})
        </Text>
        <TouchableOpacity
          style={styles.contactRow}
          activeOpacity={0.8}
          onPress={() => contact("call", contactFor)}
        >
          <Text style={styles.contactRowEmoji}>📞</Text>
          <Text style={styles.contactRowText}>Call now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactRow}
          activeOpacity={0.8}
          onPress={() => contact("whatsapp", contactFor)}
        >
          <Text style={styles.contactRowEmoji}>💬</Text>
          <Text style={styles.contactRowText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactRow}
          activeOpacity={0.8}
          onPress={() => contact("dm", contactFor)}
        >
          <Text style={styles.contactRowEmoji}>✉</Text>
          <Text style={styles.contactRowText}>Send message</Text>
        </TouchableOpacity>
      </Sheet>

      <FilterSheet
        visible={filterVisible}
        initialCat="TYPE"
        onClose={() => setFilterVisible(false)}
        onApply={(f) => setSheetFilter(f)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  logoWrap: {
    marginLeft: 6,
  },
  logoBall: {
    fontSize: 30,
  },
  proBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  proBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  subTitle: {
    fontSize: 18,
    color: "#111",
    flex: 1,
  },
  subAccent: {
    color: TEAL,
  },
  subBtns: {
    flexDirection: "row",
  },
  pillBtn: {
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginLeft: 8,
  },
  pillBtnOn: {
    backgroundColor: "#0B6E4F",
  },
  pillBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  locRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    paddingVertical: 10,
  },
  locScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  locText: {
    fontSize: 16,
    color: TEAL,
    textDecorationLine: "underline",
  },
  locDivider: {
    width: 1,
    height: 24,
    backgroundColor: TEAL,
    marginHorizontal: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipOn: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "500",
  },
  chipTextOn: {
    color: "#fff",
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  activeText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
  },
  clearLink: {
    fontSize: 16,
    color: TEAL,
    fontWeight: "500",
  },
  list: {
    padding: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 30,
  },
  proTag: {
    position: "absolute",
    left: -4,
    top: 12,
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  proTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
  },
  cardAuthor: {
    fontWeight: "400",
  },
  cardNeed: {
    fontWeight: "700",
    color: "#111",
  },
  personIcon: {
    fontSize: 30,
    color: "#BBB",
    marginLeft: 6,
  },
  bullet: {
    fontSize: 15,
    color: "#333",
    marginTop: 10,
    marginLeft: 56,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  footLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 14,
    color: "#999",
  },
  ball: {
    fontSize: 18,
    marginLeft: 12,
  },
  footMid: {
    flexDirection: "row",
    alignItems: "center",
  },
  pin: {
    fontSize: 22,
  },
  km: {
    fontSize: 15,
    color: TEAL,
    marginLeft: 2,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    fontSize: 22,
  },
  contactText: {
    fontSize: 16,
    color: TEAL,
    marginLeft: 6,
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
    marginBottom: 14,
  },
  sheetDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    maxHeight: "85%",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  sheetSub: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    marginBottom: 8,
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginTop: 12,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111",
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  contactRowEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  contactRowText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
});
