import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const ExecutionDashboardScreen = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Ejecución</Text>
      <Button mode="contained" onPress={handleLogout}>
        Cerrar sesión
      </Button>
    </View>
  );
};

export default ExecutionDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24 },
});
