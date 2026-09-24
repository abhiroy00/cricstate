import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import StoreMenuDrawer from "./StoreMenuDrawer";

const RED = "#E02020";
const TEAL = "#0FA3A3";

const CATEGORIES = [
  "New Launch",
  "Whites",
  "Clearance",
  "Bats",
  "Bestsellers",
  "express",
  "T-Shirts",
  "Sleeveless Tanks",
  "Shorts",
  "Uppers",
  "Track Pants",
  "Compression Wear",
  "Batting",
  "Bowling",
  "Caps",
  "Hat",
  "Sleeves",
];

const BANNERS = [
  { id: "1", top: "Some classics never fade.", title: "Eternal\nWhites", cta: "Explore now" },
  { id: "2", top: "New season. New gear.", title: "Pro\nEdition", cta: "Shop now" },
  { id: "3", top: "Built for match day.", title: "Match\nReady", cta: "Explore now" },
  { id: "4", top: "Clearance sale live.", title: "Up to\n50% Off", cta: "Grab now" },
  { id: "5", top: "Trusted by pros.", title: "Team\nFavourites", cta: "View all" },
];

const PRODUCTS = [
  { id: "1", name: "Pro White Jersey", price: "₹999", tag: "Whites", emoji: "👕" },
  { id: "2", name: "English Willow Bat", price: "₹4,299", tag: "New", emoji: "🏏" },
  { id: "3", name: "Leather Ball (4pc)", price: "₹499", tag: "Best Seller", emoji: "🔴" },
];

