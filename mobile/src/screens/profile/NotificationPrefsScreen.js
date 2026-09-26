import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../services/engagementService";

const RED = "#E01A22";
const TEAL = "#00A651";

const ROWS = [
  ["push_enabled", "Push notifications", "Match alerts and updates on your phone"],
  ["email_enabled", "Email notifications", "Occasional digests in your inbox"],
  ["match_alerts", "Match alerts", "Live scores, results and reminders"],
  ["team_updates", "Team updates", "Invites, roster and tournament news"],
  ["marketing", "Offers & marketing", "Store deals and PRO offers"],
];

export default function NotificationPrefsScreen({ navigation }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getNotificationPreferences()
      .then((p) => {
        if (alive) setPrefs(p);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function toggle(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }));
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (err) {
      setPrefs((p) => ({ ...p, [key]: !value }));
      Alert.alert(
        "Update failed",
        err?.response?.data?.message || err?.message || "Something went wrong"
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Notification preferences
        </Text>
        <View style={{ width: 40 }} />
      </DreamHeader>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : !prefs ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Could not load preferences. Go back and retry.</Text>
        </View>
      ) : (
        <View style={styles.body}>
          {ROWS.map(([key, label, sub]) => (
            <View key={key} style={styles.row}>
              <View style={styles.rowMid}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowSub}>{sub}</Text>
              </View>
              <Switch
                value={!!prefs[key]}
                onValueChange={(v) => toggle(key, v)}
                trackColor={{ false: "#DDD", true: TEAL }}
              />
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 15,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { fontSize: 15, color: "#777", textAlign: "center" },
  body: { flex: 1, backgroundColor: "#fff", paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowMid: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: "#111" },
  rowSub: { fontSize: 13, color: "#888", marginTop: 2 },
});
