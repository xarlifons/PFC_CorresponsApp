import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function UnitConfigurationScreen({ navigation, route }) {
  const {
    state,
    getUnidadInfoCompleta,
    actualizarConfiguracionUnidad,
    actualizarEstadoFase1,
    getModulosYTareas,
  } = useAuth();

  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [duracionCiclo, setDuracionCiclo] = useState("30");
  const [tareasUnidad, setTareasUnidad] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResumenVisible, setModalResumenVisible] = useState(false);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [tareasDelModulo, setTareasDelModulo] = useState([]);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
  const [modulosTareas, setModulosTareas] = useState([]); // 🔹 Nuevo estado

  useRedirectByEstadoFase1("momento1", "SurveyParametersScreen");

  useEffect(() => {
    console.log(
      "🌀 useEffect de UnitConfigurationScreen ejecutado. unidadAsignada:",
      state.user?.unidadAsignada
    );

    const cargarDatos = async () => {
      try {
        console.log("📡 Solicitando datos...");
        const [unidadData, modulosData] = await Promise.all([
          getUnidadInfoCompleta(state.user.unidadAsignada),
          getModulosYTareas(),
        ]);
        console.log("✅ unidadData:", unidadData);
        console.log("✅ modulosData:", modulosData);

        setUnidad(unidadData);
        setModulosTareas(modulosData);

        if (unidadData?.modulosActivados?.length) {
          setModulosSeleccionados(unidadData.modulosActivados);
          setDuracionCiclo(unidadData.cicloCorresponsabilidad?.toString());
        }
      } catch (error) {
        console.error("❌ Error al cargar datos", error.message);
        Alert.alert("❌ Error al cargar datos", error.message);
      } finally {
        setLoading(false);
      }
    };

    console.log("🔍 user actualizado:", state.user);
    if (state.user?.unidadAsignada) {
      cargarDatos();
    }
  }, [state.user]);

  useEffect(() => {
    if (route.params?.nuevaTarea) {
      const nueva = route.params.nuevaTarea;
      setTareasUnidad((prev) => {
        const sinDuplicados = prev.filter((t) => t.id !== nueva.id);
        return [...sinDuplicados, nueva];
      });

      if (modalVisible && nueva.modulo === moduloActivo) {
        setTareasDelModulo((prev) => {
          const sinDuplicados = prev.filter((t) => t.id !== nueva.id);
          return [...sinDuplicados, nueva];
        });

        setTareasSeleccionadas((prev) => {
          if (!prev.some((t) => t.id === nueva.id)) {
            return [...prev, nueva];
          }
          return prev;
        });
      }

      navigation.setParams({ nuevaTarea: null });
    }
  }, [route.params?.nuevaTarea]);

  const abrirModal = (moduloId) => {
    setModuloActivo(moduloId);

    const tareasPersonalizadas = tareasUnidad.filter(
      (t) => t.modulo === moduloId
    );

    const modulo = modulosTareas.find((m) => m.id === moduloId);
    const tareasPredefinidas =
      modulo?.tareas?.map((t) => ({
        id: t.id,
        nombre: t.nombre,
        modulo: moduloId,
        personalizada: false,
      })) || [];
    console.log("📦 Tareas predefinidas:", modulo?.tareas);

    const todasLasTareas = [
      ...tareasPredefinidas,
      ...tareasPersonalizadas,
    ].filter(
      (t, index, self) =>
        t.id !== undefined &&
        t.id !== null &&
        self.findIndex((o) => o.id === t.id) === index
    );
    console.log("🧩 Tareas del módulo", todasLasTareas);

    const yaSeleccionadas = tareasUnidad.filter((t) => t.modulo === moduloId);
    console.log("🧩 Tareas del módulo", todasLasTareas);
    setTareasDelModulo(todasLasTareas);
    setTareasSeleccionadas(yaSeleccionadas);
    setModalVisible(true);
  };

  const toggleTareaSeleccionada = (tarea) => {
    if (tareasSeleccionadas.find((t) => t.id === tarea.id)) {
      setTareasSeleccionadas(
        tareasSeleccionadas.filter((t) => t.id !== tarea.id)
      );
    } else {
      setTareasSeleccionadas([...tareasSeleccionadas, tarea]);
    }
  };

  const seleccionarTodas = () => setTareasSeleccionadas([...tareasDelModulo]);
  const deseleccionarTodas = () => setTareasSeleccionadas([]);

  const confirmarTareasModulo = () => {
    const nuevasTareas = tareasUnidad.filter(
      (t) => (t.moduloId || t.modulo) !== moduloActivo
    );
    setTareasUnidad([...nuevasTareas, ...tareasSeleccionadas]);
    if (
      !modulosSeleccionados.includes(moduloActivo) &&
      tareasSeleccionadas.length > 0
    ) {
      setModulosSeleccionados([...modulosSeleccionados, moduloActivo]);
    }
    setModalVisible(false);
  };

  const prepareTareasParaGuardar = () => {
    return tareasUnidad.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      modulo: t.modulo,
      tiempoEstimado: t.tiempoEstimado || 0,
      definicion: t.definicion,
      esPlantilla: true,
      asignadaA: null,
      periodicidad: t.periodicidad ?? 0,
      intensidad: t.intensidad ?? 0,
      cargaMental: t.cargaMental ?? 0,
    }));
  };

  const handleGuardarConfiguracion = async () => {
    if (modulosSeleccionados.length === 0 || !duracionCiclo.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona al menos un módulo y duración del ciclo."
      );
      return;
    }
    try {
      await actualizarConfiguracionUnidad(state.user.unidadAsignada, {
        modulosActivados: modulosSeleccionados,
        cicloCorresponsabilidad: parseInt(duracionCiclo),
        tareasUnidad: prepareTareasParaGuardar(),
      });
      await actualizarEstadoFase1(state.user.unidadAsignada, "momento2");
      setModalResumenVisible(true);
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    }
  };

  if (!state.user?.unidadAsignada) {
    console.log("⚠️ unidadAsignada no disponible aún. Esperando...");
    return null;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando datos de la unidad…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configuración de la unidad:</Text>
      <Text style={styles.title}>{unidad.nombre}</Text>

      <Text style={styles.subtitle}>Duración del ciclo (días):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duracionCiclo}
        onChangeText={setDuracionCiclo}
      />

      <Text style={styles.subtitle}>Selecciona los módulos:</Text>
      {modulosTareas.map((modulo) => (
        <View key={modulo.id} style={styles.moduloItem}>
          <TouchableOpacity
            style={styles.moduloButton}
            onPress={() => abrirModal(modulo.id)}
          >
            <Text style={styles.moduloNombre}>{modulo.nombre}</Text>
            <Text style={styles.moduloSub}>
              {
                tareasUnidad.filter(
                  (t) => t.modulo === modulo.id || t.moduloId === modulo.id
                ).length
              }{" "}
              tareas
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleGuardarConfiguracion}
      >
        <Text style={styles.saveButtonText}>
          Guardar configuración ({tareasUnidad.length} tareas)
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Tareas de: {moduloActivo}</Text>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={seleccionarTodas}
            >
              <Text style={styles.actionButtonText}>Seleccionar todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={deseleccionarTodas}
            >
              <Text style={styles.actionButtonText}>Deseleccionar todas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { marginVertical: 12 }]}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("CreateTaskScreen", {
                moduloId: moduloActivo,
              });
            }}
          >
            <Text style={styles.actionButtonText}>
              ➕ Crear nueva tarea personalizada
            </Text>
          </TouchableOpacity>

          <FlatList
            data={tareasDelModulo}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleTareaSeleccionada(item)}
                style={[
                  styles.tareaItem,
                  tareasSeleccionadas.find((t) => t.id === item.id) &&
                    styles.tareaItemSelected,
                ]}
              >
                <Text>{item.nombre}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmarTareasModulo}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: "#aaa" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={modalResumenVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalResumenContainer}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.title}>✅ Unidad configurada</Text>
            <Text style={styles.subtitle}>{unidad?.nombre}</Text>

            <Text style={styles.resumenText}>
              Duración del ciclo: {duracionCiclo} días
            </Text>
            <Text style={styles.resumenText}>
              Módulos seleccionados: {modulosSeleccionados.length}
            </Text>
            <Text style={styles.resumenText}>
              Tareas totales: {tareasUnidad.length}
            </Text>

            {modulosSeleccionados.map((moduloId) => (
              <View key={moduloId} style={styles.moduloResumenItem}>
                <Text style={styles.moduloResumenTitulo}>
                  {moduloId.replace(/_/g, " ").toUpperCase()}
                </Text>
                {tareasUnidad
                  .filter((t) => t.modulo === moduloId)
                  .map((t) => (
                    <Text key={t.id} style={styles.tareaResumen}>
                      • {t.nombre}
                    </Text>
                  ))}
              </View>
            ))}

            <TouchableOpacity
              style={styles.botonContinuar}
              onPress={() => {
                setModalResumenVisible(false);
                setTimeout(
                  () => navigation.replace("SurveyParametersScreen"),
                  0
                );
              }}
            >
              <Text style={styles.botonContinuarText}>
                Seguimos con una pequeña encuesta →
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: { fontSize: 16, fontWeight: "600", marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  moduloItem: { marginBottom: 12 },
  moduloButton: {
    backgroundColor: "#e0e0e0",
    padding: 16,
    borderRadius: 12,
  },
  moduloNombre: { fontSize: 16, fontWeight: "bold" },
  moduloSub: { fontSize: 13, color: "#555", marginTop: 4 },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 14,
    marginTop: 24,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 24, backgroundColor: "#fff" },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
  },
  actionButtonText: { fontWeight: "600" },
  tareaItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 4,
  },
  tareaItemSelected: { backgroundColor: "#d0f0c0" },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  confirmButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    width: "45%",
    alignItems: "center",
  },
  confirmButtonText: { color: "#fff", fontWeight: "bold" },
  modalResumenContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  resumenText: {
    fontSize: 16,
    marginVertical: 4,
  },
  moduloResumenItem: {
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    width: "100%",
  },
  moduloResumenTitulo: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
    color: "#333",
  },
  tareaResumen: {
    fontSize: 14,
    color: "#555",
  },
  botonContinuar: {
    marginTop: 24,
    padding: 14,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  botonContinuarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
