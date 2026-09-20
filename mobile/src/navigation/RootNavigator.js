import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "../screens/auth/SplashScreen";
import { useAuth } from "../hooks/useAuth";
import AppDrawer from "./AppDrawer";
import AuthStack from "./AuthStack";

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>{isAuthenticated ? <AppDrawer /> : <AuthStack />}</NavigationContainer>
  );
}
