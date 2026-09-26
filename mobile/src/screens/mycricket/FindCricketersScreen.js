import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { listPlayers } from "../../services/playerService";
import { followUser, unfollowUser } from "../../services/profileService";

const RED = "#E01A22";
const TEAL = "#00A651";

const TABS = [
  { key: "CONTACTS", label: "Contacts" },
  { key: "POPULAR", label: "Popular cricketers" },
  { key: "FOLLOWERS", label: "Followers" },
  { key: "TEAMMATES", label: "Teammates" },
  { key: "COACHES", label: "Coaches" },
];

// Decorative avatar nodes for the "friends network" illustration.
// Positions are fractions of the illustration box (0..1).
const NODES = [
  { left: 0.03, top: 0.38, size: 64, emoji: "🧔", bg: "#8d6e63" },
  { left: 0.21, top: 0.34, size: 30, emoji: "🏃", bg: "#cfd8dc" },
  { left: 0.3, top: 0.14, size: 92, emoji: "👨", bg: "#ffcc80" },
  { left: 0.2, top: 0.68, size: 70, emoji: "🧢", bg: "#a5d6a7" },
  { left: 0.47, top: 0.72, size: 28, emoji: "👳", bg: "#ffab91" },
  { left: 0.55, top: 0.44, size: 66, emoji: "🏏", bg: "#9fa8da" },
  { left: 0.78, top: 0.16, size: 72, emoji: "🕶️", bg: "#b0bec5" },
  { left: 0.8, top: 0.62, size: 78, emoji: "👦", bg: "#ef9a9a" },
];

const SPARKS = [
  { left: 0.1, top: 0.6, color: "#f9a825", size: 7, star: false },
  { left: 0.13, top: 0.66, color: TEAL, size: 9, star: false },
  { left: 0.29, top: 0.44, color: TEAL, size: 9, star: false },
  { left: 0.18, top: 0.78, color: "#ffca28", size: 14, star: true },
  { left: 0.6, top: 0.36, color: "#ffca28", size: 13, star: true },
  { left: 0.54, top: 0.78, color: "#f9a825", size: 7, star: false },
  { left: 0.7, top: 0.08, color: "#f9a825", size: 9, star: false },
  { left: 0.74, top: 0.06, color: "#f9a825", size: 11, star: false },
  { left: 0.68, top: 0.12, color: TEAL, size: 9, star: false },
  { left: 0.85, top: 0.5, color: TEAL, size: 9, star: false },
  { left: 0.82, top: 0.55, color: "#f9a825", size: 7, star: false },
];

function NetworkIllustration() {
  return (
    <View style={styles.graphWrap}>
      {/* dotted links */}
      <View style={[styles.link, { left: "12%", top: "46%", width: "22%", transform: [{ rotate: "24deg" }] }]} />
      <View style={[styles.link, { left: "30%", top: "34%", width: "12%", transform: [{ rotate: "-18deg" }] }]} />
      <View style={[styles.link, { left: "42%", top: "34%", width: "24%", transform: [{ rotate: "-8deg" }] }]} />
      <View style={[styles.link, { left: "40%", top: "52%", width: "18%", transform: [{ rotate: "28deg" }] }]} />
      <View style={[styles.link, { left: "34%", top: "72%", width: "22%", transform: [{ rotate: "-24deg" }] }]} />
      <View style={[styles.link, { left: "62%", top: "52%", width: "20%", transform: [{ rotate: "-30deg" }] }]} />
      <View style={[styles.link, { left: "64%", top: "44%", width: "18%", transform: [{ rotate: "38deg" }] }]} />
      <View style={[styles.link, { left: "84%", top: "36%", width: "4%", height: 70, transform: [{ rotate: "8deg" }] }]} />
      <View style={[styles.link, { left: "64%", top: "62%", width: "20%", transform: [{ rotate: "22deg" }] }]} />
      <View style={[styles.link, { left: "16%", top: "56%", width: "14%", transform: [{ rotate: "52deg" }] }]} />

      {SPARKS.map((s, i) => (
        <View
          key={`s${i}`}
          style={[
            styles.spark,
            {
              left: `${s.left * 100}%`,
              top: `${s.top * 100}%`,
              width: s.size,
              height: s.size,
              backgroundColor: s.star ? "transparent" : s.color,
            },
          ]}
        >
          {s.star && <Text style={{ color: s.color, fontSize: s.size + 4 }}>★</Text>}
        </View>
      ))}

      {NODES.map((n, i) => (
        <View
          key={i}
          style={[
            styles.node,
            {
              left: `${n.left * 100}%`,
              top: `${n.top * 100}%`,
              width: n.size,
              height: n.size,
              borderRadius: n.size / 2,
              backgroundColor: n.bg,
            },
          ]}
        >
          <Text style={{ fontSize: n.size * 0.45 }}>{n.emoji}</Text>
        </View>
      ))}

      {/* yellow ball near top node */}
      <View style={styles.ball} />
    </View>
  );
}

