import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import { colors } from "../../utils/theme";

const INITIAL_FORM = { fullName: "", email: "", username: "", password: "" };

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await register(form);
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join the cricket community in a few seconds.</Text>

        <Input label="Full name" value={form.fullName} onChangeText={(v) => updateField("fullName", v)} />
        <Input
          label="Email"
          value={form.email}
          onChangeText={(v) => updateField("email", v)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Username"
          value={form.username}
          onChangeText={(v) => updateField("username", v)}
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={form.password}
          onChangeText={(v) => updateField("password", v)}
          secureTextEntry
          autoCapitalize="none"
        />

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        <Button onPress={handleSubmit} loading={loading}>
          Create account
        </Button>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <Text style={styles.switchLink} onPress={() => navigation.navigate("Login")}>
            Log in
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
