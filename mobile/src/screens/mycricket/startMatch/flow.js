import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DreamHeader from "../../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../../components/HeaderIcon";

export const RED = "#E01A22";
export const TEAL = "#00A651";
export const INK = "#1a1a1a";
export const MUTED = "#8A8A8A";
export const BORDER = "#E2E5E4";
export const FIELD_BG = "#F2F3F5";

export function FlowScreen({ children, edges = ["top"] }) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      {children}
    </SafeAreaView>
  );
}

export function FlowHeader({ title, onBack, right, alignLeft = false }) {
  return (
    <DreamHeader style={styles.header}>
      <HeaderIconBtn onPress={onBack} label="Back">
        <BackGlyph />
      </HeaderIconBtn>
      <Text
        style={[styles.headerTitle, alignLeft && styles.headerTitleLeft]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {right || <View style={styles.headerSpacer} />}
    </DreamHeader>
  );
}

export function PrimaryBar({ label, onPress, loading, disabled, style }) {
  const off = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.bar, off && styles.barOff, style]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={off}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.barText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function HelpButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.help} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.helpText}>?</Text>
    </TouchableOpacity>
  );
}

export function initials(name) {
  const trimmed = (name || "?").trim();
  return trimmed.charAt(0).toUpperCase() || "?";
}

export const avatarPalette = [
  "#E91E8C",
  "#F4511E",
  "#2E7D32",
  "#1565C0",
  "#6A1B9A",
  "#00838F",
  "#C62828",
];

export function avatarColor(seed) {
  const key = String(seed || "");
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum += key.charCodeAt(i);
  return avatarPalette[sum % avatarPalette.length];
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  headerTitleLeft: {
    textAlign: "left",
    marginLeft: 6,
  },
  headerSpacer: {
    width: 40,
  },
  bar: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  barOff: {
    backgroundColor: "#B9D9C7",
  },
  barText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  help: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
