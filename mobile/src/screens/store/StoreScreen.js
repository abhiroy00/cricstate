import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import {
  BANNERS,
  CATEGORIES,
  PRODUCTS,
  RED,
  TEAL,
  formatINR,
  productsIn,
} from "../../data/storeData";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import { useCart } from "./StoreCartContext";
import StoreMenuDrawer from "./StoreMenuDrawer";
import AppLogo from "../../components/AppLogo";

function HeroBanner({ item, onPress }) {
  return (
    <View style={[styles.hero, { backgroundColor: item.bg }]}>
      <Text style={styles.heroTop}>{item.top}</Text>
      <Text style={styles.heroTitle}>{item.title}</Text>
      <View style={styles.heroModel}>
        <Text style={styles.heroModelEmoji}>🧍🏽</Text>
        <Text style={styles.heroModelShirt}>👕</Text>
      </View>
      <Text style={styles.heroLeftCollar}>👕</Text>
      <Text style={styles.heroRightCollar}>👕</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.heroCta}
        onPress={onPress}
      >
        <Text style={styles.heroCtaText}>{item.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

function StoreSearch({ visible, onClose, onPick }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const hits = query
    ? PRODUCTS.filter((p) =>
        `${p.name} ${p.brand}`.toLowerCase().includes(query)
      )
    : PRODUCTS.slice(0, 5);

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
              placeholder="Search jerseys, bats, balls..."
              value={q}
              onChangeText={setQ}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity hitSlop={8} onPress={onClose}>
              <Text style={styles.searchCancel}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={hits}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.searchHint}>
                No products for "{q}". Try another name.
              </Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.hitRow}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  onPick?.(item);
                }}
              >
                <View
                  style={[styles.hitThumb, { backgroundColor: item.bg }]}
                >
                  <Text style={styles.hitEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.hitMid}>
                  <Text style={styles.hitName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.hitPrice}>
                    {formatINR(item.price)}{" "}
                    <Text style={styles.hitMrp}>{formatINR(item.mrp)}</Text>
                  </Text>
                </View>
                <Text style={styles.hitArrow}>›</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const POLICY_TEXTS = {
  "Shipping Policy":
    "Orders ship within 24–48 hours. Metro cities get delivery in 2–4 days, rest of India in 4–7 days. Free shipping on orders above ₹999, flat ₹49 below that.",
  "Return & Exchange":
    "7-day easy size exchange on apparel. Equipment must be unused with tags intact. Personalised jerseys are non-returnable unless damaged or wrong item delivered.",
  "Privacy Policy":
    "Your name, address and order details are used only to fulfil orders and improve recommendations. We never sell your personal data to third parties.",
  "Terms of Use":
    "Prices include all taxes. Discount codes apply per offer terms. CricHeroes Store may cancel orders in case of pricing errors, with a full refund.",
};

// Drawer label -> [screen, title]. Every tappable menu item is covered.
const MENU_LINKS = {
  "Cricket Bats": ["Bestsellers", "Bestsellers"],
  Balls: ["PicksUnder499", "Picks Under ₹499"],
  Gloves: ["Bestsellers", "Bestsellers"],
  Pads: ["Bestsellers", "Bestsellers"],
  Helmets: ["Bestsellers", "Bestsellers"],
  "Kit Bags": ["Bestsellers", "Bestsellers"],
  Jerseys: ["DesignOfMonth", "Design of The Month"],
  Whites: ["TimelessClassics", "Timeless Classics"],
  "Track Pants": ["Clearance", "Clearance"],
  Caps: ["PicksUnder499", "Picks Under ₹499"],
  Shoes: ["Bestsellers", "Bestsellers"],
  Grips: ["PicksUnder499", "Picks Under ₹499"],
  Guards: ["PicksUnder499", "Picks Under ₹499"],
  Sunglasses: ["PicksUnder499", "Picks Under ₹499"],
  "Water Bottles": ["PicksUnder499", "Picks Under ₹499"],
  "New Launch": ["DesignOfMonth", "Design of The Month"],
  "New Arrivals": ["NewArrivals", "New Arrivals"],
  "Eternal Whites": ["TimelessClassics", "Timeless Classics"],
  Clearance: ["Clearance", "Clearance"],
  "Team Favourites": ["Bestsellers", "Bestsellers"],
};

