import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import NegotiationStack from "./NegotiationStack";
//import ExecutionTabs from "./ExecutionTabs";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { state } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName="NegotiationStack"
      screenOptions={{ headerShown: false }}
    >
      {/* <Stack.Screen
        name="ExecutionTabs"
        component={ExecutionTabs}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="NegotiationStack"
        component={NegotiationStack}
        options={{ headerShown: false }}
      />
      {/* Aquí añadiremos otras pantallas privadas */}
    </Stack.Navigator>
  );
}
