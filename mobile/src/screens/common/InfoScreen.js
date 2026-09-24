import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DreamHeader from "../../components/DreamHeader";
import { BackGlyph, HeaderIconBtn } from "../../components/HeaderIcon";

const RED = "#E01A22";
const TEAL = "#00A651";
const NAVY = "#171A4B";
const GOLD = "#FFC42E";
const SUPPORT_PHONE = "+91 99999 99999";
const SUPPORT_TEL = "tel:+919999999999";
const SUPPORT_MAIL = "mailto:support@cricstate.app?subject=CricState%20Help";
const SUPPORT_WA = "https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20CricState";
const APP_CODE = "CRIC2026";

// Har info page apne related section/link ke saath khule

function Para({ children }) {
  return <Text style={styles.text}>{children}</Text>;
}

function Bullets({ items }) {
  return (
    <View style={styles.bulletWrap}>
      {items.map((b) => (
        <View key={b} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function LinkBtn({ icon, label, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.linkCard} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.linkIcon}>
        <Text style={styles.linkIconText}>{icon}</Text>
      </View>
      <View style={styles.linkMid}>
        <Text style={styles.linkLabel}>{label}</Text>
        {sub ? <Text style={styles.linkSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.linkArrow}>›</Text>
    </TouchableOpacity>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqCard}>
      <TouchableOpacity
        style={styles.faqHead}
        activeOpacity={0.7}
        onPress={() => setOpen((v) => !v)}
      >
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqArrow}>{open ? "∧" : "∨"}</Text>
      </TouchableOpacity>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </View>
  );
}

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleMid}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sub ? <Text style={styles.toggleSub}>{sub}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: TEAL }} />
    </View>
  );
}

