import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import CommunityStack from "./CommunityStack";
import HomeStack from "./HomeStack";
import LookingStack from "./LookingStack";
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
      <Tab.Screen name="Looking" component={LookingStack} />
      <Tab.Screen name="My Cricket" component={MyCricketStack} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Store" component={StoreStack} />
    </Tab.Navigator>
  );
}
