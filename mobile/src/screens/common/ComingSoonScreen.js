import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../utils/theme";

export default function ComingSoonScreen({ route }) {
  const title = route?.params?.title || route?.name || "This section";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This module is built in a later phase.</Text>
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
  },
  subtitle: {
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
  },
});
