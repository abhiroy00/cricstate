import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";

import FilterSheet from "../../components/FilterSheet";
import SearchOverlay from "../../components/SearchOverlay";

const RED = "#D71920";
const TEAL = "#0FA3A3";

const TILES = [];

function CommunityHeader({ onMenu, onSearch, onMessage, onFilter, filterCount }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onMenu}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <Text style={styles.logoBall}>🏏</Text>
        </View>
        <TouchableOpacity activeOpacity={0.85} style={styles.proBtn}>
          <Text style={styles.proBtnText}>PRO @ ₹199</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onSearch}>
          <Text style={styles.headerIcon}>⌕</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onMessage}>
          <Text style={styles.headerIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={12} style={styles.headerBtn} onPress={onFilter}>
          <View>
            <Text style={styles.headerIcon}>⧩</Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [city, setCity] = useState("New Delhi");
  const [filterCount, setFilterCount] = useState(1);

  const openDrawer = () =>
    navigation?.dispatch?.(DrawerActions.openDrawer());

  const openTile = (tile) => {
    if (tile.stack) {
      navigation?.navigate?.(tile.stack, tile.params);
      return;
    }
    const [tab, screen, params] = tile.go;
    navigation?.navigate?.(tab, { screen, params });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <CommunityHeader
        onMenu={openDrawer}
        onSearch={() => setSearchOpen(true)}
        onMessage={() => navigation?.navigate?.("DirectMessages")}
        onFilter={() => setFilterOpen(true)}
        filterCount={filterCount}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.cityRow}
          activeOpacity={0.7}
          onPress={() => setFilterOpen(true)}
        >
          <Text style={styles.cityText}>
            Cricket community in <Text style={styles.cityName}>{city}</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.grid}>
          {TILES.map((t) => (
            <TouchableOpacity
              key={t.label}
              style={styles.tile}
              activeOpacity={0.8}
              onPress={() => openTile(t)}
            >
              <Text style={styles.tileEmoji}>{t.emoji}</Text>
              <Text style={styles.tileLabel}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSeeMatch={() => navigation?.navigate?.("My Cricket")}
      />

      <FilterSheet
        visible={filterOpen}
        initialCat="LOCATION"
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          const n =
            (f.locations?.length || 0) +
            (f.types?.length || 0) +
            (f.balls?.length || 0);
          setFilterCount(n);
          if (f.locations?.length > 0) setCity(f.locations[0]);
        }}
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
    backgroundColor: RED,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  logoWrap: {
    marginLeft: 6,
  },
  logoBall: {
    fontSize: 30,
  },
  proBtn: {
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  proBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  cityRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cityText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  cityName: {
    color: TEAL,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  tile: {
    width: "31.5%",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 6,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileEmoji: {
    fontSize: 48,
  },
  tileLabel: {
    fontSize: 14,
    color: "#111",
    marginTop: 12,
    textAlign: "center",
  },
});
