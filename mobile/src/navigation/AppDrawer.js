import { createDrawerNavigator } from "@react-navigation/drawer";

import InfoScreen from "../screens/common/InfoScreen";
import MainTabs from "./MainTabs";
import ProfileStack from "./ProfileStack";
import AppDrawerContent from "./AppDrawerContent";

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false, drawerStyle: { width: "82%" } }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="Main" component={MainTabs} />
      <Drawer.Screen name="ProfileRoot" component={ProfileStack} />
      <Drawer.Screen name="Info" component={InfoScreen} />
    </Drawer.Navigator>
  );
}
