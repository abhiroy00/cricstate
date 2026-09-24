import { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#E02020";
const TEAL = "#0FA3A3";

const SUB_TABS = ["All", "T-Shirts", "Sleeveless Tank", "Shorts", "Uppers", "Track Pants"];

// Sub-tab -> existing collection screen (same UI pattern, title passed via params)
const SUB_TAB_LINKS = {
  All: { screen: "TimelessClassics", title: "Timeless Classics" },
  "T-Shirts": { screen: "Bestsellers", title: "Bestsellers" },
  "Sleeveless Tank": { screen: "TimelessClassics", title: "Apparel - Sleeveless Tank" },
  Uppers: { screen: "TimelessClassics", title: "Apparel - Uppers" },
  "Track Pants": { screen: "TimelessClassics", title: "Apparel - Track Pants" },
};

const PRODUCTS = [
  {
    id: "1",
    brand: "CricHeroes",
    name: "Black AeroVent shorts",
    price: "₹699",
    mrp: "₹1,199",
    off: "42% off",
    shipsTomorrow: true,
    emoji: "🩳",
  },
  {
    id: "2",
    brand: "CricHeroes",
    name: "Black DualFit shorts",
    price: "₹999",
    mrp: "₹1,499",
    off: "33% off",
    shipsTomorrow: false,
    emoji: "🩳",
  },
  {
    id: "3",
    brand: "CricHeroes",
    name: "Seablue AeroVent shorts",
    price: "₹699",
    mrp: "₹1,199",
    off: "42% off",
    shipsTomorrow: false,
    emoji: "🩳",
  },
  {
    id: "4",
    brand: "CricHeroes",
    name: "Navy Blue DualFit shorts",
    price: "₹999",
    mrp: "₹1,499",
    off: "33% off",
    shipsTomorrow: false,
    emoji: "🩳",
  },
];

function ProductCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        <Text style={styles.imageEmoji}>{item.emoji}</Text>
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
        {item.shipsTomorrow && (
          <View style={styles.shipsRow}>
            <Text style={styles.shipsIcon}>🚚</Text>
            <Text style={styles.shipsText}>Ships tomorrow</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ApparelShortsScreen({ navigation, route }) {
  const title = route?.params?.title || "Apparel - Shorts";
  const [activeTab, setActiveTab] = useState(route?.params?.activeTab || "Shorts");

  const handleTabPress = (t) => {
    if (t === "Shorts") {
      setActiveTab(t);
      return;
    }
    const link = SUB_TAB_LINKS[t];
    if (link) {
      navigation?.navigate?.(link.screen, { title: link.title });
    } else {
      setActiveTab(t);
    }
  };

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsRow}
      >
        {SUB_TABS.map((t) => {
          const active = t === activeTab;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.8}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => handleTabPress(t)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={PRODUCTS}
        keyExtractor={(i) => i.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
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
  tabsScroll: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: "#fff",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tab: {
    borderWidth: 1,
    borderColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tabText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
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
    backgroundColor: "#E8E8E8",
    aspectRatio: 0.78,
    alignItems: "center",
    justifyContent: "center",
  },
  imageEmoji: {
    fontSize: 90,
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
  shipsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  shipsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  shipsText: {
    fontSize: 13,
    color: "#8A8A9A",
    fontWeight: "500",
  },
});
