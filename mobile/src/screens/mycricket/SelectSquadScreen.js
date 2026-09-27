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
import { getRoster } from "../../services/teamService";
import { useStartMatch } from "../../context/StartMatchContext";
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

export default function SelectSquadScreen({ navigation, route }) {
  const { teamA, teamB, tournamentId, tournamentName, mode } = route.params || {};
  const { squads: draftSquads, setSquads } = useStartMatch();
  const [active, setActive] = useState("a");
  const [rosters, setRosters] = useState({ a: [], b: [] });
  const [selected, setSelected] = useState(() => ({
    a: (draftSquads?.a || []).map((p) => p.id),
    b: (draftSquads?.b || []).map((p) => p.id),
  }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const [rosterA, rosterB] = await Promise.all([
        getRoster(teamA.id),
        getRoster(teamB.id),
      ]);
      setRosters({ a: rosterA || [], b: rosterB || [] });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamA.id, teamB.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const team = active === "a" ? teamA : teamB;
  const roster = rosters[active] || [];
  const selectedIds = selected[active] || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter((entry) =>
      (entry.player.full_name || "").toLowerCase().includes(q)
    );
  }, [roster, query]);

  function toggle(playerId) {
    setSelected((prev) => {
      const current = prev[active] || [];
      const next = current.includes(playerId)
        ? current.filter((id) => id !== playerId)
        : [...current, playerId];
      return { ...prev, [active]: next };
    });
  }

  function sameSquad() {
    setSelected((prev) => ({
      ...prev,
      [active]: roster.map((entry) => entry.player.id),
    }));
  }

  function addPlayer() {
    navigation.navigate("AddPlayerPhone", { teamId: team.id });
  }

  function buildSquad(key) {
    const ids = selected[key] || [];
    const source = rosters[key] || [];
    return source
      .filter((entry) => ids.includes(entry.player.id))
      .map((entry) => ({ id: entry.player.id, full_name: entry.player.full_name }));
  }

  function handleNext() {
    setSquads({ a: buildSquad("a"), b: buildSquad("b") });
    if (mode === "edit") {
      navigation.goBack();
      return;
    }
    navigation.navigate("MatchSetup", {
      teamA,
      teamB,
      tournamentId,
      tournamentName,
    });
  }

  return (
    <FlowScreen>
      <FlowHeader title={team?.name || "Select squad"} onBack={() => navigation.goBack()} alignLeft />

      <View style={styles.teamTabs}>
        {[teamA, teamB].map((t, index) => {
          const key = index === 0 ? "a" : "b";
          const isActive = key === active;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.teamTab, isActive && styles.teamTabOn]}
              onPress={() => {
                setActive(key);
                setQuery("");
              }}
            >
              <Text style={[styles.teamTabText, isActive && styles.teamTabTextOn]} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={[styles.teamTabCount, isActive && styles.teamTabTextOn]}>
                {(selected[key] || []).length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>
          Select squad <Text style={styles.optional}>(Optional)</Text>
        </Text>
        <TouchableOpacity onPress={sameSquad} disabled={roster.length === 0}>
          <Text style={[styles.sameSquad, roster.length === 0 && styles.sameSquadOff]}>
            Same squad
          </Text>
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity style={styles.addPill} activeOpacity={0.85} onPress={addPlayer}>
          <Text style={styles.addPillText}>+ Add player</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : (
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {filtered.map((entry) => {
            const player = entry.player;
            const isOn = selectedIds.includes(player.id);
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.playerRow, isOn && styles.playerRowOn]}
                activeOpacity={0.8}
                onPress={() => toggle(player.id)}
              >
                <View style={[styles.avatar, { backgroundColor: avatarColor(player.id) }]}>
                  {player.profile_photo_url ? (
                    <Image source={{ uri: player.profile_photo_url }} style={styles.avatarImg} />
                  ) : (
                    <Text style={styles.avatarText}>{initials(player.full_name)}</Text>
                  )}
                </View>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName} numberOfLines={1}>
                    {player.full_name}
                  </Text>
                  <Text style={styles.playerMeta}>● Played last match</Text>
                </View>
                <View style={[styles.checkbox, isOn && styles.checkboxOn]}>
                  {isOn ? <Text style={styles.tick}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
          {filtered.length === 0 ? (
            <Text style={styles.empty}>
              No players in this team yet. Tap “Add player” to add some.
            </Text>
          ) : null}
        </ScrollView>
      )}

      <PrimaryBar label="Next" onPress={handleNext} />
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  teamTabs: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  teamTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E5E4",
    borderRadius: 20,
    paddingVertical: 8,
    marginRight: 8,
  },
  teamTabOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  teamTabText: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 130,
  },
  teamTabTextOn: {
    color: "#fff",
  },
  teamTabCount: {
    marginLeft: 6,
    color: MUTED,
    fontSize: 13,
    fontWeight: "700",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: INK,
  },
  optional: {
    fontStyle: "italic",
    fontWeight: "400",
    color: MUTED,
    fontSize: 15,
  },
  sameSquad: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "600",
  },
  sameSquadOff: {
    color: "#B8C4BD",
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
    borderRadius: 4,
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
  error: {
    color: RED,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  list: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  playerRowOn: {
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
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: INK,
  },
  playerMeta: {
    fontSize: 12,
    color: TEAL,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C4C4C4",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tick: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 17,
  },
  empty: {
    color: MUTED,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
