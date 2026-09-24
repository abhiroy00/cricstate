import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import HomeStack from "./HomeStack";
import StoreStack from "./StoreStack";
import { colors } from "../utils/theme";
import MyCricketStack from "./MyCricketStack";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: "🏠",
  Looking: "🔍",
  "My Cricket": "🏏",
  Community: "👥",
  Store: "🛒",
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: () => null,
        tabBarLabel: `${TAB_ICONS[route.name] || ""} ${route.name}`,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Looking" component={ComingSoonScreen} initialParams={{ title: "Looking" }} />
      <Tab.Screen name="My Cricket" component={MyCricketStack} />
      <Tab.Screen name="Community" component={ComingSoonScreen} initialParams={{ title: "Community" }} />
      <Tab.Screen name="Store" component={StoreStack} />
    </Tab.Navigator>
  );
}
