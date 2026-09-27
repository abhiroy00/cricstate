import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { extractErrorMessage } from "../../services/api";
import { getLineups, getMatch, startMatch } from "../../services/matchService";
import { getRoster } from "../../services/teamService";
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

function Slot({ title, player, onPress }) {
  return (
    <TouchableOpacity style={styles.slot} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.slotAvatar, player ? { backgroundColor: avatarColor(player.id) } : null]}>
        {player?.profile_photo_url ? (
          <Image source={{ uri: player.profile_photo_url }} style={styles.slotImg} />
        ) : player ? (
          <Text style={styles.slotAvatarText}>{initials(player.full_name)}</Text>
        ) : (
          <Text style={styles.slotPlaceholderIcon}>🏏</Text>
        )}
      </View>
      <Text style={[styles.slotTitle, player && styles.slotTitleOn]} numberOfLines={1}>
        {player ? player.full_name : title}
      </Text>
    </TouchableOpacity>
  );
}

export default function StartInningsScreen({ navigation, route }) {
  const { matchId } = route.params || {};
  const [match, setMatch] = useState(null);
  const [lineups, setLineups] = useState([]);
  const [rosterA, setRosterA] = useState([]);
  const [rosterB, setRosterB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [picker, setPicker] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      // Older backend builds predate the /lineups route; fall back to rosters.
      let lineupData = [];
      try {
        lineupData = (await getLineups(matchId)) || [];
      } catch {
        lineupData = [];
      }
      const [rA, rB] = await Promise.all([
        getRoster(matchData.team_a.id),
        getRoster(matchData.team_b.id),
      ]);
      setLineups(lineupData);
      setRosterA(rA || []);
      setRosterB(rB || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const battingTeamId = useMemo(() => {
    if (!match) return null;
    if (match.toss_decision === "BAT") return match.toss_winner_team_id;
    return match.toss_winner_team_id === match.team_a.id ? match.team_b.id : match.team_a.id;
  }, [match]);

  const bowlingTeamId = useMemo(() => {
    if (!match || !battingTeamId) return null;
    return battingTeamId === match.team_a.id ? match.team_b.id : match.team_a.id;
  }, [match, battingTeamId]);

  function teamPlayers(teamId) {
    if (!match) return [];
    const fromLineup = lineups.filter((l) => l.team_id === teamId).map((l) => l.player);
    if (fromLineup.length) return fromLineup;
    const roster = teamId === match.team_a.id ? rosterA : rosterB;
    return roster.map((entry) => entry.player);
  }

  const battingTeam = match
    ? battingTeamId === match.team_a.id
      ? match.team_a
      : match.team_b
    : null;
  const bowlingTeam = match
    ? bowlingTeamId === match.team_a.id
      ? match.team_a
      : match.team_b
    : null;
  const battingPlayers = battingTeamId ? teamPlayers(battingTeamId) : [];
  const bowlingPlayers = bowlingTeamId ? teamPlayers(bowlingTeamId) : [];

  function pickerList() {
    if (picker === "bowler") return bowlingPlayers;
    return battingPlayers;
  }

  function select(slot, player) {
    if (slot === "striker") setStriker(player);
    else if (slot === "nonStriker") setNonStriker(player);
    else setBowler(player);
    setPicker(null);
  }

  function isDisabled(player) {
    if (picker === "striker" && nonStriker?.id === player.id) return true;
    if (picker === "nonStriker" && striker?.id === player.id) return true;
    return false;
  }

  async function handleStart() {
    if (!striker || !nonStriker || !bowler) {
      Alert.alert("Select players", "Choose striker, non-striker and bowler to start scoring.");
      return;
    }
    if (striker.id === nonStriker.id) {
      Alert.alert("Invalid selection", "Striker and non-striker must be different players.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await startMatch(matchId, {
        strikerId: striker.id,
        nonStrikerId: nonStriker.id,
        bowlerId: bowler.id,
      });
      navigation.replace("ScoringConsole", { matchId });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <FlowScreen>
        <FlowHeader title="Start innings" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      </FlowScreen>
    );
  }

  return (
    <FlowScreen>
      <FlowHeader title="Start innings" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.section}>Batting - {battingTeam?.name}</Text>
        <View style={styles.slotRow}>
          <Slot title="Select striker" player={striker} onPress={() => setPicker("striker")} />
          <Slot title="Select non-striker" player={nonStriker} onPress={() => setPicker("nonStriker")} />
        </View>

        <Text style={styles.section}>Bowling - {bowlingTeam?.name}</Text>
        <View style={styles.slotRow}>
          <Slot title="Select bowler" player={bowler} onPress={() => setPicker("bowler")} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.rulesBtn}
          onPress={() =>
            match &&
            Alert.alert(
              "Match rules",
              `${match.match_type} · ${match.overs_limit} overs\nBall: ${match.ball_type || "—"}\nCity: ${match.city || "—"}\nGround: ${match.venue || "—"}`
            )
          }
        >
          <Text style={styles.rulesText}>Match rules</Text>
        </TouchableOpacity>
        <PrimaryBar label="Start scoring" onPress={handleStart} loading={saving} style={styles.startBar} />
      </View>

      <Modal transparent visible={picker !== null} animationType="slide" onRequestClose={() => setPicker(null)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setPicker(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {picker === "bowler" ? "Select bowler" : picker === "striker" ? "Select striker" : "Select non-striker"}
            </Text>
            <ScrollView style={styles.sheetList}>
              {pickerList().map((player) => {
                const disabled = isDisabled(player);
                return (
                  <TouchableOpacity
                    key={player.id}
                    style={[styles.pRow, disabled && styles.pRowOff]}
                    onPress={() => !disabled && select(picker, player)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.pAvatar, { backgroundColor: avatarColor(player.id) }]}>
                      {player.profile_photo_url ? (
                        <Image source={{ uri: player.profile_photo_url }} style={styles.pImg} />
                      ) : (
                        <Text style={styles.pAvatarText}>{initials(player.full_name)}</Text>
                      )}
                    </View>
                    <Text style={styles.pName} numberOfLines={1}>
                      {player.full_name}
                    </Text>
                    {disabled ? <Text style={styles.pDisabled}>Selected</Text> : null}
                  </TouchableOpacity>
                );
              })}
              {pickerList().length === 0 ? (
                <Text style={styles.empty}>No players available for this team.</Text>
              ) : null}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 24 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: RED, marginBottom: 10 },
  section: { fontSize: 16, fontWeight: "700", color: INK, marginTop: 14, marginBottom: 12 },
  slotRow: { flexDirection: "row", flexWrap: "wrap" },
  slot: {
    width: "44%",
    borderWidth: 1,
    borderColor: "#E3E5E8",
    borderRadius: 8,
    backgroundColor: "#F5F6FA",
    alignItems: "center",
    paddingVertical: 22,
    marginRight: 12,
    marginBottom: 12,
  },
  slotAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  slotImg: { width: 74, height: 74 },
  slotAvatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  slotPlaceholderIcon: { fontSize: 30, opacity: 0.5 },
  slotTitle: { marginTop: 12, fontSize: 14, color: MUTED, paddingHorizontal: 6, textAlign: "center" },
  slotTitleOn: { color: INK, fontWeight: "600" },
  footer: { flexDirection: "row" },
  rulesBtn: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F0F0F0" },
  rulesText: { color: "#5A6472", fontSize: 15, fontWeight: "600" },
  startBar: { flex: 1.4 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "70%", paddingTop: 16 },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: INK, paddingHorizontal: 18, marginBottom: 8 },
  sheetList: { paddingHorizontal: 14, paddingBottom: 24 },
  pRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  pRowOff: { opacity: 0.45 },
  pAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pImg: { width: 44, height: 44 },
  pAvatarText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  pName: { flex: 1, marginLeft: 12, fontSize: 16, color: INK, fontWeight: "500" },
  pDisabled: { color: MUTED, fontSize: 12 },
  empty: { color: MUTED, textAlign: "center", paddingVertical: 20 },
});
