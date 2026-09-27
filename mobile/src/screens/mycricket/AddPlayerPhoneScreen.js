import { useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { addPlayerToRoster } from "../../services/teamService";

const RED = "#E01A22";
const TEAL = "#00A651";

export default function AddPlayerPhoneScreen({ navigation, route }) {
  const { teamId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDone() {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid phone number");
      return;
    }
    if (!name.trim()) {
      setError("Player full name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addPlayerToRoster(teamId, { new_player_full_name: name.trim() });
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>phone number</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ContactsPicker", { teamId })}
        >
          <Text style={styles.headerAction}>Add multiple</Text>
        </TouchableOpacity>
      </DreamHeader>

      <View style={styles.card}>
        <Text style={styles.floatingLabel}>Enter valid phone number</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/[^\d]/g, ""));
              setError("");
            }}
            keyboardType="number-pad"
            maxLength={10}
            placeholder=""
          />
          {phone.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setPhone("")} hitSlop={8}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.nameLabel}>Player full name*</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError("");
            }}
            placeholder=""
          />
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, { paddingBottom: Math.max(insets.bottom, 16) }]}
          activeOpacity={0.85}
          onPress={handleDone}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.doneText}>Done</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
  headerAction: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  card: {
    margin: 14,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 8,
    padding: 16,
  },
  floatingLabel: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D6D6D6",
    paddingBottom: 6,
    marginBottom: 22,
  },
  prefix: {
    fontSize: 16,
    color: "#1a1a1a",
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    padding: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#9AA0AE",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  clearText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
  },
  nameLabel: {
    fontSize: 13,
    color: TEAL,
    marginBottom: 4,
  },
  nameRow: {
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 6,
  },
  nameInput: {
    fontSize: 16,
    color: "#1a1a1a",
    padding: 0,
  },
  error: {
    color: RED,
    textAlign: "center",
    marginHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    backgroundColor: "#fff",
  },
  doneBtn: {
    backgroundColor: TEAL,
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