export default function InfoScreen({ navigation, route }) {
  const title = route?.params?.title || "Info";
  const [notif, setNotif] = useState({
    invites: true,
    looking: true,
    orders: true,
    offers: false,
  });

  // Related tab section kholo (drawer ke bahar se bhi)
  const goMain = (tab, screen, params) => {
    const payload = screen ? { screen, params } : undefined;
    navigation?.navigate?.("Main", {
      screen: tab,
      ...(payload ? { params: payload } : {}),
    });
  };
  const goDrawer = (screen, params) => navigation?.navigate?.(screen, params);

  const openLink = async (url, label = "Link") => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) throw new Error("unsupported");
      await Linking.openURL(url);
    } catch {
      Alert.alert(label, "Link khul nahi paya. Internet check karke retry karo.");
    }
  };

  const shareCode = () =>
    Share.share({ message: `CricState pe aao! Mera app code: ${APP_CODE}` }).catch(() => {});

  const renderBody = () => {
    switch (title) {
      case "CricHeroes Awards":
        return (
          <>
            <Para>
              CricHeroes Awards celebrate the best performers across matches,
              tournaments and leaderboards. Top run-getters, wicket-takers and
              MVPs earn badges, trophies and PRO rewards every season.
            </Para>
            <SectionTitle>Season categories</SectionTitle>
            <Bullets
              items={[
                "🏏 Best Batter — most runs of the season",
                "🔥 Best Bowler — most wickets of the season",
                "🧤 Best Fielder — most catches + run-outs",
                "🏆 MVP — highest overall impact points",
              ]}
            />
            <SectionTitle>Related sections</SectionTitle>
            <LinkBtn
              icon="🏵"
              label="View Leaderboards"
              sub="See who is topping this season"
              onPress={() => goMain("Community", "CricLeaderboardsHome")}
            />
            <LinkBtn
              icon="🏅"
              label="Go PRO"
              sub="Unlock awards eligibility + badge"
              onPress={() => goDrawer("ProBenefits")}
            />
          </>
        );
      case "Associations":
        return (
          <>
            <Para>
              Associations organise official tournaments, manage grounds and
              certify umpires and scorers in your region. Join your district
              association to play recognised cricket.
            </Para>
            <SectionTitle>Related sections</SectionTitle>
            <LinkBtn
              icon="🤝"
              label="Browse Organisers"
              sub="Find associations running tournaments"
              onPress={() => goMain("Community", "Organisers")}
            />
            <LinkBtn
              icon="🏟"
              label="Find Grounds"
              sub="Association-approved venues near you"
              onPress={() => goMain("Community", "Grounds")}
            />
            <LinkBtn
              icon="🏆"
              label="Join a Tournament"
              sub="Play an official tournament"
              onPress={() => goMain("My Cricket", "MyCricketHome", { section: "TOURNAMENTS" })}
            />
          </>
        );
      case "Clubs":
        return (
          <>
            <Para>
              Clubs bring players together for regular matches, practice
              sessions and tournaments. Create or join a club to build your
              squad and track team stats.
            </Para>
            <SectionTitle>Related sections</SectionTitle>
            <LinkBtn
              icon="👥"
              label="My Teams"
              sub="Your clubs and squads live here"
              onPress={() => goMain("My Cricket", "MyCricketHome", { section: "TEAMS" })}
            />
            <LinkBtn
              icon="🔍"
              label="Find Cricketers"
              sub="Invite players to your club"
              onPress={() => goMain("My Cricket", "FindCricketers")}
            />
            <LinkBtn
              icon="➕"
              label="Create a Team"
              sub="Start your own club today"
              onPress={() => goMain("My Cricket", "CreateTeam")}
            />
          </>
        );
      case "Contact":
        return (
          <>
            <Para>
              Need help? Mon–Sat, 10am–7pm. Neeche kisi bhi option se baat
              karo — hum jaldi reply karte hain.
            </Para>
            <LinkBtn
              icon="📞"
              label={`Call ${SUPPORT_PHONE}`}
              sub="Mon–Sat, 10am–7pm"
              onPress={() => openLink(SUPPORT_TEL, "Call")}
            />
            <LinkBtn
              icon="✉️"
              label="Email support@cricstate.app"
              sub="Order + app queries"
              onPress={() => openLink(SUPPORT_MAIL, "Email")}
            />
            <LinkBtn
              icon="💬"
              label="WhatsApp us"
              sub="Fastest reply for orders"
              onPress={() => openLink(SUPPORT_WA, "WhatsApp")}
            />
          </>
        );
      case "App code":
        return (
          <>
            <Para>
              Your referral app code is {APP_CODE}. Share it with friends —
              you both unlock PRO trial days when they join with your code.
            </Para>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{APP_CODE}</Text>
            </View>
            <LinkBtn
              icon="↗"
              label="Share my code"
              sub="Doston ko bhejo, PRO trial pao"
              onPress={shareCode}
            />
            <LinkBtn
              icon="🏅"
              label="See PRO benefits"
              sub="What trial unlocks for you"
              onPress={() => goDrawer("ProBenefits")}
            />
          </>
        );
      case "What's New":
        return (
          <>
            <Bullets
              items={[
                "Brand-new Store with cart, wishlist and offers",
                "CricHeroes-style leaderboards: Overall, Women's, Teams",
                "Looking section with 10 categories and filters",
                "Live streamers directory with ratings",
                "Community leaderboards for scorers, umpires and commentators",
              ]}
            />
            <SectionTitle>Try it now</SectionTitle>
            <LinkBtn
              icon="🛒"
              label="Open Store"
              sub="New arrivals + clearance deals"
              onPress={() => goMain("Store", "StoreHome")}
            />
            <LinkBtn
              icon="🏵"
              label="Open Leaderboards"
              sub="Overall, Women's and Teams"
              onPress={() => goMain("Community", "CricLeaderboardsHome")}
            />
          </>
        );
      case "About Us":
        return (
          <>
            <Para>
              CricState is home for grassroots cricket — scoring, tournaments,
              performance tracking, shopping and community, all in one app.
            </Para>
            <SectionTitle>Follow us</SectionTitle>
            <LinkBtn
              icon="📷"
              label="Instagram"
              onPress={() => openLink("https://www.instagram.com/", "Instagram")}
            />
            <LinkBtn
              icon="▶️"
              label="YouTube"
              onPress={() => openLink("https://www.youtube.com/", "YouTube")}
            />
            <LinkBtn
              icon="📘"
              label="Facebook"
              onPress={() => openLink("https://www.facebook.com/", "Facebook")}
            />
            <LinkBtn
              icon="✖️"
              label="X"
              onPress={() => openLink("https://x.com/", "X")}
            />
          </>
        );
      case "Blog":
        return (
          <>
            <Para>
              Grassroots cricket stories, scoring tips, tournament guides and
              product reviews. New posts drop every week.
            </Para>
            <LinkBtn
              icon="📰"
              label="5 scoring mistakes beginners make"
              sub="Scoring guide • 4 min read"
              onPress={() => goMain("My Cricket", "StartMatch")}
            />
            <LinkBtn
              icon="📰"
              label="How to host your first tournament"
              sub="Tournament guide • 6 min read"
              onPress={() => goMain("My Cricket", "CreateTournament")}
            />
            <LinkBtn
              icon="📰"
              label="Pick the right bat: complete guide"
              sub="Gear guide • 5 min read"
              onPress={() => goMain("Store", "StoreHome")}
            />
          </>
        );
      case "Help / FAQs":
        return (
          <>
            <FaqItem
              q="How do I start a match?"
              a="Go to My Cricket → Start A Match, pick your teams and overs, then start scoring ball by ball."
            />
            <FaqItem
              q="How do I post in Looking?"
              a="Open Looking → Post → pick a category (player, team, ground...) and fill the form. Responses land in Direct Messages."
            />
            <FaqItem
              q="How do I track my store order?"
              a="Open the Store → Menu → My Orders. For help, ping us on WhatsApp from the Contact page."
            />
            <FaqItem
              q="How do leaderboards work?"
              a="Ranks come from batting, bowling and fielding stats across India — all time, all overs. PRO members get verified badges."
            />
            <SectionTitle>Still stuck?</SectionTitle>
            <LinkBtn
              icon="📞"
              label="Contact support"
              sub={`${SUPPORT_PHONE} • Mon–Sat`}
              onPress={() => goDrawer("Info", { title: "Contact" })}
            />
            <LinkBtn
              icon="⏱"
              label="Start a match"
              sub="Scoring setup in 2 minutes"
              onPress={() => goMain("My Cricket", "StartMatch")}
            />
          </>
        );
      case "Privacy Policy":
        return (
          <>
            <Para>
              Your name, contact details and order information are used only
              to run the app and fulfil orders. We never sell your personal
              data to third parties.
            </Para>
            <Bullets
              items={[
                "Order details are used only for delivery + support",
                "Location is used only for nearby matches and grounds",
                "You can request data deletion anytime via Contact",
              ]}
            />
          </>
        );
      case "Terms of Service":
        return (
          <>
            <Para>
              By using CricState you agree to fair play, accurate scoring and
              respectful conduct. Accounts violating policies may be suspended.
            </Para>
            <Bullets
              items={[
                "Score honestly — fake scores lead to suspension",
                "Respect players, umpires and scorers in chat",
                "Store prices include all taxes; offers follow T&C",
              ]}
            />
          </>
        );
      case "Paid Service Terms":
        return (
          <>
            <Para>
              PRO is billed per plan at purchase. Benefits activate instantly
              and are non-transferable. Refunds follow app-store policies.
            </Para>
            <LinkBtn
              icon="🏅"
              label="See PRO benefits"
              sub="Plans from ₹199, no autopay"
              onPress={() => goDrawer("ProBenefits")}
            />
          </>
        );
      case "Notification Preferences":
        return (
          <>
            <Para>Choose what you get notified about:</Para>
            <ToggleRow
              label="Match invites"
              sub="Team + tournament invites"
              value={notif.invites}
              onChange={(v) => setNotif((s) => ({ ...s, invites: v }))}
            />
            <ToggleRow
              label="Looking responses"
              sub="Replies to your posts"
              value={notif.looking}
              onChange={(v) => setNotif((s) => ({ ...s, looking: v }))}
            />
            <ToggleRow
              label="Order updates"
              sub="Store shipping + delivery"
              value={notif.orders}
              onChange={(v) => setNotif((s) => ({ ...s, orders: v }))}
            />
            <ToggleRow
              label="PRO offers"
              sub="Deals and new launches"
              value={notif.offers}
              onChange={(v) => setNotif((s) => ({ ...s, offers: v }))}
            />
          </>
        );
      case "Purchase History":
        return (
          <>
            <Para>
              Your store orders will appear here with live tracking. Order
              history arrives together with the store backend.
            </Para>
            <LinkBtn
              icon="🛒"
              label="Go to Store"
              sub="Browse jerseys, bats and more"
              onPress={() => goMain("Store", "StoreHome")}
            />
            <LinkBtn
              icon="🧾"
              label="My cart"
              sub="Checkout pending items"
              onPress={() => goMain("Store", "Cart")}
            />
          </>
        );
      case "Language":
        return <Para>Current language is managed from the drawer → More → Change Language.</Para>;
      default:
        return <Para>Details coming soon in the next update.</Para>;
    }
  };

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
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {renderBody()}
        <View style={{ height: 24 }} />
      </ScrollView>
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
    paddingBottom: 15,
    shadowColor: "#A60E14",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  body: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: RED,
    paddingLeft: 8,
  },
  bulletWrap: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 16,
    color: RED,
    fontWeight: "800",
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  linkIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F8D7D9",
    alignItems: "center",
    justifyContent: "center",
  },
  linkIconText: {
    fontSize: 22,
  },
  linkMid: {
    flex: 1,
    marginLeft: 12,
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  linkSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  linkArrow: {
    fontSize: 26,
    color: RED,
    fontWeight: "300",
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
    overflow: "hidden",
  },
  faqHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  faqQ: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 10,
  },
  faqArrow: {
    fontSize: 16,
    color: RED,
    fontWeight: "700",
  },
  faqA: {
    fontSize: 14,
    lineHeight: 21,
    color: "#555",
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  toggleMid: {
    flex: 1,
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  toggleSub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  codeBox: {
    backgroundColor: NAVY,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  codeText: {
    color: GOLD,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 4,
  },
});
