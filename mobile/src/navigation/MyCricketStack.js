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
import StartMatchTypeScreen from "../screens/mycricket/StartMatchTypeScreen";
import MatchTeamSelectScreen from "../screens/mycricket/MatchTeamSelectScreen";
import SelectSquadScreen from "../screens/mycricket/SelectSquadScreen";
import MatchSetupScreen from "../screens/mycricket/MatchSetupScreen";
import TossScreen from "../screens/mycricket/TossScreen";
import StartInningsScreen from "../screens/mycricket/StartInningsScreen";
import ScoringConsoleScreen from "../screens/mycricket/ScoringConsoleScreen";
import TeamDetailScreen from "../screens/mycricket/TeamDetailScreen";
import AddTeamsScreen from "../screens/mycricket/AddTeamsScreen";
import AddPlayerPhoneScreen from "../screens/mycricket/AddPlayerPhoneScreen";
import ContactsPickerScreen from "../screens/mycricket/ContactsPickerScreen";
import TeamPlayersScreen from "../screens/mycricket/TeamPlayersScreen";
import TournamentTeamCountScreen from "../screens/mycricket/TournamentTeamCountScreen";
import TournamentTeamsScreen from "../screens/mycricket/TournamentTeamsScreen";
import TeamPickerScreen from "../screens/mycricket/TeamPickerScreen";
import TournamentDetailScreen from "../screens/mycricket/TournamentDetailScreen";
import { StartMatchProvider } from "../context/StartMatchContext";

const Stack = createNativeStackNavigator();

export default function MyCricketStack() {
  return (
    <StartMatchProvider>
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
      <Stack.Screen name="StartMatch" component={StartMatchTypeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MatchTeamSelect" component={MatchTeamSelectScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectSquad" component={SelectSquadScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MatchSetup" component={MatchSetupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Toss" component={TossScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StartInnings" component={StartInningsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ScoringConsole" component={ScoringConsoleScreen} options={{ headerShown: false }} />
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TournamentTeamCount"
        component={TournamentTeamCountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TournamentTeams"
        component={TournamentTeamsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTeams"
        component={AddTeamsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TeamPlayers"
        component={TeamPlayersScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactsPicker"
        component={ContactsPickerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPlayerPhone"
        component={AddPlayerPhoneScreen}
        options={{ headerShown: false }}
      />
      </Stack.Navigator>
    </StartMatchProvider>
  );
}
