import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { extractErrorMessage } from "../../services/api";
import { createMatch, setLineups } from "../../services/matchService";
import { useStartMatch } from "../../context/StartMatchContext";
import {
  FlowHeader,
  FlowScreen,
  INK,
  MUTED,
  PrimaryBar,
  RED,
  TEAL,
  avatarColor,
  initials,
} from "./startMatch/flow";

const MATCH_TYPES = [
  { key: "LIMITED_OVERS", label: "Limited Overs" },
  { key: "BOX_TURF", label: "Box/Turf Cricket" },
  { key: "PAIR_CRICKET", label: "Pair Cricket" },
  { key: "TEST_MATCH", label: "Test Match" },
  { key: "THE_HUNDRED", label: "The Hundred" },
];

const BALL_TYPES = [
  { key: "TENNIS", label: "Tennis", color: "#1E9E57" },
  { key: "LEATHER", label: "Leather", color: "#C0392B" },
  { key: "OTHER", label: "Other", color: "#F2A93B" },
];

const PITCH_TYPES = ["ROUGH", "CEMENT", "TURF", "ASTROTURF", "MATTING"];

// Older deployments only accept T20/ODI/CUSTOM and have no /lineups route.
// We try the full new payload first and only fall back when the server
// rejects it, so nothing changes once the updated backend is deployed.
async function createMatchCompat(payload) {
  try {
    return await createMatch(payload);
  } catch (err) {
    if (err?.response?.status === 422 && payload.match_type !== "CUSTOM") {
      return createMatch({ ...payload, match_type: "CUSTOM" });
    }
    throw err;
  }
}

