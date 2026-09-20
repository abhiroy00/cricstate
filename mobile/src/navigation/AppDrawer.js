import { createDrawerNavigator } from "@react-navigation/drawer";

import ComingSoonScreen from "../screens/common/ComingSoonScreen";
import { DRAWER_ITEMS } from "../utils/drawerItems";
import MainTabs from "./MainTabs";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator screenOptions={{ headerTitle: "CricState" }}>
      <Drawer.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
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
