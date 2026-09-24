import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatINR, offPct, RED, TEAL } from "../../data/storeData";
import { useCart } from "./StoreCartContext";

export default function ProductDetailModal({ product, visible, onClose, onBuyNow }) {
  const { add, toggleWish, isWished } = useCart();
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (visible && product) {
      setSize(product.sizes[0]);
      setQty(1);
    }
  }, [visible, product]);

  if (!product) return null;
  const wished = isWished(product.id);

  const handleAdd = () => {
    add(product, size || product.sizes[0], qty);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.dim}>
        <View style={styles.box}>
          <View style={[styles.stage, { backgroundColor: product.bg }]}>
            <Text style={styles.stageEmoji}>{product.emoji}</Text>
            {product.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            )}
            <TouchableOpacity hitSlop={10} style={styles.close} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.titleRow}>
              <View style={styles.titleMid}>
                <Text style={styles.brand}>{product.brand}</Text>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.rating}>
                  ★ {product.rating.toFixed(1)}{" "}
                  <Text style={styles.ratingDim}>
                    ({product.reviews.toLocaleString("en-IN")} reviews)
                  </Text>
                </Text>
              </View>
              <TouchableOpacity
                hitSlop={10}
                style={styles.heart}
                onPress={() => toggleWish(product.id)}
              >
                <Text style={[styles.heartIcon, wished && styles.heartOn]}>
                  {wished ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatINR(product.price)}</Text>
              <Text style={styles.mrp}>{formatINR(product.mrp)}</Text>
              <Text style={styles.off}>{offPct(product)}</Text>
            </View>
            <Text style={styles.taxNote}>Inclusive of all taxes</Text>

            <Text style={styles.label}>
              Size{product.sizes.length > 1 ? " — " + size : ""}
            </Text>
            <View style={styles.sizeRow}>
              {product.sizes.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.size, size === s && styles.sizeActive]}
                  onPress={() => setSize(s)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      size === s && styles.sizeTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.foot}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  hitSlop={8}
                  style={styles.stepBtn}
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Text style={styles.stepText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{qty}</Text>
                <TouchableOpacity
                  hitSlop={8}
                  style={styles.stepBtn}
                  onPress={() => setQty((q) => Math.min(9, q + 1))}
                >
                  <Text style={styles.stepText}>＋</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAdd}
                activeOpacity={0.85}
              >
                <Text style={styles.addText}>
                  Add • {formatINR(product.price * qty)}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.buyBtn}
              activeOpacity={0.85}
              onPress={() => {
                handleAdd();
                onBuyNow?.();
              }}
            >
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  box: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: "88%",
  },
  stage: {
    height: 210,
    alignItems: "center",
    justifyContent: "center",
  },
  stageEmoji: {
    fontSize: 110,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomRightRadius: 16,
  },
  badgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  close: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "700",
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
  },
  titleMid: {
    flex: 1,
  },
  brand: {
    fontSize: 13,
    color: "#9A9A9A",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 2,
  },
  rating: {
    fontSize: 14,
    color: "#F5A623",
    fontWeight: "700",
    marginTop: 4,
  },
  ratingDim: {
    color: "#999",
    fontWeight: "400",
  },
  heart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 22,
    color: "#999",
  },
  heartOn: {
    color: RED,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },
  mrp: {
    fontSize: 15,
    color: "#B5B5B5",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  off: {
    fontSize: 15,
    color: TEAL,
    fontWeight: "700",
    marginLeft: 8,
  },
  taxNote: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginTop: 14,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  size: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  sizeActive: {
    borderColor: "#111",
    backgroundColor: "#111",
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  sizeTextActive: {
    color: "#fff",
  },
  foot: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 10,
    marginRight: 10,
  },
  stepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  qty: {
    fontSize: 16,
    fontWeight: "800",
    minWidth: 24,
    textAlign: "center",
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  addText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  buyBtn: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  buyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
