import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "../../../hooks/useAuth";
import { extractErrorMessage } from "../../../services/api";
import { listTeams } from "../../../services/teamService";

const RED = "#EA580C";
const TEAL = "#199A8E";
const PILL_BG = "#E9E7E7";

const FILTERS = [
  { key: "YOUR", label: "Your teams" },
  { key: "OPPONENTS", label: "Opponents" },
  { key: "FOLLOWING", label: "Following" },
];

function AudioLangRow({ lang, onToggle }) {
  return (
    <View style={styles.langRow}>
      <Text style={styles.langLabel}>Audio language:</Text>
      <TouchableOpacity style={styles.langPicker} activeOpacity={0.7} onPress={onToggle}>
        <Text style={styles.langValue}>{lang}</Text>
        <Text style={styles.langArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---- Your teams video card (image 18.19.39) ----
function TeamTypeCard() {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoSide} />
      <View style={styles.videoCenter}>
        <Text style={styles.ttHeading}>Select Type of Team</Text>
        <View style={styles.ttOptions}>
          <View style={[styles.ttOption, styles.ttOptionSelected]}>
            <View style={[styles.ttIcon, styles.ttIconTeal]}>
              <Text style={styles.ttEmoji}>🏆</Text>
            </View>
            <Text style={styles.ttOptionLabel}>Tournament</Text>
          </View>
          <View style={styles.ttOption}>
            <View style={styles.ttIcon}>
              <Text style={styles.ttEmoji}>👤</Text>
            </View>
            <Text style={styles.ttOptionLabel}>Individual</Text>
          </View>
        </View>
        <Text style={styles.ttHeading}>Select Tournament</Text>
        <View style={styles.ttTournRow}>
          <View style={styles.ttCricketBadge}>
            <Text style={styles.ttCricketBadgeText}>CRICKET</Text>
          </View>
          <Text style={styles.ttTournText} numberOfLines={3}>
            4th Corona Warriors state level Lether Cricket Tournament(Nurses and Paramedical)BARMER
          </Text>
        </View>
      </View>
      <View style={styles.videoSide} />
    </View>
  );
}

// ---- Opponents video card (image 18.19.39 (1)) ----
function ScoreVideoCard() {
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoSide} />
      <View style={styles.ytBox}>
        <View style={styles.ytTop}>
          <View style={styles.ytLogo}>
            <Text style={styles.ytLogoText}>🏏</Text>
          </View>
          <View style={styles.ytTitleWrap}>
            <Text style={styles.ytTitle} numberOfLines={1}>
              How to Score In CricState
            </Text>
            <Text style={styles.ytChannel}>CricState</Text>
          </View>
          <Text style={styles.ytIcon}>🔇</Text>
          <View style={styles.ytCC}>
            <Text style={styles.ytCCText}>CC</Text>
          </View>
          <Text style={styles.ytIcon}>⚙️</Text>
        </View>
        <View style={styles.ytThumb}>
          <Text style={styles.ytTime}>0:15 / 3:00</Text>
          <View style={styles.ytPlay}>
            <Text style={styles.ytPlayText}>▶</Text>
          </View>
          <Text style={styles.ytTube}>▶ YouTube</Text>
        </View>
        <View style={styles.ytProgress}>
          <View style={styles.ytProgressFill} />
          <View style={styles.ytProgressDot} />
        </View>
        <View style={styles.ytBottom}>
          <View style={styles.ytShare}>
            <Text style={styles.ytShareText}>➤</Text>
          </View>
          <Text style={styles.ytSub} numberOfLines={2}>
            हैं तो सबसे पहले टॉप लेफ्ट कॉर्नर में बाद
          </Text>
        </View>
      </View>
      <View style={styles.videoSide} />
    </View>
  );
}

// ---- Following illustration (image 18.19.40) ----
const FOLLOW_ACTIONS = [
  { icon: "+", label: "FOLLOW", active: true },
  { icon: "▥", label: "INSIGHTS", active: false },
  { icon: "Vs", label: "CHALLENGE", active: false },
  { icon: "➤", label: "SHARE", active: false },
];

