import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ExecutionDashboardScreen() {
  const { state, getTareasInstanciadas, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    console.log("👤 Usuario cargado:", state.user);
    (async () => {
      try {
        const data = await getTareasInstanciadas(state.user.unidadAsignada);
        console.log("🧠 Usuario actual:", state.user);
        console.log("📦 Tareas instanciadas:", data);

        data.forEach((t, index) => {
          console.log(
            `🔎 Tarea[${index}] → id=${t.id}, nombre=${t.nombre}, asignadaA=${t.asignadaA}`
          );
        });

        console.log("🧩 ID usuario logueado:", state.user.id);
        data.forEach((t) => {
          if (t.asignadaA === state.user.id) {
            console.log("✅ Coincide tarea:", t.nombre);
          } else {
            console.log(
              "❌ No coincide:",
              t.nombre,
              "| asignadaA:",
              t.asignadaA,
              "| id: usuario:",
              state.user.id
            );
          }
        });
        const asignadasA = data.filter((t) => t.asignadaA === state.user.id);
        setTasks(asignadasA);
      } catch (e) {
        console.error("Error cargando tareas instanciadas:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [state.user?.unidadAsignada]);

  const handleToggleExpand = (taskId) => {
    setExpandedId((prev) => (prev === taskId ? null : taskId));
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => handleToggleExpand(item.id)}>
        <Card.Title
          title={item.nombre}
          subtitle={`📅 ${item.fechaProgramada}`}
          right={() => (
            <Ionicons
              name={expandedId === item.id ? "chevron-up" : "chevron-down"}
              size={24}
              color="#333"
              style={{ marginRight: 12 }}
            />
          )}
        />
      </TouchableOpacity>
      {expandedId === item.id && (
        <Card.Content>
          <Text style={styles.attribute}>
            🔁 Periodicidad: {item.periodicidad} días
          </Text>
          <Text style={styles.attribute}>
            💪 Esfuerzo: {item.intensidad} / 10
          </Text>
          <Text style={styles.attribute}>
            🧠 Carga mental: {item.cargaMental} / 10
          </Text>
        </Card.Content>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>
          👤 Cuenta de {state.user?.nombre || "usuario"}
        </Text>
        <Text style={styles.subHeader}>🗓 Tareas programadas:</Text>
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={tasks.length === 0 && styles.center}
          ListEmptyComponent={<Text>No hay tareas asignadas.</Text>}
          style={styles.list}
        />
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  attribute: {
    fontSize: 14,
    marginVertical: 4,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#c62828",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
});
