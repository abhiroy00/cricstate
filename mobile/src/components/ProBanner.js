import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TEAL = "#00A651";
const RED = "#E01A22";
const NAVY = "#171A4B";
const GOLD = "#FFC42E";

const PREVIEW_SUFFIX = "Explore everything PRO";
const FULL_EXTRA =
  " — AI insights of every innings, ad-free scoring, exclusive PRO club events, store discounts and your personal performance dashboard.";

export default function ProBanner({ until = "20-Oct-2026", onViewBenefits, onReadMore }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    setExpanded((e) => !e);
    onReadMore?.();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        You are experiencing <Text style={styles.proPill}>  PRO  </Text>
      </Text>
      <Text style={styles.body} numberOfLines={expanded ? undefined : 2}>
        Enjoy complimentary access until {until} and see how every match adds to your journey.{" "}
        {PREVIEW_SUFFIX}
        {expanded ? FULL_EXTRA : "..."}
      </Text>
      <TouchableOpacity activeOpacity={0.7} onPress={toggle} style={styles.readMoreWrap}>
        <Text style={styles.readMore}>{expanded ? "Read less" : "Read more"}</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={onViewBenefits}>
        <Text style={styles.benefits}>View PRO benefits</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NAVY,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: GOLD,
    borderBottomWidth: 4,
    borderBottomColor: RED,
    shadowColor: RED,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  proPill: {
    backgroundColor: GOLD,
    color: NAVY,
    fontSize: 13,
    fontWeight: "800",
    borderRadius: 10,
  },
  body: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 19,
    marginTop: 8,
  },
  readMoreWrap: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  readMore: {
    fontSize: 14,
    color: GOLD,
  },
  benefits: {
    fontSize: 16,
    color: GOLD,
    fontWeight: "700",
    marginTop: 6,
  },
});
