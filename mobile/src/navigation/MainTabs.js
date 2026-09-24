import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import HomeStack from "./HomeStack";
import StoreStack from "./StoreStack";
import { CartProvider, useCart } from "../screens/store/StoreCartContext";
import MyCricketStack from "./MyCricketStack";
import CommunityStack from "./CommunityStack";
import LookingStack from "./LookingStack";
import {
  CommunityGlyph,
  CricketGlyph,
  HomeGlyph,
  SearchTabGlyph,
  StoreTabGlyph,
} from "../components/TabGlyphs";

const Tab = createBottomTabNavigator();

const RED = "#E01A22";
const RED_DARK = "#A60E14";
const GOLD = "#FFC42E";
const GREY = "#9AA0AE";

function GlyphFor({ name, focused }) {
  const color = focused ? RED : GREY;
  switch (name) {
    case "Home":
      return <HomeGlyph color={color} />;
    case "Looking":
      return <SearchTabGlyph color={color} active={focused} />;
    case "Community":
      return <CommunityGlyph color={color} />;
    case "Store":
      return <StoreTabGlyph color={color} active={focused} />;
    default:
      return <CricketGlyph color={color} />;
  }
}

function TabIcon({ name, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <GlyphFor name={name} focused={focused} />
    </View>
  );
}

// Dream11-jaisa center raised button (My Cricket)
function CenterTabIcon({ focused }) {
  return (
    <View style={styles.centerWrap}>
      <View style={[styles.centerBtn, focused && styles.centerBtnActive]}>
        <CricketGlyph color={RED} onRed />
      </View>
    </View>
  );
}

function StoreTabIcon({ focused }) {
  const { count } = useCart();
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <GlyphFor name="Store" focused={focused} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <CartProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: RED,
          tabBarInactiveTintColor: "#8A8A8A",
          tabBarStyle: [
            styles.bar,
            { height: 68 + insets.bottom, paddingBottom: 10 + insets.bottom },
          ],
          tabBarLabelStyle: styles.label,
          tabBarIcon: ({ focused }) => {
            if (route.name === "Store") return <StoreTabIcon focused={focused} />;
            if (route.name === "My Cricket")
              return <CenterTabIcon focused={focused} />;
            return <TabIcon name={route.name} focused={focused} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Looking" component={LookingStack} />
        <Tab.Screen name="My Cricket" component={MyCricketStack} />
        <Tab.Screen name="Community" component={CommunityStack} />
        <Tab.Screen name="Store" component={StoreStack} />
      </Tab.Navigator>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#fff",
    borderTopWidth: 2,
    borderTopColor: RED,
    paddingTop: 8,
    elevation: 12,
    shadowColor: RED,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  iconWrap: {
    width: 46,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#FDE7E8",
    borderWidth: 1,
    borderColor: "#F8C4C6",
  },
  // Center raised Dream11-style button
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 40,
  },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: RED,
    borderWidth: 2.5,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    shadowColor: RED_DARK,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centerBtnActive: {
    backgroundColor: RED_DARK,
    transform: [{ scale: 1.06 }],
  },
  badge: {
    position: "absolute",
    top: -2,
    right: 2,
    backgroundColor: RED,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
