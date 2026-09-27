import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { createTeam } from "../../services/teamService";
import { registerTeam } from "../../services/tournamentService";
import { uploadImage } from "../../services/uploadService";

const RED = "#E01A22";
const TEAL = "#00A651";
const PLACEHOLDER = "#9AA0AE";
const UNDERLINE = "#D6D6D6";

let teamSeq = 0;

function emptyTeam() {
  teamSeq += 1;
  return {
    key: `t${teamSeq}`,
    name: "",
    city: "",
    logoUri: null,
    captainNumber: "",
    captainName: "",
    allowPlayers: true,
  };
}

function Field({ label, required, value, onChangeText, keyboardType, right, ...rest }) {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(value);
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, !active && styles.hidden]}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={active ? "" : `${label}${required ? " *" : ""}`}
          placeholderTextColor={PLACEHOLDER}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {right || null}
      </View>
    </View>
  );
}

export default function AddTeamsScreen({ navigation, route }) {
  const { tournamentId } = route?.params || {};
  const insets = useSafeAreaInsets();
  const [teams, setTeams] = useState(() => [emptyTeam()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateTeam(key, patch) {
    setTeams((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  }

  function addOneMore() {
    setTeams((prev) => [...prev, emptyTeam()]);
  }

  async function pickLogo(key) {
    try {
      if (Platform.OS === "ios") {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow photo access to add a team logo.");
          return;
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) updateTeam(key, { logoUri: asset.uri });
    } catch (err) {
      Alert.alert("Could not open photos", extractErrorMessage(err));
    }
  }

  async function handleDone() {
    const filled = teams.filter((t) => t.name.trim());
    if (filled.length === 0) {
      setError("Please enter at least one team name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      for (const team of filled) {
        let logoUrl = null;
        if (team.logoUri) {
          const uploaded = await uploadImage(team.logoUri);
          logoUrl = uploaded?.url || null;
        }
        const created = await createTeam({
          name: team.name.trim(),
          home_ground: team.city.trim() || null,
          logo_url: logoUrl,
        });
        if (tournamentId) {
          await registerTeam(tournamentId, created.id);
        }
      }
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
        <Text style={styles.headerTitle}>Add one or more teams</Text>
        <View style={styles.headerSpacer} />
      </DreamHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {teams.map((team) => (
          <View key={team.key} style={styles.card}>
            <TouchableOpacity
              style={styles.logoWrap}
              activeOpacity={0.8}
              onPress={() => pickLogo(team.key)}
            >
              <View style={styles.logoCircle}>
                {team.logoUri ? (
                  <Image source={{ uri: team.logoUri }} style={styles.logoImage} />
                ) : (
                  <Text style={styles.logoIcon}>🏆</Text>
                )}
              </View>
              <View style={styles.logoBadge}>
                <Text style={styles.logoBadgeIcon}>📷</Text>
              </View>
              <View style={styles.logoTag}>
                <Text style={styles.logoTagText}>Logo</Text>
              </View>
            </TouchableOpacity>

            <Field
              label="Team name"
              required
              value={team.name}
              onChangeText={(v) => updateTeam(team.key, { name: v })}
            />
            <Field
              label="City / town"
              required
              value={team.city}
              onChangeText={(v) => updateTeam(team.key, { city: v })}
            />
            <Field
              label="+91 Team captain/coordinator number (optional)"
              value={team.captainNumber}
              onChangeText={(v) => updateTeam(team.key, { captainNumber: v })}
              keyboardType="phone-pad"
              right={
                <View style={styles.waIcon}>
                  <Text style={styles.waIconText}>☎</Text>
                </View>
              }
            />

            <Text style={styles.captainLabel}>Team captain name (optional)</Text>
            <View style={[styles.fieldRow, styles.captainRow]}>
              <TextInput
                style={styles.fieldInput}
                value={team.captainName}
                onChangeText={(v) => updateTeam(team.key, { captainName: v })}
                placeholderTextColor={PLACEHOLDER}
              />
            </View>

            <TouchableOpacity
              style={styles.checkRow}
              activeOpacity={0.8}
              onPress={() => updateTeam(team.key, { allowPlayers: !team.allowPlayers })}
            >
              <View style={[styles.checkbox, team.allowPlayers && styles.checkboxOn]}>
                {team.allowPlayers ? <Text style={styles.checkTick}>✓</Text> : null}
              </View>
              <Text style={styles.checkLabel}>Let the captain add team players.</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addMore} activeOpacity={0.8} onPress={addOneMore}>
          <View style={styles.plusCircle}>
            <Text style={styles.plusText}>+</Text>
          </View>
          <Text style={styles.addMoreText}>Add one more team</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

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
    backgroundColor: "#EFF1F4",
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
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    padding: 16,
    paddingTop: 20,
    marginBottom: 16,
  },
  logoWrap: {
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#CFCFCF",
    borderStyle: "dashed",
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoIcon: {
    fontSize: 38,
    opacity: 0.5,
  },
  logoBadge: {
    position: "absolute",
    right: 4,
    top: 56,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeIcon: {
    fontSize: 12,
  },
  logoTag: {
    marginTop: -14,
    backgroundColor: "#333333",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  logoTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 2,
  },
  hidden: {
    opacity: 0,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: UNDERLINE,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1a1a1a",
  },
  req: {
    color: RED,
  },
  waIcon: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  waIconText: {
    color: "#fff",
    fontSize: 14,
  },
  captainLabel: {
    color: TEAL,
    fontSize: 13,
    marginBottom: 2,
  },
  captainRow: {
    borderBottomColor: TEAL,
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C4C4C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  checkTick: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 17,
  },
  checkLabel: {
    color: "#4B4B4B",
    fontSize: 14,
  },
  addMore: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  plusCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 30,
  },
  addMoreText: {
    color: TEAL,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  error: {
    color: RED,
    textAlign: "center",
    marginBottom: 8,
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
