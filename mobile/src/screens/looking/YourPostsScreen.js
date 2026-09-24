import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLooking } from "./LookingContext";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

function DottedArrow() {
  const rows = [1, 2, 3, 4, 5, 6, 7, 6, 4, 4, 4, 4, 4, 4];
  return (
    <View style={styles.arrow}>
      {rows.map((n, i) => (
        <View key={i} style={styles.arrowRow}>
          {Array.from({ length: n }).map((_, j) => (
            <View key={j} style={styles.dot} />
          ))}
        </View>
      ))}
    </View>
  );
}

function MineRow({ item, onToggleActive, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
          <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
        </View>
        <View style={styles.cardMid}>
          <Text style={styles.cardNeed} numberOfLines={1}>
            {item.need} ({item.needDetail})
          </Text>
          <Text style={styles.cardMeta}>
            {item.type} • {item.time}
          </Text>
        </View>
        <View
          style={[styles.statusPill, item.active ? styles.on : styles.off]}
        >
          <Text style={styles.statusText}>
            {item.active ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          hitSlop={8}
          onPress={() => onToggleActive(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionLink}>
            {item.active ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={8}
          onPress={() => onDelete(item.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionLink, styles.deleteLink]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function YourPostsScreen({ navigation }) {
  const { posts, setPostActive, deletePost } = useLooking();
  const [tab, setTab] = useState("Active");

  const mine = posts.filter((p) => p.mine);
  const shown = mine.filter((p) =>
    tab === "Active" ? p.active : !p.active
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle}>Your posts</Text>
        <View style={{ width: 36 }} />
      </DreamHeader>

      <View style={styles.tabs}>
        {["Active", "Inactive"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabOn]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextOn]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {shown.length === 0 ? (
        <View style={styles.empty}>
          <DottedArrow />
          <Text style={styles.emptyText}>
            We know for a fact that everyone is looking for something but you
            are not! Come on, try it. It's fun.
          </Text>
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate?.("LookingCategories")}
          >
            <Text style={styles.startText}>Start looking</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MineRow
              item={item}
              onToggleActive={(p) => setPostActive(p.id, !p.active)}
              onDelete={deletePost}
            />
          )}
        />
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
  backBtn: {
    padding: 6,
  },
  backArrow: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabOn: {
    borderBottomColor: RED,
  },
  tabText: {
    fontSize: 18,
    color: "#888",
  },
  tabTextOn: {
    color: "#111",
    fontWeight: "500",
  },
  list: {
    padding: 14,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  cardMid: {
    flex: 1,
  },
  cardNeed: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  cardMeta: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  on: {
    backgroundColor: "#C6F6D5",
  },
  off: {
    backgroundColor: "#FFE4CC",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionLink: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
    marginLeft: 18,
  },
  deleteLink: {
    color: RED,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  arrow: {
    alignItems: "center",
    marginBottom: 30,
  },
  arrowRow: {
    flexDirection: "row",
    marginVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D5D5D5",
    marginHorizontal: 3,
  },
  emptyText: {
    fontSize: 18,
    color: "#111",
    textAlign: "center",
    lineHeight: 26,
  },
  startBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 34,
    paddingVertical: 13,
    marginTop: 22,
  },
  startText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
