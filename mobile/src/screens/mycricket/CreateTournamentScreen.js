import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { createTournament } from "../../services/tournamentService";
import { uploadImage } from "../../services/uploadService";
import { useAuth } from "../../hooks/useAuth";

const RED = "#E01A22";
const TEAL = "#00A651";
const PLACEHOLDER = "#9AA0AE";
const UNDERLINE = "#D6D6D6";

const BALL_TYPES = [
  { key: "Tennis", color: "#1E9E57" },
  { key: "Leather", color: "#C0392B" },
  { key: "Other", color: "#F2A93B" },
];

const MATCH_TYPES = ["Limited Overs", "Test Match"];

const MONTHS_S = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromIso(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return new Date();
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function displayDate(iso) {
  if (!iso) return "";
  const d = fromIso(iso);
  return `${d.getDate()} ${MONTHS_S[d.getMonth()]} ${d.getFullYear()}`;
}

function Field({ label, required, value, onChangeText, icon, keyboardType, ...rest }) {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(value);
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, !active && styles.hidden]}>
        {label}
        {required ? <Text style={styles.req}> *</Text> : null}
      </Text>
      <View style={styles.fieldRow}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={active ? "" : `${label}${required ? " *" : ""}`}
          placeholderTextColor={PLACEHOLDER}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
      </View>
    </View>
  );
}

