import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts/legacy";

import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { addPlayerToRoster } from "../../services/teamService";

const RED = "#E01A22";
const TEAL = "#00A651";

export default function ContactsPickerScreen({ navigation, route }) {
  const { teamId } = route.params || {};
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });
      const items = (data || [])
        .map((contact) => {
          const rawPhone = contact.phoneNumbers?.[0]?.number || "";
          const phone = rawPhone.replace(/[^\d+]/g, "");
          const name = (contact.name || "").trim() || phone;
          return { id: String(contact.id), name, phone };
        })
        .filter((c) => c.name)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
      setContacts(items);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    const digits = q.replace(/\D/g, "");
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || (digits && c.phone.includes(digits))
    );
  }, [contacts, query]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    const chosen = contacts.filter((c) => selected.has(c.id));
    if (chosen.length === 0) return;
    setSaving(true);
    setError("");
    try {
      for (const contact of chosen) {
        await addPlayerToRoster(teamId, { new_player_full_name: contact.name });
      }
      navigation.goBack();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const count = selected.size;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation.goBack()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Multiple players from your contacts
        </Text>
        <View style={styles.headerSpacer} />
      </DreamHeader>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Quick search"
          placeholderTextColor="#B8B8B8"
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={TEAL} />
        </View>
      ) : permissionDenied ? (
        <View style={styles.centered}>
          <Text style={styles.infoTitle}>Contacts access needed</Text>
          <Text style={styles.infoSub}>
            Allow contacts access to pick players from your phone.
          </Text>
          <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={load}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsLink}>Open settings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>No contacts found on this device</Text>
          }
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => toggle(item.id)}
              >
                <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>
                  {isSelected ? <Text style={styles.tick}>✓</Text> : null}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {!!item.phone && <Text style={styles.phone}>{item.phone}</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={[styles.addBtn, count === 0 && styles.addBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleAdd}
          disabled={count === 0 || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addText}>
              {count > 0 ? `Add ${count} player${count > 1 ? "s" : ""}` : "Add players"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 6,
    marginHorizontal: 14,
    marginTop: 14,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1a1a1a",
    padding: 0,
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#C4C4C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  checkboxOn: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  tick: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 17,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },
  phone: {
    fontSize: 13,
    color: "#9AA0AE",
    marginTop: 2,
  },
  emptyText: {
    textAlign: "center",
    color: "#9AA0AE",
    marginTop: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  infoSub: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: TEAL,
    borderRadius: 6,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 20,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  settingsLink: {
    color: TEAL,
    fontSize: 14,
    marginTop: 14,
    fontWeight: "600",
  },
  error: {
    color: RED,
    textAlign: "center",
    marginBottom: 6,
  },
  footer: {
    backgroundColor: "#fff",
  },
  addBtn: {
    backgroundColor: TEAL,
    paddingTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#B9D9C7",
  },
  addText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
