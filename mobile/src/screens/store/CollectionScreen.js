import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLLECTIONS, productsIn, RED, TEAL } from "../../data/storeData";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "./StoreCartContext";

const SORTS = ["Popular", "Price ↑", "Price ↓", "Discount"];

function sortProducts(list, sort) {
  const arr = [...list];
  if (sort === "Price ↑") arr.sort((a, b) => a.price - b.price);
  else if (sort === "Price ↓") arr.sort((a, b) => b.price - a.price);
  else if (sort === "Discount")
    arr.sort((a, b) => b.mrp - b.price - (a.mrp - a.price));
  else arr.sort((a, b) => b.reviews - a.reviews);
  return arr;
}

export default function CollectionScreen({ navigation, route, collectionKey }) {
  const { count } = useCart();
  const [sort, setSort] = useState("Popular");
  const [selected, setSelected] = useState(null);

  const key = collectionKey || COLLECTIONS[route?.name]?.key || "bestsellers";
  const title = route?.params?.title || route?.name || "Collection";
  const desc =
    COLLECTIONS[route?.name]?.desc ||
    "Handpicked gear from the CricHeroes Store.";

  const items = useMemo(
    () => sortProducts(productsIn(key), sort),
    [key, sort]
  );

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
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigation?.navigate?.("Cart")}
          >
            <Text style={styles.headerIcon}>🛍</Text>
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <Text style={styles.desc}>{desc}</Text>
            <Text style={styles.countLine}>
              {items.length} products
            </Text>
            <View style={styles.sortRow}>
              {SORTS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.sort, sort === s && styles.sortActive]}
                  onPress={() => setSort(s)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sortText,
                      sort === s && styles.sortTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard item={item} onPress={setSelected} />
        )}
      />

      <ProductDetailModal
        product={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onBuyNow={() => {
          setSelected(null);
          navigation?.navigate?.("Cart");
        }}
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
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: RED,
    fontSize: 11,
    fontWeight: "800",
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
    paddingTop: 14,
  },
  countLine: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  sortRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  sort: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
  },
  sortActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  sortText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  sortTextActive: {
    color: "#fff",
  },
  unused: {
    color: TEAL,
  },
});
