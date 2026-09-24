import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/home/HomeScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";
import ProBenefitsScreen from "../screens/mycricket/ProBenefitsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
      <Stack.Screen name="ProBenefits" component={ProBenefitsScreen} />
    </Stack.Navigator>
  );
}
