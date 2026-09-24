import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MENU_SECTIONS = [
  { id: "orders", label: "My Orders", children: [] },
  {
    id: "equipment",
    label: "Equipment",
    children: ["Cricket Bats", "Balls", "Gloves", "Pads", "Helmets", "Kit Bags"],
  },
  {
    id: "apparel",
    label: "Apparel",
    children: ["Jerseys", "Whites", "Track Pants", "Caps", "Shoes"],
  },
  {
    id: "accessories",
    label: "Accessories",
    children: ["Grips", "Guards", "Sunglasses", "Water Bottles"],
  },
  {
    id: "collection",
    label: "Collection",
    children: ["New Launch", "Eternal Whites", "Clearance", "Team Favourites"],
  },
  {
    id: "policy",
    label: "Policy Details",
    children: ["Shipping Policy", "Return & Exchange", "Privacy Policy", "Terms of Use"],
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 340);

export default function StoreMenuDrawer({ visible, userName, onClose, onExitStore, onSelect }) {
  const [expandedId, setExpandedId] = useState(null);
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setExpandedId(null);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(-PANEL_WIDTH);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleRowPress = (section) => {
    if (section.children.length === 0) {
      onSelect?.(section);
      return;
    }
    setExpandedId((prev) => (prev === section.id ? null : section.id));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.dim, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.dimTouch} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.greetHeader}>
            <Text style={styles.greetText} numberOfLines={1}>
              Hello, {userName || "Anshmeet"}
            </Text>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {MENU_SECTIONS.map((s) => {
              const expanded = expandedId === s.id;
              const hasChildren = s.children.length > 0;
              return (
                <View key={s.id}>
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => handleRowPress(s)}
                  >
                    <Text style={styles.rowLabel}>{s.label}</Text>
                    {hasChildren && (
                      <Text style={[styles.rowArrow, expanded && styles.rowArrowOpen]}>
                        ∨
                      </Text>
                    )}
                  </TouchableOpacity>

                  {expanded &&
                    s.children.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={styles.childRow}
                        activeOpacity={0.7}
                        onPress={() => onSelect?.({ ...s, child: c })}
                      >
                        <Text style={styles.childLabel}>{c}</Text>
                      </TouchableOpacity>
                    ))}

                  <View style={styles.thinDivider} />
                </View>
              );
            })}

            <View style={styles.thickDivider} />

            <Text style={styles.helpText}>
              In case of any queries contact us on email or WhatsApp.
            </Text>

            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
                <Text style={styles.contactIcon}>✉</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.contactBtnLast]}
                activeOpacity={0.8}
              >
                <Text style={styles.contactIcon}>✆</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.exitRow}
              activeOpacity={0.7}
              onPress={onExitStore || onClose}
            >
              <Text style={styles.exitArrow}>〈</Text>
              <Text style={styles.exitText}>Exit Store</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  dimTouch: {
    flex: 1,
  },
  panel: {
    width: PANEL_WIDTH,
    backgroundColor: "#fff",
    height: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  greetHeader: {
    backgroundColor: "#3D3D3D",
    paddingHorizontal: 18,
    paddingVertical: 22,
    paddingTop: 28,
  },
  greetText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "500",
  },
  list: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  rowLabel: {
    fontSize: 17,
    color: "#222",
    fontWeight: "400",
  },
  rowArrow: {
    fontSize: 18,
    color: "#888",
    fontWeight: "400",
  },
  rowArrowOpen: {
    transform: [{ rotate: "180deg" }],
  },
  childRow: {
    paddingVertical: 11,
    paddingLeft: 12,
  },
  childLabel: {
    fontSize: 15,
    color: "#555",
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  thickDivider: {
    height: 8,
    backgroundColor: "#F2F2F2",
    marginHorizontal: -18,
    marginTop: 8,
    marginBottom: 18,
  },
  helpText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  contactRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  contactBtn: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactBtnLast: {
    marginRight: 0,
  },
  contactIcon: {
    fontSize: 34,
    color: "#111",
    fontWeight: "400",
  },
  exitRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  exitArrow: {
    fontSize: 18,
    color: "#9A9A9A",
    marginRight: 8,
  },
  exitText: {
    fontSize: 16,
    color: "#9A9A9A",
  },
});
