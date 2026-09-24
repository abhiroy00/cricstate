import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";

const BODIES = {
  "CricHeroes Awards":
    "CricHeroes Awards celebrate the best performers across matches, tournaments and leaderboards. Top run-getters, wicket-takers and MVPs earn badges, trophies and PRO rewards every season.",
  Associations:
    "Associations organise official tournaments, manage grounds and certify umpires and scorers in your region. Join your district association to play recognised cricket.",
  Clubs:
    "Clubs bring players together for regular matches, practice sessions and tournaments. Create or join a club to build your squad and track team stats.",
  Contact:
    "Need help?\n\nEmail: support@cricstate.app\nPhone: +91 99999 99999 (Mon–Sat, 10am–7pm)\n\nYou can also reach us from the Store menu via WhatsApp.",
  "App code":
    "Your referral app code is CRIC2026.\n\nShare it with friends — you both unlock PRO trial days when they join with your code.",
  "What's New":
    "• Brand-new Store with cart, wishlist and offers\n• Looking section with 10 categories and filters\n• Live streamers directory with ratings\n• Community leaderboards for scorers, umpires and commentators",
  "About Us":
    "CricState is home for grassroots cricket — scoring, tournaments, performance tracking, shopping and community, all in one app.",
  Blog:
    "Our blog covers grassroots cricket stories, scoring tips, tournament guides and product reviews. New posts drop every week.",
  "Help / FAQs":
    "Q: How do I start a match?\nGo to My Cricket → Start A Match and follow the setup.\n\nQ: How do I post in Looking?\nOpen Looking → Post → pick a category and fill the form.\n\nQ: How do I track my order?\nStore menu → My Orders.",
  "Privacy Policy":
    "Your name, contact details and order information are used only to run the app and fulfil orders. We never sell your personal data to third parties.",
  "Terms of Service":
    "By using CricState you agree to fair play, accurate scoring and respectful conduct. Accounts violating policies may be suspended.",
  "Paid Service Terms":
    "PRO is billed per plan at purchase. Benefits activate instantly and are non-transferable. Refunds follow app-store policies.",
  "Notification Preferences":
    "Choose what you get notified about: match invites, Looking responses, order updates and PRO offers. Granular toggles arrive in the next update.",
  Language:
    "Current language: English. More languages are coming soon.",
  "Purchase History":
    "Your store orders will appear here with live tracking. Order history arrives together with the store backend.",
};

export default function InfoScreen({ navigation, route }) {
  const title = route?.params?.title || "Info";
  const body = BODIES[title] || "Details coming soon in the next update.";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <DreamHeader style={styles.header}>
        <HeaderIconBtn onPress={() => navigation?.goBack?.()} label="Back">
          <BackGlyph />
        </HeaderIconBtn>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 36 }} />
      </DreamHeader>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.text}>{body}</Text>
      </ScrollView>
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
    fontSize: 21,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  body: {
    padding: 18,
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: "#333",
  },
});
