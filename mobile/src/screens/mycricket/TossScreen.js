import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { extractErrorMessage } from "../../services/api";
import { getMatch, recordToss } from "../../services/matchService";
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

function TeamCard({ team, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.teamCard, selected && styles.teamCardOn]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor(team.id) }]}>
        {team.logo_url ? (
          <Image source={{ uri: team.logo_url }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarText}>{initials(team.name)}</Text>
        )}
      </View>
      <Text style={styles.teamName} numberOfLines={2}>
        {team.name}
      </Text>
    </TouchableOpacity>
  );
}

function Decision({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.decisionCard, selected && styles.decisionCardOn]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.decisionIcon, selected && styles.decisionIconOn]}>
        <Text style={styles.decisionIconText}>{icon}</Text>
      </View>
      <Text style={styles.decisionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function TossScreen({ navigation, route }) {
  const { matchId } = route.params || {};
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tossWinnerId, setTossWinnerId] = useState(null);
  const [decision, setDecision] = useState(null);
  const [coin, setCoin] = useState("Tap to flip");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setMatch(await getMatch(matchId));
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

  function flipCoin() {
    setCoin(Math.random() < 0.5 ? "Heads" : "Tails");
  }

  async function handlePlay() {
    if (!tossWinnerId || !decision) {
      Alert.alert("Complete the toss", "Select who won the toss and what they elected to do.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await recordToss(matchId, { tossWinnerTeamId: tossWinnerId, tossDecision: decision });
      navigation.navigate("StartInnings", { matchId });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <FlowScreen>
        <FlowHeader title="Toss" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      </FlowScreen>
    );
  }

  return (
    <FlowScreen>
      <FlowHeader title="Toss" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.heading}>Who won the toss?</Text>
        <View style={styles.teamRow}>
          <TeamCard
            team={match.team_a}
            selected={tossWinnerId === match.team_a.id}
            onPress={() => setTossWinnerId(match.team_a.id)}
          />
          <TeamCard
            team={match.team_b}
            selected={tossWinnerId === match.team_b.id}
            onPress={() => setTossWinnerId(match.team_b.id)}
          />
        </View>

        <Text style={styles.heading}>Winner of the toss elected to?</Text>
        <View style={styles.teamRow}>
          <Decision
            label="Bat"
            icon="🏏"
            selected={decision === "BAT"}
            onPress={() => setDecision("BAT")}
          />
          <Decision
            label="Bowl"
            icon="🎯"
            selected={decision === "BOWL"}
            onPress={() => setDecision("BOWL")}
          />
        </View>

        <Text style={styles.heading}>Tap the coin to flip</Text>
        <View style={styles.coinWrap}>
          <TouchableOpacity style={styles.coin} activeOpacity={0.85} onPress={flipCoin}>
            <Text style={styles.coinText}>Cricket{"\n"}State</Text>
          </TouchableOpacity>
          <Text style={styles.coinResult}>{coin}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.help} onPress={() => Alert.alert("Toss", "The team that wins the toss chooses to bat or bowl.")}>
          <Text style={styles.helpText}>Need help?</Text>
        </TouchableOpacity>
        <PrimaryBar label="Let's play" onPress={handlePlay} loading={saving} style={styles.playBar} />
      </View>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 30 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: RED, marginBottom: 10 },
  heading: { fontSize: 17, fontWeight: "700", color: INK, marginTop: 8, marginBottom: 14 },
  teamRow: { flexDirection: "row", marginBottom: 18 },
  teamCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E3E5E8",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 18,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  teamCardOn: { borderColor: TEAL },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 78, height: 78 },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "800" },
  teamName: { fontSize: 15, color: INK, marginTop: 10, textAlign: "center", paddingHorizontal: 6 },
  decisionCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E3E5E8",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 18,
    marginRight: 12,
    backgroundColor: "#fff",
  },
  decisionCardOn: { borderColor: TEAL },
  decisionIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#F2F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  decisionIconOn: { backgroundColor: "#FDE7E8" },
  decisionIconText: { fontSize: 32 },
  decisionLabel: { fontSize: 15, color: INK, marginTop: 10, fontWeight: "500" },
  coinWrap: { alignItems: "center", marginTop: 6 },
  coin: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#8A8A8A",
    borderWidth: 6,
    borderColor: "#B5B5B5",
    alignItems: "center",
    justifyContent: "center",
  },
  coinText: { color: "#F0F0F0", fontSize: 14, fontWeight: "800", textAlign: "center" },
  coinResult: { marginTop: 12, color: MUTED, fontSize: 14, fontWeight: "600" },
  footer: { flexDirection: "row" },
  help: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F0F0F0" },
  helpText: { color: "#5A6472", fontSize: 15, fontWeight: "600" },
  playBar: { flex: 1.3 },
});