export default function FindCricketersScreen({ navigation }) {
  const [tab, setTab] = useState("CONTACTS");
  const [syncing, setSyncing] = useState(false);
  const [players, setPlayers] = useState(null);
  const [following, setFollowing] = useState({});

  const handleFind = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const page = await listPlayers({ limit: 20 });
      setPlayers(page.items || []);
    } catch {
      setPlayers([]);
    } finally {
      setSyncing(false);
    }
  };

  const toggleFollow = async (player) => {
    if (!player.user_id) return;
    const on = !!following[player.id];
    setFollowing((p) => ({ ...p, [player.id]: !p[player.id] }));
    try {
      if (on) await unfollowUser(player.user_id);
      else await followUser(player.user_id);
    } catch {
      setFollowing((p) => ({ ...p, [player.id]: on }));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />

      {/* Red header */}
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Cricketers from your contacts
        </Text>
        <TouchableOpacity hitSlop={12} style={styles.menuBtn}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </DreamHeader>

      {/* Filter pills */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                activeOpacity={0.8}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <NetworkIllustration />

        <Text style={styles.title}>CricState is better with friends</Text>
        <Text style={styles.sub}>
          Find your friends on CricState instantly{"\n"}
          We never spam your contacts{"\n"}
          You can delete your contacts from our servers anytime{"\n"}
          Sync now to see who is already playing
        </Text>

        <TouchableOpacity style={styles.cta} activeOpacity={0.85} onPress={handleFind}>
          <Text style={styles.ctaText}>{syncing ? "Syncing..." : "Find my friends"}</Text>
        </TouchableOpacity>

        {players && (
          <View style={styles.resultsWrap}>
            <Text style={styles.resultsTitle}>
              {players.length === 0
                ? "No cricketers found yet"
                : `${players.length} cricketers on CricState`}
            </Text>
            <FlatList
              data={players}
              keyExtractor={(i) => String(i.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.playerRow}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {(item.full_name || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.playerMid}>
                    <Text style={styles.playerName} numberOfLines={1}>
                      {item.full_name}
                    </Text>
                    <Text style={styles.playerRole}>
                      {String(item.role || "").replace("_", " ")}
                    </Text>
                  </View>
                  {item.user_id ? (
                    <TouchableOpacity
                      style={[styles.followBtn, following[item.id] && styles.followBtnDone]}
                      activeOpacity={0.8}
                      onPress={() => toggleFollow(item)}
                    >
                      <Text
                        style={[
                          styles.followBtnText,
                          following[item.id] && styles.followBtnTextDone,
                        ]}
                      >
                        {following[item.id] ? "Following" : "Follow"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RED,
  },
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
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "400",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 14,
  },
  menuBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  menuDots: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  tabsWrap: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1.2,
  },
  pillActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  pillInactive: {
    backgroundColor: "#fff",
    borderColor: TEAL,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
  },
  pillTextActive: {
    color: "#fff",
  },
  pillTextInactive: {
    color: TEAL,
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bodyContent: {
    paddingBottom: 40,
  },
  graphWrap: {
    height: 300,
    marginHorizontal: 16,
    marginTop: 30,
    position: "relative",
  },
  link: {
    position: "absolute",
    height: 0,
    borderTopWidth: 1.5,
    borderColor: "#BDBDBD",
    borderStyle: "dotted",
  },
  node: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  spark: {
    position: "absolute",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  ball: {
    position: "absolute",
    left: "50%",
    top: "24%",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ffeb3b",
    borderWidth: 1,
    borderColor: "#f9a825",
  },
  title: {
    fontSize: 19,
    color: "#111",
    textAlign: "center",
    fontWeight: "400",
    marginTop: 18,
    paddingHorizontal: 20,
  },
  sub: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
    paddingHorizontal: 24,
  },
  cta: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginHorizontal: 100,
    marginTop: 18,
    paddingVertical: 13,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  resultsWrap: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  playerMid: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  playerRole: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
    textTransform: "capitalize",
  },
  followBtn: {
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  followBtnDone: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: TEAL,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  followBtnTextDone: {
    color: TEAL,
  },
});
