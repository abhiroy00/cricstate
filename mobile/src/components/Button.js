import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors } from "../utils/theme";

export default function Button({
  children,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) {
  const isSecondary = variant === "secondary";

  return (
    <TouchableOpacity
      style={[styles.base, isSecondary ? styles.secondary : styles.primary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : "#fff"} />
      ) : (
        <Text style={isSecondary ? styles.secondaryText : styles.primaryText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
});
