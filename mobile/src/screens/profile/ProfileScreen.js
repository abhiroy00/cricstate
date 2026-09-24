import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";
import { extractErrorMessage } from "../../services/api";
import { fetchMyProfile } from "../../services/profileService";
import { clearTokens } from "../../utils/storage";
import { colors } from "../../utils/theme";

const RED = "#EA580C";
const TEAL = "#0FA3A3";
const PINK = "#FEF3EB";

function MiniJersey({ color, accent, name, no }) {
  return (
    <View style={styles.jerseyCard}>
      <View style={styles.jerseyStage}>
        <View style={[styles.jerseyBack, { backgroundColor: color, borderColor: accent }]}>
          <Text style={styles.jerseyName}>{name}</Text>
          <Text style={styles.jerseyNo}>{no}</Text>
        </View>
        <View style={[styles.jerseyFront, { backgroundColor: color, borderColor: accent }]} />
      </View>
      <View style={styles.getRow}>
        <Text style={styles.getText}>Get it now</Text>
        <Text style={styles.getArrow}>→</Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoHalf}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function LinkRow({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.linkRow} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.linkText}>{label}</Text>
      <Text style={styles.linkArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMyProfile();
      setProfile(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const goMain = (tab, screen, params) =>
    navigation.navigate("Main", {
      screen: tab,
      ...(screen ? { params: { screen, params } } : {}),
    });
  const goInfo = (title) => navigation.navigate("Info", { title });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button onPress={load}>Retry</Button>
      </View>
    );
  }

  const name = profile?.full_name || user?.full_name || "Nishant Giri";
  const first = name.split(" ")[0] || name;
  const phone = profile?.phone || user?.phone || user?.mobile || "8851888818";
  const city = profile?.city || "New Bongaigaon Railway Colony";
  const followers = profile?.followers_count ?? 0;
  const views = profile?.profile_views ?? 2;

  const doLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  const clearData = async () => {
    Alert.alert("Clear data", "Cached data on this device will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearTokens();
          logout();
        },
      },
    ]);
  };

  const deleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "To delete your account, please write to support@cricstate.app from your registered email."
    );
  };

  const shareQR = () => {
    Share.share({ message: `Follow ${name} on CricState!` }).catch(() => {});
  };

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
        <Text style={styles.headerTitle}>Your cricket profile</Text>
        <TouchableOpacity
          hitSlop={12}
          style={styles.iconBtn}
          onPress={() => navigation.navigate("EditProfile", { profile })}
        >
          <Text style={styles.headerIcon}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.pinkCard}>
          <View style={styles.pinkTop}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("EditProfile", { profile })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>🧑🏽</Text>
                <View style={styles.editBadge}>
                  <Text style={styles.editText}>Edit</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.pinkMid}>
              <Text style={styles.pName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.pLoc} numberOfLines={2}>
                📍 {city}
              </Text>
              <Text style={styles.pSince}>📅 Since 20-Sep-2026</Text>
            </View>
            <TouchableOpacity
              style={styles.goPro}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("ProBenefits")}
            >
              <Text style={styles.goProText}>Go PRO ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statRow}>
            <TouchableOpacity style={styles.stat} activeOpacity={0.7} onPress={shareQR}>
              <Text style={styles.statIcon}>⚄</Text>
              <Text style={styles.statLabel}>Your QR code</Text>
            </TouchableOpacity>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{views}</Text>
              <Text style={styles.statLabel}>Profile views</Text>
            </View>
          </View>
        </View>

        <Text style={styles.promoTitle}>
          {first}, get top sellers at an extra 20% off.
        </Text>
        <View style={styles.promoRow}>
          <MiniJersey color="#1E63D0" accent="#FF6B1A" name={name.toUpperCase()} no="88" />
          <MiniJersey color="#C0122E" accent="#101828" name={name.toUpperCase()} no="88" />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => goMain("Store")}
          style={styles.promoLink}
        >
          <Text style={styles.promoLinkText}>Open Store →</Text>
        </TouchableOpacity>

        <View style={styles.proBanner}>
          <Text style={styles.proHead}>▍PRO Membership</Text>
          <Text style={styles.proPrice}>
            ₹399<Text style={styles.proPer}>/year</Text>
            <Text style={styles.proOr}>  OR  </Text>
            ₹3,999<Text style={styles.proPer}>/lifetime</Text>
          </Text>
          <Text style={styles.proSub}>
            Access unlimited CricInsights and additional benefits with PRO
            membership.
          </Text>
          <TouchableOpacity
            style={styles.proBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("ProBenefits")}
          >
            <Text style={styles.proBtnText}>Become A PRO</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>My profile</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => navigation.navigate("EditProfile", { profile })}
          >
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoGrid}>
          <InfoRow label="Mobile number" value={phone} />
          <InfoRow label="Gender" value={profile?.gender || "Male"} />
          <InfoRow label="Playing role" value={profile?.playing_role || "-"} />
          <InfoRow label="Batting style" value={profile?.batting_style || "-"} />
          <InfoRow label="Bowling style" value={profile?.bowling_style || "-"} />
          <InfoRow label="Date of birth" value={profile?.dob || "2003-04-24"} />
          <InfoRow label="Email" value={profile?.email || user?.email || "-"} />
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressPct}>50%</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("EditProfile", { profile })}
        >
          <Text style={styles.completeLink}>Complete profile</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Connections</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.connRow}
        >
          {["🧑🏻", "🧑🏽", "🧑🏿", "👦🏻", "🧑🏼"].map((e, i) => (
            <View key={i} style={styles.connAvatar}>
              <Text style={styles.connEmoji}>{e}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.connSub}>
          Connect with cricketers to challenge, motivate & inspire each other.
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => goMain("My Cricket", "FindCricketers")}
        >
          <Text style={styles.findLink}>Find Cricketers</Text>
        </TouchableOpacity>

        <LinkRow label="Edit notification preferences" onPress={() => goInfo("Notification Preferences")} />
        <LinkRow label="Change language" onPress={() => goInfo("Language")} />
        <LinkRow label="Purchase history" onPress={() => goInfo("Purchase History")} />

        <View style={styles.dangerRow}>
          <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.8} onPress={doLogout}>
            <Text style={styles.dangerText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerBtn} activeOpacity={0.8} onPress={clearData}>
            <Text style={styles.dangerText}>Clear data</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={deleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={styles.version}>Version 26.8.3 (494)</Text>
        <Text style={styles.emailNudge}>
          To keep your stats safe, add your <Text style={styles.emailBold}>Email</Text> now.
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    textAlign: "center",
  },
  header: {
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  iconBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    flex: 1,
    textAlign: "center",
  },
  pinkCard: {
    backgroundColor: PINK,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pinkTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#3A3A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 52,
  },
  editBadge: {
    position: "absolute",
    bottom: -2,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  editText: {
    color: "#fff",
    fontSize: 11,
  },
  pinkMid: {
    flex: 1,
    marginLeft: 12,
  },
  pName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
  },
  pLoc: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
  pSince: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  goPro: {
    backgroundColor: "#8A8A8A",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  goProText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDiv: {
    width: 1,
    height: 34,
    backgroundColor: "#D5B5B5",
  },
  statIcon: {
    fontSize: 22,
    color: "#888",
  },
  statNum: {
    fontSize: 20,
    color: "#333",
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    paddingHorizontal: 14,
    marginTop: 16,
  },
  promoRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    marginTop: 10,
  },
  promoLink: {
    paddingHorizontal: 14,
    marginTop: 6,
  },
  promoLinkText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
  },
  jerseyCard: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    borderRadius: 14,
    marginRight: 10,
    padding: 10,
  },
  jerseyStage: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  jerseyBack: {
    position: "absolute",
    right: 12,
    top: 24,
    width: 76,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    paddingTop: 14,
  },
  jerseyFront: {
    position: "absolute",
    left: 12,
    top: 8,
    width: 76,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    opacity: 0.98,
  },
  jerseyName: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "800",
  },
  jerseyNo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  getRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  getText: {
    fontSize: 14,
    color: TEAL,
  },
  getArrow: {
    fontSize: 18,
    color: TEAL,
    fontWeight: "700",
  },
  proBanner: {
    backgroundColor: TEAL,
    marginTop: 16,
    padding: 18,
  },
  proHead: {
    color: "#fff",
    fontSize: 16,
  },
  proPrice: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
  },
  proPer: {
    fontSize: 15,
    fontWeight: "400",
  },
  proOr: {
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255,255,255,0.8)",
  },
  proSub: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  proBtn: {
    backgroundColor: "#fff",
    borderRadius: 4,
    paddingHorizontal: 22,
    paddingVertical: 11,
    alignSelf: "flex-start",
    marginTop: 14,
  },
  proBtnText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111",
    paddingHorizontal: 14,
    marginTop: 18,
  },
  editLink: {
    fontSize: 16,
    color: TEAL,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    marginTop: 12,
  },
  infoHalf: {
    width: "50%",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#999",
  },
  infoValue: {
    fontSize: 16,
    color: "#111",
    marginTop: 2,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginTop: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D5D5D5",
  },
  progressFill: {
    width: "50%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4DA3FF",
  },
  progressPct: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#AAA",
    marginLeft: 8,
  },
  completeLink: {
    fontSize: 16,
    color: TEAL,
    textAlign: "center",
    marginTop: 10,
  },
  connRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    marginTop: 12,
  },
  connAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E8A87C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  connEmoji: {
    fontSize: 44,
  },
  connSub: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: 12,
    lineHeight: 20,
  },
  findLink: {
    fontSize: 16,
    color: TEAL,
    textAlign: "center",
    marginTop: 8,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginTop: 6,
  },
  linkText: {
    fontSize: 15,
    color: "#111",
  },
  linkArrow: {
    fontSize: 22,
    color: "#333",
    borderWidth: 1.5,
    borderColor: "#555",
    borderRadius: 14,
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 26,
  },
  dangerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dangerBtn: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginHorizontal: 6,
  },
  dangerText: {
    fontSize: 15,
    color: "#777",
  },
  deleteText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
  },
  version: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 22,
  },
  emailNudge: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 14,
  },
  emailBold: {
    fontWeight: "700",
  },
});