function DateField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  const active = Boolean(value);
  const current = value ? fromIso(value) : new Date();

  function onAndroidChange(event, selected) {
    setShow(false);
    if (event.type === "set" && selected) {
      onChange(toIso(selected));
    }
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, !active && styles.hidden]}>
        {label}
        <Text style={styles.req}> *</Text>
      </Text>
      <TouchableOpacity style={styles.fieldRow} activeOpacity={0.7} onPress={() => setShow(true)}>
        <Text style={[styles.fieldValue, !active && styles.fieldPlaceholder]}>
          {active ? displayDate(value) : `${label} *`}
        </Text>
        <Text style={styles.fieldIcon}>📅</Text>
      </TouchableOpacity>

      {Platform.OS === "android" && show && (
        <DateTimePicker value={current} mode="date" display="default" onChange={onAndroidChange} />
      )}

      {Platform.OS === "ios" && (
        <Modal
          transparent
          visible={show}
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHead}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalAction}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.modalAction, styles.modalDone]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={current}
                mode="date"
                display="spinner"
                onChange={(event, selected) => selected && onChange(toIso(selected))}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function BallOption({ color, label, selected, onPress }) {
  return (
    <TouchableOpacity style={styles.ballItem} activeOpacity={0.85} onPress={onPress}>
      <View style={[styles.ball, { backgroundColor: color }]}>
        {label === "Leather" ? <View style={styles.ballSeam} /> : null}
        {selected ? (
          <View style={styles.ballCheck}>
            <Text style={styles.ballCheckText}>✓</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.ballLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CreateTournamentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [ground, setGround] = useState("");
  const [organiserName, setOrganiserName] = useState(user?.full_name || "");
  const [organiserNumber, setOrganiserNumber] = useState(user?.phone || "");
  const [organiserEmail, setOrganiserEmail] = useState(user?.email || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ballType, setBallType] = useState("Tennis");
  const [matchType, setMatchType] = useState("Limited Overs");
  const [logoUri, setLogoUri] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function pickLogo() {
    try {
      // Android 13+ ka system photo picker permission nahi maangta; sirf iOS pe
      // library permission chahiye. Pehle permission maangne se Android pe
      // picker block ho jaata tha.
      if (Platform.OS === "ios") {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!permission.granted && permission.canAskAgain) {
          permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        if (!permission.granted) {
          Alert.alert("Permission needed", "Please allow photo access to add a team logo.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setLogoUri(asset.uri);
      }
    } catch (err) {
      Alert.alert("Could not open photos", extractErrorMessage(err));
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("Tournament / series name is required");
      return;
    }
    setCreating(true);
    setError("");
    try {
      let logoUrl = null;
      if (logoUri) {
        const uploaded = await uploadImage(logoUri);
        logoUrl = uploaded?.url || null;
      }
      const tournament = await createTournament({
        name: name.trim(),
        format: "LEAGUE",
        location: [city.trim(), ground.trim()].filter(Boolean).join(", ") || null,
        start_date: startDate || null,
        end_date: endDate || null,
        logo_url: logoUrl,
        city: city.trim() || null,
        ground: ground.trim() || null,
        organiser_name: organiserName.trim() || null,
        organiser_number: organiserNumber.trim() || null,
        organiser_email: organiserEmail.trim() || null,
        ball_type: ballType,
        match_type: matchType,
      });
      navigation.replace("TournamentTeamCount", {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>Add a tournament / series</Text>
        <HeaderIconBtn onPress={handleCreate} label="Next">
          <Text style={styles.headerNext}>▷</Text>
        </HeaderIconBtn>
      </DreamHeader>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Team logo (moved to top center, replaces Add banner) */}
        <TouchableOpacity style={styles.logoButton} activeOpacity={0.8} onPress={pickLogo}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoIcon}>🏏</Text>
              )}
            </View>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeIcon}>📷</Text>
            </View>
          </View>
          <Text style={styles.logoLabel}>{logoUri ? "Change team logo" : "Team logo"}</Text>
        </TouchableOpacity>

        <Field label="Tournament / series name" required value={name} onChangeText={setName} />
        <Field label="City" required value={city} onChangeText={setCity} />
        <Field label="Ground" required value={ground} onChangeText={setGround} />
        <Field label="Organiser name" required value={organiserName} onChangeText={setOrganiserName} />
        <Field
          label="Organiser number"
          required
          value={organiserNumber}
          onChangeText={setOrganiserNumber}
          keyboardType="phone-pad"
        />
        <Field
          label="Organiser email"
          required
          value={organiserEmail}
          onChangeText={setOrganiserEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.helper}>
          *Get updated with CricHeroes offers and help videos on mail.
        </Text>

        <Text style={styles.sectionTitle}>Tournament dates</Text>
        <View style={styles.datesRow}>
          <View style={styles.dateCol}>
            <DateField label="Start date" value={startDate} onChange={setStartDate} />
          </View>
          <View style={styles.dateCol}>
            <DateField label="End date" value={endDate} onChange={setEndDate} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          Select ball type<Text style={styles.req}> *</Text>
        </Text>
        <View style={styles.ballsRow}>
          {BALL_TYPES.map((b) => (
            <BallOption
              key={b.key}
              color={b.color}
              label={b.key}
              selected={ballType === b.key}
              onPress={() => setBallType(b.key)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          Match type<Text style={styles.req}> *</Text>
        </Text>
        <View style={styles.chipsRow}>
          {MATCH_TYPES.map((m) => (
            <Chip key={m} label={m} selected={matchType === m} onPress={() => setMatchType(m)} />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.nextBtn}
          activeOpacity={0.85}
          onPress={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  headerNext: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 26,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  logoButton: {
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  logoWrap: {
    width: 72,
    height: 72,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#D6D6D6",
    borderStyle: "dashed",
    backgroundColor: "#F7F7F7",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoIcon: {
    fontSize: 32,
    opacity: 0.55,
  },
  logoImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  logoBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoBadgeIcon: {
    fontSize: 12,
  },
  logoLabel: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 8,
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#8A8A8A",
    marginBottom: 2,
  },
  hidden: {
    opacity: 0,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: UNDERLINE,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1a1a1a",
  },
  fieldValue: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: "#1a1a1a",
  },
  fieldPlaceholder: {
    color: PLACEHOLDER,
  },
  fieldIcon: {
    fontSize: 16,
    color: PLACEHOLDER,
    marginLeft: 8,
  },
  req: {
    color: RED,
  },
  helper: {
    color: "#9AA0AE",
    fontSize: 12,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    marginTop: 8,
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: "row",
    gap: 18,
  },
  dateCol: {
    flex: 1,
  },
  ballsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  ballItem: {
    alignItems: "center",
    marginRight: 28,
  },
  ball: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ballSeam: {
    position: "absolute",
    width: 2,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 1,
    transform: [{ rotate: "28deg" }],
  },
  ballCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  ballCheckText: {
    color: TEAL,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 18,
  },
  ballLabel: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#EFEFEF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  chipSelected: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: RED,
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalAction: {
    fontSize: 15,
    color: "#6B7280",
  },
  modalDone: {
    color: TEAL,
    fontWeight: "700",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  nextBtn: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
