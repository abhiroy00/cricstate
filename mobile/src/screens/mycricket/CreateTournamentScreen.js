import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { createTournament } from "../../services/tournamentService";
import { colors } from "../../utils/theme";

const FORMATS = ["KNOCKOUT", "LEAGUE"];

export default function CreateTournamentScreen({ navigation }) {
  const [name, setName] = useState("");
  const [format, setFormat] = useState("LEAGUE");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Tournament name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const tournament = await createTournament({
        name: name.trim(),
        format,
        location: location || null,
      });
      navigation.replace("TournamentDetail", { tournamentId: tournament.id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Host a Tournament</Text>
      <Input label="Tournament name" value={name} onChangeText={setName} placeholder="e.g. Summer Cup" />

      <Text style={styles.label}>Format</Text>
      <View style={styles.pickerRow}>
        {FORMATS.map((f) => (
          <Button key={f} variant={format === f ? "primary" : "secondary"} onPress={() => setFormat(f)}>
            {f}
          </Button>
        ))}
      </View>

      <Input label="Location (optional)" value={location} onChangeText={setLocation} />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.ctaWrap}>
        <Button onPress={handleCreate} loading={creating}>
          Create Tournament
        </Button>
      </View>
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
  ctaWrap: {
    marginTop: 8,
  },
});
