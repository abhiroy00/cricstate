import { createDrawerNavigator } from "@react-navigation/drawer";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import StartMatchScreen from "../screens/mycricket/StartMatchScreen";
import { DRAWER_ITEMS } from "../utils/drawerItems";
import MainTabs from "./MainTabs";
import ProfileStack from "./ProfileStack";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerTitle: "CricState" }}>
      <Drawer.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
      <Drawer.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
      <Drawer.Screen name="Start A Match" component={StartMatchScreen} />
      {DRAWER_ITEMS.map((title) => (
        <Drawer.Screen
          key={title}
          name={title}
          component={ComingSoonScreen}
          initialParams={{ title }}
        />
      ))}
    </Drawer.Navigator>
  );
}
