import { StyleSheet, Text, View } from "react-native";

import { colors } from "../utils/theme";
import Button from "./Button";

export default function EmptyState({ title, subtitle, ctaLabel, onPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {ctaLabel && onPress && (
        <View style={styles.ctaWrap}>
          <Button onPress={onPress}>{ctaLabel}</Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
  ctaWrap: {
    marginTop: 20,
    minWidth: 180,
  },
});
