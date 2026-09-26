import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { extractErrorMessage } from "../../services/api";
import { getMatch } from "../../services/matchService";
import { getLiveState, getScorecard } from "../../services/scoringService";
import { getStreamByMatch } from "../../services/streamService";
import { colors } from "../../utils/theme";

function LiveScoreView({ state }) {
  if (!state.innings) return null;
  return (
    <View style={styles.liveBox}>
      <Text style={styles.liveScore}>
        {state.innings.total_runs}/{state.innings.total_wickets}
        <Text style={styles.liveOvers}> ({state.innings.overs_display} ov)</Text>
      </Text>
      <Text style={styles.liveLine}>
        {state.striker?.full_name} * {state.striker_runs} ({state.striker_balls})
      </Text>
      <Text style={styles.liveLine}>
        {state.non_striker?.full_name} {state.non_striker_runs} ({state.non_striker_balls})
      </Text>
      {state.bowler && (
        <Text style={styles.liveLine}>
          {state.bowler.full_name}: {state.bowler_wickets}/{state.bowler_runs_conceded} ({state.bowler_overs})
        </Text>
      )}
      <Text style={styles.liveRR}>
        CRR {state.run_rate}
        {state.required_run_rate != null ? `  ·  RRR ${state.required_run_rate}` : ""}
      </Text>
    </View>
  );
}

function ScorecardView({ scorecard }) {
  return (
    <View>
      {scorecard.innings.map((inn) => (
        <View key={inn.innings.id} style={styles.inningsBox}>
          <Text style={styles.inningsTitle}>
            Innings {inn.innings.innings_number}: {inn.innings.total_runs}/{inn.innings.total_wickets} (
            {inn.innings.overs_display} ov)
          </Text>
          {inn.batting.map((b) => (
            <Text key={b.player.id} style={styles.rowLine}>
              {b.player.full_name}: {b.runs} ({b.balls_faced}b) {b.is_out ? `- ${b.dismissal}` : "- not out"}
            </Text>
          ))}
          <Text style={styles.bowlingHeading}>Bowling</Text>
          {inn.bowling.map((b) => (
            <Text key={b.player.id} style={styles.rowLine}>
              {b.player.full_name}: {b.overs}-{b.runs_conceded}-{b.wickets}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function MatchDetailScreen({ route }) {
  const { matchId } = route.params;
  const [match, setMatch] = useState(null);
  const [liveState, setLiveState] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const matchData = await getMatch(matchId);
      setMatch(matchData);
      if (matchData.status === "LIVE") {
        setLiveState(await getLiveState(matchId));
      } else if (matchData.status === "COMPLETED") {
        setScorecard(await getScorecard(matchId));
      }
      try {
        setStream(await getStreamByMatch(matchId));
      } catch {
        setStream(null);
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [matchId]);

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

  if (error || !match) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Match not found"}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {match.team_a.name} vs {match.team_b.name}
      </Text>
      <Text style={styles.subtitle}>
        {match.match_type} · {match.overs_limit} overs · {match.status}
      </Text>
      {match.result_summary && <Text style={styles.resultBanner}>{match.result_summary}</Text>}
      {stream && (
        <Text style={styles.streamBanner}>
          📡 Stream: {stream.status}
          {stream.status === "LIVE" && stream.viewer_count != null
            ? ` · ${stream.viewer_count} watching`
            : ""}
        </Text>
      )}
      {match.status === "SCHEDULED" && (
        <Text style={styles.hint}>
          Toss, starting the match, and scoring are done from the web app for now.
        </Text>
      )}

      {liveState && <LiveScoreView state={liveState} />}
      {scorecard && <ScorecardView scorecard={scorecard} />}
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    color: colors.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  resultBanner: {
    backgroundColor: "#eaf6f0",
    color: colors.primaryDark,
    padding: 10,
    borderRadius: 8,
    fontWeight: "600",
    marginBottom: 12,
  },
  streamBanner: {
    backgroundColor: "#fdeaea",
    color: "#A60E14",
    padding: 10,
    borderRadius: 8,
    fontWeight: "600",
    marginBottom: 12,
  },
  hint: {
    backgroundColor: colors.background,
    color: colors.muted,
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 12,
  },
  liveBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  liveScore: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  liveOvers: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.muted,
  },
  liveLine: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  liveRR: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 8,
  },
  inningsBox: {
    marginBottom: 20,
  },
  inningsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  bowlingHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
    marginTop: 8,
    marginBottom: 4,
  },
  rowLine: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  error: {
    color: colors.danger,
  },
});
