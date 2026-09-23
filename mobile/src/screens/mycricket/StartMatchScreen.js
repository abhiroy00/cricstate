import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { createMatch } from "../../services/matchService";
import { colors } from "../../utils/theme";

const FORMATS = [
  { key: "LIMITED_OVERS", label: "Limited Overs", enabled: true },
  { key: "BOX_CRICKET", label: "Box Cricket", enabled: false },
  { key: "PAIR_CRICKET", label: "Pair Cricket", enabled: false },
  { key: "TEST_MATCH", label: "Test Match", enabled: false },
  { key: "THE_HUNDRED", label: "The Hundred", enabled: false },
];

function TeamSlot({ team, label, onPress }) {
  const initial = team ? team.name.trim().charAt(0).toUpperCase() : "+";
  return (
    <View style={styles.slot}>
      <TouchableOpacity style={styles.avatar} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.avatarText}>{initial}</Text>
      </TouchableOpacity>
      <Button variant="secondary" onPress={onPress}>
        {team ? team.name : label}
      </Button>
    </View>
  );
}

export default function StartMatchScreen({ navigation }) {
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [oversLimit, setOversLimit] = useState("20");
  const [venue, setVenue] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  function pickTeamA() {
    navigation.navigate("TeamPicker", { onSelect: setTeamA });
  }

  function pickTeamB() {
    navigation.navigate("TeamPicker", { onSelect: setTeamB });
  }

  async function handleCreate() {
    if (!teamA || !teamB) {
      setError("Pick both teams");
      return;
    }
    if (teamA.id === teamB.id) {
      setError("A team cannot play itself");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const match = await createMatch({
        team_a_id: teamA.id,
        team_b_id: teamB.id,
        match_type: "CUSTOM",
        overs_limit: Number(oversLimit) || 20,
        venue: venue || null,
      });
      navigation.replace("MatchDetail", { matchId: match.id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Start a Match</Text>

      <View style={styles.teamsRow}>
        <TeamSlot team={teamA} label="Select Team A" onPress={pickTeamA} />
        <Text style={styles.vs}>VS</Text>
        <TeamSlot team={teamB} label="Select Team B" onPress={pickTeamB} />
      </View>

      <Text style={styles.label}>Match type</Text>
      <View style={styles.pickerRow}>
        {FORMATS.map((f) => (
          <View key={f.key} style={[styles.chip, f.enabled ? styles.chipEnabled : styles.chipDisabled]}>
            <Text style={f.enabled ? styles.chipTextEnabled : styles.chipTextDisabled}>{f.label}</Text>
          </View>
        ))}
      </View>

      <Input label="Overs" value={oversLimit} onChangeText={setOversLimit} keyboardType="numeric" />
      <Input label="Ground / Venue (optional)" value={venue} onChangeText={setVenue} />

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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },
  teamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  slot: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  vs: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    marginHorizontal: 8,
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
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  chipEnabled: {
    backgroundColor: colors.primary,
  },
  chipDisabled: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipTextEnabled: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextDisabled: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});
