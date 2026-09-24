import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";

import FilterSheet from "../../components/FilterSheet";
import SearchOverlay from "../../components/SearchOverlay";
import AppLogoImage from "../../components/AppLogo";

// Screenshot se nikale exact colours
const RED = "#EA580C";
const TEAL = "#0E9E9B";
const INK = "#111111";
const CARD_BORDER = "#EDEDED";

const CITIES = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad"];

/* ---------------- Header white line-icons (screenshot jaisa) ---------------- */

function MenuIcon() {
  return (
    <View style={{ width: 24, gap: 5 }}>
      <View style={styles.hBar} />
      <View style={styles.hBar} />
      <View style={styles.hBar} />
    </View>
  );
}

function SearchIcon() {
  return (
    <View style={{ width: 26, height: 26 }}>
      <View style={styles.searchCircle} />
      <View style={styles.searchHandle} />
    </View>
  );
}

function InboxIcon() {
  return (
    <View style={{ width: 28, height: 26, alignItems: "center" }}>
      <View style={styles.chatBox}>
        <View style={styles.chatLine} />
        <View style={[styles.chatLine, { width: 10 }]} />
      </View>
      <View style={styles.chatTail} />
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

function AppLogo() {
  return (
    <View style={styles.logoRow}>
      <Text style={styles.logoTen}>10</Text>
      <View style={styles.logoBall}>
        <View style={styles.logoSeam} />
      </View>
    </View>
  );
}

/* ---------------- Grid black line-icons (screenshot jaisa) ---------------- */

function ScorerIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.scorerBoard}>
        <View style={styles.scorerCell}>
          <Text style={styles.scorerOne}>1</Text>
        </View>
        <View style={[styles.scorerCell, { borderRightWidth: 0 }]}>
          <Text style={styles.scorerOne}>1</Text>
        </View>
      </View>
      <View style={styles.scorerLegs}>
        <View style={styles.scorerLeg}>
          <View style={styles.scorerFoot} />
        </View>
        <View style={styles.scorerLeg}>
          <View style={styles.scorerFoot} />
        </View>
      </View>
    </View>
  );
}

function UmpireIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.umpCrown} />
      <View style={styles.umpBrim} />
      <View style={styles.umpHead} />
      <View style={styles.umpBody}>
        <View style={styles.umpCollarL} />
        <View style={styles.umpCollarR} />
      </View>
    </View>
  );
}

function CommentatorIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.micWaves}>
        <View style={[styles.wave, { width: 8 }]} />
        <View style={[styles.wave, { width: 13 }]} />
        <View style={[styles.wave, { width: 18 }]} />
      </View>
      <View style={styles.micHead}>
        <View style={styles.micGrill} />
        <View style={styles.micGrill} />
        <View style={styles.micGrill} />
      </View>
      <View style={styles.micNeck} />
      <View style={styles.micStand} />
      <View style={styles.micBase} />
    </View>
  );
}

function StreamerIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.wifiDot} />
      <View style={styles.wifiArc1} />
      <View style={styles.wifiArc2} />
      <View style={styles.liveBox}>
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

function OrganiserIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.orgHead} />
      <View style={styles.orgBody}>
        <View style={styles.orgShirt} />
      </View>
      <View style={styles.orgBase} />
    </View>
  );
}

function AcademyIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.acFlagRow}>
        <View style={styles.acPole} />
        <View style={styles.acFlag} />
      </View>
      <View style={styles.acRow}>
        <View style={styles.acWing}>
          <View style={styles.dot} />
        </View>
        <View style={styles.acMain}>
          <View style={styles.acWindows}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.acDoor} />
        </View>
        <View style={styles.acWing}>
          <View style={styles.dot} />
        </View>
      </View>
      <View style={styles.acGround} />
    </View>
  );
}

function GroundIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.gCircle}>
        <View style={styles.gStumps}>
          <View style={styles.gStump} />
          <View style={styles.gStump} />
          <View style={styles.gStump} />
        </View>
        <View style={styles.gBails}>
          <View style={styles.gBail} />
          <View style={styles.gBail} />
        </View>
        <View style={styles.gBase} />
      </View>
    </View>
  );
}

function BoxIcon() {
  return (
    <View style={styles.gBox}>
      <View style={styles.bFrame}>
        <View style={styles.bWicks}>
          <View style={styles.bWick} />
          <View style={styles.bWick} />
          <View style={styles.bWick} />
        </View>
        <View style={styles.bLegs}>
          <View style={[styles.bLeg, { transform: [{ rotate: "16deg" }] }]} />
          <View style={[styles.bLeg, { transform: [{ rotate: "-16deg" }] }]} />
        </View>
        <View style={styles.bBase} />
      </View>
    </View>
  );
}

