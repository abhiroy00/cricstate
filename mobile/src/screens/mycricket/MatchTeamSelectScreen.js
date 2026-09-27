import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { extractErrorMessage } from "../../services/api";
import { listOpponentTeams, listTeams } from "../../services/teamService";
import { useAuth } from "../../hooks/useAuth";
import {
  FlowHeader,
  FlowScreen,
  INK,
  MUTED,
  PrimaryBar,
  RED,
  TEAL,
  avatarColor,
  initials,
} from "./startMatch/flow";

const TABS = [
  { key: "YOUR", label: "Your teams" },
  { key: "OPPONENTS", label: "Opponents" },
  { key: "ADD", label: "Add" },
];

function Slot({ label, team, onClear }) {
  return (
    <View style={styles.slot}>
      <View style={[styles.slotAvatar, { backgroundColor: team ? avatarColor(team.id) : "#D7DBE0" }]}>
        {team?.logo_url ? (
          <Image source={{ uri: team.logo_url }} style={styles.slotLogo} />
        ) : (
          <Text style={styles.slotAvatarText}>{team ? initials(team.name) : "+"}</Text>
        )}
      </View>
      <View style={styles.slotInfo}>
        <Text style={styles.slotLabel}>{label}</Text>
        <Text style={styles.slotName} numberOfLines={1}>
          {team ? team.name : "Select team"}
        </Text>
      </View>
      {team ? (
        <TouchableOpacity onPress={onClear} hitSlop={8}>
          <Text style={styles.slotClear}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function MatchTeamSelectScreen({ navigation, route }) {
  const { tournamentId, tournamentName } = route.params || {};
  const { user } = useAuth();
  const [tab, setTab] = useState("YOUR");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);

  const load = useCallback(
    async (activeTab) => {
      if (activeTab === "ADD") return;
      setLoading(true);
      setError("");
      try {
        if (activeTab === "OPPONENTS") {
          setTeams(await listOpponentTeams());
        } else {
          const data = await listTeams({ createdBy: user.id, limit: 100 });
          setTeams(data?.items || []);
        }
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
      load(tab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => (t.name || "").toLowerCase().includes(q));
  }, [teams, query]);

  function assign(team) {
    if (teamA?.id === team.id) {
      setTeamA(null);
      return;
    }
    if (teamB?.id === team.id) {
      setTeamB(null);
      return;
    }
    if (!teamA) {
      setTeamA(team);
    } else if (!teamB) {
      setTeamB(team);
    }
  }

  function isSelected(team) {
    return teamA?.id === team.id || teamB?.id === team.id;
  }

  function handleNext() {
    if (!teamA || !teamB) {
      setError("Select both teams to continue");
      return;
    }
    setError("");
    navigation.navigate("SelectSquad", {
      teamA,
      teamB,
      tournamentId,
      tournamentName,
    });
  }

  return (
    <FlowScreen>
      <FlowHeader title={tournamentName || "Start a match"} onBack={() => navigation.goBack()} />

      <View style={styles.tabsRow}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
              <Text style={[styles.tabText, active && styles.tabTextOn]}>{t.label}</Text>
              <View style={[styles.tabLine, active && styles.tabLineOn]} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.slots}>
        <Slot label="Team 1" team={teamA} onClear={() => setTeamA(null)} />
        <Slot label="Team 2" team={teamB} onClear={() => setTeamB(null)} />
      </View>

      {tab === "ADD" ? (
        <View style={styles.addWrap}>
          <Text style={styles.addTitle}>Create a new team</Text>
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("CreateTeam", {
                onCreated: (team) => {
                  if (team) {
                    setTeams((prev) => [team, ...prev]);
                    assign(team);
                  }
                },
              })
            }
          >
            <Text style={styles.addBtnText}>+ Add team</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
            <TouchableOpacity
              style={styles.addPill}
              activeOpacity={0.85}
              onPress={() => setTab("ADD")}
            >
              <Text style={styles.addPillText}>+ Add team</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={TEAL} />
            </View>
          ) : (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered.map((team) => {
                const selected = isSelected(team);
                return (
                  <TouchableOpacity
                    key={team.id}
                    style={[styles.teamRow, selected && styles.teamRowOn]}
                    activeOpacity={0.8}
                    onPress={() => assign(team)}
                  >
                    <View style={[styles.avatar, { backgroundColor: avatarColor(team.id) }]}>
                      {team.logo_url ? (
                        <Image source={{ uri: team.logo_url }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarText}>{initials(team.name)}</Text>
                      )}
                    </View>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName} numberOfLines={1}>
                        {team.name}
                      </Text>
                      {!!team.home_ground && (
                        <Text style={styles.teamMeta} numberOfLines={1}>
                          📍 {team.home_ground}
                        </Text>
                      )}
                    </View>
                    {selected ? <Text style={styles.check}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })}
              {filtered.length === 0 ? (
                <Text style={styles.empty}>No teams here yet.</Text>
              ) : null}
            </ScrollView>
          )}
        </>
      )}

      <PrimaryBar label="Next" onPress={handleNext} />
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: {
    marginRight: 22,
    alignItems: "center",
    paddingTop: 12,
  },
  tabText: {
    fontSize: 15,
    color: MUTED,
    fontWeight: "500",
  },
  tabTextOn: {
    color: INK,
    fontWeight: "700",
  },
  tabLine: {
    height: 3,
    width: "100%",
    marginTop: 8,
    backgroundColor: "transparent",
  },
  tabLineOn: {
    backgroundColor: RED,
  },
  slots: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  slot: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6E8EB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  slotAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  slotLogo: {
    width: 44,
    height: 44,
  },
  slotAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  slotInfo: {
    flex: 1,
    marginLeft: 12,
  },
  slotLabel: {
    fontSize: 12,
    color: MUTED,
  },
  slotName: {
    fontSize: 15,
    color: INK,
    fontWeight: "600",
  },
  slotClear: {
    color: "#9AA0AE",
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 12,
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
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: INK,
    padding: 0,
  },
  addPill: {
    backgroundColor: TEAL,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginLeft: 10,
  },
  addPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  teamRowOn: {
    borderColor: TEAL,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 46,
    height: 46,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: INK,
  },
  teamMeta: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  check: {
    color: TEAL,
    fontSize: 18,
    fontWeight: "900",
  },
  empty: {
    color: MUTED,
    textAlign: "center",
    marginTop: 20,
  },
  error: {
    color: RED,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  addWrap: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  addTitle: {
    fontSize: 16,
    color: INK,
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
