import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "../utils/theme";

export default function TabSwitcher({ tabs, activeKey, onChange, size = "large" }) {
  const isLarge = size === "large";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={isLarge ? styles.wrapLarge : styles.wrapSmall}
      contentContainerStyle={styles.content}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              isLarge ? styles.tabLarge : styles.tabSmall,
              !isLarge && (active ? styles.pillActive : styles.pillInactive),
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                isLarge ? styles.labelLarge : styles.labelSmall,
                active && (isLarge ? styles.activeLabelLarge : styles.activeLabelSmall),
              ]}
            >
              {tab.label}
            </Text>
            {isLarge && active && <View style={styles.underlineLarge} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapLarge: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wrapSmall: {
    marginBottom: 12,
  },
  content: {
    paddingHorizontal: 12,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLarge: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tabSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillInactive: {
    backgroundColor: colors.background,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.muted,
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  activeLabelLarge: {
    color: colors.primary,
  },
  activeLabelSmall: {
    color: "#fff",
  },
  underlineLarge: {
    marginTop: 8,
    height: 3,
    width: "100%",
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
