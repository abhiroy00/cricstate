import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, ScrollView, Share, StyleSheet, Text, View } from "react-native";

import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Input from "../../components/Input";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import {
  addPlayerToRoster,
  getRoster,
  getTeam,
  getTeamInvite,
  updateTeamPlayer,
} from "../../services/teamService";
import { colors } from "../../utils/theme";

export default function TeamDetailScreen({ route }) {
  const { teamId } = route.params;
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [adding, setAdding] = useState(false);
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [teamData, rosterData] = await Promise.all([getTeam(teamId), getRoster(teamId)]);
      setTeam(teamData);
      setRoster(rosterData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isOwner = user?.id === team?.created_by;

  async function handleAddPlayer() {
    if (!newPlayerName.trim()) return;
    setAdding(true);
    setError("");
    try {
      await addPlayerToRoster(teamId, { new_player_full_name: newPlayerName.trim() });
      setNewPlayerName("");
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleCaptain(playerId, current) {
    try {
      await updateTeamPlayer(teamId, playerId, { is_captain: !current });
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function handleInvite() {
    setInviting(true);
    setError("");
    try {
      const invite = await getTeamInvite(teamId);
      await Share.share({
        message: `Join my team "${team.name}" on CricState! Open the app, go to My Cricket > Teams > "Have an invite code?" and enter: ${invite.code}`,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setInviting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error && !team) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!team) return <EmptyState title="Team not found" />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{team.name}</Text>
      {team.home_ground && <Text style={styles.subtitle}>{team.home_ground}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      {isOwner && (
        <View style={styles.addForm}>
          <Button variant="secondary" onPress={handleInvite} loading={inviting}>
            Invite Players
          </Button>
          <View style={styles.addFormSpacer} />
          <Input
            label="Add a player"
            value={newPlayerName}
            onChangeText={setNewPlayerName}
            placeholder="Player name"
          />
          <Button onPress={handleAddPlayer} loading={adding}>
            Add Player
          </Button>
        </View>
      )}

      <Text style={styles.sectionHeading}>Roster</Text>
      {roster.length === 0 ? (
        <Text style={styles.emptyText}>No players on this roster yet</Text>
      ) : (
        roster.map((entry) => (
          <View key={entry.player.id} style={styles.rosterRow}>
            <View>
              <Text style={styles.playerName}>{entry.player.full_name}</Text>
              <Text style={styles.playerMeta}>{entry.player.role}</Text>
            </View>
            <View style={styles.rosterActions}>
              {entry.is_captain && <Text style={styles.captainBadge}>Captain</Text>}
              {isOwner && (
                <Button
                  variant="secondary"
                  onPress={() => handleToggleCaptain(entry.player.id, entry.is_captain)}
                >
                  {entry.is_captain ? "Remove Captain" : "Make Captain"}
                </Button>
              )}
            </View>
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
    marginBottom: 8,
  },
  addForm: {
    marginTop: 16,
    marginBottom: 8,
  },
  addFormSpacer: {
    height: 16,
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
  rosterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  playerMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  rosterActions: {
    alignItems: "flex-end",
    gap: 6,
  },
  captainBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
});
