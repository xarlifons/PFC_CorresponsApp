import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SelectUnitTypeScreen from "../screens/fase1_negociacion/SelectUnitTypeScreen";
import SurveyParametersScreen from "../screens/fase1_negociacion/SurveyParametersScreen";
import TaskNegotiationThresholdScreen from "../screens/fase1_negociacion/TaskNegotiationThresholdScreen";
import TaskNegotiationAssignmentScreen from "../screens/fase1_negociacion/TaskNegotiationAssignmentScreen";
import Fase1RouterScreen from "../screens/fase1_negociacion/Fase1RouterScreen";
import UnitConfigurationScreen from "../screens/fase1_negociacion/UnitConfigurationScreen";
import CreateTaskScreen from "../screens/fase1_negociacion/CreateTaskScreen";

const Stack = createNativeStackNavigator();

const NegotiationStack = () => {
  return (
    <Stack.Navigator initialRouteName="Fase1RouterScreen">
      <Stack.Screen
        name="Fase1RouterScreen"
        component={Fase1RouterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectUnitTypeScreen"
        component={SelectUnitTypeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UnitConfigurationScreen"
        component={UnitConfigurationScreen}
      />
      <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />

      <Stack.Screen
        name="SurveyParametersScreen"
        component={SurveyParametersScreen}
      />
      <Stack.Screen
        name="TaskNegotiationThresholdScreen"
        component={TaskNegotiationThresholdScreen}
      />
      <Stack.Screen
        name="TaskNegotiationAssignmentScreen"
        component={TaskNegotiationAssignmentScreen}
      />
    </Stack.Navigator>
  );
};

export default NegotiationStack;
