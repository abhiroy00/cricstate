import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import { useLooking } from "./LookingContext";

const RED = "#D71920";
const TEAL = "#0FA3A3";
const DEFAULT_WHERE = "New Bongaigaon Railway Colony";

const BALLS = [
  { key: "Tennis", emoji: "🎾" },
  { key: "Leather", emoji: "🔴" },
  { key: "Other", emoji: "🟠" },
];

const GROUNDS = [
  { key: "Open ground", emoji: "🏟️" },
  { key: "Box cricket", emoji: "🏢" },
];

const DAYS = ["1", "2", "3", "4", "5+"];
const BUDGET_DAY = ["500 - 1000", "1100 - 1500", "1600 - 2000", "2000+", "Not Decided"];
const BUDGET_MATCH = ["100 - 500", "600 - 1000", "1100 - 1500", "1500+", "Not Decided"];

function FInput({ label, value, onChange, icon, keyboard, fixed }) {
  return (
    <View style={styles.field}>
      <Text style={styles.inLabel}>{label}</Text>
      <View style={styles.inRow}>
        <TextInput
          style={[styles.inBox, fixed && styles.inFixed]}
          value={value}
          onChangeText={onChange}
          editable={!fixed}
          keyboardType={keyboard}
          placeholderTextColor="#B5B5B5"
        />
        {icon && <Text style={styles.inIcon}>{icon}</Text>}
      </View>
    </View>
  );
}