const TILES = [
  { key: "scorers", label: "Scorers", Icon: ScorerIcon },
  { key: "umpires", label: "Umpires", Icon: UmpireIcon },
  { key: "commentators", label: "Commentators", Icon: CommentatorIcon },
  { key: "streamers", label: "Streamers", Icon: StreamerIcon },
  { key: "organisers", label: "Organisers", Icon: OrganiserIcon },
  { key: "academies", label: "Academies", Icon: AcademyIcon },
  { key: "grounds", label: "Grounds", Icon: GroundIcon },
  { key: "box", label: "Box Cricket & Nets", Icon: BoxIcon },
];

// Last row me 2 cards hain — teesra khaali slot taaki Box bilkul
// Organisers ke neeche (middle column) rahe, right edge par na khiske.
const GRID = [...TILES, { key: "blank", blank: true }];

function CommunityHeader({ onMenu, onSearch, onMessage, onFilter, onPro, filterCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onMenu}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <AppLogoImage />
        <TouchableOpacity activeOpacity={0.85} style={styles.proBtn} onPress={onPro}>
          <Text style={styles.proBtnText}>PRO @ ₹199</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onSearch}>
          <Text style={styles.headerIcon}>⌕</Text>
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

export default function CommunityScreen({ navigation }) {
  const [city, setCity] = useState("Delhi");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);

  const openDrawer = () => navigation?.dispatch?.(DrawerActions.openDrawer());

  const openTile = (tile) => {
    if (tile.key === "scorers") {
      navigation?.navigate?.("Scorers", { city });
      return;
    }
    if (tile.key === "umpires") {
      navigation?.navigate?.("Umpires", { city });
      return;
    }
    navigation?.navigate?.("CommunityList", {
      category: tile.key,
      title: tile.label,
      city,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <CommunityHeader
        onMenu={openDrawer}
        onPro={() => navigation?.navigate?.("ProBenefits")}
        onSearch={() => setSearchOpen(true)}
        onMessage={() => navigation?.navigate?.("DirectMessages")}
        onFilter={() => setFilterOpen(true)}
        filterCount={filterCount}
      />

      <View style={styles.titleRow}>
        <Text style={styles.title}>
          Cricket community in <Text style={styles.city} onPress={() => setCityOpen(true)}>{city}</Text>
        </Text>
      </View>

      <FlatList
        data={GRID}
        keyExtractor={(i) => i.key}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          if (item.blank) return <View style={styles.tileBlank} />;
          const Icon = item.Icon;
          return (
            <TouchableOpacity
              style={styles.tile}
              activeOpacity={0.85}
              onPress={() => openTile(item)}
            >
              <Icon />
              <Text style={styles.tileLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={cityOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCityOpen(false)}
      >
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
                <Text style={[styles.cityRowText, c === city && styles.cityRowOn]}>
                  {c}
                </Text>
                {c === city && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <SearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSeeMatch={() => navigation?.navigate?.("My Cricket")}
      />

      <FilterSheet
        visible={filterOpen}
        initialCat="LOCATION"
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          const n =
            (f.locations?.length || 0) +
            (f.types?.length || 0) +
            (f.balls?.length || 0);
          setFilterCount(n);
          if (f.locations?.length > 0) setCity(f.locations[0]);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* Header — screenshot: solid red, white icons */
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
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
    padding: 8,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  logoWrap: {
    marginLeft: 6,
  },
  hBar: {
    width: 22,
    height: 2.6,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  logoTen: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  logoBall: {
    fontSize: 30,
  },
  logoSeam: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: RED,
    borderStyle: "dashed",
  },
  proBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
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

  /* Title */
  titleRow: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  city: {
    color: TEAL,
    fontWeight: "700",
  },

  /* Grid — screenshot: 3 cols, white cards, soft shadow */
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 18,
    paddingBottom: 0,
    paddingHorizontal: 6,
    marginBottom: 12,
    height: 158,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileLabel: {
    fontSize: 16.5,
    color: "#1A1A1A",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 21,
    height: 42,
  },
  tileBlank: {
    flex: 1,
  },

  /* Shared icon box */
  gBox: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: INK,
  },

  /* Scorers — scoreboard 1|1 on stand */
  scorerBoard: {
    width: 58,
    height: 36,
    borderWidth: 3.4,
    borderColor: INK,
    borderRadius: 4,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  scorerCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 3.4,
    borderColor: INK,
  },
  scorerOne: {
    fontSize: 21,
    fontWeight: "900",
    color: INK,
  },
  scorerLegs: {
    flexDirection: "row",
    gap: 16,
    marginTop: -1,
  },
  scorerLeg: {
    width: 11,
    height: 13,
    borderWidth: 3.2,
    borderTopWidth: 0,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  scorerFoot: {
    width: 15,
    height: 3.4,
    backgroundColor: INK,
    borderRadius: 2,
    marginBottom: -3.4,
  },

  /* Umpires — hat + head + shoulders */
  umpCrown: {
    width: 30,
    height: 15,
    borderWidth: 3.4,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  umpBrim: {
    width: 54,
    height: 5,
    borderRadius: 3,
    backgroundColor: INK,
  },
  umpHead: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 3.4,
    borderColor: INK,
    marginTop: 3,
    backgroundColor: "#fff",
  },
  umpBody: {
    width: 56,
    height: 20,
    borderWidth: 3.4,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 3,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 0,
  },
  umpCollarL: {
    width: 11,
    height: 3.4,
    backgroundColor: INK,
    transform: [{ rotate: "32deg" }],
  },
  umpCollarR: {
    width: 11,
    height: 3.4,
    backgroundColor: INK,
    transform: [{ rotate: "-32deg" }],
  },

  /* Commentators — mic + waves */
  micWaves: {
    position: "absolute",
    left: 0,
    top: 14,
    gap: 6,
  },
  wave: {
    height: 3.4,
    borderRadius: 2,
    backgroundColor: INK,
    transform: [{ rotate: "-28deg" }],
  },
  micHead: {
    width: 31,
    height: 40,
    borderWidth: 3.4,
    borderColor: INK,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#fff",
  },
  micGrill: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: INK,
  },
  micNeck: {
    width: 4,
    height: 8,
    backgroundColor: INK,
  },
  micStand: {
    width: 14,
    height: 7,
    borderWidth: 3.2,
    borderBottomWidth: 0,
    borderColor: INK,
  },
  micBase: {
    width: 46,
    height: 6,
    borderRadius: 3,
    backgroundColor: INK,
  },

  /* Streamers — wifi + LIVE plate */
  wifiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: INK,
  },
  wifiArc1: {
    width: 26,
    height: 13,
    borderWidth: 3.2,
    borderBottomWidth: 0,
    borderColor: INK,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    marginTop: 3,
  },
  wifiArc2: {
    width: 0,
    height: 0,
  },
  liveBox: {
    width: 64,
    height: 31,
    borderWidth: 4,
    borderColor: INK,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    backgroundColor: "#fff",
  },
  liveText: {
    fontSize: 18,
    fontWeight: "900",
    color: INK,
    letterSpacing: 1.5,
  },

  /* Organisers — bust */
  orgHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3.4,
    borderColor: INK,
    backgroundColor: "#fff",
  },
  orgBody: {
    width: 54,
    height: 30,
    borderWidth: 3.4,
    borderColor: INK,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    borderBottomWidth: 0,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
  },
  orgShirt: {
    width: 16,
    height: 18,
    borderWidth: 3,
    borderColor: INK,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  orgBase: {
    width: 54,
    height: 4,
    backgroundColor: INK,
    borderRadius: 2,
  },

  /* Academies — building */
  acFlagRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 12,
  },
  acPole: {
    width: 3.2,
    height: 12,
    backgroundColor: INK,
  },
  acFlag: {
    width: 13,
    height: 7,
    borderWidth: 2.6,
    borderColor: INK,
    borderLeftWidth: 0,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  acRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  acWing: {
    width: 13,
    height: 24,
    borderWidth: 3.2,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  acMain: {
    width: 32,
    height: 37,
    borderWidth: 3.4,
    borderColor: INK,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  acWindows: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 20,
    gap: 5,
    marginTop: 6,
    justifyContent: "center",
  },
  acDoor: {
    width: 12,
    height: 12,
    borderWidth: 3,
    borderColor: INK,
    borderBottomWidth: 0,
    marginTop: 5,
  },
  acGround: {
    width: 66,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK,
    marginTop: 2,
  },

  /* Grounds — circled stumps */
  gCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  gStumps: {
    flexDirection: "row",
    gap: 5,
  },
  gStump: {
    width: 4.5,
    height: 24,
    borderRadius: 2,
    backgroundColor: INK,
  },
  gBails: {
    flexDirection: "row",
    gap: 5,
    marginTop: -28,
    marginBottom: 24,
  },
  gBail: {
    width: 7,
    height: 3.6,
    borderRadius: 2,
    backgroundColor: INK,
  },
  gBase: {
    width: 26,
    height: 3.6,
    borderRadius: 2,
    backgroundColor: INK,
    marginTop: 2,
  },

  /* Box — framed stumps */
  bFrame: {
    width: 50,
    height: 52,
    borderWidth: 4,
    borderColor: INK,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
    paddingBottom: 6,
  },
  bWicks: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 1,
  },
  bWick: {
    width: 3.6,
    height: 11,
    borderRadius: 2,
    backgroundColor: INK,
  },
  bLegs: {
    flexDirection: "row",
    gap: 14,
  },
  bLeg: {
    width: 4.5,
    height: 24,
    borderRadius: 2,
    backgroundColor: INK,
  },
  bBase: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: INK,
    marginTop: 1,
  },

  /* City sheet */
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
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginBottom: 6,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  cityRowText: {
    fontSize: 16,
    color: "#111",
  },
  cityRowOn: {
    color: TEAL,
    fontWeight: "700",
  },
  tick: {
    fontSize: 18,
    color: TEAL,
    fontWeight: "800",
  },
});
