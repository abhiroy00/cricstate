import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import { colors } from "../../utils/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>🏏 CricState</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to follow live matches, teams and players.</Text>

        <Input
          label="Email or username"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Button onPress={handleSubmit} loading={loading}>
          Log in
        </Button>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don&apos;t have an account? </Text>
          <Text style={styles.switchLink} onPress={() => navigation.navigate("Register")}>
            Register
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: "#fdecea",
    color: colors.danger,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
  },
  switchText: {
    color: colors.muted,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: "700",
  },
});
