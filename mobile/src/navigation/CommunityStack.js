import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CommunityScreen from "../screens/community/CommunityScreen";
import RoleBoardScreen from "../screens/community/RoleBoardScreen";
import AddRoleScreen from "../screens/community/AddRoleScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityMain" component={CommunityScreen} />
      <Stack.Screen name="RoleBoard" component={RoleBoardScreen} />
      <Stack.Screen name="AddRole" component={AddRoleScreen} />
      <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
    </Stack.Navigator>
  );
}
