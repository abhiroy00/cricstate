import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CommunityScreen from "../screens/community/CommunityScreen";
import CommunityListScreen from "../screens/community/CommunityListScreen";
import ScorersScreen from "../screens/community/ScorersScreen";
import UmpiresScreen from "../screens/community/UmpiresScreen";
import ProfileDetailScreen from "../screens/community/ProfileDetailScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={CommunityScreen} />
      <Stack.Screen name="Scorers" component={ScorersScreen} />
      <Stack.Screen name="Umpires" component={UmpiresScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="CommunityList" component={CommunityListScreen} />
      <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
    </Stack.Navigator>
  );
}
