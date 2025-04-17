import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SelectUnitTypeScreen from "../screens/fase1_negociacion/SelectUnitTypeScreen";
import SurveyParametersScreen from "../screens/fase1_negociacion/SurveyParametersScreen";
import TaskNegotiationThresholdScreen from "../screens/fase1_negociacion/TaskNegotiationThresholdScreen";
import TaskNegotiationAssignmentScreen from "../screens/fase1_negociacion/TaskNegotiationAssignmentScreen";

const Stack = createNativeStackNavigator();

const NegotiationStack = () => {
  return (
    <Stack.Navigator initialRouteName="SelectUnitTypeScreen">
      <Stack.Screen
        name="SelectUnitTypeScreen"
        component={SelectUnitTypeScreen}
        options={{ title: "Tipo de Unidad", headerShown: false }}
      />
      <Stack.Screen
        name="SurveyParametersScreen"
        component={SurveyParametersScreen}
        options={{ title: "Preferencias de Tareas" }}
      />
      <Stack.Screen
        name="TaskNegotiationThresholdScreen"
        component={TaskNegotiationThresholdScreen}
        options={{ title: "Negociación del Umbral" }}
      />
      <Stack.Screen
        name="TaskNegotiationAssignmentScreen"
        component={TaskNegotiationAssignmentScreen}
        options={{ title: "Asignación Final" }}
      />
    </Stack.Navigator>
  );
};

export default NegotiationStack;
