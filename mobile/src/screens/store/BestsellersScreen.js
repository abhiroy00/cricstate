import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#E02020";
const TEAL = "#0FA3A3";

const PRODUCTS = [
  {
    id: "1",
    badge: "Bestseller",
    brand: "CricHeroes",
    name: "Blue Burst Blaze Half Sleeve Jersey",
    price: "₹699",
    mrp: "₹1,149",
    off: "39% off",
    emoji: "👕",
  },
  {
    id: "2",
    badge: "Bestseller",
    brand: "CricHeroes",
    name: "Black Burst Blaze half sleeve jersey",
    price: "₹699",
    mrp: "₹1,149",
    off: "39% off",
    emoji: "👕",
  },
  {
    id: "3",
    badge: "Bestseller",
    brand: "CricHeroes",
    name: "Green Blaze V2 Full Sleeve Jersey",
    price: "₹699",
    mrp: "₹1,149",
    off: "39% off",
    emoji: "👕",
  },
  {
    id: "4",
    badge: "Bestseller",
    brand: "CricHeroes",
    name: "Jade trooper V2 half sleeve t-shirt",
    price: "₹699",
    mrp: "₹1,149",
    off: "39% off",
    emoji: "👕",
  },
];

function ProductCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Text style={styles.imageEmoji}>{item.emoji}</Text>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.personalisePill}>
          <Text style={styles.personaliseText}>Personalise</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.mrp}>{item.mrp}</Text>
          <View style={styles.offDivider} />
          <Text style={styles.off}>{item.off}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BestsellersScreen({ navigation, route }) {
  const title = route?.params?.title || "Bestsellers";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn}>
            <Text style={styles.headerIcon}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn}>
            <Text style={styles.headerIcon}>🛍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(i) => i.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <Text style={styles.desc}>
            Explore the gear, apparel and accessories that cricketers keep coming back
            to. The most-loved products from the CricHeroes Store.
          </Text>
        }
        renderItem={({ item }) => <ProductCard item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
    flex: 1,
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    paddingVertical: 14,
  },
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
  imageWrap: {
    backgroundColor: "#EDEDED",
    aspectRatio: 0.72,
    alignItems: "center",
    justifyContent: "center",
  },
  imageEmoji: {
    fontSize: 90,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: TEAL,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomRightRadius: 14,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  mrp: {
    fontSize: 14,
    color: "#B5B5B5",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  offDivider: {
    width: 1,
    height: 16,
    backgroundColor: TEAL,
    marginHorizontal: 6,
  },
  off: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
  },
});
