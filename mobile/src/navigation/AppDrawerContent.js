import { useEffect, useRef, useState } from "react";
import {
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DrawerActions } from "@react-navigation/native";
import { useDrawerStatus } from "@react-navigation/drawer";

import { useAuth } from "../hooks/useAuth";

const TEAL = "#0FA3A3";

function Row({ icon, label, badge, onPress, small }) {
  return (
    <TouchableOpacity
      style={[styles.row, small && styles.rowSmall]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.rowIcon, small && styles.rowIconSmall]}>{icon}</Text>
      <Text
        style={[styles.rowLabel, small && styles.rowLabelSmall]}
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
  const [moreOpen, setMoreOpen] = useState(true);
  const [lang, setLang] = useState("English");
  const drawerStatus = useDrawerStatus();
  const listRef = useRef(null);

  // Drawer band hote hi More auto-collapse
  useEffect(() => {
    if (drawerStatus === "closed") setMoreOpen(false);
  }, [drawerStatus]);

  // Drawer khulne pe list top pe (top 11 elements visible)
  useEffect(() => {
    if (drawerStatus === "open") listRef.current?.scrollTo({ y: 0, animated: false });
  }, [drawerStatus]);

  const name = user?.full_name || "Nishant Giri";
  const phone = user?.phone || user?.mobile || "8851888818";

  const close = () => navigation.dispatch(DrawerActions.closeDrawer());
  const go = (screen, params) => {
    if (screen) navigation.navigate(screen, params);
    close();
  };
  const goMain = (tab, screen, params) => {
    const payload = screen ? { screen, params } : undefined;
    navigation.navigate("Main", { screen: tab, ...(payload ? { params: payload } : {}) });
    close();
  };
  const goInfo = (title) => go("Info", { title });

  const shareApp = () => {
    Share.share({
      message: "Play cricket the smart way with CricState — scoring, tournaments, store and more!",
    }).catch(() => {});
  };
  const rateUs = () => {
    Linking.openURL("https://play.google.com/store").catch(() => {});
  };
  const openUrl = (url) => Linking.openURL(url).catch(() => {});

  return (
    <View style={styles.wrap}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧑🏽</Text>
        </View>
        <View style={styles.profileMid}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.phone}>{phone}</Text>
          <View style={styles.freePill}>
            <Text style={styles.freePillText}>Free User</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>
        <View style={styles.profileRight}>
          <TouchableOpacity
            hitSlop={10}
            onPress={() => go("ProfileRoot")}
            activeOpacity={0.7}
          >
            <Text style={styles.profileArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={10}
            onPress={() => go("ProfileRoot")}
            activeOpacity={0.7}
          >
            <Text style={styles.bell}>🔔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.progressPct}>50%</Text>
      </View>

      <ScrollView ref={listRef} showsVerticalScrollIndicator={false}>
        <Row icon="🏅" label="PRO at ₹199 (No autopay)" onPress={() => go("ProBenefits")} />
        <Row icon="🏆" label="Add a Tournament/Series" badge="Free" onPress={() => goMain("My Cricket", "CreateTournament")} />
        <Row icon="⏱" label="Start A Match" badge="Free" onPress={() => goMain("My Cricket", "StartMatch")} />
        <Row icon="🎥" label="Go Live" onPress={() => goMain("My Cricket", "StartMatch")} />
        <Row icon="🏏" label="My Cricket" onPress={() => goMain("My Cricket")} />
        <Row icon="📊" label="My Performance" onPress={() => goMain("My Cricket", "MyCricketHome", { section: "STATS" })} />
        <Row icon="🛒" label="CricHeroes Store" onPress={() => goMain("Store")} />
        <Row icon="🏵" label="Leaderboards" onPress={() => goMain("Community", "RoleBoard", { role: "scorers" })} />
        <Row icon="🏆" label="CricHeroes Awards" onPress={() => goInfo("CricHeroes Awards")} />
        <Row icon="🤝" label="Associations" onPress={() => goInfo("Associations")} />
        <Row icon="👥" label="Clubs" onPress={() => goInfo("Clubs")} />
        <Row icon="📞" label="Contact" onPress={() => goInfo("Contact")} />

        <View style={styles.divider} />

        <Row icon="↗" label="Share the app" onPress={shareApp} />
        <Row icon="⭐" label="Rate us" onPress={rateUs} />
        <Row icon="🔢" label="App code" onPress={() => goInfo("App code")} />

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => setMoreOpen((v) => !v)}
        >
          <Text style={styles.rowIcon}>⋯</Text>
          <Text style={styles.rowLabel}>More</Text>
          <Text style={styles.moreArrow}>{moreOpen ? "∧" : "∨"}</Text>
        </TouchableOpacity>
        {moreOpen && (
          <View style={styles.moreWrap}>
            <Row small icon="ⓘ" label="What's New" onPress={() => goInfo("What's New")} />
            <TouchableOpacity style={[styles.row, styles.rowSmall]} activeOpacity={0.7} onPress={() => setLang((l) => (l === "English" ? "Hindi" : "English"))}>
              <Text style={[styles.rowIcon, styles.rowIconSmall]}>🌐</Text>
              <Text style={[styles.rowLabel, styles.rowLabelSmall]} numberOfLines={1}>
                Change Language ({lang})
              </Text>
            </TouchableOpacity>
            <Row small icon="📷" label="Instagram" onPress={() => openUrl("https://www.instagram.com/")} />
            <Row small icon="▶️" label="YouTube" onPress={() => openUrl("https://www.youtube.com/")} />
            <Row small icon="📘" label="Facebook" onPress={() => openUrl("https://www.facebook.com/")} />
            <Row small icon="✖️" label="X" onPress={() => openUrl("https://x.com/")} />
            <Row small icon="🛡" label="About Us" onPress={() => goInfo("About Us")} />
            <Row small icon="📰" label="Blog" onPress={() => goInfo("Blog")} />
            <Row small icon="❓" label="Help / FAQs" onPress={() => goInfo("Help / FAQs")} />
            <Row small icon="📄" label="Privacy Policy" onPress={() => goInfo("Privacy Policy")} />
            <Row small icon="📃" label="Terms of Service" onPress={() => goInfo("Terms of Service")} />
            <Row small icon="🧾" label="Paid Service Terms" onPress={() => goInfo("Paid Service Terms")} />
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profile: {
    backgroundColor: "#7C2D12",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 44,
    paddingBottom: 14,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  profileMid: {
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
  },
  phone: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 1,
  },
  freePill: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  freePillText: {
    color: "#fff",
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginTop: 8,
  },
  progressFill: {
    width: "50%",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4DA3FF",
  },
  profileRight: {
    alignItems: "center",
    marginLeft: 6,
  },
  profileArrow: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "300",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    width: 32,
    height: 32,
    textAlign: "center",
    lineHeight: 30,
  },
  bell: {
    fontSize: 22,
    marginTop: 8,
  },
  progressPct: {
    position: "absolute",
    right: 12,
    bottom: 10,
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontStyle: "italic",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  rowIcon: {
    fontSize: 24,
    width: 34,
    textAlign: "center",
    color: "#777",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#222",
    marginLeft: 10,
  },
  rowSmall: {
    paddingVertical: 10,
  },
  rowIconSmall: {
    fontSize: 20,
    width: 28,
  },
  rowLabelSmall: {
    fontSize: 14,
  },
  freeBadge: {
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  freeText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  moreArrow: {
    fontSize: 18,
    color: "#888",
    fontWeight: "700",
  },
  moreWrap: {
    paddingLeft: 30,
  },
  divider: {
    height: 8,
    backgroundColor: "#F2F2F2",
  },
  unused: {
    color: TEAL,
  },
});
