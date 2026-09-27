import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { extractErrorMessage } from "../../services/api";
import { listTournaments } from "../../services/tournamentService";
import { useStartMatch } from "../../context/StartMatchContext";
import {
  FlowHeader,
  FlowScreen,
  HelpButton,
  INK,
  MUTED,
  PrimaryBar,
  RED,
  TEAL,
  initials,
} from "./startMatch/flow";

function TypeCard({ kind, title, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.typeCard, selected && styles.typeCardOn]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={[styles.typeIcon, selected && styles.typeIconOn]}>
        <Text style={styles.typeIconText}>{selected ? "✓" : icon}</Text>
      </View>
      <Text style={styles.typeLabel}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function StartMatchTypeScreen({ navigation }) {
  const { resetSquads } = useStartMatch();
  const [type, setType] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tournamentId, setTournamentId] = useState(null);

  const loadTournaments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listTournaments({ limit: 50 });
      setTournaments(data?.items || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetSquads();
      loadTournaments();
    }, [loadTournaments, resetSquads])
  );

  const selectedTournament = tournaments.find((t) => t.id === tournamentId) || null;

  function handleNext() {
    if (!type) {
      Alert.alert("Select match type", "Choose Tournament or Individual to continue.");
      return;
    }
    if (type === "tournament" && !tournamentId) {
      Alert.alert("Select tournament", "Pick the tournament this match belongs to.");
      return;
    }
    navigation.navigate("MatchTeamSelect", {
      tournamentId: type === "tournament" ? tournamentId : null,
      tournamentName: type === "tournament" ? selectedTournament?.name : null,
    });
  }

  return (
    <FlowScreen>
      <FlowHeader
        title="Start a match"
        onBack={() => navigation.goBack()}
        right={<HelpButton onPress={() => Alert.alert("Scoring", "Scoring a match on Cricket State is free.")} />}
      />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <Text style={styles.note}>*Scoring a match on Cricket State is free.</Text>
        <Text style={styles.heading}>Select type of match</Text>

        <View style={styles.typeRow}>
          <TypeCard
            title="Tournament"
            icon="🏆"
            selected={type === "tournament"}
            onPress={() => setType("tournament")}
          />
          <TypeCard
            title="Individual"
            icon="🏏"
            selected={type === "individual"}
            onPress={() => setType("individual")}
          />
        </View>

        {type === "tournament" && (
          <>
            <Text style={styles.heading}>Select tournament</Text>
            {loading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={TEAL} />
              </View>
            ) : error ? (
              <Text style={styles.error}>{error}</Text>
            ) : tournaments.length === 0 ? (
              <Text style={styles.empty}>No tournaments yet. Host one from My Cricket first.</Text>
            ) : (
              tournaments.map((t) => {
                const active = t.id === tournamentId;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tRow, active && styles.tRowOn]}
                    activeOpacity={0.85}
                    onPress={() => setTournamentId(t.id)}
                  >
                    <View style={styles.tBadge}>
                      {t.logo_url ? (
                        <Image source={{ uri: t.logo_url }} style={styles.tLogo} />
                      ) : (
                        <Text style={styles.tBadgeText}>{initials(t.name)}</Text>
                      )}
                    </View>
                    <Text style={styles.tName} numberOfLines={1}>
                      {t.name}
                    </Text>
                    {active ? <Text style={styles.tCheck}>✓</Text> : null}
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={styles.heading}>Select round</Text>
            <TouchableOpacity
              style={styles.roundTile}
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert("Rounds", "Rounds and groups will be available in a later update.")
              }
            >
              <Text style={styles.roundText}>Add new{"\n"}round</Text>
            </TouchableOpacity>
            <Text style={styles.helper}>
              *You will need to add rounds and groups to generate points table.
            </Text>
          </>
        )}
      </ScrollView>

      <PrimaryBar label="Next" onPress={handleNext} />
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  note: {
    fontStyle: "italic",
    color: "#4B4B4B",
    fontSize: 14,
    marginBottom: 14,
  },
  heading: {
    fontSize: 17,
    fontWeight: "700",
    color: INK,
    marginTop: 6,
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  typeCard: {
    width: 150,
    paddingVertical: 18,
    borderRadius: 10,
    backgroundColor: "#F2F3F5",
    borderWidth: 1.5,
    borderColor: "#E3E5E8",
    alignItems: "center",
    marginRight: 14,
  },
  typeCardOn: {
    borderColor: TEAL,
    backgroundColor: "#fff",
  },
  typeIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E3E5E8",
  },
  typeIconOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  typeIconText: {
    fontSize: 30,
    color: "#fff",
  },
  typeLabel: {
    fontSize: 16,
    color: INK,
    fontWeight: "500",
  },
  centered: {
    paddingVertical: 20,
    alignItems: "center",
  },
  error: {
    color: RED,
    marginBottom: 8,
  },
  empty: {
    color: MUTED,
    marginBottom: 8,
  },
  tRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F3F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tRowOn: {
    borderColor: TEAL,
    backgroundColor: "#fff",
  },
  tBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E3E5E8",
  },
  tLogo: {
    width: 44,
    height: 44,
  },
  tBadgeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#5A6472",
  },
  tName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: INK,
    fontWeight: "500",
  },
  tCheck: {
    color: TEAL,
    fontSize: 18,
    fontWeight: "900",
    marginRight: 6,
  },
  roundTile: {
    width: 120,
    height: 96,
    backgroundColor: "#2B2B2B",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  roundText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 22,
  },
  helper: {
    color: "#B0B4BB",
    fontStyle: "italic",
    fontSize: 13,
    marginTop: 14,
  },
});
