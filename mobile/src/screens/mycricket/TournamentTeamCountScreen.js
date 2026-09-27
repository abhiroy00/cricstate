import { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

export default function TournamentTeamCountScreen({ navigation, route }) {
  const { tournamentId, tournamentName } = route.params || {};
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState("");
  const [error, setError] = useState("");

  function handleDone() {
    const value = Number(count);
    if (!count.trim() || Number.isNaN(value)) {
      setError("Please enter the number of teams");
      return;
    }
    if (value < 2) {
      setError("A tournament needs at least 2 teams");
      return;
    }
    navigation.replace("TournamentTeams", {
      tournamentId,
      tournamentName,
      teamCount: value,
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>Number of teams</Text>
        <View style={styles.headerSpacer} />
      </DreamHeader>

      <View style={styles.body}>
        <Text style={styles.question}>How many teams will take part?</Text>
        <Text style={styles.sub}>Don&apos;t worry, you can add or remove teams later.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={count}
            onChangeText={(text) => {
              setCount(text.replace(/[^0-9]/g, ""));
              setError("");
            }}
            keyboardType="number-pad"
            placeholder="e.g. 10"
            placeholderTextColor="#C4C4C4"
            maxLength={3}
            autoFocus
          />
          <Text style={styles.inputSuffix}>teams</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, { paddingBottom: Math.max(insets.bottom, 16) }]}
          activeOpacity={0.85}
          onPress={handleDone}
        >
          <Text style={styles.doneText}>Done</Text>
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
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 56,
  },
  question: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 40,
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 6,
  },
  input: {
    minWidth: 90,
    fontSize: 46,
    fontWeight: "800",
    color: RED,
    textAlign: "center",
    padding: 0,
  },
  inputSuffix: {
    fontSize: 18,
    color: "#8A8A8A",
    marginLeft: 8,
    marginBottom: 8,
  },
  error: {
    color: RED,
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 0,
  },
  doneBtn: {
    backgroundColor: TEAL,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
