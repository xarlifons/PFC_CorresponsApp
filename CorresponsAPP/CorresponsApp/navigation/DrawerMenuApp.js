import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ExecutionTabs from "./ExecutionTabs";
import { View, Text, Button } from "react-native";
import { useAuth } from "../context/AuthContext";

const Drawer = createDrawerNavigator();

const SettingsScreen = () => {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>⚙️ Ajustes</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
};

const DrawerMenuApp = () => {
  return (
    <Drawer.Navigator
      initialRouteName="ExecutionTabs"
      screenOptions={{
        drawerPosition: "right",
        headerShown: false,
      }}
    >
      <Drawer.Screen name="ExecutionTabs" component={ExecutionTabs} />
      <Drawer.Screen name="Ajustes" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerMenuApp;