function PolicyModal({ policy, onClose }) {
  return (
    <Modal
      visible={!!policy}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.searchDim}>
        <View style={styles.searchBox}>
          <View style={styles.policyHead}>
            <Text style={styles.policyTitle}>{policy}</Text>
            <TouchableOpacity hitSlop={8} onPress={onClose}>
              <Text style={styles.searchCancel}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.policyBody}>
              {POLICY_TEXTS[policy] || ""}
            </Text>
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function StoreScreen({ navigation }) {
  const { user } = useAuth();
  const { count } = useCart();
  const [activeBanner, setActiveBanner] = useState(0);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerApplied, setOfferApplied] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [policy, setPolicy] = useState(null);
  const bannerRef = useRef(null);
  const bannerIndex = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      bannerIndex.current = (bannerIndex.current + 1) % BANNERS.length;
      const w = Dimensions.get("window").width - 32;
      bannerRef.current?.scrollToOffset({
        offset: bannerIndex.current * w,
        animated: true,
      });
      setActiveBanner(bannerIndex.current);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const firstName = user?.full_name?.split(" ")?.[0] || "Anshmeet";
  const bestPages = useMemo(() => {
    const all = productsIn("bestsellers");
    const pages = [];
    for (let i = 0; i < all.length; i += 2) pages.push(all.slice(i, i + 2));
    return pages;
  }, []);
  const [bestPage, setBestPage] = useState(0);
  const newPages = useMemo(() => {
    const all = productsIn("new");
    const pages = [];
    for (let i = 0; i < all.length; i += 2) pages.push(all.slice(i, i + 2));
    return pages;
  }, []);
  const [newPage, setNewPage] = useState(0);

  const goCollection = (screen, title) =>
    navigation?.navigate?.(screen, { title });

  // Drawer khula ho aur tab switch ho to drawer band kar do
  useEffect(() => {
    const unsub = navigation?.addListener?.("blur", () =>
      setMenuVisible(false)
    );
    return unsub;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            hitSlop={12}
            onPress={() => navigation?.goBack?.()}
            style={styles.iconBtn}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <AppLogo size={30} />
          <Text style={styles.headerTitle}>Store</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => setSearchOpen(true)}
          >
            <Text style={styles.headerIcon}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={12}
            style={styles.iconBtn}
            onPress={() => navigation?.navigate?.("Cart")}
          >
            <Text style={styles.headerIcon}>🛍</Text>
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
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
              key={c.label}
              style={styles.pill}
              activeOpacity={0.8}
              onPress={() => goCollection(c.screen, c.title)}
            >
              <Text style={styles.pillEmoji}>{c.emoji}</Text>
              <Text style={styles.pillText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
              <HeroBanner
                item={item}
                onPress={() => goCollection(item.screen, item.params.title)}
              />
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

        <View style={styles.greetWrap}>
          <Text style={styles.greet}>
            <Text style={styles.greetEmoji}>👋 </Text> Hello, {firstName}
          </Text>
          <Text style={styles.trust}>
            <Text style={styles.trustBold}>135,576+ cricketers </Text>
            already trust us. Your turn!
          </Text>
        </View>

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
                Use code CRIC20 at checkout. Valid on Whites & New Launch. T&C
                apply.
              </Text>
              <TouchableOpacity
                style={[styles.offerBtn, offerApplied && styles.offerBtnDone]}
                onPress={() => setOfferApplied(true)}
              >
                <Text style={styles.offerBtnText}>
                  {offerApplied ? "Applied ✓" : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Best sellers</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => goCollection("Bestsellers", "Bestsellers")}
          >
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={bestPages}
          keyExtractor={(_, i) => `best-page-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const w = Dimensions.get("window").width;
            setBestPage(Math.round(e.nativeEvent.contentOffset.x / w));
          }}
          renderItem={({ item: pair }) => (
            <View style={styles.newPage}>
              {pair.map((p) => (
                <View key={p.id} style={styles.newCard}>
                  <ProductCard item={p} compact onPress={setSelected} />
                </View>
              ))}
            </View>
          )}
        />
        <View style={styles.dotsRow}>
          {bestPages.map((_, i) => (
            <View
              key={`best-dot-${i}`}
              style={[styles.dot, i === bestPage ? styles.dotActive : null]}
            />
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>New arrivals</Text>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => goCollection("NewArrivals", "New Arrivals")}
          >
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={newPages}
          keyExtractor={(_, i) => `new-page-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const w = Dimensions.get("window").width;
            setNewPage(Math.round(e.nativeEvent.contentOffset.x / w));
          }}
          renderItem={({ item: pair }) => (
            <View style={styles.newPage}>
              {pair.map((p) => (
                <View key={p.id} style={styles.newCard}>
                  <ProductCard item={p} compact onPress={setSelected} />
                </View>
              ))}
            </View>
          )}
        />
        <View style={styles.dotsRow}>
          {newPages.map((_, i) => (
            <View
              key={`new-dot-${i}`}
              style={[styles.dot, i === newPage ? styles.dotActive : null]}
            />
          ))}
        </View>
        <View style={{ height: 8 }} />
        <View style={{ height: 24 }} />
      </ScrollView>

      <StoreSearch
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onPick={setSelected}
      />

      <ProductDetailModal
        product={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        onBuyNow={() => {
          setSelected(null);
          navigation?.navigate?.("Cart");
        }}
      />

      <PolicyModal policy={policy} onClose={() => setPolicy(null)} />

      <StoreMenuDrawer
        visible={menuVisible}
        userName={firstName}
        onClose={() => setMenuVisible(false)}
        onExitStore={() => {
          setMenuVisible(false);
          navigation?.goBack?.();
        }}
        onContact={(type) => {
          setMenuVisible(false);
          const url =
            type === "email"
              ? "mailto:support@cricstate.app?subject=Store%20Query"
              : "https://wa.me/919999999999?text=Hi%2C%20I%20need%20help%20with%20my%20store%20order";
          Linking.openURL(url).catch(() => {});
        }}
        onSelect={(section) => {
          setMenuVisible(false);
          const label = section?.child || section?.label;
          if (label === "My Orders") {
            navigation?.navigate?.("Cart");
            return;
          }
          if (POLICY_TEXTS[label]) {
            setPolicy(label);
            return;
          }
          const found = CATEGORIES.find((c) => c.label === label);
          if (found) {
            goCollection(found.screen, found.title);
            return;
          }
          const link = MENU_LINKS[label];
          if (link) {
            goCollection(link[0], link[1]);
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
  pillEmoji: {
    fontSize: 15,
    marginRight: 6,
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
    color: "#fff",
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
    opacity: 0.3,
  },
  heroRightCollar: {
    position: "absolute",
    right: -22,
    top: 10,
    fontSize: 110,
    opacity: 0.3,
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
  offerBtnDone: {
    backgroundColor: TEAL,
  },
  offerBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  sectionLink: {
    fontSize: 15,
    color: TEAL,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  newPage: {
    width: Dimensions.get("window").width,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  newCard: {
    width: (Dimensions.get("window").width - 32 - 12) / 2,
  },
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
    maxHeight: "80%",
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
  policyHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    flex: 1,
    marginRight: 10,
  },
  policyBody: {
    fontSize: 15,
    lineHeight: 23,
    color: "#333",
  },
  searchHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  hitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  hitThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  hitEmoji: {
    fontSize: 30,
  },
  hitMid: {
    flex: 1,
  },
  hitName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  hitPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    marginTop: 2,
  },
  hitMrp: {
    fontSize: 12,
    color: "#B5B5B5",
    textDecorationLine: "line-through",
    fontWeight: "400",
  },
  hitArrow: {
    fontSize: 22,
    color: "#BBB",
    marginLeft: 8,
  },
});
