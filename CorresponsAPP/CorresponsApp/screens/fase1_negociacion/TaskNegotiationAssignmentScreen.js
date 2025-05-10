import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

const { height, width } = Dimensions.get("window");
const CARD_SIZE = width * 0.24;
// Altura total que queremos reservar para el botón + márgenes
const BUTTON_AREA_HEIGHT = 80;

export default function TaskNegotiationAssignmentScreen({ navigation }) {
  const {
    state,
    getUnidadInfoCompleta,
    getUnidadConfiguracion,
    guardarConsensoFinal,
    actualizarEstadoFase1,
  } = useAuth();

  const [zones, setZones] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const panRefs = useRef({});
  const responderRefs = useRef({});
  const zoneLayouts = useRef({});

  useRedirectByEstadoFase1("momento4", "ExecutionDashboardScreen", refresh);

  useEffect(() => {
    if (!state.user?.unidadAsignada) return;
    (async () => {
      setLoading(true);
      try {
        const config = await getUnidadConfiguracion(state.user.unidadAsignada);
        const info = await getUnidadInfoCompleta(state.user.unidadAsignada);

        // Inicializa las zonas
        const init = { unassigned: [] };
        config.tareasUnidad.forEach((t) => {
          init.unassigned.push({ ...t });
          panRefs.current[t.id] = new Animated.ValueXY();
          responderRefs.current[t.id] = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
              panRefs.current[t.id].setOffset({
                x: panRefs.current[t.id].x._value,
                y: panRefs.current[t.id].y._value,
              });
              panRefs.current[t.id].setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
              [
                null,
                {
                  dx: panRefs.current[t.id].x,
                  dy: panRefs.current[t.id].y,
                },
              ],
              { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, { moveX, moveY }) => {
              panRefs.current[t.id].flattenOffset();
              for (let [zoneId, layout] of Object.entries(
                zoneLayouts.current
              )) {
                if (
                  moveX >= layout.x &&
                  moveX <= layout.x + layout.width &&
                  moveY >= layout.y &&
                  moveY <= layout.y + layout.height
                ) {
                  setZones((z) => {
                    const nz = {};
                    Object.keys(z).forEach((k) => {
                      nz[k] = z[k].filter((tk) => tk.id !== t.id);
                    });
                    nz[zoneId] = [...nz[zoneId], t];
                    return nz;
                  });
                  break;
                }
              }
              panRefs.current[t.id].setValue({ x: 0, y: 0 });
            },
          });
        });
        (info.miembros || []).forEach((m) => (init[m.id] = []));
        setZones(init);
        setMembers(info.miembros || []);
      } catch (e) {
        console.error("❌ Error cargando asignaciones:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [state.user?.unidadAsignada]);

  const onSave = async () => {
    try {
      const payload = Object.entries(zones)
        .filter(([zoneId]) => zoneId !== "unassigned")
        .flatMap(([_, tasks]) =>
          tasks.map((t) => ({
            tareaId: t.id,
            grupoId: t.modulo,
            periodicidad: t.datos?.periodicidad ?? 1,
            intensidad: t.datos?.intensidad ?? 5,
            cargaMental: t.datos?.cargaMental ?? 5,
          }))
        );
      await guardarConsensoFinal(state.user.unidadAsignada, payload);
      await actualizarEstadoFase1(state.user.unidadAsignada, "completada");
      setRefresh((r) => !r);
    } catch (e) {
      console.error("Error guardando:", e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando asignaciones…</Text>
      </View>
    );
  }

  // Definir orden de filas según número de miembros
  let filasOrder;
  if (members.length === 2) {
    filasOrder = [members[0].id, "unassigned", members[1].id];
  } else if (members.length > 2) {
    filasOrder = [
      members[0].id,
      "unassigned",
      ...members.slice(1).map((m) => m.id),
    ];
  } else {
    filasOrder = ["unassigned", ...members.map((m) => m.id)];
  }

  // Reducimos un poco el factor para dejar más espacio
  const ROW_HEIGHT =
    ((height - BUTTON_AREA_HEIGHT - 32) / filasOrder.length) * 0.7;

  const renderRow = (zoneId) => {
    const label =
      zoneId === "unassigned"
        ? "Por asignar"
        : `${members.find((m) => m.id === zoneId)?.nombre || ""}`;
    const tasks = zones[zoneId] || [];

    return (
      <View
        key={zoneId}
        style={[
          styles.row,
          { height: ROW_HEIGHT },
          zoneId === "unassigned" ? styles.unassignedRow : styles.userRow,
        ]}
        onLayout={(e) => (zoneLayouts.current[zoneId] = e.nativeEvent.layout)}
      >
        <Text style={styles.rowTitle}>
          {label} ({tasks.length} tareas)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "flex-start", // bajas las tarjetas
            alignItems: "flex-end", // y las dejas a la izquierda
            paddingHorizontal: 4,
            marginBottom: 4,
          }}
        >
          {tasks.map((task) => (
            <Animated.View
              key={task.id}
              style={[styles.card, panRefs.current[task.id].getLayout()]}
              {...responderRefs.current[task.id].panHandlers}
            >
              <Text style={styles.cardText}>{task.nombre}</Text>
            </Animated.View>
          ))}
          <View style={[styles.card, styles.cardEmpty]}>
            <Text style={styles.cardEmptyText}>＋</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.rowsContainer, { marginBottom: BUTTON_AREA_HEIGHT }]}
        showsVerticalScrollIndicator={false}
      >
        {filasOrder.map((zoneId) => renderRow(zoneId))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveText}>Guardar asignaciones y finalizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#fff",
  },
  rowsContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    marginBottom: 8,
    borderRadius: 6,
    padding: 4,
    overflow: "visible",
  },
  unassignedRow: {
    backgroundColor: "#b3d4fc",
  },
  userRow: {
    backgroundColor: "#fafafa",
    borderWidth: 2,
    borderColor: "#2D6A4F",
  },
  rowTitle: {
    fontWeight: "bold",
    marginLeft: 4,
    marginBottom: 4,
    fontSize: 14,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 4,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE * 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#e0f7fa",
    borderRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  cardText: {
    textAlign: "center",
    fontSize: 10,
  },
  cardEmpty: {
    backgroundColor: "#eee",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cardEmptyText: {
    fontSize: 18,
    color: "#999",
  },
  saveButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    padding: 12,
    backgroundColor: "#2D6A4F",
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
