import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import SplashScreen from "../screens/SplashScreen";
import AuthStack from "./AuthStack";
import MainStack from "./MainStack";

export default function AppNavigator() {
  const { state } = useAuth();

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {state.isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
