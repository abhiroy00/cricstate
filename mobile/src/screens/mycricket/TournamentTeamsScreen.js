import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, ChatGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { listTournamentTeams, unregisterTeam } from "../../services/tournamentService";

const RED = "#E01A22";
const TEAL = "#00A651";

const TABS = ["About", "Teams", "Matches", "Points Table", "Sponsors"];

function TeamRow({ team, onRemove, onPress }) {
  const initial = team.name.trim().charAt(0).toUpperCase() || "T";
  return (
    <View style={styles.teamCard}>
      <TouchableOpacity style={styles.teamMain} activeOpacity={0.7} onPress={onPress}>
        <View style={styles.teamAvatar}>
          {team.logoUri ? (
            <Image source={{ uri: team.logoUri }} style={styles.teamAvatarImg} />
          ) : (
            <Text style={styles.teamAvatarText}>{initial}</Text>
          )}
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName} numberOfLines={1}>
            {team.name}
          </Text>
          <Text style={styles.teamSub}>Tap to add players in the team</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeBtn} hitSlop={8} onPress={() => onRemove(team.id)}>
        <Text style={styles.removeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TournamentTeamsScreen({ navigation, route }) {
  const { tournamentId, tournamentName, teamCount } = route.params || {};
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Teams");
  const [query, setQuery] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(Boolean(tournamentId));
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setError("");
      const data = await listTournamentTeams(tournamentId);
      setTeams(
        (data || []).map((entry) => ({
          id: entry.team.id,
          name: entry.team.name,
          logoUri: entry.team.logo_url,
        }))
      );
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function openAddTeams() {
    navigation.navigate("AddTeams", { tournamentId });
  }

  async function removeTeam(id) {
    try {
      setError("");
      if (tournamentId) {
        await unregisterTeam(tournamentId, id);
      }
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tournamentName || "Tournament"}
        </Text>
        <View style={styles.headerIcons}>
          <HeaderIconBtn label="Chat">
            <ChatGlyph />
          </HeaderIconBtn>
          <HeaderIconBtn label="Settings">
            <Text style={styles.icon}>⚙</Text>
          </HeaderIconBtn>
          <HeaderIconBtn label="More">
            <Text style={styles.icon}>⋮</Text>
          </HeaderIconBtn>
        </View>
      </DreamHeader>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((tab) => {
            const active = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
                <View style={[styles.tabUnderline, active && styles.tabUnderlineActive]} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Quick search + counter */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Quick search"
              placeholderTextColor="#B8B8B8"
            />
          </View>
          {teams.length > 0 ? (
            <View style={styles.counterWrap}>
              <Text style={styles.counterText}>
                {teams.length}
                {teamCount ? `/${teamCount}` : ""} Teams
              </Text>
              <Text style={styles.counterCheck}>☑</Text>
            </View>
          ) : null}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : teams.length === 0 ? (
          <>
            <Text style={styles.inviteTitle}>Invite Captains to Add Teams</Text>
            <Text style={styles.inviteSub}>
              Save time! Share this link with captains, and they&apos;ll add their teams and
              players.
            </Text>

            <Text style={styles.arrow}>⤵</Text>

            <TouchableOpacity style={styles.addBtn} activeOpacity={0.85} onPress={openAddTeams}>
              <Text style={styles.addText}>ADD MANUALLY</Text>
            </TouchableOpacity>
          </>
        ) : (
          filtered.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              onRemove={removeTeam}
              onPress={() =>
                navigation.navigate("TeamPlayers", { teamId: team.id, teamName: team.name })
              }
            />
          ))
        )}
      </ScrollView>

      {teams.length === 0 ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Text style={styles.bottomText}>Looking for more teams?</Text>
        </View>
      ) : (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.addTeamsPill} activeOpacity={0.85} onPress={openAddTeams}>
            <View style={styles.pillPlus}>
              <Text style={styles.pillPlusText}>+</Text>
            </View>
            <Text style={styles.addTeamsText}>Add teams</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  tabsWrap: {
    backgroundColor: "#fff",
  },
  tabs: {
    paddingHorizontal: 12,
  },
  tab: {
    alignItems: "center",
    marginRight: 22,
    paddingTop: 14,
  },
  tabText: {
    fontSize: 15,
    color: "#7A7A7A",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#1a1a1a",
    fontWeight: "700",
  },
  tabUnderline: {
    height: 3,
    width: "100%",
    marginTop: 8,
    backgroundColor: "transparent",
    borderRadius: 2,
  },
  tabUnderlineActive: {
    backgroundColor: RED,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  errorText: {
    color: RED,
    marginTop: 12,
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    padding: 0,
  },
  counterWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  counterText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: "600",
  },
  counterCheck: {
    color: TEAL,
    fontSize: 16,
    marginLeft: 5,
  },
  inviteTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginTop: 40,
  },
  inviteSub: {
    fontSize: 14,
    color: "#4B4B4B",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 6,
  },
  arrow: {
    fontSize: 46,
    color: "#B0B0B0",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  addBtn: {
    borderWidth: 1.5,
    borderColor: TEAL,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  addText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 12,
    marginTop: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  teamMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E9EDF2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  teamAvatarImg: {
    width: 48,
    height: 48,
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#5A6472",
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  teamSub: {
    fontSize: 13,
    color: "#9AA0AE",
    marginTop: 2,
  },
  removeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#4A4A4A",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 15,
  },
  bottomBar: {
    backgroundColor: "#E6F7F7",
    alignItems: "center",
    paddingTop: 16,
  },
  bottomText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "500",
  },
  footer: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: 14,
  },
  addTeamsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: TEAL,
    borderRadius: 28,
    paddingLeft: 8,
    paddingRight: 24,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  pillPlus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pillPlusText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  addTeamsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
