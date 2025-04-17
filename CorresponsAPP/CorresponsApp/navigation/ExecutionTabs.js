import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
//import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import ExecutionDashboardScreen from "../screens/fase2_ejecucion/ExecutionDashboardScreen";

// Temporal: pantallas vacías para completar navegación
const CompletedCyclesScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Histórico</Text>
  </View>
);
const ResultsEvaluationScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Estadísticas</Text>
  </View>
);
const GamificationRewardsScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Logros</Text>
  </View>
);
const SettingsScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Ajustes</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const ExecutionTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#000",
        tabBarStyle: {
          backgroundColor: "#ede5f2",
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Histórico"
        component={CompletedCyclesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="download" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Estadísticas"
        component={ResultsEvaluationScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={ExecutionDashboardScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                backgroundColor: "#524b5b",
                borderRadius: 32,
                padding: 10,
                marginBottom: 30,
              }}
            >
              <Icon name="emoticon-excited-outline" size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Logros"
        component={GamificationRewardsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="star-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ExecutionTabs;
