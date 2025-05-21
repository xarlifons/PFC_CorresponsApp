import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import NegotiationStack from "./NegotiationStack";
import ExecutionDashboardScreen from "../screens/fase2_ejecucion/ExecutionDashboardScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { state } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="NegotiationStack"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="NegotiationStack"
        component={NegotiationStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExecutionDashboardScreen"
        component={ExecutionDashboardScreen}
        screenOptions={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