function HeroBanner({ item }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroTop}>{item.top}</Text>
      <Text style={styles.heroTitle}>{item.title}</Text>

      {/* Centre model placeholder — replace with <Image> when assets are ready */}
      <View style={styles.heroModel}>
        <Text style={styles.heroModelEmoji}>🧍🏽</Text>
        <Text style={styles.heroModelShirt}>👕</Text>
      </View>

      {/* Side collar hints like the screenshot edges */}
      <Text style={styles.heroLeftCollar}>👕</Text>
      <Text style={styles.heroRightCollar}>👕</Text>

      <TouchableOpacity activeOpacity={0.85} style={styles.heroCta}>
        <Text style={styles.heroCtaText}>{item.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function StoreScreen({ navigation }) {
  const { user } = useAuth();
  const [activeBanner, setActiveBanner] = useState(0);
  const [offerOpen, setOfferOpen] = useState(false);
  const [cartCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const bannerRef = useRef(null);
  const sellerRef = useRef(null);
  const bannerIndex = useRef(0);
  const sellerIndex = useRef(0);

  // Auto-play hero banners every 3s
  useEffect(() => {
    const id = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % BANNERS.length;
      const w = Dimensions.get("window").width - 32;
      bannerRef.current?.scrollToOffset({
        offset: bannerIndex.current * w,
        animated: true,
      });
      setActiveBanner(bannerIndex.current);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Auto-play best sellers cards every 2.5s
  useEffect(() => {
    const id = setInterval(() => {
      sellerIndex.current = (sellerIndex.current + 1) % PRODUCTS.length;
      sellerRef.current?.scrollToOffset({
        offset: sellerIndex.current * 162,
        animated: true,
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const firstName = user?.full_name?.split(" ")?.[0] || "Anshmeet";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Red header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            hitSlop={12}
            onPress={() => navigation?.goBack?.()}
            style={styles.iconBtn}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🏏</Text>
          </View>
          <Text style={styles.headerTitle}>Store</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn}>
            <Text style={styles.headerIcon}>↗</Text>
          </TouchableOpacity>
          <TouchableOpacity hitSlop={12} style={styles.iconBtn}>
            <Text style={styles.headerIcon}>🛍</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Category pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          <TouchableOpacity
            style={styles.pill}
            activeOpacity={0.8}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.pillMenuIcon}>☰</Text>
            <Text style={styles.pillText}>Menu</Text>
          </TouchableOpacity>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={styles.pill}
              activeOpacity={0.8}
              onPress={() => {
                if (c === "New Launch") {
                  navigation?.navigate?.("DesignOfMonth", {
                    title: "Design of The Month",
                  });
                } else if (c === "Whites") {
                  navigation?.navigate?.("TimelessClassics", {
                    title: "Timeless Classics",
                  });
                } else if (c === "Clearance") {
                  navigation?.navigate?.("Clearance", {
                    title: "Clearance",
                  });
                } else if (c === "Bats") {
                  navigation?.navigate?.("PicksUnder499", {
                    title: "Picks Under ₹499",
                  });
                } else if (
                  c === "Batting" ||
                  c === "Bowling" ||
                  c === "Caps" ||
                  c === "Hat" ||
                  c === "Sleeves"
                ) {
                  navigation?.navigate?.("PicksUnder499", {
                    title: "Picks Under ₹499",
                  });
                } else if (c === "Bestsellers") {
                  navigation?.navigate?.("Bestsellers", {
                    title: "Bestsellers",
                  });
                } else if (c === "Shorts") {
                  navigation?.navigate?.("ApparelShorts", {
                    title: "Apparel - Shorts",
                  });
                } else if (
                  c === "express" ||
                  c === "T-Shirts" ||
                  c === "Sleeveless Tanks" ||
                  c === "Uppers" ||
                  c === "Track Pants" ||
                  c === "Compression Wear"
                ) {
                  navigation?.navigate?.("TimelessClassics", {
                    title: "Timeless Classics",
                  });
                }
              }}
            >
              <Text style={styles.pillText}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero carousel */}
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          onMomentumScrollEnd={(e) => {
            const w = Dimensions.get("window").width - 32;
            const idx = Math.round(e.nativeEvent.contentOffset.x / w);
            bannerIndex.current = idx;
            setActiveBanner(idx);
          }}
          renderItem={({ item }) => (
            <View style={styles.heroSlide}>
              <HeroBanner item={item} />
            </View>
          )}
        />
        <View style={styles.dotsRow}>
          {BANNERS.map((b, i) => (
            <View
              key={b.id}
              style={[styles.dot, i === activeBanner ? styles.dotActive : null]}
            />
          ))}
        </View>

        {/* Greeting */}
        <View style={styles.greetWrap}>
          <Text style={styles.greet}>
            <Text style={styles.greetEmoji}>👋 </Text> Hello, {firstName}
          </Text>
          <Text style={styles.trust}>
            <Text style={styles.trustBold}>135,576+ cricketers </Text>
            already trust us. Your turn!
          </Text>
        </View>

        {/* Offer card */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.offerCard}
          onPress={() => setOfferOpen((v) => !v)}
        >
          <View style={styles.offerRow}>
            <View style={styles.offerLeft}>
              <Text style={styles.offerEmoji}>🌟</Text>
              <Text style={styles.offerText}>20% off</Text>
            </View>
            <View style={styles.offerRight}>
              <Text style={styles.offerCount}>1 offer</Text>
              <Text style={styles.offerArrow}>{offerOpen ? "∧" : "∨"}</Text>
            </View>
          </View>
          {offerOpen && (
            <View style={styles.offerDetail}>
              <Text style={styles.offerDetailText}>
                Use code CRIC20 at checkout. Valid on Whites & New Launch. T&C apply.
              </Text>
              <TouchableOpacity style={styles.offerBtn}>
                <Text style={styles.offerBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        {/* Best sellers swiper */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation?.navigate?.("Bestsellers", { title: "Bestsellers" })
          }
        >
          <Text style={styles.sectionTitle}>Best sellers</Text>
        </TouchableOpacity>
        <FlatList
          ref={sellerRef}
          data={PRODUCTS}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}
          snapToInterval={162}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                navigation?.navigate?.("Bestsellers", { title: "Bestsellers" })
              }
            >
              <View style={styles.cardImage}>
                <Text style={styles.cardEmoji}>{p.emoji}</Text>
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>{p.tag}</Text>
                </View>
              </View>
              <Text style={styles.cardName} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={styles.cardPrice}>{p.price}</Text>
            </TouchableOpacity>
          )}
        />
        <View style={{ height: 24 }} />
      </ScrollView>

      <StoreMenuDrawer
        visible={menuVisible}
        userName={firstName}
        onClose={() => setMenuVisible(false)}
        onExitStore={() => {
          setMenuVisible(false);
          navigation?.goBack?.();
        }}
        onSelect={(section) => {
          setMenuVisible(false);
          const label = section?.child || section?.label;
          if (label === "New Launch") {
            navigation?.navigate?.("DesignOfMonth", {
              title: "Design of The Month",
            });
          } else if (
            label === "Whites" ||
            label === "Eternal Whites" ||
            label === "Apparel"
          ) {
            navigation?.navigate?.("TimelessClassics", {
              title: "Timeless Classics",
            });
          } else if (label === "Clearance") {
            navigation?.navigate?.("Clearance", {
              title: "Clearance",
            });
          } else if (
            label === "Bats" ||
            label === "Balls" ||
            label === "Cricket Bats" ||
            label === "Equipment" ||
            label === "Accessories"
          ) {
            navigation?.navigate?.("PicksUnder499", {
              title: "Picks Under ₹499",
            });
          } else if (
            label === "Team Favourites" ||
            label === "Collection" ||
            label === "My Orders"
          ) {
            navigation?.navigate?.("Bestsellers", {
              title: "Bestsellers",
            });
          }
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
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    padding: 6,
  },
  headerIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
  },
  logoWrap: {
    backgroundColor: "#fff",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  logoEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 6,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: RED,
    fontSize: 11,
    fontWeight: "800",
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pillsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  pillMenuIcon: {
    fontSize: 16,
    marginRight: 6,
    fontWeight: "700",
  },
  pillText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "500",
  },
  heroSlide: {
    width: Dimensions.get("window").width - 32,
    marginHorizontal: 16,
  },
  hero: {
    backgroundColor: "#6E6E6E",
    borderRadius: 18,
    overflow: "hidden",
    minHeight: 380,
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 86,
    position: "relative",
  },
  heroTop: {
    color: "#E8E8E8",
    fontSize: 14,
  },
  heroTitle: {
    color: "#D9D9D9",
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 60,
    textAlign: "center",
    marginTop: 4,
    letterSpacing: -1,
  },
  heroModel: {
    marginTop: 6,
    alignItems: "center",
  },
  heroModelEmoji: {
    fontSize: 150,
    marginBottom: -46,
  },
  heroModelShirt: {
    fontSize: 88,
  },
  heroLeftCollar: {
    position: "absolute",
    left: -22,
    bottom: 30,
    fontSize: 110,
    opacity: 0.95,
  },
  heroRightCollar: {
    position: "absolute",
    right: -22,
    top: 10,
    fontSize: 110,
    opacity: 0.95,
  },
  heroCta: {
    position: "absolute",
    bottom: 28,
    backgroundColor: TEAL,
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  heroCtaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#BDBDBD",
    marginHorizontal: 5,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#BDBDBD",
  },
  greetWrap: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
  },
  greet: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111",
  },
  greetEmoji: {
    fontSize: 28,
  },
  trust: {
    fontSize: 17,
    color: "#111",
    marginTop: 8,
    textAlign: "center",
  },
  trustBold: {
    fontWeight: "800",
  },
  offerCard: {
    backgroundColor: "#F1F1F1",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 26,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  offerText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  offerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerCount: {
    fontSize: 16,
    color: "#8A8A8A",
    marginRight: 10,
  },
  offerArrow: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  offerDetail: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offerDetailText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    marginRight: 10,
  },
  offerBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  offerBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
    color: "#111",
  },
  productsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 14,
    padding: 10,
  },
  cardImage: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 52,
  },
  cardTag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#111",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    color: "#111",
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
    color: "#111",
  },
});
