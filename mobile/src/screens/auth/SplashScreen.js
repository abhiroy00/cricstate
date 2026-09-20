import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "../../utils/theme";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>🏏 CricState</Text>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  spinner: {
    marginTop: 16,
  },
});
