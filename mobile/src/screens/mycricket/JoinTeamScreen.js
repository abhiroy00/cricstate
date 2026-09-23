import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { joinTeamByCode } from "../../services/teamService";
import { colors } from "../../utils/theme";

export default function JoinTeamScreen({ navigation }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    if (!code.trim()) {
      setError("Enter an invite code");
      return;
    }
    setJoining(true);
    setError("");
    try {
      const result = await joinTeamByCode(code.trim().toUpperCase());
      navigation.replace("TeamDetail", { teamId: result.team_id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setJoining(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Have an invite code?</Text>
      <Text style={styles.subtitle}>
        Enter the code a captain shared with you to join their team's roster.
      </Text>
      <Input
        label="Invite code"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="e.g. A1B2C3D4"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button onPress={handleJoin} loading={joining}>
        Join Team
      </Button>
    </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});
