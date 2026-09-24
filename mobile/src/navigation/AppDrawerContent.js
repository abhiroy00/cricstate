import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerActions } from "@react-navigation/native";
import { useDrawerStatus } from "@react-navigation/drawer";

import { useAuth } from "../hooks/useAuth";
import { DrawerProfileGradient } from "../components/DreamHeader";
import { DRAWER_ITEMS, DRAWER_MORE_ITEMS } from "../utils/drawerItems";

const TEAL = "#00A651";
const RED = "#E01A22";
const RED_DARK = "#A60E14";
const NAVY = "#171A4B";
const NAVY_DEEP = "#0E0F30";
const GOLD = "#FFC42E";
const ICON_TINT = "#FDECEC";

const APP_CODE = "CRIC2026";
const LANG_KEY = "@cricstate:lang";
const RATE_URL = "https://play.google.com/store";
const SHARE_MESSAGE =
  "Play cricket the smart way with CricState — scoring, tournaments, store and more!";

function Row({ icon, label, badge, onPress, small, highlight }) {
  return (
    <TouchableOpacity
      style={[styles.row, small && styles.rowSmall, highlight && styles.rowHighlight]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, small && styles.iconBoxSmall, highlight && styles.iconBoxGold]}>
        <Text style={[styles.rowIcon, small && styles.rowIconSmall]}>{icon}</Text>
      </View>
      <Text
        style={[styles.rowLabel, small && styles.rowLabelSmall, highlight && styles.rowLabelHighlight]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {badge ? (
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function AppDrawerContent({ navigation }) {
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const [lang, setLang] = useState("English");
  const [langOpen, setLangOpen] = useState(false);
  const drawerStatus = useDrawerStatus();
  const listRef = useRef(null);

  // Saved language load karo
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then((v) => {
        if (v === "Hindi" || v === "English") setLang(v);
      })
      .catch(() => {});
  }, []);

  // Drawer band hote hi More + Language modal auto-close
  useEffect(() => {
    if (drawerStatus === "closed") {
      setMoreOpen(false);
      setLangOpen(false);
    }
  }, [drawerStatus]);

  // Drawer khulne pe list top pe (top elements visible)
  useEffect(() => {
    if (drawerStatus === "open") listRef.current?.scrollTo({ y: 0, animated: false });
  }, [drawerStatus]);

  const name = user?.full_name || "Nishant Giri";
  const phone = user?.phone || user?.mobile || "8851888818";

  const close = () => navigation.dispatch(DrawerActions.closeDrawer());
  const go = (screen, params) => {
    close();
    if (screen) {
      // Drawer close animation ke baad navigate taaki nested stack glitch na ho
      requestAnimationFrame(() => navigation.navigate(screen, params));
    }
  };
  const goMain = (tab, screen, params) => {
    close();
    const payload = screen ? { screen, params } : undefined;
    requestAnimationFrame(() =>
      navigation.navigate("Main", {
        screen: tab,
        ...(payload ? { params: payload } : {}),
      })
    );
  };
  const goInfo = (title) => go("Info", { title });

  const shareApp = async () => {
    try {
      await Share.share({ message: SHARE_MESSAGE });
    } catch {
      // user ne dismiss kiya — kuch nahi karna
    }
  };

  const rateUs = async () => {
    try {
      await Linking.openURL(RATE_URL);
    } catch {
      Alert.alert("Rate us", "Play Store link khul nahi paya. Baad me try karo.");
    }
  };

  const openUrl = async (url, label = "Link") => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) throw new Error("unsupported");
      await Linking.openURL(url);
    } catch {
      Alert.alert(label, "Link khul nahi paya. Internet check karke retry karo.");
    }
  };

  const showAppCode = () => {
    Alert.alert(`App code: ${APP_CODE}`, "Doston ke saath share karo — dono ko PRO trial milega.", [
      { text: "Baad me", style: "cancel" },
      {
        text: "Share karo",
        onPress: () =>
          Share.share({ message: `CricState pe aao! Mera app code: ${APP_CODE}` }).catch(() => {}),
      },
      { text: "Details dekho", onPress: () => goInfo("App code") },
    ]);
  };

  const pickLanguage = async (l) => {
    setLang(l);
    setLangOpen(false);
    try {
      await AsyncStorage.setItem(LANG_KEY, l);
    } catch {}
    Alert.alert(
      "Language",
      l === "Hindi" ? "Bhasha Hindi me badal gayi." : "Language switched to English."
    );
  };

  // Share / Rate / App-code divider ke neeche (pehle jaisa look)
  const ACTION_KEYS = new Set(["share", "rate", "app-code"]);
  const mainItems = DRAWER_ITEMS.filter((i) => !ACTION_KEYS.has(i.key));
  const actionItems = DRAWER_ITEMS.filter((i) => ACTION_KEYS.has(i.key));

  // Har drawer item apne related section/link pe khule — single dispatcher
  // type: drawer | tab | info | action | modal | external (drawerItems.js)
  const handleItem = (item) => {
    if (!item) return;
    switch (item.type) {
      case "drawer":
        go(item.target, item.params);
        break;
      case "tab":
        goMain(item.tab, item.target, item.params);
        break;
      case "info":
        goInfo(item.title || item.label);
        break;
      case "external":
        openUrl(item.url, item.label);
        break;
      case "modal":
        if (item.action === "language") setLangOpen(true);
        break;
      case "action":
      default:
        if (item.action === "share" || item.key === "share") shareApp();
        else if (item.action === "rate" || item.key === "rate") rateUs();
        else if (item.action === "appCode" || item.key === "app-code") showAppCode();
        else if (item.target) go(item.target, item.params);
        break;
    }
  };

  const renderItem = (item, small = false) => {
    if (item.key === "language") {
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.row, styles.rowSmall]}
          activeOpacity={0.7}
          onPress={() => setLangOpen(true)}
        >
          <View style={[styles.iconBox, styles.iconBoxSmall]}>
            <Text style={[styles.rowIcon, styles.rowIconSmall]}>{item.icon}</Text>
          </View>
          <Text style={[styles.rowLabel, styles.rowLabelSmall]} numberOfLines={1}>
            {item.label} ({lang})
          </Text>
        </TouchableOpacity>
      );
    }
    if (item.key === "app-code") {
      return (
        <Row
          key={item.key}
          small={small}
          icon={item.icon}
          label={`${item.label}: ${APP_CODE}`}
          onPress={() => handleItem(item)}
        />
      );
    }
    return (
      <Row
        key={item.key}
        small={small}
        icon={item.icon}
        label={item.label}
        badge={item.badge}
        highlight={item.key === "pro"}
        onPress={() => handleItem(item)}
      />
    );
  };

  return (
    <View style={styles.wrap}>
      <DrawerProfileGradient style={styles.profile}>
        <View style={styles.profileGlow} />
        <View style={styles.profileRedOrb} />
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧑🏽</Text>
        </View>
        <View style={styles.profileMid}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.phone}>{phone}</Text>
          <View style={styles.freePill}>
            <Text style={styles.freePillText}>★ Free User</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <View style={styles.profileRight}>
          {/* Profile kholo */}
          <TouchableOpacity
            hitSlop={10}
            onPress={() => go("ProfileRoot")}
            activeOpacity={0.7}
          >
            <Text style={styles.profileArrow}>›</Text>
          </TouchableOpacity>
          {/* Notification preferences kholo */}
          <TouchableOpacity
            hitSlop={10}
            onPress={() => goInfo("Notification Preferences")}
            activeOpacity={0.7}
            style={styles.bellWrap}
          >
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>
        <Text style={styles.progressPct}>50%</Text>
        {/* Dream11-style dynamic red strip + gold line */}
        <View style={styles.profileStrip} />
        <View style={styles.profileGoldLine} />
      </DrawerProfileGradient>

      <ScrollView ref={listRef} showsVerticalScrollIndicator={false}>
        {mainItems.map((item) => renderItem(item))}

        <View style={styles.divider} />

        {actionItems.map((item) => renderItem(item))}

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => setMoreOpen((v) => !v)}
        >
          <View style={styles.iconBox}>
            <Text style={styles.rowIcon}>⋯</Text>
          </View>
          <Text style={styles.rowLabel}>More</Text>
          <Text style={styles.moreArrow}>{moreOpen ? "∧" : "∨"}</Text>
        </TouchableOpacity>
        {moreOpen && (
          <View style={styles.moreWrap}>
            {DRAWER_MORE_ITEMS.map((item) => renderItem(item, true))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Language selector */}
      <Modal
        visible={langOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLangOpen(false)}
      >
        <View style={styles.dim}>
          <Pressable style={styles.backdrop} onPress={() => setLangOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose language</Text>
            {["English", "Hindi"].map((l) => (
              <TouchableOpacity
                key={l}
                style={styles.langRow}
                activeOpacity={0.8}
                onPress={() => pickLanguage(l)}
              >
                <Text style={[styles.langText, l === lang && styles.langOn]}>{l}</Text>
                {l === lang && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 44,
    paddingBottom: 22,
    overflow: "hidden",
    borderBottomWidth: 0,
    // dynamic depth
    shadowColor: RED,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  profileGlow: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,196,46,0.22)",
  },
  profileRedOrb: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(224,26,34,0.45)",
  },
  profileStrip: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 4,
    height: 6,
    backgroundColor: RED,
  },
  profileGoldLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
    backgroundColor: GOLD,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: NAVY_DEEP,
    borderWidth: 2.5,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  profileMid: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  phone: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  freePill: {
    backgroundColor: GOLD,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  freePillText: {
    color: NAVY_DEEP,
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginTop: 9,
  },
  progressFill: {
    width: "50%",
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  profileRight: {
    alignItems: "center",
    marginLeft: 6,
  },
  profileArrow: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "300",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    width: 32,
    height: 32,
    textAlign: "center",
    lineHeight: 29,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  bellWrap: {
    marginTop: 8,
  },
  bell: {
    fontSize: 22,
  },
  bellDot: {
    position: "absolute",
    top: 1,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GOLD,
    borderWidth: 1.5,
    borderColor: NAVY,
  },
  progressPct: {
    position: "absolute",
    right: 12,
    bottom: 16,
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3FA",
  },
  rowHighlight: {
    backgroundColor: "#FFF4F4",
    borderBottomColor: "#F5C6C8",
    borderLeftWidth: 4,
    borderLeftColor: RED,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ICON_TINT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F8D7D9",
  },
  iconBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  iconBoxGold: {
    backgroundColor: "#FFE9AE",
  },
  rowIcon: {
    fontSize: 21,
    textAlign: "center",
    color: "#777",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: "500",
    color: "#23233A",
    marginLeft: 12,
  },
  rowLabelHighlight: {
    fontWeight: "800",
    color: RED,
  },
  rowSmall: {
    paddingVertical: 8,
  },
  rowIconSmall: {
    fontSize: 17,
  },
  rowLabelSmall: {
    fontSize: 14,
  },
  freeBadge: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  freeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "800",
  },
  moreArrow: {
    fontSize: 18,
    color: RED,
    fontWeight: "700",
  },
  moreWrap: {
    paddingLeft: 26,
    backgroundColor: "#FAFBFF",
  },
  divider: {
    height: 8,
    backgroundColor: "#FDECEC",
  },
  dim: {
    flex: 1,
    backgroundColor: "rgba(18,24,69,0.55)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY_DEEP,
    marginBottom: 6,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  langText: {
    fontSize: 16,
    color: "#111",
  },
  langOn: {
    color: NAVY,
    fontWeight: "700",
  },
  tick: {
    fontSize: 18,
    color: NAVY,
    fontWeight: "800",
  },
  unused: {
    color: TEAL,
  },
});
