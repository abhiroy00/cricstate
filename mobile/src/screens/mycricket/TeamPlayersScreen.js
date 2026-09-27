import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn, PencilGlyph } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { getRoster } from "../../services/teamService";

const RED = "#E01A22";
const TEAL = "#00A651";

function PlayerCard({ entry }) {
  const player = entry.player;
  const initial = (player.full_name || "?").trim().charAt(0).toUpperCase();
  return (
    <View style={styles.playerCard}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {player.profile_photo_url ? (
            <Image source={{ uri: player.profile_photo_url }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>
        {entry.is_captain ? (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>Admin</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {player.full_name}
      </Text>
      <View style={styles.matCol}>
        <Text style={styles.matValue}>0</Text>
        <Text style={styles.matLabel}>Mat</Text>
      </View>
    </View>
  );
}

export default function TeamPlayersScreen({ navigation, route }) {
  const { teamId, teamName } = route.params || {};
  const insets = useSafeAreaInsets();
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await getRoster(teamId);
      setRoster(data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function goToContacts() {
    setSheetOpen(false);
    navigation.navigate("ContactsPicker", { teamId, teamName });
  }

  function goToPhone() {
    setSheetOpen(false);
    navigation.navigate("AddPlayerPhone", { teamId, teamName });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {teamName || "Team"}
        </Text>
        <HeaderIconBtn
          onPress={() => navigation.navigate("TeamDetail", { teamId })}
          label="Edit team"
        >
          <PencilGlyph />
        </HeaderIconBtn>
      </DreamHeader>

      <View style={styles.bannerStrip}>
        <Text style={styles.bannerEmoji}>🃏</Text>
        <Text style={styles.bannerText}>Get squad banners</Text>
        <Text style={styles.bannerArrow}>›</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={TEAL} />
          </View>
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : roster && roster.length > 0 ? (
          roster.map((entry) => <PlayerCard key={entry.player.id} entry={entry} />)
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No players yet</Text>
            <Text style={styles.emptySub}>Tap “Add player” to build your squad.</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.profileBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("TeamDetail", { teamId })}
        >
          <Text style={styles.profileText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => setSheetOpen(true)}
        >
          <Text style={styles.addText}>Add player</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        visible={sheetOpen}
        animationType="slide"
        onRequestClose={() => setSheetOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setSheetOpen(false)}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add player</Text>
            <TouchableOpacity style={styles.sheetOption} activeOpacity={0.8} onPress={goToContacts}>
              <Text style={styles.sheetOptionIcon}>👥</Text>
              <Text style={styles.sheetOptionText}>Add from contacts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} activeOpacity={0.8} onPress={goToPhone}>
              <Text style={styles.sheetOptionIcon}>📱</Text>
              <Text style={styles.sheetOptionText}>Add via phone number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetCancel}
              activeOpacity={0.8}
              onPress={() => setSheetOpen(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  bannerStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
    paddingVertical: 12,
  },
  bannerEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  bannerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  bannerArrow: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 24,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  error: {
    color: RED,
    textAlign: "center",
    marginTop: 24,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  emptySub: {
    fontSize: 14,
    color: "#8A8A8A",
    marginTop: 6,
    textAlign: "center",
  },
  playerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  avatarWrap: {
    width: 54,
    height: 54,
    marginRight: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#DCE3EA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: 54,
    height: 54,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5A6472",
  },
  adminBadge: {
    position: "absolute",
    top: -6,
    left: -4,
    backgroundColor: "#D8F3E3",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#00A651",
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  adminText: {
    color: "#0B7A3B",
    fontSize: 10,
    fontWeight: "700",
  },
  playerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  matCol: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  matValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#B0B0B0",
  },
  matLabel: {
    fontSize: 12,
    color: "#B0B0B0",
  },
  bottomBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  profileBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  profileText: {
    color: "#5A6472",
    fontSize: 16,
    fontWeight: "600",
  },
  addBtn: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TEAL,
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#DDD",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sheetOptionIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  sheetOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  sheetCancel: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  sheetCancelText: {
    fontSize: 15,
    color: "#8A8A8A",
    fontWeight: "600",
  },
});
