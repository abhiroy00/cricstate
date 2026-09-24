import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { formatINR, offPct, RED, TEAL } from "../../data/storeData";
import { useCart } from "./StoreCartContext";

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <Text style={styles.stars}>
      {"★".repeat(full)}
      <Text style={styles.starsDim}>{"★".repeat(5 - full)}</Text>
      <Text style={styles.ratingText}> {rating.toFixed(1)}</Text>
    </Text>
  );
}

export default function ProductCard({ item, onPress, compact }) {
  const { toggleWish, isWished } = useCart();
  const wished = isWished(item.id);

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      activeOpacity={0.85}
      onPress={() => onPress?.(item)}
    >
      <View style={[styles.imageWrap, { backgroundColor: item.bg }]}>
        <Text style={styles.imageEmoji}>{item.emoji}</Text>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <TouchableOpacity
          hitSlop={10}
          style={styles.heart}
          onPress={() => toggleWish(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.heartIcon, wished && styles.heartIconOn]}>
            {wished ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
        <View style={styles.personalisePill}>
          <Text style={styles.personaliseText}>Personalise</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Stars rating={item.rating} />
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatINR(item.price)}</Text>
          <Text style={styles.mrp}>{formatINR(item.mrp)}</Text>
        </View>
        <Text style={styles.off}>{offPct(item)}</Text>
        {item.shipsTomorrow && (
          <Text style={styles.ship}>⚡ Ships tomorrow</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: "48.5%",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 14,
  },
  cardCompact: {
    maxWidth: "100%",
  },
  imageWrap: {
    aspectRatio: 0.78,
    alignItems: "center",
    justifyContent: "center",
  },
  imageEmoji: {
    fontSize: 84,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: RED,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 14,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  heart: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 18,
    color: "#999",
  },
  heartIconOn: {
    color: RED,
  },
  personalisePill: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  personaliseText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  info: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  brand: {
    fontSize: 13,
    color: "#9A9A9A",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginTop: 2,
    minHeight: 42,
  },
  stars: {
    fontSize: 12,
    color: "#F5A623",
    marginTop: 4,
  },
  starsDim: {
    color: "#E0E0E0",
  },
  ratingText: {
    color: "#777",
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  mrp: {
    fontSize: 13,
    color: "#B5B5B5",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  off: {
    fontSize: 13,
    color: TEAL,
    fontWeight: "700",
    marginTop: 2,
  },
  ship: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
});
