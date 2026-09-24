import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CLUB_POSTS, CONTACT_MATCHES, CRICKETERS } from "../data/feedData";

export default function SearchOverlay({ visible, onClose, onSeeMatch }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matchHits = q
    ? CONTACT_MATCHES.filter((m) =>
        `${m.team1} ${m.team2} ${m.tournament} ${m.owner}`
          .toLowerCase()
          .includes(q)
      )
    : [];
  const playerHits = q
    ? CRICKETERS.filter((c) => c.name.toLowerCase().includes(q))
    : [];
  const postHits = q
    ? CLUB_POSTS.filter((p) =>
        `${p.author} ${p.text}`.toLowerCase().includes(q)
      )
    : [];
  const empty = q.length > 0 && !matchHits.length && !playerHits.length && !postHits.length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.searchDim}>
        <View style={styles.searchBox}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search matches, players, posts..."
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity hitSlop={8} onPress={onClose}>
              <Text style={styles.searchCancel}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {!q && (
              <Text style={styles.searchHint}>
                Try "Pathsala", "Parth", "Night League"...
              </Text>
            )}
            {matchHits.length > 0 && (
              <>
                <Text style={styles.searchGroup}>Matches</Text>
                {matchHits.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.searchRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSeeMatch?.();
                    }}
                  >
                    <Text style={styles.searchRowEmoji}>🏏</Text>
                    <View style={styles.searchRowMid}>
                      <Text style={styles.searchRowTitle} numberOfLines={1}>
                        {m.team1} vs {m.team2}
                      </Text>
                      <Text style={styles.searchRowSub} numberOfLines={1}>
                        {m.tournament} • {m.status}
                      </Text>
                    </View>
                    <Text style={styles.searchRowArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            {playerHits.length > 0 && (
              <>
                <Text style={styles.searchGroup}>Cricketers</Text>
                {playerHits.map((c) => (
                  <View key={c.id} style={styles.searchRow}>
                    <Text style={styles.searchRowEmoji}>{c.emoji}</Text>
                    <View style={styles.searchRowMid}>
                      <Text style={styles.searchRowTitle} numberOfLines={1}>
                        {c.name}
                      </Text>
                      <Text style={styles.searchRowSub}>
                        {c.runs}   {c.wkts}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
            {postHits.length > 0 && (
              <>
                <Text style={styles.searchGroup}>Club posts</Text>
                {postHits.map((p) => (
                  <View key={p.id} style={styles.searchRow}>
                    <Text style={styles.searchRowEmoji}>{p.avatarEmoji}</Text>
                    <View style={styles.searchRowMid}>
                      <Text style={styles.searchRowTitle} numberOfLines={1}>
                        {p.author}
                      </Text>
                      <Text style={styles.searchRowSub} numberOfLines={1}>
                        {p.text}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
            {empty && (
              <Text style={styles.searchHint}>
                No results for "{query}". Try another name.
              </Text>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchDim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  searchBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: "85%",
    minHeight: 320,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 20,
    color: "#777",
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    paddingVertical: 12,
  },
  searchCancel: {
    fontSize: 18,
    color: "#777",
    fontWeight: "600",
    padding: 4,
  },
  searchHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  searchGroup: {
    fontSize: 13,
    fontWeight: "800",
    color: "#999",
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  searchRowEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  searchRowMid: {
    flex: 1,
  },
  searchRowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  searchRowSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  searchRowArrow: {
    fontSize: 22,
    color: "#BBB",
    marginLeft: 8,
  },
});
