import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
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
import { listListings } from "../../services/engagementService";
import {
  BackGlyph,
  FilterGlyph,
  HeaderIconBtn,
  SearchGlyph,
  ShareGlyph,
} from "../../components/HeaderIcon";
import RoleIcon from "../../components/RoleIcon";
import SearchOverlay from "../../components/SearchOverlay";

const RED = "#E01A22";
const TEAL = "#00A651";
const INK = "#1A1A1A";
const GREY = "#8A8A8A";

/* Header white icons */

function SearchIcon() {
  return (
    <View style={{ width: 26, height: 26 }}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function ShareIcon() {
  return (
    <View style={styles.shareWrap}>
      <View style={styles.shareDotTop} />
      <View style={styles.shareDotMid} />
      <View style={styles.shareDotBot} />
      <View style={[styles.shareBar, styles.shareBarTop]} />
      <View style={[styles.shareBar, styles.shareBarBot]} />
    </View>
  );
}

function FilterIcon({ count }) {
  return (
    <View style={{ width: 28, height: 26 }}>
      <View style={styles.funnelTop} />
      <View style={styles.funnelV}>
        <View style={[styles.funnelArm, { transform: [{ rotate: "38deg" }] }]} />
        <View style={[styles.funnelArm, { transform: [{ rotate: "-38deg" }] }]} />
      </View>
      <View style={styles.funnelStem} />
      {count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
}

/* Chhota medal badge (kuch names ke paas) */

function Medal() {
  return (
    <View style={styles.medalWrap}>
      <View style={styles.medalRibbonL} />
      <View style={styles.medalRibbonR} />
      <View style={styles.medalRing}>
        <Text style={styles.medalStar}>★</Text>
      </View>
    </View>
  );
}

function ChatIcon() {
  return (
    <View style={{ width: 26, height: 24, alignItems: "center" }}>
      <View style={styles.chatBox}>
        <View style={styles.chatLine} />
        <View style={[styles.chatLine, { width: 9 }]} />
      </View>
      <View style={styles.chatTail} />
    </View>
  );
}

function RankCard({ item, statLabel, onChat, onOpen, role, tone }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onOpen}
    >
      <View style={styles.cardTop}>
        <RoleIcon role={role} size={84} tone={tone} style={{ marginRight: 10 }} />
        <View style={styles.mid}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.medal && <Medal />}
          </View>
          <Text style={styles.stat}>
            {statLabel}: <Text style={styles.statVal}>{item.matches}</Text>
          </Text>
          <Text style={styles.stat}>
            Total points = <Text style={styles.statTeal}>{item.points}</Text>
          </Text>
        </View>
        <View style={styles.rankWrap}>
          <Text
            style={[styles.rank, item.id.length > 1 && styles.rankSmall]}
            numberOfLines={1}
          >
            {item.id}
          </Text>
        </View>
      </View>
      <View style={styles.cardFoot}>
        <Text style={styles.rate}>{item.rate}</Text>
        <TouchableOpacity hitSlop={10} onPress={onChat} activeOpacity={0.7}>
          <ChatIcon />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function LeaderboardScreen({
  navigation,
  city = "Delhi",
  title = "Scorers",
  role = "scorers",
  statLabel = "Matches Scored",
  list = [],
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [regOpen, setRegOpen] = useState(false);
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDone, setRegDone] = useState(false);
  const [apiEntries, setApiEntries] = useState([]);
  const insets = useSafeAreaInsets();

  // Real directory listings from backend, merged above bundled seeds.
  useEffect(() => {
    let alive = true;
    listListings({ category: title, limit: 50 })
      .then((page) => {
        if (!alive || !page?.items?.length) return;
        setApiEntries(
          page.items.map((l) => ({
            id: `api-${l.id}`,
            name: l.name,
            medal: !!l.is_verified,
            matches: 0,
            points: 0,
            rate: [l.contact, l.city].filter(Boolean).join(", "),
          }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [title]);

  const fullList = useMemo(
    () => [...apiEntries, ...list],
    [apiEntries, list]
  );
  const visible = expanded ? fullList : fullList.slice(0, 5);

  const submitReg = () => {
    if (!regName.trim() || regPhone.trim().length < 10) return;
    setRegDone(true);
  };

  const closeReg = () => {
    setRegOpen(false);
    setRegDone(false);
    setRegName("");
    setRegPhone("");
  };

  const shareBoard = () => {
    Share.share({
      message: `Top ${title} of ${city} on CricState — ${visible.length} ranked and counting!`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight}>
          <HeaderIconBtn onPress={() => setSearchOpen(true)} label="Search">
            <SearchGlyph />
          </HeaderIconBtn>
          <HeaderIconBtn onPress={shareBoard} label="Share">
            <ShareGlyph />
          </HeaderIconBtn>
          <HeaderIconBtn
            onPress={() => setExpanded((e) => !e)}
            label="Filter"
            badge={expanded ? 0 : 4}
          >
            <FilterGlyph active={!expanded} />
          </HeaderIconBtn>
        </View>
      </DreamHeader>
      <SearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSeeMatch={() => {
          setSearchOpen(false);
          navigation?.navigate?.("My Cricket");
        }}
      />

      <View style={styles.subRow}>
        <Text style={styles.subTitle}>
          Top {title.toLowerCase()} of{" "}
          <Text style={styles.subCity}>{city} - September</Text>
        </Text>
        <TouchableOpacity hitSlop={10} onPress={() => setInfoOpen(true)}>
          <View style={styles.infoCircle}>
            <Text style={styles.infoText}>i</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.chipOn}>
          <Text style={styles.chipOnText}>All</Text>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        style={styles.listFlex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <RankCard
            item={item}
            role={role}
            tone={index % 2 ? "navy" : "red"}
            statLabel={statLabel}
            onChat={() => navigation?.navigate?.("DirectMessages")}
            onOpen={() =>
              navigation?.navigate?.("ProfileDetail", {
                person: item,
                role,
                city,
                title,
              })
            }
          />
        )}
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.viewAllBtn}
          activeOpacity={0.85}
          onPress={() => setExpanded((e) => !e)}
        >
          <Text style={styles.viewAllText}>
            {expanded ? "Show less" : "View all"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerBtn}
          activeOpacity={0.85}
          onPress={() => setRegOpen(true)}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={regOpen}
        transparent
        animationType="slide"
        onRequestClose={closeReg}
      >
        <View style={styles.dim}>
          <Pressable style={styles.backdrop} onPress={closeReg} />
          <View style={styles.regSheet}>
            <View style={styles.handle} />
            {regDone ? (
              <View style={styles.regDoneWrap}>
                <View style={styles.regTick}>
                  <Text style={styles.regTickText}>✓</Text>
                </View>
                <Text style={styles.regDoneTitle}>You're registered!</Text>
                <Text style={styles.regDoneSub}>
                  {regName.trim()} • {title} ({city})
                </Text>
                <TouchableOpacity
                  style={styles.regSubmit}
                  activeOpacity={0.85}
                  onPress={closeReg}
                >
                  <Text style={styles.regSubmitText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.regTitle}>Register as {title.toLowerCase().replace(/s$/, "")}</Text>
                <Text style={styles.regSub}>
                  {city} • September leaderboard
                </Text>
                <Text style={styles.regLabel}>Full name</Text>
                <TextInput
                  style={styles.regInput}
                  placeholder="e.g. Rahul Sharma"
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
                  style={[
                    styles.regSubmit,
                    (!regName.trim() || regPhone.trim().length < 10) &&
                      styles.regSubmitOff,
                  ]}
                  activeOpacity={0.85}
                  onPress={submitReg}
                >
                  <Text style={styles.regSubmitText}>Submit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={infoOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View style={styles.dim}>
          <Pressable style={styles.backdrop} onPress={() => setInfoOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <ScrollView
              showsVerticalScrollIndicator
              contentContainerStyle={styles.sheetScroll}
            >
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>ⓘ</Text>
              </View>
              <Text style={styles.sheetBody}>
                CricHeroes does not employ any of these {role}. They work as
                freelancers. Always check their profiles thoroughly before
                hiring and ask for references if required.
              </Text>
              <Text style={styles.sheetTitle}>How ranking is calculated?</Text>
              <Text style={styles.sheetBody}>
                Your rank is based on player ratings received after the matches
                you officiate.
              </Text>
              <View style={styles.starTable}>
                {[
                  ["1 Star", "0 points"],
                  ["2 Star", "25 points"],
                  ["3 Star", "50 points"],
                  ["4 Star", "75 points"],
                  ["5 Star", "100 points"],
                ].map(([star, pts]) => (
                  <View key={star} style={styles.starRow}>
                    <Text style={styles.starLabel}>{star}</Text>
                    <Text style={styles.starArrow}>→</Text>
                    <Text style={styles.starPts}>{pts}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.sheetNote}>
                *More rating points = Higher leaderboard rank
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Red header */
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
  backBtn: {
    padding: 6,
    width: 40,
  },
  backArrow: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "400",
    lineHeight: 34,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    padding: 8,
  },
  searchCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 2.4,
    borderColor: "#fff",
  },
  searchHandle: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 9,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
    transform: [{ rotate: "-45deg" }],
  },
  shareWrap: {
    width: 26,
    height: 24,
  },
  shareDotTop: {
    position: "absolute",
    top: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareDotMid: {
    position: "absolute",
    top: 9,
    left: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareDotBot: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  shareBar: {
    position: "absolute",
    height: 2.2,
    borderRadius: 1,
    backgroundColor: "#fff",
  },
  shareBarTop: {
    top: 5,
    left: 7,
    width: 12,
    transform: [{ rotate: "-24deg" }],
  },
  shareBarBot: {
    bottom: 5,
    left: 7,
    width: 12,
    transform: [{ rotate: "24deg" }],
  },
  funnelTop: {
    width: 24,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  funnelV: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
    gap: 10,
  },
  funnelArm: {
    width: 13,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  funnelStem: {
    width: 2.6,
    height: 9,
    borderRadius: 2,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginTop: 1,
  },
  filterBadge: {
    position: "absolute",
    top: -9,
    right: -9,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },

  /* Sub header */
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: INK,
    flex: 1,
  },
  subCity: {
    color: TEAL,
    fontWeight: "600",
  },
  infoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.6,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9E9E9E",
    fontStyle: "italic",
  },
  chipRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipOn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chipOnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Leaderboard cards */
  listFlex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  mid: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: INK,
    flexShrink: 1,
  },
  stat: {
    fontSize: 14,
    color: GREY,
    marginTop: 3,
  },
  statVal: {
    color: INK,
    fontWeight: "600",
  },
  statTeal: {
    color: TEAL,
    fontWeight: "600",
  },
  rankWrap: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  rank: {
    fontSize: 46,
    fontWeight: "300",
    color: INK,
  },
  rankSmall: {
    fontSize: 34,
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    marginTop: 8,
    paddingTop: 8,
  },
  rate: {
    fontSize: 13,
    color: "#9E9E9E",
  },

  /* Medal */
  medalWrap: {
    width: 20,
    height: 22,
    alignItems: "center",
  },
  medalRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  medalStar: {
    fontSize: 8,
    color: TEAL,
    fontWeight: "800",
  },
  medalRibbonL: {
    position: "absolute",
    bottom: 0,
    left: 3,
    width: 4,
    height: 9,
    backgroundColor: TEAL,
    borderRadius: 1,
    transform: [{ rotate: "14deg" }],
  },
  medalRibbonR: {
    position: "absolute",
    bottom: 0,
    right: 3,
    width: 4,
    height: 9,
    backgroundColor: TEAL,
    borderRadius: 1,
    transform: [{ rotate: "-14deg" }],
  },

  /* Chat */
  chatBox: {
    width: 23,
    height: 16,
    borderRadius: 5,
    borderWidth: 2.2,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,
  },
  chatLine: {
    width: 11,
    height: 1.8,
    borderRadius: 1,
    backgroundColor: TEAL,
  },
  chatTail: {
    width: 7,
    height: 7,
    backgroundColor: "#fff",
    borderRightWidth: 2.2,
    borderBottomWidth: 2.2,
    borderColor: TEAL,
    transform: [{ rotate: "45deg" }],
    marginTop: -4.5,
  },

  /* Sticky bottom bar — screenshot jaisa */
  bottomBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  viewAllBtn: {
    flex: 1,
    backgroundColor: "#EDEDED",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
  },
  viewAllText: {
    fontSize: 18,
    color: INK,
    fontWeight: "400",
  },
  registerBtn: {
    flex: 1,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
  },
  registerText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },

  /* Register sheet */
  regSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  regTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: INK,
    marginTop: 8,
    textTransform: "capitalize",
  },
  regSub: {
    fontSize: 14,
    color: GREY,
    marginTop: 4,
  },
  regLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: INK,
    marginTop: 14,
  },
  regInput: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: INK,
    marginTop: 6,
  },
  regSubmit: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 18,
  },
  regSubmitOff: {
    opacity: 0.5,
  },
  regSubmitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  regDoneWrap: {
    alignItems: "center",
    paddingVertical: 16,
  },
  regTick: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  regTickText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  regDoneTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: INK,
    marginTop: 14,
  },
  regDoneSub: {
    fontSize: 14,
    color: GREY,
    marginTop: 6,
  },
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "86%",
    paddingTop: 8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginBottom: 4,
  },
  sheetScroll: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  infoBadge: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#E3E6EA",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 22,
  },
  infoBadgeText: {
    fontSize: 52,
    color: "#4A5568",
    fontWeight: "400",
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: INK,
    marginTop: 22,
  },
  sheetBody: {
    fontSize: 16.5,
    color: "#8A8A8A",
    lineHeight: 23,
  },
  starTable: {
    marginTop: 26,
    gap: 7,
  },
  starRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starLabel: {
    fontSize: 16.5,
    color: "#8A8A8A",
    width: 62,
  },
  starArrow: {
    fontSize: 16.5,
    color: "#8A8A8A",
    marginHorizontal: 8,
  },
  starPts: {
    fontSize: 17.5,
    color: INK,
    fontWeight: "500",
  },
  sheetNote: {
    fontSize: 16.5,
    color: "#8A8A8A",
    marginTop: 22,
  },
});
