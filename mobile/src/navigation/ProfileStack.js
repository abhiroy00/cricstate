import { createNativeStackNavigator } from "@react-navigation/native-stack";

import EditProfileScreen from "../screens/profile/EditProfileScreen";
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
        name="ProBenefits"
        component={ProBenefitsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
