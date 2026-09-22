import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { extractErrorMessage } from "../../services/api";
import { updateMyProfile } from "../../services/profileService";
import { colors } from "../../utils/theme";

export default function EditProfileScreen({ route, navigation }) {
  const existing = route.params?.profile;
  const [form, setForm] = useState({
    bio: existing?.bio || "",
    city: existing?.city || "",
    country: existing?.country || "",
    website_url: existing?.website_url || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      await updateMyProfile(form);
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Bio" value={form.bio} onChangeText={(v) => updateField("bio", v)} multiline />
        <Input label="City" value={form.city} onChangeText={(v) => updateField("city", v)} />
        <Input
          label="Country"
          value={form.country}
          onChangeText={(v) => updateField("country", v)}
        />
        <Input
          label="Website"
          value={form.website_url}
          onChangeText={(v) => updateField("website_url", v)}
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button onPress={handleSave} loading={saving}>
          Save
        </Button>
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
    padding: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
  },
});
