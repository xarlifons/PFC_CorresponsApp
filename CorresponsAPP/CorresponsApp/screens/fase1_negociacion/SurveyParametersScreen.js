import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

const SurveyParametersScreen = ({ navigation }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout(); // limpia AsyncStorage y estado global
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferencias y cálculo del umbral</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Cerrar sesión" color="#d9534f" onPress={handleLogout} />
      </View>
      <Text style={{ marginTop: 20 }}>
        Aquí puedes establecer tus preferencias y calcular el umbral de
        negociación.
      </Text>
      <Button
        title="Siguiente"
        onPress={() => navigation.navigate("TaskNegotiationThresholdScreen")}
      />
    </View>
  );
};

export default SurveyParametersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 24, marginBottom: 16 },
});
