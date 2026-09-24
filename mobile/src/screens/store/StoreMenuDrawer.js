import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { RED } from "../../data/storeData";

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
    children: ["New Launch", "New Arrivals", "Eternal Whites", "Clearance", "Team Favourites"],
  },
  {
    id: "policy",
    label: "Policy Details",
    children: ["Shipping Policy", "Return & Exchange", "Privacy Policy", "Terms of Use"],
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 340);

export default function StoreMenuDrawer({ visible, userName, onClose, onExitStore, onSelect, onContact }) {
  const [expandedId, setExpandedId] = useState(null);
  // App-drawer jaisa smooth open/close: band hote waqt bhi slide-out + fade,
  // phir unmount (pehle turant gayab ho jata tha).
  const [rendered, setRendered] = useState(visible);
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const dimAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.stopAnimation();
    dimAnim.stopAnimation();
    if (visible) {
      setRendered(true);
      setExpandedId(null);
      slideAnim.setValue(-PANEL_WIDTH);
      dimAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dimAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dimAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setRendered(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleRowPress = (section) => {
    if (section.children.length === 0) {
      onSelect?.(section);
      return;
    }
    setExpandedId((prev) => (prev === section.id ? null : section.id));
  };

  // Swipe left on the panel to close (back to store) — app drawer jaisa.
  // Release pe sirf onClose bolo, slide-out animation effect sambhal lega.
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx < -10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          slideAnim.setValue(g.dx);
          dimAnim.setValue(Math.max(0, 1 + g.dx / PANEL_WIDTH));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -70 || g.vx < -0.6) {
          // Drag position se smooth slide-out — effect animate karega
          onClose?.();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 9,
              tension: 320,
              useNativeDriver: true,
            }),
            Animated.timing(dimAnim, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!rendered && !visible) return null;

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* App-drawer jaisa dim + tap-catcher */}
        <Animated.View
          style={[styles.dimLayer, { opacity: dimAnim }]}
          pointerEvents="none"
        />
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        <Animated.View
          {...pan.panHandlers}
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
                    style={[styles.row, expanded && styles.rowOpen]}
                    activeOpacity={0.7}
                    onPress={() => handleRowPress(s)}
                  >
                    <Text style={[styles.rowLabel, expanded && styles.rowLabelOpen]}>{s.label}</Text>
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
              <TouchableOpacity
                style={styles.contactBtn}
                activeOpacity={0.8}
                onPress={() => onContact?.("email")}
              >
                <Text style={styles.contactIcon}>✉</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, styles.contactBtnLast]}
                activeOpacity={0.8}
                onPress={() => onContact?.("whatsapp")}
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
          {/* Right-edge tab inside panel: tap to go back to store */}
          <TouchableOpacity
            style={styles.edgeTab}
            activeOpacity={0.7}
            hitSlop={10}
            onPress={onClose}
          >
            <Text style={styles.edgeTabText}>‹</Text>
          </TouchableOpacity>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,8,20,0.5)",
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
  edgeTab: {
    position: "absolute",
    right: 6,
    top: "50%",
    marginTop: -30,
    width: 26,
    height: 60,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  edgeTabText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
  },
  greetHeader: {
    backgroundColor: RED,
    paddingHorizontal: 18,
    paddingVertical: 22,
    paddingTop: 28,
    borderBottomWidth: 3,
    borderBottomColor: "#FFC42E",
  },
  greetText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
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
  rowOpen: {
    backgroundColor: "#FFF4F4",
    marginHorizontal: -18,
    paddingHorizontal: 18,
    borderLeftWidth: 4,
    borderLeftColor: RED,
  },
  rowLabel: {
    fontSize: 17,
    color: "#222",
    fontWeight: "400",
  },
  rowLabelOpen: {
    color: RED,
    fontWeight: "800",
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
    borderLeftWidth: 2,
    borderLeftColor: "#F8C4C6",
    marginLeft: 2,
    marginVertical: 1,
  },
  childLabel: {
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  thickDivider: {
    height: 8,
    backgroundColor: "#FDECEC",
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
    backgroundColor: "#171A4B",
    borderRadius: 16,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#FFC42E",
  },
  contactBtnLast: {
    marginRight: 0,
  },
  contactIcon: {
    fontSize: 34,
    color: "#FFC42E",
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
    color: RED,
    marginRight: 8,
    fontWeight: "700",
  },
  exitText: {
    fontSize: 16,
    color: RED,
    fontWeight: "700",
  },
});
