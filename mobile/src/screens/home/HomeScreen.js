import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../utils/theme";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.full_name}! 🏏</Text>
      <Text style={styles.subtitle}>
        Live matches, scores, tournaments and your feed will land here in the upcoming
        phases. Phase 1 wires up the account you just created.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    color: colors.muted,
    marginTop: 10,
    textAlign: "center",
  },
});