function FollowingIllustration() {
  const [following, setFollowing] = useState(false);
  return (
    <View style={styles.fgCard}>
      <View style={styles.fgTopBar} />
      <Text style={styles.fgBack}>←</Text>
      <View style={styles.fgAvatar} />
      <Text style={styles.fgName}>DG LIONS</Text>
      <Text style={styles.fgCity}>Ahmedabad</Text>
      <View style={styles.fgDivider} />
      <View style={styles.fgActions}>
        {FOLLOW_ACTIONS.map((a) => {
          const isFollow = a.label === "FOLLOW";
          const on = isFollow ? following : false;
          const Wrap = isFollow ? TouchableOpacity : View;
          return (
            <Wrap
              key={a.label}
              style={styles.fgAction}
              activeOpacity={isFollow ? 0.7 : 1}
              onPress={isFollow ? () => setFollowing((f) => !f) : undefined}
            >
              <Text style={[styles.fgActionIcon, (a.active || on) && styles.fgTeal]}>
                {isFollow && following ? "✓" : a.icon}
              </Text>
              <Text style={[styles.fgActionLabel, (a.active || on) && styles.fgTeal]}>
                {isFollow && following ? "FOLLOWING" : a.label}
              </Text>
            </Wrap>
          );
        })}
      </View>
    </View>
  );
}

