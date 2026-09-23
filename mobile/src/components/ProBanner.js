import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const TEAL = "#199A8E";

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
    backgroundColor: "#F1F1F1",
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  proPill: {
    backgroundColor: TEAL,
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    borderRadius: 10,
  },
  body: {
    fontSize: 13,
    color: "#333",
    lineHeight: 19,
    marginTop: 8,
  },
  readMoreWrap: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  readMore: {
    fontSize: 14,
    color: "#999",
  },
  benefits: {
    fontSize: 16,
    color: TEAL,
    fontWeight: "500",
    marginTop: 6,
  },
});
