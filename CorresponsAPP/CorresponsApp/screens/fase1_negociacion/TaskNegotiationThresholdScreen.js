import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function TaskNegotiationThresholdScreen() {
  const { state, getConsensoFase1, getGruposTareas } = useAuth();
  const [consenso, setConsenso] = useState({});
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);

  useRedirectByEstadoFase1("momento3", "TaskNegotiationAssignmentScreen");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [consensoData, gruposData] = await Promise.all([
          getConsensoFase1(state.user.unidadAsignada),
          getGruposTareas(),
        ]);
        console.log("📦 Consenso:", consensoData);
        console.log("📦 Grupos:", gruposData);
        setConsenso(consensoData);
        setGrupos(gruposData);
        if (!Array.isArray(gruposData)) {
          console.warn("⚠️ gruposData no es un array:", gruposData);
        }
      } catch (e) {
        console.error("❌ Error cargando datos:", e.message);
      } finally {
        setLoading(false);
      }
    };

    if (state.user?.unidadAsignada) {
      cargarDatos();
    }
  }, [state.user?.unidadAsignada]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando consenso por grupo...</Text>
      </View>
    );
  }

  console.log("🧠 Claves en el consenso:", Object.keys(consenso)); // ← AQUI

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧼 Umbral de limpieza consensuado</Text>
      <Text style={styles.subtitle}>
        Revisa los valores consensuados para cada grupo y tarea.
      </Text>

      {grupos.map((grupo) => {
        console.log(
          "📌 Tareas del grupo",
          grupo.id,
          grupo.tareas?.map((t) => t.id)
        );

        return (
          <View key={grupo.id} style={styles.groupSection}>
            <Text style={styles.groupTitle}>{grupo.nombre}</Text>

            {grupo.tareas.map((tarea) => {
              const datos = consenso[tarea.id];
              console.log("🔎 Buscando tarea", tarea.id, "→", datos);
              if (!datos) return null;

              return (
                <View key={tarea.id} style={styles.card}>
                  <Text style={styles.taskTitle}>
                    {tarea.id.replaceAll("_", " ")}
                  </Text>

                  <Text>
                    📅 Periodicidad: {datos.periodicidad.toFixed(1)} días
                  </Text>
                  <Slider
                    minimumValue={0.5}
                    maximumValue={30}
                    step={0.5}
                    value={datos.periodicidad}
                    disabled={true}
                  />

                  <Text>💥 Intensidad: {datos.intensidad.toFixed(1)} / 10</Text>
                  <Slider
                    minimumValue={0}
                    maximumValue={10}
                    step={0.1}
                    value={datos.intensidad}
                    disabled={true}
                  />

                  <Text>
                    🧠 Carga mental: {datos.cargaMental.toFixed(1)} / 10
                  </Text>
                  <Slider
                    minimumValue={0}
                    maximumValue={10}
                    step={0.1}
                    value={datos.cargaMental}
                    disabled={true}
                  />
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  groupSection: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007AFF",
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 10,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "capitalize",
  },
});
