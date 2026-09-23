import { useState } from "react";
import { StyleSheet, View } from "react-native";

import TabSwitcher from "../../components/TabSwitcher";
import { colors } from "../../utils/theme";
import HighlightsSection from "./sections/HighlightsSection";
import MatchesSection from "./sections/MatchesSection";
import StatsSection from "./sections/StatsSection";
import TeamsSection from "./sections/TeamsSection";
import TournamentsSection from "./sections/TournamentsSection";

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

export default function MyCricketHomeScreen({ navigation }) {
  const [section, setSection] = useState("MATCHES");
  const SectionComponent = SECTION_COMPONENTS[section];

  return (
    <View style={styles.container}>
      <TabSwitcher tabs={SECTIONS} activeKey={section} onChange={setSection} size="large" />
      <SectionComponent navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
