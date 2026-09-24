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

const Tab = createBottomTabNavigator();

const RED = "#EA580C";

const TAB_ICONS = {
  Home: "🏠",
  Looking: "🔍",
  "My Cricket": "🏏",
  Community: "👥",
  Store: "🛒",
};

function TabIcon({ emoji, focused }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.icon, !focused && styles.iconDim]}>{emoji}</Text>
    </View>
  );
}

function StoreTabIcon({ focused }) {
  const { count } = useCart();
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Text style={[styles.icon, !focused && styles.iconDim]}>
        {TAB_ICONS.Store}
      </Text>
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
          tabBarIcon: ({ focused }) =>
            route.name === "Store" ? (
              <StoreTabIcon focused={focused} />
            ) : (
              <TabIcon emoji={TAB_ICONS[route.name] || "•"} focused={focused} />
            ),
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
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    paddingTop: 8,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
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
    backgroundColor: "#FFF1E6",
  },
  icon: {
    fontSize: 23,
  },
  iconDim: {
    fontSize: 22,
    opacity: 0.9,
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