function FChips({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, value === o && styles.chipOn]}
            activeOpacity={0.8}
            onPress={() => onChange(o)}
          >
            <Text style={[styles.chipText, value === o && styles.chipTextOn]}>
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FBall({ label, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.ballRow}>
        {BALLS.map((b) => (
          <TouchableOpacity
            key={b.key}
            style={styles.ballCol}
            activeOpacity={0.8}
            onPress={() => onChange(b.key)}
          >
            <View
              style={[styles.ballCircle, value === b.key && styles.ballOn]}
            >
              <Text style={styles.ballEmoji}>{b.emoji}</Text>
            </View>
            <Text style={styles.ballLabel}>{b.key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FGround({ label, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.ballRow}>
        {GROUNDS.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={styles.ballCol}
            activeOpacity={0.8}
            onPress={() => onChange(g.key)}
          >
            <View
              style={[styles.ballCircle, value === g.key && styles.ballOn]}
            >
              <Text style={styles.ballEmoji}>{g.emoji}</Text>
            </View>
            <Text style={styles.ballLabel}>{g.key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FRadio({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.radioRow}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={styles.radioOpt}
            activeOpacity={0.8}
            onPress={() => onChange(o)}
          >
            <View style={[styles.radioOut, value === o && styles.radioOutOn]}>
              {value === o && <View style={styles.radioIn} />}
            </View>
            <Text style={styles.radioText}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FContact({ label, options, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.qLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.chip, value === o && styles.chipTeal]}
            activeOpacity={0.8}
            onPress={() => onChange(o)}
          >
            <Text style={[styles.chipText, value === o && styles.chipTextOn]}>
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FDetails({ placeholder, max, value, onChange }) {
  return (
    <View style={styles.field}>
      <View style={styles.detailsBox}>
        <TextInput
          style={styles.detailsInput}
          multiline
          placeholder={placeholder}
          placeholderTextColor="#9A9A9A"
          value={value}
          onChangeText={(t) => onChange(t.slice(0, max))}
        />
      </View>
      <Text style={styles.counter}>
        {value.length}/{max}
      </Text>
    </View>
  );
}

function FNotify({ value, onChange }) {
  return (
    <View style={styles.notifyRow}>
      <View style={styles.notifyMid}>
        <Text style={styles.notifyTitle}>Notify me for relevant post</Text>
        <Text style={styles.notifySub}>
          We will send you a notification when something is posted related to
          what you are looking for.
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D5D5D5", true: "#7FC4BC" }}
        thumbColor={value ? TEAL : "#f4f3f4"}
      />
    </View>
  );
}

function FSplit({ left, right, values, onChange }) {
  return (
    <View style={styles.splitRow}>
      <View style={styles.splitHalf}>
        <FInput
          label={left.label}
          value={values[left.key] || ""}
          onChange={(t) => onChange(left.key, t)}
          keyboard={left.keyboard}
        />
      </View>
      <View style={styles.splitHalf}>
        <FInput
          label={right.label}
          value={values[right.key] || ""}
          onChange={(t) => onChange(right.key, t)}
          keyboard={right.keyboard}
        />
      </View>
    </View>
  );
}

const CONTACT_ALL = ["CricHeroes DM", "Call", "WhatsApp"];
const CONTACT_DM = ["CricHeroes DM"];

// kind: input | chips | balls | grounds | radio | contact | details | notify | split | dateline
const FORMS = {
  "tournament-teams": {
    title: "Teams for my tournament",
    button: "Post",
    postType: "Player",
    need: (v) => v.tournament || "Teams",
    detail: (v) => v.overs || v.format || "Open",
    sections: [
      { kind: "input", key: "tournament", label: "Tournament Name?" },
      { kind: "chips", key: "days", label: "Matches on?", options: ["Weekdays", "Weekend", "All days"] },
      { kind: "input", key: "start", label: "Start Date", icon: "📅" },
      { kind: "input", key: "overs", label: "Number of overs (Optional)", keyboard: "numeric" },
      { kind: "input", key: "where", label: "Where?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "input", key: "ground", label: "Ground? (Optional)" },
      { kind: "split", left: { key: "fees", label: "Entry Fees", keyboard: "numeric" }, right: { key: "teams", label: "Total No. of Teams", keyboard: "numeric" } },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "chips", key: "prize", label: "Winning Prize", options: ["Cash", "Trophies", "Both"] },
      { kind: "chips", key: "timing", label: "Matches Timing", options: ["Day", "NIGHT", "Day & night"] },
      { kind: "chips", key: "format", label: "Tournament Format", options: ["League", "Knockout"] },
      { kind: "contact", key: "contact", label: "How can teams contact you?", options: CONTACT_ALL },
      { kind: "details", key: "details", max: 2000, placeholder: "Share details like the format (box cricket, league matches, knockout) tournament fees and prizes." },
      { kind: "notify", key: "notify" },
    ],
  },
  "tournaments-join": {
    title: "Tournaments to join",
    button: "Post",
    postType: "Player",
    need: (v) => "Tournament",
    detail: (v) => v.role || "Open",
    sections: [
      { kind: "chips", key: "days", label: "Matches on?", options: ["Weekdays", "Weekend", "All days"] },
      { kind: "input", key: "where", label: "Where?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "chips", key: "role", label: "Participate as a:", options: ["Team", "Player"] },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "chips", key: "timing", label: "Matches Timing", options: ["Day", "NIGHT", "Day & night"] },
      { kind: "chips", key: "format", label: "Tournament Format", options: ["League", "Knockout"] },
      { kind: "contact", key: "contact", label: "How can organiser contact you?", options: CONTACT_DM },
      { kind: "details", key: "details", max: 280, placeholder: "Share your preferred dates of weekend, weekdays, or specific days that work for you." },
      { kind: "notify", key: "notify" },
    ],
  },
  opponent: {
    title: "Opponent teams",
    button: "Post",
    postType: "Opponent",
    need: (v) => "Opponent",
    detail: (v) => v.datetime || "Open",
    sections: [
      { kind: "input", key: "datetime", label: "Date and Time of your match", icon: "📅" },
      { kind: "input", key: "where", label: "Where is your match?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "input", key: "ground", label: "Ground? (Optional)" },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "contact", key: "contact", label: "How do teams contact you?", options: CONTACT_DM },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like match overs and ground cost whether it's free, shared, or losers pay." },
      { kind: "notify", key: "notify" },
    ],
  },
  "teams-join": {
    title: "Teams to join",
    button: "Post",
    postType: "Player",
    need: (v) => v.role || "Player",
    detail: (v) => v.region || "Open",
    sections: [
      { kind: "chips", key: "role", label: "What is your playing role?", options: ["Batter", "Bowler", "All-rounder", "Wicket-keeper"] },
      { kind: "input", key: "region", label: "Which region?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "contact", key: "contact", label: "How do teams contact you?", options: CONTACT_DM },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like your role, whether you're playing in a tournament or a friendly match, match fees, and more." },
      { kind: "notify", key: "notify" },
    ],
  },
  players: {
    title: "Players for my team",
    button: "Post",
    postType: "Player",
    need: (v) => v.role || "Player",
    detail: (v) => v.region || "Open",
    sections: [
      { kind: "chips", key: "role", label: "What role are you looking for?", options: ["Batter", "Bowler", "All-rounder", "Wicket-keeper"] },
      { kind: "input", key: "region", label: "Which region?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "radio", key: "term", label: "Date and Time (Optional)", options: ["Long term", "Specific date"] },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "contact", key: "contact", label: "How do players contact you?", options: CONTACT_ALL },
      { kind: "details", key: "details", max: 280, placeholder: "Share details of whether you need a player for a tournament or a friendly match, along with overs, ground details, match fees, and more." },
      { kind: "notify", key: "notify" },
    ],
  },
  grounds: {
    title: "Cricket grounds",
    button: "Post",
    postType: "Player",
    need: (v) => "Cricket ground",
    detail: (v) => v.booking || "Open",
    sections: [
      { kind: "input", key: "booking", label: "Select booking date and time", icon: "📅" },
      { kind: "input", key: "where", label: "Where?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "contact", key: "contact", label: "How can ground owner contact you?", options: CONTACT_DM },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like how many days or matches you need the ground for." },
      { kind: "notify", key: "notify" },
    ],
  },
  umpires: {
    title: "Umpires",
    button: "Post",
    postType: "Umpire",
    need: (v) => "Umpire",
    detail: (v) => v.scope || "Open",
    sections: [
      { kind: "chips", key: "scope", label: "Need an umpire for?", options: ["Whole day", "Match", "Tournament"] },
      { kind: "input", key: "when", label: "When do you need umpire?", icon: "📅" },
      { kind: "input", key: "where", label: "Where?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "input", key: "ground", label: "Ground? (Optional)" },
      { kind: "balls", key: "ball", label: "Any preferences for ball type?" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "chips", key: "days", label: "For how many days?", options: DAYS },
      { kind: "chips", key: "perday", label: "Matches per day?", options: DAYS },
      { kind: "chips", key: "budgetDay", label: "Budget (Per day in INR)?", options: BUDGET_DAY },
      { kind: "chips", key: "budgetMatch", label: "Budget (Per match in INR)?", options: BUDGET_MATCH },
      { kind: "contact", key: "contact", label: "How can umpires contact you?", options: CONTACT_ALL },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like how many days or matches you need the umpire for." },
      { kind: "notify", key: "notify" },
    ],
  },
  scorers: {
    title: "Scorers",
    button: "Post",
    postType: "Scorer",
    need: (v) => "Scorer",
    detail: (v) => v.days ? `${v.days} day(s)` : "Open",
    sections: [
      { kind: "input", key: "ground", label: "Ground? (Optional)" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "chips", key: "days", label: "For how many days?", options: DAYS },
      { kind: "chips", key: "perday", label: "Matches per day?", options: DAYS },
      { kind: "chips", key: "budgetDay", label: "Budget (Per day in INR)?", options: BUDGET_DAY },
      { kind: "chips", key: "budgetMatch", label: "Budget (Per match in INR)?", options: BUDGET_MATCH },
      { kind: "contact", key: "contact", label: "How can scorers contact you?", options: CONTACT_ALL },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like how many days or matches you need the scorer for." },
      { kind: "notify", key: "notify" },
    ],
  },
  commentators: {
    title: "Commentators",
    button: "Post",
    postType: "Player",
    need: (v) => "Commentator",
    detail: (v) => v.scope || "Open",
    sections: [
      { kind: "chips", key: "scope", label: "Need a commentator for?", options: ["Whole day", "Match", "Tournament"] },
      { kind: "input", key: "when", label: "When do you need commentator?", icon: "📅" },
      { kind: "input", key: "where", label: "Where?", fixed: true },
      { kind: "input", key: "area", label: "Area in this city?" },
      { kind: "input", key: "ground", label: "Ground? (Optional)" },
      { kind: "grounds", key: "groundType", label: "Ground Type?" },
      { kind: "chips", key: "days", label: "For how many days?", options: DAYS },
      { kind: "chips", key: "perday", label: "Matches per day?", options: DAYS },
      { kind: "chips", key: "budgetDay", label: "Budget (Per day in INR)?", options: BUDGET_DAY },
      { kind: "chips", key: "budgetMatch", label: "Budget (Per match in INR)?", options: BUDGET_MATCH },
      { kind: "contact", key: "contact", label: "How can commentators contact you?", options: CONTACT_ALL },
      { kind: "details", key: "details", max: 280, placeholder: "Share details like how many days or matches you need the commentator for." },
      { kind: "notify", key: "notify" },
    ],
  },
  live: {
    title: "Register live streamer",
    button: "Next",
    register: true,
    sections: [],
  },
};

function RegisterStreamer({ user, onDone }) {
  const [v, setV] = useState({
    company: "",
    address: "",
    city: "",
    person: user?.full_name || "",
    phone: "",
    feeMatch: "",
    feeDay: "",
    youtube: "",
    facebook: "",
    details: "",
  });
  const set = (k, t) => setV((p) => ({ ...p, [k]: t }));

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
        <TouchableOpacity style={styles.bannerPick} activeOpacity={0.8}>
          <Text style={styles.bannerIcon}>🖼</Text>
          <View style={styles.camBadge}>
            <Text style={styles.camText}>📷</Text>
          </View>
          <Text style={styles.pickLabel}>Add banner</Text>
        </TouchableOpacity>

        <View style={styles.logoRow}>
          <TouchableOpacity style={styles.logoPick} activeOpacity={0.8}>
            <Text style={styles.logoIcon}>🏏</Text>
            <View style={[styles.camBadge, styles.logoCam]}>
              <Text style={styles.camText}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.pickLabel}>Add logo</Text>

        <View style={styles.formPad}>
          <FInput label="Company name*" value={v.company} onChange={(t) => set("company", t)} />
          <FInput label="Address*" value={v.address} onChange={(t) => set("address", t)} />
          <FInput label="City*" value={v.city} onChange={(t) => set("city", t)} />
          <FInput label="Contact person name*" value={v.person} onChange={(t) => set("person", t)} />
          <FInput label="Contact number*" value={v.phone} onChange={(t) => set("phone", t)} keyboard="phone-pad" />
          <View style={styles.feesRow}>
            <View style={styles.feesHalf}>
              <FInput label="Fees*" value={v.feeMatch} onChange={(t) => set("feeMatch", t)} keyboard="numeric" />
            </View>
            <Text style={styles.feesMid}>Per match (20 ov.)</Text>
            <View style={styles.feesHalf}>
              <FInput label="Fees*" value={v.feeDay} onChange={(t) => set("feeDay", t)} keyboard="numeric" />
            </View>
            <Text style={styles.feesMid}>per day</Text>
          </View>
          <FInput label="Youtube channel link*" value={v.youtube} onChange={(t) => set("youtube", t)} />
          <FInput label="Facebook page link" value={v.facebook} onChange={(t) => set("facebook", t)} />
          <FDetails
            max={2000}
            value={v.details}
            onChange={(t) => set("details", t)}
            placeholder="Add more details about your live stream, like facilities, timings, etc."
          />
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.bottomBtn}
        activeOpacity={0.85}
        onPress={() => onDone(v)}
      >
        <Text style={styles.bottomText}>Next</Text>
      </TouchableOpacity>
    </>
  );
}

export default function LookingFormScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addPost } = useLooking();
  const formKey = route?.params?.formKey || "players";
  const form = FORMS[formKey] || FORMS.players;
  const returnTo = route?.params?.returnTo;

  const [values, setValues] = useState(() => ({
    where: DEFAULT_WHERE,
    region: DEFAULT_WHERE,
    contact: "CricHeroes DM",
    details: "",
    notify: true,
  }));
  const set = (k, val) => setValues((p) => ({ ...p, [k]: val }));

  const submit = (registerVals) => {
    const firstName =
      user?.full_name?.split(" ")?.[0] || user?.full_name || "You";
    const name = user?.full_name || "Your team";
    let need;
    let detail;
    let type = form.postType || "Player";
    let detailsText = values.details?.trim() || "";
    if (form.register && registerVals) {
      need = "Live streamer";
      detail = registerVals.company || registerVals.city || "Open";
      detailsText = registerVals.details?.trim() || "";
    } else {
      need = form.need(values);
      detail = form.detail(values);
    }
    let line = `${name} is looking for a ${need} (${detail}) to join.`;
    if (detailsText) line += ` ${detailsText}`;
    addPost({
      author: firstName,
      team: "My Team",
      mine: true,
      pro: false,
      avatarEmoji: "🧑🏽",
      avatarBg: "#3A3A3A",
      need,
      needDetail: detail,
      line,
      bullets: [`${need} (${detail})`],
      time: "Just now",
      km: "-- KM",
      type,
    });
    navigation.navigate(returnTo || "LookingMain");
  };

  const renderSection = (s, i) => {
    switch (s.kind) {
      case "input":
        return (
          <FInput
            key={i}
            label={s.label}
            icon={s.icon}
            keyboard={s.keyboard}
            fixed={s.fixed}
            value={s.fixed ? DEFAULT_WHERE : values[s.key] || ""}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "chips":
        return (
          <FChips
            key={i}
            label={s.label}
            options={s.options}
            value={values[s.key]}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "balls":
        return (
          <FBall
            key={i}
            label={s.label}
            value={values[s.key]}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "grounds":
        return (
          <FGround
            key={i}
            label={s.label}
            value={values[s.key]}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "radio":
        return (
          <FRadio
            key={i}
            label={s.label}
            options={s.options}
            value={values[s.key]}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "contact":
        return (
          <FContact
            key={i}
            label={s.label}
            options={s.options}
            value={values[s.key] || "CricHeroes DM"}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "details":
        return (
          <FDetails
            key={i}
            placeholder={s.placeholder}
            max={s.max}
            value={values[s.key] || ""}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "notify":
        return (
          <FNotify
            key={i}
            value={values[s.key] !== false}
            onChange={(t) => set(s.key, t)}
          />
        );
      case "split":
        return (
          <FSplit
            key={i}
            left={s.left}
            right={s.right}
            values={values}
            onChange={set}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={12}
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {form.title}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {form.register ? (
        <RegisterStreamer user={user} onDone={submit} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.body}
            contentContainerStyle={styles.formPad}
            keyboardShouldPersistTaps="handled"
          >
            {form.sections.map(renderSection)}
            <View style={{ height: 12 }} />
          </ScrollView>
          <TouchableOpacity
            style={styles.bottomBtn}
            activeOpacity={0.85}
            onPress={() => submit()}
          >
            <Text style={styles.bottomText}>{form.button}</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  body: {
    flex: 1,
  },
  formPad: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  field: {
    marginTop: 14,
  },
  inLabel: {
    fontSize: 15,
    color: "#9A9A9A",
  },
  inRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D5D5D5",
    paddingBottom: 6,
    marginTop: 2,
  },
  inBox: {
    flex: 1,
    fontSize: 17,
    color: "#111",
    paddingVertical: 4,
  },
  inFixed: {
    fontWeight: "400",
  },
  inIcon: {
    fontSize: 22,
    color: "#888",
    marginLeft: 8,
  },
  qLabel: {
    fontSize: 16,
    color: "#111",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  chip: {
    backgroundColor: "#EFEFEF",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: {
    backgroundColor: TEAL,
  },
  chipTeal: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 15,
    color: "#111",
  },
  chipTextOn: {
    color: "#fff",
  },
  ballRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  ballCol: {
    alignItems: "center",
    marginRight: 36,
  },
  ballCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F2F2F2",
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  ballOn: {
    borderColor: TEAL,
    backgroundColor: "#E6F5F3",
  },
  ballEmoji: {
    fontSize: 34,
  },
  ballLabel: {
    fontSize: 15,
    color: "#111",
    marginTop: 6,
  },
  radioRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  radioOpt: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 28,
  },
  radioOut: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioOutOn: {
    borderColor: TEAL,
  },
  radioIn: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TEAL,
  },
  radioText: {
    fontSize: 15,
    color: "#111",
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 8,
    minHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailsInput: {
    fontSize: 16,
    color: "#111",
    minHeight: 90,
    textAlignVertical: "top",
  },
  counter: {
    fontSize: 13,
    color: "#B5B5B5",
    textAlign: "right",
    marginTop: 4,
  },
  notifyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  notifyMid: {
    flex: 1,
    marginRight: 10,
  },
  notifyTitle: {
    fontSize: 16,
    color: "#111",
  },
  notifySub: {
    fontSize: 13,
    color: "#B5B5B5",
    marginTop: 4,
    lineHeight: 18,
  },
  splitRow: {
    flexDirection: "row",
  },
  splitHalf: {
    flex: 1,
    marginRight: 12,
  },
  bottomBtn: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
  },
  bottomText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  bannerPick: {
    alignItems: "center",
    paddingVertical: 30,
  },
  bannerIcon: {
    fontSize: 72,
    color: "#CCC",
  },
  camBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    marginLeft: 60,
  },
  camText: {
    fontSize: 18,
  },
  pickLabel: {
    fontSize: 16,
    color: "#111",
    marginTop: 6,
  },
  logoRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 20,
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  logoPick: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderColor: "#DDD",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  logoIcon: {
    fontSize: 44,
  },
  logoCam: {
    position: "absolute",
    right: -4,
    bottom: -4,
    marginTop: 0,
    marginLeft: 0,
  },
  feesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  feesHalf: {
    width: 90,
  },
  feesMid: {
    fontSize: 15,
    color: "#9A9A9A",
    marginLeft: 8,
    marginRight: 16,
    paddingBottom: 10,
  },
});
