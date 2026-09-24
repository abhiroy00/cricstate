import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LookingScreen from "../screens/looking/LookingScreen";
import LookingCategoriesScreen from "../screens/looking/LookingCategoriesScreen";
import YourPostsScreen from "../screens/looking/YourPostsScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";
import { LookingProvider } from "../screens/looking/LookingContext";

const Stack = createNativeStackNavigator();

export default function LookingStack() {
  return (
    <LookingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LookingMain" component={LookingScreen} />
        <Stack.Screen name="LookingCategories" component={LookingCategoriesScreen} />
        <Stack.Screen name="YourPosts" component={YourPostsScreen} />
        <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
      </Stack.Navigator>
    </LookingProvider>
  );
}
