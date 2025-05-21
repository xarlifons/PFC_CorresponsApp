import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";

export default function CreateTaskScreen({ route, navigation }) {
  const { moduloId } = route.params;
  const [nombre, setNombre] = useState("");
  const [definicion, setDefinicion] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");

  const handleCrearTarea = () => {
    if (!nombre.trim() || !tiempoEstimado.trim()) {
      Alert.alert("Campo obligatorio", "Debes indicar un nombre para la tarea");
      return;
    }

    const nuevaTarea = {
      id: `${moduloId}_${nombre.replace(/\s+/g, "_").toLowerCase()}`,
      nombre,
      definicion: definicion.trim() || "Definición pendiente",
      tiempoEstimado: parseInt(tiempoEstimado),
      modulo: moduloId,
      personalizada: true,
    };

    navigation.goBack();
    setTimeout(() => {
      navigation.navigate("UnitConfigurationScreen", { nuevaTarea });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Nueva tarea para el módulo:</Text>
        <Text style={styles.moduleText}>{moduloId}</Text>

        <Text style={styles.label}>Nombre de la tarea *</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
          placeholder="Ej: Limpiar ventilador de techo"
        />

        <Text style={styles.label}>Definición (opcional)</Text>
        <TextInput
          value={definicion}
          onChangeText={setDefinicion}
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Describe la tarea si lo consideras útil"
        />

        <Text style={styles.label}>Tiempo estimado (mins) *</Text>
        <TextInput
          value={tiempoEstimado}
          onChangeText={setTiempoEstimado}
          style={styles.input}
          multiline
          placeholder="30"
        />

        <TouchableOpacity style={styles.botonCrear} onPress={handleCrearTarea}>
          <Text style={styles.botonTexto}>Crear tarea</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  moduleText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#333",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  botonCrear: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
});
