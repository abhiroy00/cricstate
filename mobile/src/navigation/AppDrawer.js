import { createDrawerNavigator } from "@react-navigation/drawer";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import { DRAWER_ITEMS } from "../utils/drawerItems";
import MainTabs from "./MainTabs";
import ProfileStack from "./ProfileStack";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerTitle: "CricState" }}>
      <Drawer.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false, drawerLabel: "Home", title: "CricState" }}
      />
      <Drawer.Screen
        name="ProfileRoot"
        component={ProfileStack}
        options={{ headerShown: false, drawerLabel: "Profile", title: "Profile" }}
      />
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
