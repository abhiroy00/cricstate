import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

const CITIES = [
  "New Delhi",
  "[kalaiya]]",
  "Abohar",
  "Adelaide",
  "Adilabad",
  "Adoor",
  "Agar",
  "Agra",
  "Ahmedabad",
  "Ahore (Jalore)",
  "Aizawl",
  "Ajman",
  "Lucknow",
  "Mumbai",
];

const INDEX_LETTERS = [
  "N", "[", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K",
  "L", "M", "O", "P", "Q", "R", "S", "T", "U", "V",
];

const ROW_H = 62;

export default function LiveFilterScreen({ navigation, route }) {
  const [picked, setPicked] = useState(route?.params?.initial || ["New Delhi"]);
  const [query, setQuery] = useState("");
  const listRef = useRef(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  const toggle = (c) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const jumpTo = (letter) => {
    const idx = shown.findIndex((c) =>
      c.toUpperCase().startsWith(letter.toUpperCase())
    );
    if (idx >= 0) {
      try {
        listRef.current?.scrollToIndex({ index: idx, viewPosition: 0 });
      } catch (e) {}
    }
  };

  const apply = () => {
    navigation.navigate("LiveStreamers", { locations: picked });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>Filter live streamer</Text>
        <View style={{ width: 36 }} />
      </DreamHeader>

      <View style={styles.tabRow}>
        <View style={styles.tabOn}>
          <Text style={styles.tabText}>Location</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.main}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Quick search"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <FlatList
            ref={listRef}
            data={shown}
            keyExtractor={(c) => c}
            showsVerticalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: ROW_H,
              offset: ROW_H * index,
              index,
            })}
            renderItem={({ item }) => {
              const on = picked.includes(item);
              return (
                <TouchableOpacity
                  style={styles.row}
                  activeOpacity={0.7}
                  onPress={() => toggle(item)}
                >
                  <View style={[styles.box, on && styles.boxOn]}>
                    {on && <Text style={styles.tick}>✓</Text>}
                  </View>
                  <Text style={styles.rowLabel}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <View style={styles.index}>
          {INDEX_LETTERS.map((l) => (
            <TouchableOpacity key={l} hitSlop={4} onPress={() => jumpTo(l)}>
              <Text style={styles.indexLetter}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.resetBtn}
          activeOpacity={0.8}
          onPress={() => setPicked([])}
        >
          <Text style={styles.resetText}>Reset all</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.85}
          onPress={apply}
        >
          <Text style={styles.applyText}>Apply</Text>
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
    paddingBottom: 15,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
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
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  tabRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tabOn: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: RED,
    marginBottom: -1,
  },
  tabText: {
    fontSize: 18,
    color: "#111",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  main: {
    flex: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 22,
    color: "#999",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#111",
    paddingVertical: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: ROW_H,
    paddingHorizontal: 16,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  boxOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tick: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  rowLabel: {
    fontSize: 17,
    color: "#111",
  },
  index: {
    width: 34,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 17,
    marginVertical: 12,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 8,
  },
  indexLetter: {
    fontSize: 13,
    color: "#888",
  },
  footer: {
    flexDirection: "row",
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#9E9E9E",
    paddingVertical: 18,
    alignItems: "center",
  },
  resetText: {
    fontSize: 19,
    color: "#fff",
  },
  applyBtn: {
    flex: 1,
    backgroundColor: TEAL,
    paddingVertical: 18,
    alignItems: "center",
  },
  applyText: {
    fontSize: 19,
    color: "#fff",
  },
});
