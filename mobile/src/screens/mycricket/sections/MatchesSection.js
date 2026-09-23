import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import EmptyState from "../../../components/EmptyState";
import TabSwitcher from "../../../components/TabSwitcher";
import { extractErrorMessage } from "../../../services/api";
import { listMatches } from "../../../services/matchService";
import { colors } from "../../../utils/theme";

const SUB_TABS = [
  { key: "ALL", label: "All" },
  { key: "PLAYED", label: "Played" },
];

const STATUS_LABEL = {
  SCHEDULED: "Upcoming",
  LIVE: "🔴 LIVE",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

export default function MatchesSection({ navigation }) {
  const [subTab, setSubTab] = useState("ALL");
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (tab) => {
    setLoading(true);
    setError("");
    try {
      const data = await listMatches(tab === "PLAYED" ? { status: "COMPLETED" } : {});
      setMatches(data.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

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

      {!loading && !error && matches && matches.length === 0 && (
        <EmptyState
          title="You have not played any matches yet"
          subtitle="Why don't you start one with your rival team?"
          ctaLabel="Start A Match"
          onPress={() => navigation.navigate("StartMatch")}
        />
      )}

      {!loading && !error && matches && matches.length > 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("MatchDetail", { matchId: item.id })}
            >
              <Text style={styles.status}>{STATUS_LABEL[item.status] || item.status}</Text>
              <Text style={styles.teams}>
                {item.team_a.name} vs {item.team_b.name}
              </Text>
              <Text style={styles.meta}>
                {item.match_type} · {item.overs_limit} overs
              </Text>
              {item.result_summary && <Text style={styles.result}>{item.result_summary}</Text>}
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
  status: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.danger,
    marginBottom: 4,
  },
  teams: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  result: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primaryDark,
    marginTop: 6,
  },
  error: {
    color: colors.danger,
  },
});
