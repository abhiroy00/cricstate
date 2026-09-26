import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { listMyConversations } from "../../services/engagementService";

const RED = "#E01A22";
const TEAL = "#00A651";
const GREY = "#9AA0A0";

function ChatIllustration() {
  return (
    <View style={styles.art}>
      {/* back small bubble */}
      <View style={styles.backBubble}>
        <View style={styles.backTail} />
      </View>
      {/* front big bubble */}
      <View style={styles.frontBubble}>
        <View style={styles.msgLine} />
        <View style={styles.msgLine} />
        <View style={[styles.msgLine, styles.msgLineShort]} />
        <View style={styles.frontTail} />
      </View>
    </View>
  );
}

export default function DirectMessagesScreen({ navigation }) {
  const [conversations, setConversations] = useState(null);

  const load = useCallback(async () => {
    try {
      const page = await listMyConversations({ limit: 20 });
      setConversations(page.items || []);
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Direct messages (dm)
        </Text>
        <TouchableOpacity hitSlop={10} style={styles.iconBtn}>
          <Text style={styles.headerPlus}>+</Text>
        </TouchableOpacity>
      </DreamHeader>

      {conversations && conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(i) => i.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onRefresh={load}
          refreshing={conversations === null}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() =>
                navigation?.navigate?.("Conversation", { conversationId: item.id })
              }
            >
              <View style={styles.rowAvatar}>
                <Text style={styles.rowAvatarText}>💬</Text>
              </View>
              <View style={styles.rowMid}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.last_message?.body || "New conversation"}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {item.member_ids?.length || 2} members
                </Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.body}>
          <ChatIllustration />
          <Text style={styles.emptyText}>
            You have not received any message yet. You can also initiate a conversation with your team
            mates or opponents
          </Text>
          <TouchableOpacity style={styles.sendBtn} activeOpacity={0.85}>
            <Text style={styles.sendBtnText}>Send message</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: RED,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 15,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  iconBtn: {
    padding: 4,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "500",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  headerPlus: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "400",
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  list: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowAvatarText: {
    fontSize: 22,
  },
  rowMid: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  rowSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  rowArrow: {
    fontSize: 24,
    color: "#BBB",
    marginLeft: 8,
  },
  art: {
    width: 220,
    height: 170,
    marginBottom: 30,
  },
  backBubble: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 110,
    height: 80,
    borderWidth: 7,
    borderColor: GREY,
    borderRadius: 18,
    backgroundColor: "#fff",
  },
  backTail: {
    position: "absolute",
    left: 22,
    bottom: -16,
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderColor: GREY,
    transform: [{ rotate: "45deg" }],
  },
  frontBubble: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 150,
    height: 120,
    borderWidth: 7,
    borderColor: GREY,
    borderRadius: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  msgLine: {
    height: 8,
    borderRadius: 4,
    backgroundColor: GREY,
    marginBottom: 10,
  },
  msgLineShort: {
    width: "60%",
  },
  frontTail: {
    position: "absolute",
    right: 26,
    bottom: -18,
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderColor: GREY,
    transform: [{ rotate: "45deg" }],
  },
  emptyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 23,
  },
  sendBtn: {
    backgroundColor: TEAL,
    borderRadius: 4,
    paddingHorizontal: 36,
    paddingVertical: 13,
    marginTop: 18,
  },
  sendBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
});