async function saveSquadIfSupported(matchId, teamId, players) {
  if (!players.length) return;
  try {
    await setLineups(matchId, { teamId, players: players.map((p) => p.id) });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 405 || status === 501) return;
    throw err;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatNow() {
  const d = new Date();
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()} ${h}:${m} ${ampm}`;
}

function TeamHead({ team, squadCount, onPressSquad }) {
  return (
    <View style={styles.teamHead}>
      <View style={[styles.teamAvatar, { backgroundColor: avatarColor(team.id) }]}>
        {team.logo_url ? (
          <Image source={{ uri: team.logo_url }} style={styles.teamAvatarImg} />
        ) : (
          <Text style={styles.teamAvatarText}>{initials(team.name)}</Text>
        )}
      </View>
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
      <TouchableOpacity style={styles.squadPill} activeOpacity={0.85} onPress={onPressSquad}>
        <Text style={styles.squadPillText}>Squad ({squadCount})</Text>
      </TouchableOpacity>
    </View>
  );
}

function Underline({ label, value, onChangeText, keyboardType, maxLength }) {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(value);
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, !active && styles.hidden]}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={active ? "" : label}
        placeholderTextColor="#9AA0AE"
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

export default function MatchSetupScreen({ navigation, route }) {
  const { teamA, teamB, tournamentId } = route.params || {};
  const { squads, setSquads } = useStartMatch();
  const [toast, setToast] = useState("");
  const [matchType, setMatchType] = useState("LIMITED_OVERS");
  const [overs, setOvers] = useState("5");
  const [oversPerBowler, setOversPerBowler] = useState("1");
  const [powerplay, setPowerplay] = useState("");
  const [city, setCity] = useState("");
  const [ground, setGround] = useState("");
  const [ballType, setBallType] = useState("TENNIS");
  const [wagonWheel, setWagonWheel] = useState(false);
  const [pitchType, setPitchType] = useState("");
  const [officials, setOfficials] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const squadA = squads.a || [];
  const squadB = squads.b || [];

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  function editSquad() {
    navigation.navigate("SelectSquad", {
      teamA,
      teamB,
      tournamentId,
      mode: "edit",
    });
  }

  async function create(goToToss) {
    setBusy(true);
    setError("");
    try {
      const match = await createMatchCompat({
        team_a_id: teamA.id,
        team_b_id: teamB.id,
        match_type: matchType,
        overs_limit: Number(overs) || 5,
        ball_type: ballType,
        overs_per_bowler: oversPerBowler ? Number(oversPerBowler) : null,
        powerplay_overs: powerplay ? Number(powerplay) : null,
        pitch_type: pitchType || null,
        wagon_wheel: wagonWheel,
        officials: officials.trim() || null,
        city: city.trim() || null,
        venue: ground.trim() || null,
        scheduled_at: new Date().toISOString(),
        tournament_id: tournamentId || undefined,
      });

      if (goToToss) {
        await saveSquadIfSupported(match.id, teamA.id, squadA);
        await saveSquadIfSupported(match.id, teamB.id, squadB);
        navigation.navigate("Toss", { matchId: match.id });
      } else {
        Alert.alert("Match scheduled", "Find it in My Cricket → Matches.");
        navigation.navigate("MyCricketHome");
      }
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleNext() {
    if (!overs || Number(overs) <= 0) {
      showToast("Enter a valid number of overs");
      return;
    }
    if (squadA.length < 2) {
      showToast(`Please select minimum two players in team ${teamA.name}`);
      return;
    }
    if (squadB.length < 2) {
      showToast(`Please select minimum two players in team ${teamB.name}`);
      return;
    }
    setError("");
    if (squadA.length !== squadB.length) {
      setConfirmOpen(true);
      return;
    }
    create(true);
  }

  return (
    <FlowScreen>
      <FlowHeader title="Start a match" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.body} contentContainerStyle={styles.content}>
        <View style={styles.teamsRow}>
          <TeamHead team={teamA} squadCount={squadA.length} onPressSquad={editSquad} />
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>vs</Text>
          </View>
          <TeamHead team={teamB} squadCount={squadB.length} onPressSquad={editSquad} />
        </View>

        <Text style={styles.sectionLabel}>
          Match type<Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.chipsRow}>
          {MATCH_TYPES.map((m) => {
            const on = m.key === matchType;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setMatchType(m.key)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Underline label="No. of overs *" value={overs} onChangeText={setOvers} keyboardType="number-pad" maxLength={3} />
          </View>
          <View style={styles.col}>
            <Underline label="Overs per bowler" value={oversPerBowler} onChangeText={setOversPerBowler} keyboardType="number-pad" maxLength={2} />
          </View>
        </View>

        <View style={styles.powerplayRow}>
          <Underline label="Power play overs" value={powerplay} onChangeText={setPowerplay} keyboardType="number-pad" maxLength={2} />
        </View>

        <Underline label="City / town *" value={city} onChangeText={setCity} />
        <Underline label="Ground *" value={ground} onChangeText={setGround} />

        <Text style={styles.fieldLabelFull}>Date &amp; time</Text>
        <Text style={styles.dateValue}>{formatNow()}</Text>

        <Text style={styles.sectionLabel}>
          Ball type<Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.ballsRow}>
          {BALL_TYPES.map((b) => {
            const on = b.key === ballType;
            return (
              <TouchableOpacity
                key={b.key}
                style={styles.ballItem}
                activeOpacity={0.85}
                onPress={() => setBallType(b.key)}
              >
                <View style={[styles.ball, { backgroundColor: b.color }]}>
                  {on ? (
                    <View style={styles.ballCheck}>
                      <Text style={styles.ballCheckText}>✓</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.ballLabel}>{b.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Wagon Wheel</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show Wagon Wheel for 1s, 2s, &amp; 3s</Text>
          <Switch
            value={wagonWheel}
            onValueChange={setWagonWheel}
            trackColor={{ true: TEAL, false: "#CCC" }}
            thumbColor="#fff"
          />
        </View>

        <Text style={styles.sectionLabel}>Pitch type</Text>
        <View style={styles.chipsRow}>
          {PITCH_TYPES.map((p) => {
            const on = p === pitchType;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setPitchType(on ? "" : p)}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{p}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Match officials</Text>
        <Underline label="Umpire / scorer" value={officials} onChangeText={setOfficials} />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.scheduleBtn}
          activeOpacity={0.85}
          onPress={() => (Number(overs) > 0 ? create(false) : setError("Enter overs"))}
          disabled={busy}
        >
          <Text style={styles.scheduleText}>Schedule match</Text>
        </TouchableOpacity>
        <PrimaryBar
          label="Next (toss)"
          onPress={handleNext}
          loading={busy}
          style={styles.nextBar}
        />
      </View>

      <Modal transparent visible={confirmOpen} animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Playing 11</Text>
            <Text style={styles.modalBody}>
              {teamA.name} and {teamB.name} playing squads are not same. Want to
              continue?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={() => {
                  setConfirmOpen(false);
                  create(true);
                }}
              >
                <Text style={styles.modalConfirmText}>Yes, I'm sure</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24 },
  teamsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  teamHead: { flex: 1, alignItems: "center" },
  teamAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  teamAvatarImg: { width: 72, height: 72 },
  teamAvatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  teamName: { fontSize: 15, color: INK, fontWeight: "600", marginTop: 8, maxWidth: 140 },
  squadPill: {
    marginTop: 6,
    backgroundColor: TEAL,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  squadPillText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDE1E5",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  vsText: { transform: [{ rotate: "-45deg" }], color: MUTED, fontWeight: "700", fontSize: 12 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: INK,
    marginTop: 18,
    marginBottom: 10,
  },
  req: { color: RED },
  chipsRow: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    backgroundColor: "#EFEFEF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: TEAL },
  chipText: { color: "#333", fontSize: 14, fontWeight: "500" },
  chipTextOn: { color: "#fff", fontWeight: "600" },
  twoCol: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },
  col: { flex: 1, marginRight: 14 },
  powerplayLink: { paddingBottom: 12 },
  powerplayText: { color: TEAL, fontSize: 14, fontWeight: "600" },
  powerplayRow: { marginTop: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, color: "#8A8A8A", marginBottom: 2 },
  hidden: { opacity: 0 },
  fieldLabelFull: { fontSize: 12, color: "#8A8A8A", marginTop: 2 },
  fieldInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#D6D6D6",
    paddingVertical: 8,
    fontSize: 16,
    color: INK,
  },
  dateValue: {
    fontSize: 16,
    color: INK,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D6D6D6",
    marginBottom: 6,
  },
  ballsRow: { flexDirection: "row" },
  ballItem: { alignItems: "center", marginRight: 26 },
  ball: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  ballCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ballCheckText: { color: TEAL, fontSize: 16, fontWeight: "900", lineHeight: 18 },
  ballLabel: { fontSize: 13, color: "#4B5563", marginTop: 8 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  switchLabel: { fontSize: 14, color: "#4B5563", flex: 1, marginRight: 12 },
  error: { color: RED, marginTop: 12 },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 84,
    backgroundColor: "#3A3A3A",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  toastText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  footer: { flexDirection: "row" },
  scheduleBtn: {
    flex: 1,
    backgroundColor: "#EDEFF1",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleText: { color: "#5A6472", fontSize: 15, fontWeight: "600" },
  nextBar: { flex: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 20,
    paddingBottom: 26,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: RED, marginBottom: 10 },
  modalBody: { fontSize: 15, color: "#333", lineHeight: 21 },
  modalActions: { flexDirection: "row", marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 14, alignItems: "center" },
  modalCancel: { backgroundColor: "#F0F0F0", marginRight: 6 },
  modalCancelText: { color: "#5A6472", fontSize: 15, fontWeight: "600" },
  modalConfirm: { backgroundColor: TEAL, marginLeft: 6 },
  modalConfirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
