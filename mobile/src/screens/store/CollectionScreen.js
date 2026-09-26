import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLLECTIONS, productsIn, RED, TEAL } from "../../data/storeData";
import { listProducts } from "../../services/storeService";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "./StoreCartContext";
import { BackGlyph, BagGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import DreamHeader from "../../components/DreamHeader";

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

  // Real products from backend merged with bundled mocks.
  const [apiProducts, setApiProducts] = useState([]);
  useEffect(() => {
    let alive = true;
    listProducts({ limit: 50 })
      .then((page) => {
        if (!alive || !page?.items) return;
        setApiProducts(
          page.items.map((p) => ({
            id: `api-${p.id}`,
            backendId: p.id,
            name: p.name,
            brand: "CricState",
            price: p.price,
            mrp: p.mrp ?? p.price,
            rating: 4.5,
            reviews: 0,
            emoji: "👕",
            bg: "#E8EEF7",
            badge: null,
            shipsTomorrow: false,
            sizes: ["S", "M", "L", "XL", "XXL"],
            collections: ["bestsellers", "new"],
          }))
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    const local = productsIn(key);
    const merged = key === "bestsellers" || key === "new" ? [...apiProducts, ...local] : local;
    return sortProducts(merged, sort);
  }, [key, sort, apiProducts]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <View style={styles.headerLeft}>
          <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
            <BackGlyph />
          </HeaderIconBtn>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <HeaderIconBtn onPress={() => navigation?.navigate?.("Cart")} label="Cart" badge={count}>
            <BagGlyph />
          </HeaderIconBtn>
        </View>
      </DreamHeader>

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
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 13,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    color: RED,
    fontWeight: "700",
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
    backgroundColor: "#fff",
  },
  sortActive: {
    backgroundColor: RED,
    borderColor: RED,
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
