import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const TaskNegotiationThresholdScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Negociación del umbral de limpieza</Text>
      <Button
        title="Siguiente"
        onPress={() => navigation.navigate("TaskNegotiationAssignmentScreen")}
      />
    </View>
  );
};

export default TaskNegotiationThresholdScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: { fontSize: 24, marginBottom: 16 },
});