const DEMO_TOP_TEAMS = [
  { id: "demo-dg", name: "DG LIONS", city: "Ahmedabad" },
  { id: "demo-ms", name: "MUMBAI STRIKERS", city: "Mumbai" },
  { id: "demo-dt", name: "DELHI THUNDERS 11", city: "New Delhi" },
];

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamsSection({ navigation }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("YOUR");
  const [audioLang, setAudioLang] = useState("Hindi");
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTopTeams, setShowTopTeams] = useState(false);
  const [followed, setFollowed] = useState({});

  const load = useCallback(
    async (tab) => {
      // Opponents + Following are fixed illustration UIs — no API needed
      if (tab !== "YOUR") {
        setLoading(false);
        setError("");
        setTeams([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await listTeams({ createdBy: user.id, limit: 100 });
        setTeams(data.items);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  useFocusEffect(
    useCallback(() => {
      load(filter);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter])
  );

  const toggleLang = () => setAudioLang((l) => (l === "Hindi" ? "English" : "Hindi"));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {filter === "YOUR" && (
        <View style={styles.createBanner}>
          <Text style={styles.createBannerText}>Want to create a new team?</Text>
          <TouchableOpacity
            style={styles.createPill}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("CreateTeam")}
          >
            <Text style={styles.createPillText}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pills */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                setFilter(f.key);
                setShowTopTeams(false);
              }}
              activeOpacity={0.8}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : filter === "YOUR" && !error && teams && teams.length > 0 ? (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.teamCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("TeamDetail", { teamId: item.id })}
            >
              <View style={styles.teamAvatar}>
                <Text style={styles.teamAvatarText}>{initials(item.name)}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.teamMeta} numberOfLines={1}>
                  {item.player_count} player{item.player_count === 1 ? "" : "s"}
                  {item.home_ground ? ` · ${item.home_ground}` : ""}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : filter === "YOUR" ? (
        <>
          <AudioLangRow lang={audioLang} onToggle={toggleLang} />
          <TeamTypeCard />
          <Text style={styles.emptyText}>
            Hmmm you are not part of any team as of now. Why not create your own?
          </Text>
          <TouchableOpacity
            style={styles.fullCta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("CreateTeam")}
          >
            <Text style={styles.fullCtaText}>Create Your Team</Text>
          </TouchableOpacity>
        </>
      ) : filter === "OPPONENTS" ? (
        <>
          <AudioLangRow lang={audioLang} onToggle={toggleLang} />
          <ScoreVideoCard />
          <Text style={styles.emptyText}>
            You still haven&apos;t played a match? Come on... go ahead and start one. Your opponent
            teams will automatically come here.
          </Text>
          <TouchableOpacity
            style={styles.fullCta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("StartMatch")}
          >
            <Text style={styles.fullCtaText}>Start A Match</Text>
          </TouchableOpacity>
        </>
      ) : showTopTeams ? (
        <View style={styles.list}>
          {DEMO_TOP_TEAMS.map((t) => {
            const isF = !!followed[t.id];
            return (
              <View key={t.id} style={styles.teamCard}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>{initials(t.name)}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <Text style={styles.teamMeta} numberOfLines={1}>
                    {t.city}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.miniFollow, isF && styles.miniFollowOn]}
                  activeOpacity={0.8}
                  onPress={() => setFollowed((p) => ({ ...p, [t.id]: !p[t.id] }))}
                >
                  <Text style={[styles.miniFollowText, isF && styles.miniFollowTextOn]}>
                    {isF ? "✓ Following" : "+ Follow"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : (
        <>
          <FollowingIllustration />
          <Text style={styles.followEmptyText}>
            Keep tabs on your opponents. The teams you are following will come here.
          </Text>
          <TouchableOpacity
            style={styles.topTeamsBtn}
            activeOpacity={0.85}
            onPress={() => setShowTopTeams(true)}
          >
            <Text style={styles.topTeamsText}>Top teams</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 32,
  },
  createBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  createBannerText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  createPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  createPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  filterPill: {
    backgroundColor: PILL_BG,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: TEAL,
  },
  filterText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  list: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f1f1",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F4F1",
    alignItems: "center",
    justifyContent: "center",
  },
  teamAvatarText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "800",
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  teamMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 3,
  },
  miniFollow: {
    borderWidth: 1.2,
    borderColor: TEAL,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  miniFollowOn: {
    backgroundColor: TEAL,
  },
  miniFollowText: {
    color: TEAL,
    fontSize: 12,
    fontWeight: "700",
  },
  miniFollowTextOn: {
    color: "#fff",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  langLabel: {
    fontSize: 16,
    color: "#333",
  },
  langPicker: {
    flex: 1,
    marginLeft: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },
  langValue: {
    fontSize: 16,
    color: "#333",
  },
  langArrow: {
    fontSize: 12,
    color: "#bbb",
  },
  videoCard: {
    flexDirection: "row",
    marginHorizontal: 22,
    marginTop: 22,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#A31616",
    minHeight: 220,
  },
  videoSide: {
    flex: 1,
    backgroundColor: "#A31616",
  },
  videoCenter: {
    width: 215,
    backgroundColor: "#fff",
    padding: 12,
  },
  ttHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  ttOptions: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 10,
  },
  ttOption: {
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
    padding: 8,
    marginRight: 8,
    width: 88,
  },
  ttOptionSelected: {
    borderColor: TEAL,
  },
  ttIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  ttIconTeal: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  ttEmoji: {
    fontSize: 20,
  },
  ttOptionLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#333",
  },
  ttTournRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: "flex-start",
  },
  ttCricketBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e65100",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  ttCricketBadgeText: {
    color: "#fff",
    fontSize: 6,
    fontWeight: "800",
  },
  ttTournText: {
    flex: 1,
    fontSize: 9,
    color: "#444",
    lineHeight: 12,
  },
  ytBox: {
    width: 215,
    backgroundColor: "#1a1a1a",
  },
  ytTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  ytLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ytLogoText: {
    fontSize: 18,
  },
  ytTitleWrap: {
    flex: 1,
    marginLeft: 8,
  },
  ytTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  ytChannel: {
    color: "#bbb",
    fontSize: 10,
    marginTop: 1,
  },
  ytIcon: {
    fontSize: 14,
    marginLeft: 6,
  },
  ytCC: {
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  ytCCText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  ytThumb: {
    height: 110,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ytTime: {
    position: "absolute",
    left: 8,
    top: 40,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  ytPlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  ytPlayText: {
    fontSize: 18,
    color: "#333",
    marginLeft: 3,
  },
  ytTube: {
    position: "absolute",
    right: 8,
    bottom: 6,
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  ytProgress: {
    height: 3,
    backgroundColor: "#555",
    position: "relative",
  },
  ytProgressFill: {
    width: "30%",
    height: 3,
    backgroundColor: RED,
  },
  ytProgressDot: {
    position: "absolute",
    left: "30%",
    top: -4,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: RED,
  },
  ytBottom: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  ytShare: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ytShareText: {
    color: "#fff",
    fontSize: 16,
  },
  ytSub: {
    flex: 1,
    color: "#fff",
    fontSize: 10,
    marginLeft: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 30,
    marginTop: 18,
  },
  fullCta: {
    backgroundColor: TEAL,
    borderRadius: 5,
    marginHorizontal: 22,
    marginTop: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  fullCtaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fgCard: {
    marginHorizontal: 60,
    marginTop: 110,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    paddingBottom: 18,
    position: "relative",
  },
  fgTopBar: {
    height: 22,
    backgroundColor: "#EDEDED",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  fgBack: {
    position: "absolute",
    top: 30,
    left: 14,
    fontSize: 18,
    color: "#bbb",
  },
  fgAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#F1F0F0",
    alignSelf: "center",
    marginTop: 14,
  },
  fgName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  fgCity: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginTop: 2,
  },
  fgDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 16,
    marginTop: 14,
  },
  fgActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  fgAction: {
    alignItems: "center",
    minWidth: 56,
  },
  fgActionIcon: {
    fontSize: 22,
    color: "#D5D5D5",
    fontWeight: "700",
  },
  fgActionLabel: {
    fontSize: 9,
    color: "#D5D5D5",
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  fgTeal: {
    color: TEAL,
  },
  followEmptyText: {
    fontSize: 15,
    color: "#222",
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 28,
    marginTop: 28,
  },
  topTeamsBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    marginTop: 16,
    width: 200,
    paddingVertical: 13,
    alignItems: "center",
    alignSelf: "center",
  },
  topTeamsText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
});
