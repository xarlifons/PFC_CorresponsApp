import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";

export default function CreateTaskScreen({ navigation, route }) {
  const { moduloId } = route.params; // Recibimos el módulo activo

  const [nombreTarea, setNombreTarea] = useState("");
  const [definicionTarea, setDefinicionTarea] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");

  const handleGuardar = () => {
    if (
      !nombreTarea.trim() ||
      !definicionTarea.trim() ||
      !tiempoEstimado.trim()
    ) {
      Alert.alert("❌ Error", "Debes completar todos los campos obligatorios.");
      return;
    }

    const nuevaTarea = {
      id: `${moduloId}_${nombreTarea
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase()}_${Date.now()}`,
      nombre: nombreTarea.trim(),
      definicion: definicionTarea.trim(),
      tiempoEstimado: parseInt(tiempoEstimado),
      moduloId: moduloId, // Se asigna automáticamente
      agrupacionId: moduloId, // Agrupación = módulo para mantener consistencia
      completada: false,
      personalizada: true,
    };

    navigation.navigate("UnitConfigurationScreen", { nuevaTarea });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear nueva tarea</Text>

      <Text style={styles.label}>Nombre de la tarea:</Text>
      <TextInput
        style={styles.input}
        placeholder="Introduce el nombre de la tarea"
        value={nombreTarea}
        onChangeText={setNombreTarea}
      />

      <Text style={styles.label}>Definición de la tarea:</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Describe brevemente la tarea"
        value={definicionTarea}
        onChangeText={setDefinicionTarea}
        multiline
      />

      <Text style={styles.label}>Tiempo estimado (en minutos):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ejemplo: 20"
        keyboardType="numeric"
        value={tiempoEstimado}
        onChangeText={setTiempoEstimado}
      />

      <Button title="Guardar tarea" onPress={handleGuardar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
});
