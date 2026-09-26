import { useCallback, useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import HighlightsSection from "./sections/HighlightsSection";
import MatchesSection from "./sections/MatchesSection";
import StatsSection from "./sections/StatsSection";
import TeamsSection from "./sections/TeamsSection";
import TournamentsSection from "./sections/TournamentsSection";
import FilterSheet from "../../components/FilterSheet";
import SearchOverlay from "../../components/SearchOverlay";
import AppLogo from "../../components/AppLogo";
import DreamHeader from "../../components/DreamHeader";
import ProPill from "../../components/ProPill";
import {
  ChatGlyph,
  FilterGlyph,
  HeaderIconBtn,
  MenuGlyph,
  SearchGlyph,
} from "../../components/HeaderIcon";
import { extractErrorMessage } from "../../services/api";
import { getMyCricket } from "../../services/myCricketService";

const SECTIONS = [
  { key: "MATCHES", label: "Matches" },
  { key: "TOURNAMENTS", label: "Tournaments" },
  { key: "TEAMS", label: "Teams" },
  { key: "STATS", label: "Stats" },
  { key: "HIGHLIGHTS", label: "Highlights" },
];

const SECTION_COMPONENTS = {
  MATCHES: MatchesSection,
  TOURNAMENTS: TournamentsSection,
  TEAMS: TeamsSection,
  STATS: StatsSection,
  HIGHLIGHTS: HighlightsSection,
};

const RED = "#E01A22";
const TEAL = "#00A651";

function AppHeader({ onMenu, onSearch, onMessage, onFilter, onPro, filterCount }) {
  return (
    <DreamHeader style={styles.header}>
      <View style={styles.headerLeft}>
        <HeaderIconBtn onPress={onMenu} label="Menu">
          <MenuGlyph />
        </HeaderIconBtn>
        <AppLogo />
        <ProPill onPress={onPro} />
      </View>
      <View style={styles.headerRight}>
        <HeaderIconBtn onPress={onSearch} label="Search">
          <SearchGlyph />
        </HeaderIconBtn>
        <HeaderIconBtn onPress={onMessage} label="Messages">
          <ChatGlyph />
        </HeaderIconBtn>
        <HeaderIconBtn onPress={onFilter} label="Filter" badge={filterCount}>
          <FilterGlyph active={filterCount > 0} />
        </HeaderIconBtn>
      </View>
    </DreamHeader>
  );
}

export default function MyCricketHomeScreen({ navigation, route }) {
  const [section, setSection] = useState(route?.params?.section || "MATCHES");
  const SectionComponent = SECTION_COMPONENTS[section];
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterCat, setFilterCat] = useState("LOCATION");
  const [filterCount, setFilterCount] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    setOverviewError("");
    try {
      setOverview(await getMyCricket());
    } catch (err) {
      setOverviewError(extractErrorMessage(err));
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOverview();
    }, [loadOverview])
  );

  useEffect(() => {
    if (route?.params?.section && SECTION_COMPONENTS[route.params.section]) {
      setSection(route.params.section);
    }
  }, [route?.params?.section]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <AppHeader
        onMenu={() => navigation.openDrawer?.()}
        onPro={() => navigation.navigate("ProBenefits")}
        onSearch={() => setSearchOpen(true)}
        onMessage={() => navigation.navigate("DirectMessages")}
        onFilter={() => setFilterVisible(true)}
        filterCount={filterCount}
      />

      {/* Top tabs — Matches / Tournaments / Teams / Stats / Highlights */}
      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {SECTIONS.map((t) => {
            const active = t.key === section;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSection(t.key)}
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                {active && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.body}>
        <SectionComponent
          navigation={navigation}
          overview={overview}
          loading={overviewLoading}
          error={overviewError}
          onRefresh={loadOverview}
        />
      </View>

      <FilterSheet
        visible={filterVisible}
        initialCat={filterCat}
        onClose={() => setFilterVisible(false)}
        onApply={(f) =>
          setFilterCount((f.locations?.length || 0) + (f.types?.length || 0) + (f.balls?.length || 0))
        }
      />
      <SearchOverlay
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSeeMatch={() => navigation.navigate("AllMatches")}
      />
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
    paddingVertical: 10,
    paddingBottom: 13,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoWrap: {
    marginLeft: 6,
  },
  logoBall: {
    fontSize: 30,
  },
  proBtn: {
    backgroundColor: TEAL,
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
  bellDot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  logoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMarkText: {
    color: RED,
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
  },
  proPill: {
    marginLeft: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  proPillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabsWrap: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tabsContent: {
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 0,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 16,
    color: "#777",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: RED,
    fontWeight: "800",
  },
  tabUnderline: {
    marginTop: 10,
    height: 4,
    width: "100%",
    backgroundColor: RED,
    borderRadius: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: "#FFC42E",
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
