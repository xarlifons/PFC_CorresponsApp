import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function TaskNegotiationThresholdScreen({ navigation }) {
  const {
    state,
    getConsensoFase1,
    getModulosYTareas,
    getCorrespondencias,
    getUnidadConfiguracion,
    actualizarEstadoFase1,
    guardarConsensoFinal,
  } = useAuth();

  const [consenso, setConsenso] = useState({});
  const [modules, setModules] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [values, setValues] = useState({});
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [totalTasks, setTotalTask] = useState(0);
  const [refreshRedirect, setRefreshRedirect] = useState(false);

  useRedirectByEstadoFase1(
    "momento3",
    "TaskNegotiationAssignmentScreen",
    refreshRedirect
  );

  useEffect(() => {
    if (!state.user?.unidadAsignada) return;
    (async () => {
      setLoading(true);
      try {
        const [consData, modData, corr, uni] = await Promise.all([
          getConsensoFase1(state.user.unidadAsignada),
          getModulosYTareas(),
          getCorrespondencias(),
          getUnidadConfiguracion(state.user.unidadAsignada),
        ]);
        setTotalTask(uni.tareasUnidad.length);

        // sólo módulos activos
        const activos = modData.filter((m) =>
          uni.modulosActivados.includes(m.id)
        );

        // construimos cada módulo
        const builtModulo = activos.map((mod) => {
          // Plantillas: las tareasUnidad que vienen marcadas esPlantilla y pertenecen a este módulo
          const plantilla = uni.tareasUnidad
            .filter((t) => t.esPlantilla && t.modulo === mod.id)
            .map((t) => {
              // extraemos el grupo_id tras "<mod.id>_"
              const gid = t.id.startsWith(`${mod.id}_`)
                ? t.id.slice(mod.id.length + 1)
                : t.id;
              // buscamos la descripción en correspondencias
              const entry = corr.find((c) => c.grupo_id === gid);
              const nombre = entry?.modulo_tarea || t.nombre;
              const datos = consData[gid] || {
                periodicidad: 1,
                intensidad: 5,
                cargaMental: 5,
              };
              return { id: gid, nombre, datos, esPlantilla: true };
            });

          // Custom: las tareasUnidad creadas a mano
          const custom = uni.tareasUnidad
            .filter((t) => !t.esPlantilla && t.modulo === mod.id)
            .map((t) => {
              const gid = t.id;
              const datos = consData[gid] || {
                periodicidad: 1,
                intensidad: 5,
                cargaMental: 5,
              };
              return {
                id: gid,
                nombre: t.nombre,
                datos,
                esPlantilla: false,
              };
            });

          // Unimos sin necesidad de dedupe extra
          const tareas = [...plantilla, ...custom];

          // Inicializamos los valores sólo la primera vez
          tareas.forEach((t) => {
            if (!values[t.id]) values[t.id] = t.datos;
          });

          return { ...mod, tareas };
        });

        setConsenso(consData);
        setModules(builtModulo);
        setValues({ ...values });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [state.user?.unidadAsignada]);

  // progresión
  const totalModules = modules.length;
  const doneModules = Object.values(completed).filter((v) => v).length;
  const progress = totalModules ? doneModules / totalModules : 0;

  // increment / decrement
  const inc = (taskId, field) =>
    setValues({
      ...values,
      [taskId]: {
        ...values[taskId],
        [field]: values[taskId][field] + (field === "periodicidad" ? 0.5 : 1),
      },
    });
  const dec = (taskId, field) =>
    setValues({
      ...values,
      [taskId]: {
        ...values[taskId],
        [field]: Math.max(
          field === "periodicidad" ? 0.5 : 0,
          values[taskId][field] - (field === "periodicidad" ? 0.5 : 1)
        ),
      },
    });

  const markDone = (id) => setCompleted({ ...completed, [id]: true });

  const saveConsensus = async () => {
    try {
      // 1) Construimos el payload con la forma { tareaId, grupoId, periodicidad, intensidad, cargaMental }
      const payload = modules.flatMap((mod) =>
        mod.tareas.map((t) => ({
          tareaId: t.id, // usa t.id
          grupoId: mod.id, // o si tienes otro campo de grupo: t.esPlantilla ? t.id : mod.id
          periodicidad: values[t.id].periodicidad,
          intensidad: values[t.id].intensidad,
          cargaMental: values[t.id].cargaMental,
        }))
      );

      // 2) Guardar consenso final en la unidad
      await guardarConsensoFinal(state.user.unidadAsignada, payload);

      // 3) Actualizar estadoFase1 (si no lo hace el backend)
      await actualizarEstadoFase1(state.user.unidadAsignada, "momento4");
      setRefreshRedirect((prev) => !prev);
    } catch (error) {
      Alert.alert("❌ Error al guardar consenso", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando módulos…</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={modules}
      keyExtractor={(m) => m.id}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            Consenso del Umbral de limpieza inicial
          </Text>
          <Text style={styles.subtitle}>
            Ahora ya has contestado la encuesta y hemos extraído tu umbral de
            limpieza. Vamos a consensuar el Umbral de limpieza de la vivienda.
            Para ello, revisad las {totalTasks} tareas de la unidad.
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFg, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
          <Text style={styles.progressText}>
            Módulos revisados: {doneModules}/{totalModules}
          </Text>
        </>
      }
      renderItem={({ item: mod }) => (
        <View style={styles.moduleSection}>
          <TouchableOpacity
            style={styles.moduleHeader}
            onPress={() =>
              setExpanded({ ...expanded, [mod.id]: !expanded[mod.id] })
            }
          >
            <Text style={styles.moduleTitle}>
              {mod.nombre} ({mod.tareas.length} tareas)
            </Text>
            <Ionicons
              name={expanded[mod.id] ? "chevron-down" : "chevron-forward"}
              size={24}
              color="#333"
            />
          </TouchableOpacity>

          {expanded[mod.id] && (
            <View style={styles.taskList}>
              {mod.tareas.map((t) => (
                <View key={t.id} style={styles.taskRow}>
                  <Text style={styles.taskName}>{t.nombre}</Text>

                  {/* Periodicidad */}
                  <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Periodicidad</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => dec(t.id, "periodicidad")}
                      >
                        <Text style={styles.stepButton}>–</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepValue}>
                        {values[t.id].periodicidad.toFixed(1)}
                      </Text>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => inc(t.id, "periodicidad")}
                      >
                        <Text style={styles.stepButton}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Intensidad -> Esfuerzo */}
                  <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Esfuerzo</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => dec(t.id, "intensidad")}
                      >
                        <Text style={styles.stepButton}>–</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepValue}>
                        {values[t.id].intensidad.toFixed(0)}
                      </Text>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => inc(t.id, "intensidad")}
                      >
                        <Text style={styles.stepButton}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Carga mental */}
                  <View style={styles.paramRow}>
                    <Text style={styles.paramLabel}>Carga mental</Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => dec(t.id, "cargaMental")}
                      >
                        <Text style={styles.stepButton}>–</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepValue}>
                        {values[t.id].cargaMental.toFixed(0)}
                      </Text>
                      <TouchableOpacity
                        style={styles.stepButtonBg}
                        onPress={() => inc(t.id, "cargaMental")}
                      >
                        <Text style={styles.stepButton}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.doneButton,
                  completed[mod.id] && styles.doneButtonDone,
                ]}
                onPress={() => markDone(mod.id)}
              >
                <Text style={styles.doneText}>
                  {completed[mod.id]
                    ? "✔ Módulo revisado"
                    : "✔ He revisado este módulo"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      ListFooterComponent={
        <TouchableOpacity style={styles.saveAll} onPress={saveConsensus}>
          <Text style={styles.saveAllText}>
            Guardar consenso del umbral de limpieza
          </Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },

  progressBarBg: {
    flexDirection: "row",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressBarFg: {
    backgroundColor: "#2D6A4F",
  },
  progressText: { textAlign: "center", marginBottom: 16 },

  moduleSection: {
    marginBottom: 16,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 8,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  moduleTitle: { fontSize: 16, fontWeight: "600" },

  taskList: {
    paddingLeft: 12,
    paddingBottom: 12,
  },
  taskRow: {
    marginBottom: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f8fffd",
  },
  taskName: { fontSize: 15, fontWeight: "600", marginBottom: 8 },

  paramRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Empuja todo hacia la derecha
    marginBottom: 6,
  },
  paramLabel: {
    width: 100, // Ajusta este valor al espacio que necesites
    textAlign: "right", // Alinea el texto a la derecha
    marginRight: 8, // Espacio entre etiqueta y stepper
    fontSize: 14,
    fontWeight: "500",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepButtonBg: {
    backgroundColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 4,
  },
  stepButton: {
    fontSize: 18,
    lineHeight: 18,
    textAlign: "center",
  },
  stepValue: { width: 32, textAlign: "center", fontSize: 14 },

  doneButton: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    alignItems: "center",
  },
  doneButtonDone: { backgroundColor: "#4d9174" },
  doneText: { color: "#fff", fontWeight: "600" },

  saveAll: {
    marginVertical: 24,
    padding: 14,
    backgroundColor: "#199962",
    borderRadius: 8,
    alignItems: "center",
  },
  saveAllText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
