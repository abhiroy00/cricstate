import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import { extractErrorMessage } from "../../services/api";
import { fetchMyProfile } from "../../services/profileService";
import { colors } from "../../utils/theme";

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyProfile();
      setProfile(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button onPress={load}>Retry</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.name}>{profile.full_name}</Text>
      <Text style={styles.username}>@{profile.username}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{profile.followers_count}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statValue}>{profile.following_count}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <Text style={styles.bio}>{profile.bio || "No bio yet."}</Text>

      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>City</Text>
        <Text style={styles.fieldValue}>{profile.city || "—"}</Text>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Country</Text>
        <Text style={styles.fieldValue}>{profile.country || "—"}</Text>
      </View>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>Website</Text>
        <Text style={styles.fieldValue}>{profile.website_url || "—"}</Text>
      </View>

      <Button onPress={() => navigation.navigate("EditProfile", { profile })}>
        Edit profile
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  username: {
    color: colors.muted,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 14,
  },
  statBlock: {
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  bio: {
    color: colors.text,
    marginBottom: 18,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    color: colors.muted,
  },
  fieldValue: {
    color: colors.text,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
  },
});
