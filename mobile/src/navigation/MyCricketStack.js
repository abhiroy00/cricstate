import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateTeamScreen from "../screens/mycricket/CreateTeamScreen";
import CreateTournamentScreen from "../screens/mycricket/CreateTournamentScreen";
import JoinTeamScreen from "../screens/mycricket/JoinTeamScreen";
import MatchDetailScreen from "../screens/mycricket/MatchDetailScreen";
import MyCricketHomeScreen from "../screens/mycricket/MyCricketHomeScreen";
import StartMatchScreen from "../screens/mycricket/StartMatchScreen";
import TeamDetailScreen from "../screens/mycricket/TeamDetailScreen";
import TeamPickerScreen from "../screens/mycricket/TeamPickerScreen";
import TournamentDetailScreen from "../screens/mycricket/TournamentDetailScreen";

const Stack = createNativeStackNavigator();

export default function MyCricketStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyCricketHome" component={MyCricketHomeScreen} options={{ title: "My Cricket" }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: "Match" }} />
      <Stack.Screen name="StartMatch" component={StartMatchScreen} options={{ title: "Start A Match" }} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: "Team" }} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: "Create Team" }} />
      <Stack.Screen name="TeamPicker" component={TeamPickerScreen} options={{ title: "Select Team" }} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} options={{ title: "Join A Team" }} />
      <Stack.Screen
        name="TournamentDetail"
        component={TournamentDetailScreen}
        options={{ title: "Tournament" }}
      />
      <Stack.Screen
        name="CreateTournament"
        component={CreateTournamentScreen}
        options={{ title: "Host a Tournament" }}
      />
    </Stack.Navigator>
  );
}
