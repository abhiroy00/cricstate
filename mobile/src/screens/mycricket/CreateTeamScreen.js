import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { createTeam } from "../../services/teamService";
import { colors } from "../../utils/theme";

export default function CreateTeamScreen({ navigation }) {
  const [name, setName] = useState("");
  const [homeGround, setHomeGround] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Team name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      const team = await createTeam({ name: name.trim(), home_ground: homeGround || null });
      navigation.replace("TeamDetail", { teamId: team.id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Team</Text>
      <Input label="Team name" value={name} onChangeText={setName} placeholder="e.g. Falcons XI" />
      <Input
        label="Home ground (optional)"
        value={homeGround}
        onChangeText={setHomeGround}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.ctaWrap}>
        <Button onPress={handleCreate} loading={creating}>
          Create Team
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
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
  ctaWrap: {
    marginTop: 8,
  },
});
