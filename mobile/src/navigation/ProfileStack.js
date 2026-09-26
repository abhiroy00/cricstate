import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EditProfileScreen from "../screens/profile/EditProfileScreen";
import NotificationPrefsScreen from "../screens/profile/NotificationPrefsScreen";
import OrdersScreen from "../screens/profile/OrdersScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ProBenefitsScreen from "../screens/mycricket/ProBenefitsScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Stack.Screen
        name="NotificationPrefs"
        component={NotificationPrefsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProBenefits"
        component={ProBenefitsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
