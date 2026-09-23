import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { createMatch } from "../../services/matchService";
import { listTeams } from "../../services/teamService";
import { colors } from "../../utils/theme";

export default function StartMatchScreen() {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [oversLimit, setOversLimit] = useState("20");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    listTeams({ limit: 100 })
      .then((data) => setTeams(data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoadingTeams(false));
  }, []);

  async function handleCreate() {
    if (!teamAId || !teamBId) {
      setError("Pick both teams");
      return;
    }
    if (teamAId === teamBId) {
      setError("A team cannot play itself");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const match = await createMatch({
        team_a_id: teamAId,
        team_b_id: teamBId,
        match_type: "T20",
        overs_limit: Number(oversLimit) || 20,
        venue: venue || null,
      });
      setCreated(match);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loadingTeams) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (created) {
    return (
      <View style={styles.centered}>
        <Text style={styles.successTitle}>Match created!</Text>
        <Text style={styles.successBody}>
          {created.team_a.name} vs {created.team_b.name}
        </Text>
        <Text style={styles.successHint}>
          Open the My Cricket tab to record the toss and start scoring.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Start a Match</Text>

      <Text style={styles.label}>Team A</Text>
      <View style={styles.pickerRow}>
        {teams.map((t) => (
          <Button
            key={t.id}
            variant={teamAId === t.id ? "primary" : "secondary"}
            onPress={() => setTeamAId(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </View>

      <Text style={styles.label}>Team B</Text>
      <View style={styles.pickerRow}>
        {teams.map((t) => (
          <Button
            key={t.id}
            variant={teamBId === t.id ? "primary" : "secondary"}
            onPress={() => setTeamBId(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </View>

      <Input label="Overs" value={oversLimit} onChangeText={setOversLimit} keyboardType="numeric" />
      <Input label="Venue (optional)" value={venue} onChangeText={setVenue} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button onPress={handleCreate} loading={creating}>
        Create Match
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  successBody: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  successHint: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
});
