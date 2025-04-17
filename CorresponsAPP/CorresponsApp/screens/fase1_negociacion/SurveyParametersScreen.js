import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const SurveyParametersScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferencias y cálculo del umbral</Text>
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
