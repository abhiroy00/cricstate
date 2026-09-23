import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmptyState from "../../../components/EmptyState";
import TabSwitcher from "../../../components/TabSwitcher";
import { useAuth } from "../../../hooks/useAuth";
import { extractErrorMessage } from "../../../services/api";
import { listTournaments } from "../../../services/tournamentService";
import { colors } from "../../../utils/theme";

const SUB_TABS = [
  { key: "ALL", label: "All" },
  { key: "MINE", label: "Mine" },
];

export default function TournamentsSection({ navigation }) {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("ALL");
  const [tournaments, setTournaments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (tab) => {
      setLoading(true);
      setError("");
      try {
        const data = await listTournaments(
          tab === "MINE" ? { organizerId: user.id, limit: 100 } : { limit: 100 }
        );
        setTournaments(data.items);
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

      {!loading && !error && tournaments && tournaments.length === 0 && (
        <EmptyState
          title="It seems you have not played any tournaments yet"
          subtitle="You know, you can host your own tournament too!"
          ctaLabel="Host a Tournament"
          onPress={() => navigation.navigate("CreateTournament")}
        />
      )}

      {!loading && !error && tournaments && tournaments.length > 0 && (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("TournamentDetail", { tournamentId: item.id })}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.format} · {item.status}
                {item.location ? ` · ${item.location}` : ""}
              </Text>
              <Text style={styles.meta}>{item.team_count} team(s) registered</Text>
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
