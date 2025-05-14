import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Button, Card, Title, Paragraph } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function ExecutionDashboardScreen() {
  const { state, getTareasInstanciadas, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getTareasInstanciadas(state.user.unidadAsignada);
        setTasks(data);
      } catch (e) {
        console.error("Error cargando tareas instanciadas:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [state.user?.unidadAsignada]);

  const handleLogout = async () => {
    await logout();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.taskName}>{item.nombre}</Title>
        <Paragraph style={styles.taskDate}>{item.fechaProgramada}</Paragraph>
      </Card.Content>
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
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Ejecución</Text>
      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        renderItem={renderItem}
        contentContainerStyle={tasks.length === 0 && styles.center}
        ListEmptyComponent={<Text>No hay tareas programadas.</Text>}
        style={styles.list}
      />
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Cerrar sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  card: {
    marginBottom: 8,
    elevation: 2,
  },
  taskName: {
    fontSize: 18,
  },
  taskDate: {
    color: "#555",
  },
  logoutButton: {
    alignSelf: "center",
    width: "60%",
  },
});
