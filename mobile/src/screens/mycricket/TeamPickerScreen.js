import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmptyState from "../../components/EmptyState";
import TabSwitcher from "../../components/TabSwitcher";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import { listOpponentTeams, listTeams } from "../../services/teamService";
import { colors } from "../../utils/theme";

const SUB_TABS = [
  { key: "YOUR", label: "Your" },
  { key: "OPPONENTS", label: "Opponents" },
];

export default function TeamPickerScreen({ navigation, route }) {
  const { onSelect } = route.params;
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("YOUR");
  const [teams, setTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (tab) => {
      setLoading(true);
      setError("");
      try {
        if (tab === "OPPONENTS") {
          setTeams(await listOpponentTeams());
        } else {
          const data = await listTeams({ createdBy: user.id, limit: 100 });
          setTeams(data.items);
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  useFocusEffect(
    useCallback(() => {
      load(subTab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subTab])
  );

  function handlePick(team) {
    onSelect(team);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TabSwitcher tabs={SUB_TABS} activeKey={subTab} onChange={setSubTab} size="small" />

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}

      {!loading && !error && teams && teams.length === 0 && subTab === "YOUR" && (
        <EmptyState
          title="You are not part of any team as of now"
          subtitle="Why not create your own?"
          ctaLabel="Create Your Team"
          onPress={() => navigation.navigate("CreateTeam", { onCreated: handlePick })}
        />
      )}

      {!loading && !error && teams && teams.length === 0 && subTab === "OPPONENTS" && (
        <EmptyState title="No opponent teams yet" />
      )}

      {!loading && !error && teams && teams.length > 0 && (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handlePick(item)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.player_count} player{item.player_count === 1 ? "" : "s"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
  },
});
