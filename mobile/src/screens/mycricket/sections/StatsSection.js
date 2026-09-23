import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import ProBanner from "../../../components/ProBanner";
import { useAuth } from "../../../hooks/useAuth";
import { extractErrorMessage } from "../../../services/api";
import { createPlayer, getMyPlayer, getPlayerStats } from "../../../services/playerService";
import { colors } from "../../../utils/theme";

const RED = "#C81E1E";
const TEAL = "#199A8E";
const PILL_BG = "#E9E7E7";

const FILTERS = [
  { key: "BATTING", label: "Batting" },
  { key: "BOWLING", label: "Bowling" },
  { key: "FIELDING", label: "Fielding" },
  { key: "CAPTAIN", label: "Captain" },
];

const EMPTY_TEXT = {
  BATTING: "No batting statistics found.",
  BOWLING: "No bowling statistics found.",
  FIELDING: "No fielding statistics found.",
  CAPTAIN: "No captaincy statistics found.",
};

function StatTile({ label, value }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function ChartIllustration() {
  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartYAxis} />
      <View style={styles.chartXAxis} />
      <View style={[styles.chartBar, { left: "18%", height: 44 }]} />
      <View style={[styles.chartBar, { left: "42%", height: 66 }]} />
      <View style={[styles.chartBar, { left: "66%", height: 88 }]} />
    </View>
  );
}

function isAllZero(stats) {
  if (!stats) return true;
  return ["runs_scored", "wickets_taken", "catches", "matches_played"].every(
    (k) => !stats[k]
  );
}

export default function StatsSection({ navigation }) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("BATTING");
  const [player, setPlayer] = useState(undefined);
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
        setStats(null);
      } else {
        setError(extractErrorMessage(err));
        setPlayer(null);
        setStats(null);
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

  async function handleAnalyse() {
    if (player === undefined || creating) return;
    if (player) {
      navigation.navigate("Analyse", { name: player.full_name || user.full_name });
      return;
    }
    setCreating(true);
    setError("");
    try {
      const created = await createPlayer({ full_name: user.full_name, role: "BATSMAN", user_id: user.id });
      await load();
      navigation.navigate("Analyse", { name: created?.full_name || user.full_name });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  const hasData = player && stats && !isAllZero(stats) && filter !== "CAPTAIN";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Improve banner */}
      <View style={styles.topBanner}>
        <Text style={styles.topBannerText}>Want to improve your stats?</Text>
        <TouchableOpacity style={styles.topPill} activeOpacity={0.8} onPress={handleAnalyse}>
          <Text style={styles.topPillText}>{creating ? "..." : "Analyse"}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContent}
        style={styles.filtersWrap}
      >
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[styles.filterPill, active && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ProBanner onViewBenefits={() => navigation.navigate("ProBenefits")} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : hasData ? (
        <View style={styles.grid}>
          {filter === "BATTING" && (
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
          {filter === "BOWLING" && (
            <>
              <StatTile label="Wickets" value={stats.wickets_taken} />
              <StatTile label="Balls Bowled" value={stats.balls_bowled} />
              <StatTile label="Runs Conceded" value={stats.runs_conceded} />
              <StatTile label="Average" value={stats.bowling_average ?? "-"} />
              <StatTile label="Economy" value={stats.economy_rate ?? "-"} />
            </>
          )}
          {filter === "FIELDING" && (
            <>
              <StatTile label="Catches" value={stats.catches} />
              <StatTile label="Stumpings" value={stats.stumpings} />
              <StatTile label="Run Outs" value={stats.run_outs} />
            </>
          )}
        </View>
      ) : (
        <View style={styles.emptyWrap}>
          <ChartIllustration />
          <Text style={styles.emptyText}>{EMPTY_TEXT[filter]}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 32,
  },
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  topBannerText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  topPill: {
    backgroundColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  topPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  filtersWrap: {
    marginTop: 12,
  },
  filtersContent: {
    paddingHorizontal: 10,
  },
  filterPill: {
    backgroundColor: PILL_BG,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginRight: 10,
  },
  filterPillActive: {
    backgroundColor: TEAL,
  },
  filterText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
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
  emptyWrap: {
    alignItems: "center",
    paddingTop: 8,
  },
  chartWrap: {
    width: 190,
    height: 130,
    marginTop: 26,
    position: "relative",
  },
  chartYAxis: {
    position: "absolute",
    left: 14,
    top: 0,
    bottom: 12,
    width: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
  },
  chartXAxis: {
    position: "absolute",
    left: 14,
    right: 0,
    bottom: 12,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
  },
  chartBar: {
    position: "absolute",
    bottom: 20,
    width: 34,
    borderWidth: 5,
    borderColor: "#D9D9D9",
    borderRadius: 4,
    backgroundColor: "transparent",
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    marginTop: 22,
  },
  error: {
    color: RED,
  },
});
