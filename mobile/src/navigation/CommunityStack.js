import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CommunityScreen from "../screens/community/CommunityScreen";
import CommunityListScreen from "../screens/community/CommunityListScreen";
import ScorersScreen from "../screens/community/ScorersScreen";
import UmpiresScreen from "../screens/community/UmpiresScreen";
import CommentatorsScreen from "../screens/community/CommentatorsScreen";
import StreamersScreen from "../screens/community/StreamersScreen";
import StreamerDetailScreen from "../screens/community/StreamerDetailScreen";
import OrganisersScreen from "../screens/community/OrganisersScreen";
import OrganiserDetailScreen from "../screens/community/OrganiserDetailScreen";
import AcademiesScreen from "../screens/community/AcademiesScreen";
import AcademyDetailScreen from "../screens/community/AcademyDetailScreen";
import GroundsScreen from "../screens/community/GroundsScreen";
import GroundDetailScreen from "../screens/community/GroundDetailScreen";
import BoxCricketScreen from "../screens/community/BoxCricketScreen";
import BoxDetailScreen from "../screens/community/BoxDetailScreen";
import ProfileDetailScreen from "../screens/community/ProfileDetailScreen";
import RoleBoardScreen from "../screens/community/RoleBoardScreen";
import CricLeaderboardsHomeScreen from "../screens/community/CricLeaderboardsHomeScreen";
import CricLeaderboardDetailScreen from "../screens/community/CricLeaderboardDetailScreen";
import TopTeamsScreen from "../screens/community/TopTeamsScreen";
import AddRoleScreen from "../screens/community/AddRoleScreen";
import DirectMessagesScreen from "../screens/mycricket/DirectMessagesScreen";
import ProBenefitsScreen from "../screens/mycricket/ProBenefitsScreen";

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CommunityHome" component={CommunityScreen} />
      <Stack.Screen name="Scorers" component={ScorersScreen} />
      <Stack.Screen name="Umpires" component={UmpiresScreen} />
      <Stack.Screen name="Commentators" component={CommentatorsScreen} />
      <Stack.Screen name="Streamers" component={StreamersScreen} />
      <Stack.Screen name="StreamerDetail" component={StreamerDetailScreen} />
      <Stack.Screen name="Organisers" component={OrganisersScreen} />
      <Stack.Screen name="OrganiserDetail" component={OrganiserDetailScreen} />
      <Stack.Screen name="Academies" component={AcademiesScreen} />
      <Stack.Screen name="AcademyDetail" component={AcademyDetailScreen} />
      <Stack.Screen name="Grounds" component={GroundsScreen} />
      <Stack.Screen name="GroundDetail" component={GroundDetailScreen} />
      <Stack.Screen name="BoxCricket" component={BoxCricketScreen} />
      <Stack.Screen name="BoxDetail" component={BoxDetailScreen} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen name="CommunityList" component={CommunityListScreen} />
      <Stack.Screen name="RoleBoard" component={RoleBoardScreen} />
      <Stack.Screen name="CricLeaderboardsHome" component={CricLeaderboardsHomeScreen} />
      <Stack.Screen name="CricLeaderboardDetail" component={CricLeaderboardDetailScreen} />
      <Stack.Screen name="TopTeams" component={TopTeamsScreen} />
      <Stack.Screen name="AddRole" component={AddRoleScreen} />
      <Stack.Screen name="DirectMessages" component={DirectMessagesScreen} />
      <Stack.Screen name="ProBenefits" component={ProBenefitsScreen} />
    </Stack.Navigator>
  );
}
