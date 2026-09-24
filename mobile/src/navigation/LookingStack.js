import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LookingScreen from "../screens/looking/LookingScreen";
import LookingCategoriesScreen from "../screens/looking/LookingCategoriesScreen";
import LookingFormScreen from "../screens/looking/LookingFormScreen";
import LiveStreamersScreen from "../screens/looking/LiveStreamersScreen";
import LiveFilterScreen from "../screens/looking/LiveFilterScreen";
import YourPostsScreen from "../screens/looking/YourPostsScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";
import ProBenefitsScreen from "../screens/mycricket/ProBenefitsScreen";
import { LookingProvider } from "../screens/looking/LookingContext";

const Stack = createNativeStackNavigator();

export default function LookingStack() {
  return (
    <LookingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LookingMain" component={LookingScreen} />
        <Stack.Screen name="LookingCategories" component={LookingCategoriesScreen} />
        <Stack.Screen name="LookingForm" component={LookingFormScreen} />
        <Stack.Screen name="LiveStreamers" component={LiveStreamersScreen} />
        <Stack.Screen name="LiveFilter" component={LiveFilterScreen} />
        <Stack.Screen name="YourPosts" component={YourPostsScreen} />
        <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
        <Stack.Screen name="ProBenefits" component={ProBenefitsScreen} />
      </Stack.Navigator>
    </LookingProvider>
  );
}
