import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CreateTeamScreen from "../screens/mycricket/CreateTeamScreen";
import CreateTournamentScreen from "../screens/mycricket/CreateTournamentScreen";
import AiHighlightsScreen from "../screens/mycricket/AiHighlightsScreen";
import AllMatchesScreen from "../screens/mycricket/AllMatchesScreen";
import AnalyseScreen from "../screens/mycricket/AnalyseScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";
import FindCricketersScreen from "../screens/mycricket/FindCricketersScreen";
import JoinTeamScreen from "../screens/mycricket/JoinTeamScreen";
import MatchDetailScreen from "../screens/mycricket/MatchDetailScreen";
import MyCricketHomeScreen from "../screens/mycricket/MyCricketHomeScreen";
import ProBenefitsScreen from "../screens/mycricket/ProBenefitsScreen";
import StartMatchScreen from "../screens/mycricket/StartMatchScreen";
import TeamDetailScreen from "../screens/mycricket/TeamDetailScreen";
import TeamPickerScreen from "../screens/mycricket/TeamPickerScreen";
import TournamentDetailScreen from "../screens/mycricket/TournamentDetailScreen";

const Stack = createNativeStackNavigator();

export default function MyCricketStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyCricketHome" component={MyCricketHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: "Match" }} />
      <Stack.Screen name="AllMatches" component={AllMatchesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AiHighlights" component={AiHighlightsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProBenefits" component={ProBenefitsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Analyse" component={AnalyseScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="DirectMessages"
        component={DirectMessagesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="StartMatch" component={StartMatchScreen} options={{ title: "Start A Match" }} />
      <Stack.Screen name="TeamDetail" component={TeamDetailScreen} options={{ title: "Team" }} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} options={{ title: "Create Team" }} />
      <Stack.Screen name="TeamPicker" component={TeamPickerScreen} options={{ title: "Select Team" }} />
      <Stack.Screen name="JoinTeam" component={JoinTeamScreen} options={{ title: "Join A Team" }} />
      <Stack.Screen
        name="FindCricketers"
        component={FindCricketersScreen}
        options={{ headerShown: false }}
      />
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
