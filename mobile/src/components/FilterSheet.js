import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const TEAL = "#199A8E";

const LOCATIONS = [
  "New Bongaigaon Railway Colony",
  "24 Parganas (n)",
  "24 Parganas (s)",
  "Aantarsuba",
  "Abdasa",
  "Abhayapuri",
  "Abiramam",
  "Abohar",
  "Abrama",
  "Abu Road",
  "Achabal",
  "Achalpur",
  "Achampet",
];

const TYPES = [
  "Opponent",
  "Team to Join",
  "Player",
  "Teams for tournament",
  "Tournaments",
  "Ground",
  "Umpire",
  "Scorer",
  "Commentator",
];

const BALL_TYPES = ["LEATHER", "TENNIS", "OTHER"];

const CATS = [
  { key: "LOCATION", label: "LOCATION" },
  { key: "TYPE", label: "TYPE" },
  { key: "BALL_TYPE", label: "BALL TYPE" },
];

function toggleIn(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function CheckRow({ label, checked, onToggle }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
      <Text style={styles.rowLabel} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function FilterSheet({ visible, initialCat = "LOCATION", onClose, onApply }) {
  const [cat, setCat] = useState(initialCat);
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState(["New Bongaigaon Railway Colony"]);
  const [types, setTypes] = useState([]);
  const [balls, setBalls] = useState([]);

  useEffect(() => {
    if (visible) setCat(initialCat);
  }, [visible, initialCat]);

  const resetAll = () => {
    setLocations([]);
    setTypes([]);
    setBalls([]);
    setQuery("");
  };

  const apply = () => {
    onApply?.({ locations, types, balls });
    onClose?.();
  };

  const visibleLocations = LOCATIONS.filter((l) =>
    l.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <View style={styles.titleSpacer} />
            <Text style={styles.title}>Filter</Text>
            <View style={styles.titleSpacer}>
              <TouchableOpacity onPress={onClose} hitSlop={10} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.topTabs}>
            {CATS.map((c) => {
              const active = c.key === cat;
              const badgeCount =
                c.key === "LOCATION"
                  ? locations.length
                  : c.key === "TYPE"
                    ? types.length
                    : balls.length;
              return (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCat(c.key)}
                  activeOpacity={0.7}
                  style={styles.topTab}
                >
                  <View style={styles.topTabLabelRow}>
                    <Text style={[styles.topTabLabel, active && styles.topTabLabelActive]}>
                      {c.label}
                    </Text>
                    {badgeCount > 0 && (
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{badgeCount}</Text>
                      </View>
                    )}
                  </View>
                  {active && <View style={styles.topTabUnderline} />}
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent}>
            {cat === "LOCATION" && (
              <View style={styles.searchBox}>
                <Text style={styles.searchIcon}>⌕</Text>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Quick search"
                  placeholderTextColor="#999"
                  style={styles.searchInput}
                />
              </View>
            )}
            {cat === "LOCATION" &&
              visibleLocations.map((l) => (
                <CheckRow
                  key={l}
                  label={l}
                  checked={locations.includes(l)}
                  onToggle={() => setLocations((s) => toggleIn(s, l))}
                />
              ))}
            {cat === "TYPE" &&
              TYPES.map((t) => (
                <CheckRow
                  key={t}
                  label={t}
                  checked={types.includes(t)}
                  onToggle={() => setTypes((s) => toggleIn(s, t))}
                />
              ))}
            {cat === "BALL_TYPE" &&
              BALL_TYPES.map((b) => (
                <CheckRow
                  key={b}
                  label={b}
                  checked={balls.includes(b)}
                  onToggle={() => setBalls((s) => toggleIn(s, b))}
                />
              ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetBtn} activeOpacity={0.8} onPress={resetAll}>
              <Text style={styles.resetText}>Reset all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} activeOpacity={0.85} onPress={apply}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: "85%",
    overflow: "hidden",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  titleSpacer: {
    width: 60,
    alignItems: "flex-end",
    paddingRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "700",
  },
  body: {
    minHeight: 320,
  },
  topTabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topTab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 14,
  },
  topTabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  topTabLabel: {
    fontSize: 14,
    color: "#777",
    fontWeight: "500",
  },
  topTabLabelActive: {
    color: "#111",
    fontWeight: "600",
  },
  topTabUnderline: {
    marginTop: 10,
    height: 3,
    width: "70%",
    backgroundColor: TEAL,
    borderRadius: 2,
  },
  catBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  catBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  options: {
    flex: 1,
    backgroundColor: "#fff",
  },
  optionsContent: {
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: "#aaa",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    paddingVertical: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  boxChecked: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tick: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 18,
    alignItems: "center",
  },
  resetText: {
    fontSize: 18,
    color: "#111",
  },
  applyBtn: {
    flex: 1,
    backgroundColor: TEAL,
    paddingVertical: 18,
    alignItems: "center",
  },
  applyText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
  },
});
