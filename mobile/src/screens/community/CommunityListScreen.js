import { useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";

const SAMPLE = {
  scorers: [
    { id: "s1", name: "Amit Verma", meta: "120+ matches • BCCI Level 1", km: "2.1 KM", rating: "4.8" },
    { id: "s2", name: "Rohit Gupta", meta: "80+ matches • Digital scoring", km: "3.4 KM", rating: "4.7" },
    { id: "s3", name: "Sahil Khan", meta: "Live scoring expert", km: "5.0 KM", rating: "4.6" },
  ],
  umpires: [
    { id: "u1", name: "Rajesh Kumar", meta: "150+ matches • BCCI panel", km: "1.8 KM", rating: "4.9" },
    { id: "u2", name: "Vikram Singh", meta: "90+ matches • T20 specialist", km: "4.2 KM", rating: "4.7" },
  ],
  commentators: [
    { id: "c1", name: "Neeraj Sharma", meta: "Hindi + English • 200+ matches", km: "2.9 KM", rating: "4.8" },
    { id: "c2", name: "Arjun Mehta", meta: "Live + Box cricket", km: "6.1 KM", rating: "4.5" },
  ],
  streamers: [
    { id: "st1", name: "CricLive Delhi", meta: "4-cam setup • Live + highlights", km: "3.0 KM", rating: "4.9" },
    { id: "st2", name: "StreamKar", meta: "Single cam • Budget", km: "4.8 KM", rating: "4.4" },
  ],
  organisers: [
    { id: "o1", name: "Delhi Cricket League", meta: "12 tournaments / year", km: "2.2 KM", rating: "4.7" },
  ],
  academies: [
    { id: "a1", name: "Star Cricket Academy", meta: "Rohini • U-14 to U-19", km: "3.3 KM", rating: "4.8" },
    { id: "a2", name: "Arena Sports", meta: "Dwarka • Weekend batches", km: "7.5 KM", rating: "4.6" },
  ],
  grounds: [
    { id: "g1", name: "Green Park Ground", meta: "Full size • Turf wicket", km: "5.2 KM", rating: "4.6" },
    { id: "g2", name: "City Sports Complex", meta: "2 grounds • Floodlights", km: "6.8 KM", rating: "4.5" },
  ],
  box: [
    { id: "b1", name: "BoxPlay Arena", meta: "6-a-side • Night slots", km: "1.2 KM", rating: "4.7" },
    { id: "b2", name: "NetsHub", meta: "Bowling machine • Coaching", km: "2.6 KM", rating: "4.6" },
  ],
};

const FILTERS = ["All", "Near me", "Top rated"];

export default function CommunityListScreen({ navigation, route }) {
  const { category = "all", title = "Community", city = "Delhi" } = route?.params || {};
  const [filter, setFilter] = useState("All");

  const data = useMemo(() => {
    const all = Object.values(SAMPLE).flat();
    let list = category === "all" ? all : SAMPLE[category] || all;
    if (filter === "Near me") list = [...list].sort((a, b) => parseFloat(a.km) - parseFloat(b.km));
    if (filter === "Top rated") list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    return list;
  }, [category, filter]);

  const call = () => Linking.openURL("tel:+919999999999").catch(() => {});

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title} in {city}
        </Text>
        <View style={{ width: 36 }} />
      </DreamHeader>

      <View style={styles.chipsRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipOn]}
            activeOpacity={0.8}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextOn]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No providers found in {city} yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.[0] || "C"}</Text>
            </View>
            <View style={styles.mid}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name} <Text style={styles.rating}>★ {item.rating}</Text>
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.meta}
              </Text>
              <Text style={styles.km}>📍 {item.km} • {city}</Text>
            </View>
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={call}>
              <Text style={styles.contactText}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
    width: 36,
  },
  backArrow: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 32,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  chipOn: {
    backgroundColor: TEAL,
  },
  chipText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "500",
  },
  chipTextOn: {
    color: "#fff",
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  empty: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#00A651",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  mid: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  rating: {
    fontSize: 13,
    color: "#00A651",
    fontWeight: "700",
  },
  meta: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  km: {
    fontSize: 13,
    color: TEAL,
    marginTop: 4,
  },
  contactBtn: {
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: TEAL,
    fontWeight: "600",
  },
});
