import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MatchDetailScreen from "../screens/mycricket/MatchDetailScreen";
import MatchListScreen from "../screens/mycricket/MatchListScreen";

const Stack = createNativeStackNavigator();

export default function MyCricketStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MatchList" component={MatchListScreen} options={{ title: "My Cricket" }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: "Match" }} />
    </Stack.Navigator>
  );
}
