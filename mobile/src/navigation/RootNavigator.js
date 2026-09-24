import { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";

import IntroScreen from "../screens/auth/IntroScreen";
import SplashScreen from "../screens/auth/SplashScreen";
import { useAuth } from "../hooks/useAuth";
import AppDrawer from "./AppDrawer";
import AuthStack from "./AuthStack";

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);

  if (!introDone) {
    return <IntroScreen onDone={() => setIntroDone(true)} />;
  }

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>{isAuthenticated ? <AppDrawer /> : <AuthStack />}</NavigationContainer>
  );
}
