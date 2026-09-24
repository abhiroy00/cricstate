import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { formatINR, RED, TEAL } from "../../data/storeData";
import { useCart } from "./StoreCartContext";

const FREE_SHIP_ABOVE = 999;
const SHIP_FEE = 49;

export default function CartScreen({ navigation }) {
  const { lines, setQty, remove, subtotal, savings, clear } = useCart();
  const [placed, setPlaced] = useState(false);

  const shipping = subtotal === 0 || subtotal >= FREE_SHIP_ABOVE ? 0 : SHIP_FEE;
  const total = subtotal + shipping;

  if (placed) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order confirmed</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.success}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Order placed!</Text>
          <Text style={styles.successSub}>
            Thanks for shopping with CricHeroes Store. Your gear will ship
            soon.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            activeOpacity={0.85}
            onPress={() => {
              setPlaced(false);
              navigation?.navigate?.("StoreHome");
            }}
          >
            <Text style={styles.shopBtnText}>Continue shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={12}
          style={styles.iconBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          My Cart{lines.length > 0 ? ` (${lines.length})` : ""}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {lines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>
            Add some gear and it will show up here.
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("StoreHome")}
          >
            <Text style={styles.shopBtnText}>Browse store</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(l) => l.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item: l }) => (
              <View style={styles.line}>
                <View style={[styles.thumb, { backgroundColor: l.product.bg }]}>
                  <Text style={styles.thumbEmoji}>{l.product.emoji}</Text>
                </View>
                <View style={styles.lineMid}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {l.product.name}
                  </Text>
                  <Text style={styles.lineSize}>Size: {l.size}</Text>
                  <View style={styles.linePriceRow}>
                    <Text style={styles.linePrice}>
                      {formatINR(l.product.price)}
                    </Text>
                    <Text style={styles.lineMrp}>
                      {formatINR(l.product.mrp)}
                    </Text>
                  </View>
                  <View style={styles.lineFoot}>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        hitSlop={8}
                        style={styles.stepBtn}
                        onPress={() => setQty(l.key, l.qty - 1)}
                      >
                        <Text style={styles.stepText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qty}>{l.qty}</Text>
                      <TouchableOpacity
                        hitSlop={8}
                        style={styles.stepBtn}
                        onPress={() => setQty(l.key, Math.min(9, l.qty + 1))}
                      >
                        <Text style={styles.stepText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity hitSlop={8} onPress={() => remove(l.key)}>
                      <Text style={styles.remove}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.summary}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumVal}>{formatINR(subtotal)}</Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>You save</Text>
              <Text style={[styles.sumVal, styles.saveVal]}>
                − {formatINR(savings)}
              </Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Delivery</Text>
              <Text style={styles.sumVal}>
                {shipping === 0 ? "FREE" : formatINR(shipping)}
              </Text>
            </View>
            <View style={[styles.sumRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>{formatINR(total)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkout}
              activeOpacity={0.85}
              onPress={() => {
                clear();
                setPlaced(true);
              }}
            >
              <Text style={styles.checkoutText}>
                Place order • {formatINR(total)}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  },
  list: {
    padding: 14,
  },
  line: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  thumb: {
    width: 84,
    height: 96,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  thumbEmoji: {
    fontSize: 44,
  },
  lineMid: {
    flex: 1,
  },
  lineName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  lineSize: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  linePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  linePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  lineMrp: {
    fontSize: 13,
    color: "#B5B5B5",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  lineFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 8,
  },
  stepBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stepText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  qty: {
    fontSize: 14,
    fontWeight: "800",
    minWidth: 22,
    textAlign: "center",
  },
  remove: {
    fontSize: 13,
    color: RED,
    fontWeight: "600",
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 16,
  },
  sumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  sumLabel: {
    fontSize: 14,
    color: "#555",
  },
  sumVal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  saveVal: {
    color: TEAL,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    marginTop: 6,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
  },
  checkout: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 72,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    textAlign: "center",
  },
  shopBtn: {
    backgroundColor: "#111",
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 16,
  },
  shopBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  success: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  successEmoji: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginTop: 12,
  },
  successSub: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
