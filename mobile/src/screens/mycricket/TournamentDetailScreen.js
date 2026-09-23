import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import { listTeams } from "../../services/teamService";
import {
  getPointsTable,
  getTournament,
  listTournamentTeams,
  registerTeam,
} from "../../services/tournamentService";
import { colors } from "../../utils/theme";

export default function TournamentDetailScreen({ route }) {
  const { tournamentId } = route.params;
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState(null);
  const [pointsTable, setPointsTable] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tournamentData, teamsData, pointsData, ownTeams] = await Promise.all([
        getTournament(tournamentId),
        listTournamentTeams(tournamentId),
        getPointsTable(tournamentId),
        listTeams({ createdBy: user.id, limit: 100 }),
      ]);
      setTournament(tournamentData);
      setTeams(teamsData);
      setPointsTable(pointsData);
      setMyTeams(ownTeams.items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [tournamentId, user.id]);

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

  if (error && !tournament) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!tournament) return <EmptyState title="Tournament not found" />;

  const registeredTeamIds = new Set(teams.map((t) => t.team.id));
  const availableTeams = myTeams.filter((t) => !registeredTeamIds.has(t.id));

  async function handleRegister(teamId) {
    setRegistering(true);
    setError("");
    try {
      await registerTeam(tournamentId, teamId);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{tournament.name}</Text>
      <Text style={styles.subtitle}>
        {tournament.format} · {tournament.status}
        {tournament.location ? ` · ${tournament.location}` : ""}
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {availableTeams.length > 0 && (
        <View style={styles.registerBox}>
          <Text style={styles.sectionHeading}>Register one of your teams</Text>
          {availableTeams.map((t) => (
            <Button key={t.id} variant="secondary" onPress={() => handleRegister(t.id)} loading={registering}>
              {t.name}
            </Button>
          ))}
        </View>
      )}

      <Text style={styles.sectionHeading}>Teams</Text>
      {teams.length === 0 ? (
        <Text style={styles.emptyText}>No teams registered yet</Text>
      ) : (
        teams.map((entry) => (
          <View key={entry.team.id} style={styles.row}>
            <Text style={styles.rowText}>{entry.team.name}</Text>
            <Text style={styles.statusBadge}>{entry.status}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionHeading}>Points Table</Text>
      {pointsTable.length === 0 ? (
        <Text style={styles.emptyText}>No completed matches yet</Text>
      ) : (
        pointsTable.map((row) => (
          <View key={row.team.id} style={styles.row}>
            <Text style={styles.rowText}>{row.team.name}</Text>
            <Text style={styles.rowMeta}>
              P{row.played} W{row.won} L{row.lost} · {row.points} pts · NRR {row.net_run_rate}
            </Text>
          </View>
        ))
      )}
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
  },
  registerBox: {
    marginTop: 16,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: colors.muted,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  rowText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  rowMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
});
