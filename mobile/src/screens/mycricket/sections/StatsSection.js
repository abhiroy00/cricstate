import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import EmptyState from "../../../components/EmptyState";
import TabSwitcher from "../../../components/TabSwitcher";
import { useAuth } from "../../../hooks/useAuth";
import { extractErrorMessage } from "../../../services/api";
import { createPlayer, getMyPlayer, getPlayerStats } from "../../../services/playerService";
import { colors } from "../../../utils/theme";

const SUB_TABS = [
  { key: "BATTING", label: "Batting" },
  { key: "BOWLING", label: "Bowling" },
  { key: "FIELDING", label: "Fielding" },
];

function StatTile({ label, value }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export default function StatsSection() {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState("BATTING");
  const [player, setPlayer] = useState(undefined); // undefined = loading, null = none linked
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await getMyPlayer();
      setPlayer(me);
      setStats(await getPlayerStats(me.id));
    } catch (err) {
      if (err?.response?.status === 404) {
        setPlayer(null);
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleCreateProfile() {
    setCreating(true);
    setError("");
    try {
      await createPlayer({ full_name: user.full_name, role: "BATSMAN", user_id: user.id });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

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
      </View>
    );
  }

  if (player === null) {
    return (
      <EmptyState
        title="No player profile linked yet"
        subtitle="Create your player profile to start tracking your batting, bowling, and fielding stats."
        ctaLabel={creating ? "Creating…" : "Create Your Player Profile"}
        onPress={creating ? undefined : handleCreateProfile}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TabSwitcher tabs={SUB_TABS} activeKey={subTab} onChange={setSubTab} size="small" />
      <ScrollView contentContainerStyle={styles.grid}>
        {subTab === "BATTING" && (
          <>
            <StatTile label="Matches" value={stats.matches_played} />
            <StatTile label="Runs" value={stats.runs_scored} />
            <StatTile label="Highest" value={stats.highest_score} />
            <StatTile label="Average" value={stats.batting_average ?? "-"} />
            <StatTile label="Strike Rate" value={stats.strike_rate ?? "-"} />
            <StatTile label="Not Outs" value={stats.not_outs} />
            <StatTile label="100s" value={stats.hundreds} />
            <StatTile label="50s" value={stats.fifties} />
            <StatTile label="4s" value={stats.fours} />
            <StatTile label="6s" value={stats.sixes} />
          </>
        )}
        {subTab === "BOWLING" && (
          <>
            <StatTile label="Wickets" value={stats.wickets_taken} />
            <StatTile label="Balls Bowled" value={stats.balls_bowled} />
            <StatTile label="Runs Conceded" value={stats.runs_conceded} />
            <StatTile label="Average" value={stats.bowling_average ?? "-"} />
            <StatTile label="Economy" value={stats.economy_rate ?? "-"} />
          </>
        )}
        {subTab === "FIELDING" && (
          <>
            <StatTile label="Catches" value={stats.catches} />
            <StatTile label="Stumpings" value={stats.stumpings} />
            <StatTile label="Run Outs" value={stats.run_outs} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
  },
  tile: {
    width: "33.33%",
    padding: 8,
  },
  tileValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  tileLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  error: {
    color: colors.danger,
  },
});
