import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const TaskNegotiationAssignmentScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asignación final de tareas</Text>
      <Button
        title="Finalizar negociación"
        onPress={() => navigation.navigate("PantallaFase2")} // placeholder
      />
    </View>
  );
};

export default TaskNegotiationAssignmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 24, marginBottom: 16 },
});
