import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DesignOfMonthScreen from "../screens/store/DesignOfMonthScreen";
import ClearanceScreen from "../screens/store/ClearanceScreen";
import PicksUnder499Screen from "../screens/store/PicksUnder499Screen";
import BestsellersScreen from "../screens/store/BestsellersScreen";
import ApparelShortsScreen from "../screens/store/ApparelShortsScreen";
import CartScreen from "../screens/store/CartScreen";
import NewArrivalsScreen from "../screens/store/NewArrivalsScreen";
import StoreScreen from "../screens/store/StoreScreen";
import TimelessClassicsScreen from "../screens/store/TimelessClassicsScreen";
import { CartProvider } from "../screens/store/StoreCartContext";

const Stack = createNativeStackNavigator();

export default function StoreStack() {
  return (
    <CartProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StoreHome" component={StoreScreen} />
        <Stack.Screen name="DesignOfMonth" component={DesignOfMonthScreen} />
        <Stack.Screen name="TimelessClassics" component={TimelessClassicsScreen} />
        <Stack.Screen name="Clearance" component={ClearanceScreen} />
        <Stack.Screen name="PicksUnder499" component={PicksUnder499Screen} />
        <Stack.Screen name="Bestsellers" component={BestsellersScreen} />
        <Stack.Screen name="ApparelShorts" component={ApparelShortsScreen} />
        <Stack.Screen name="NewArrivals" component={NewArrivalsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </CartProvider>
  );
}
