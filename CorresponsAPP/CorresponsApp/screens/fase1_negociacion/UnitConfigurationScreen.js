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
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function UnitConfigurationScreen({ navigation, route }) {
  const {
    state,
    getUnidadInfoCompleta,
    actualizarConfiguracionUnidad,
    actualizarEstadoFase1,
  } = useAuth();

  const [unidad, setUnidad] = useState(null);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [duracionCiclo, setDuracionCiclo] = useState("30");
  const [tareasUnidad, setTareasUnidad] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalResumenVisible, setModalResumenVisible] = useState(false);
  const [moduloActivo, setModuloActivo] = useState(null);
  const [tareasDelModulo, setTareasDelModulo] = useState([]);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);

  useRedirectByEstadoFase1("momento1", "SurveyParametersScreen");

  const MODULOS_DISPONIBLES = [
    { id: "limpieza_general", nombre: "Limpieza general" },
    { id: "limpieza_especifica", nombre: "Limpieza específica" },
    { id: "cocina_alimentacion", nombre: "Cocina y alimentación" },
    { id: "ropa_lavanderia", nombre: "Ropa y lavandería" },
    { id: "habitaciones_organizacion", nombre: "Habitaciones y organización" },
    { id: "bano_higiene", nombre: "Baño e higiene" },
    { id: "cuidados_familiares", nombre: "Cuidados familiares" },
    { id: "mantenimiento_hogar", nombre: "Mantenimiento del hogar" },
    { id: "plantas_mascotas", nombre: "Cuidado de plantas y mascotas" },
    { id: "recados_abastecimiento", nombre: "Recados y abastecimiento" },
    { id: "gestion_invisible", nombre: "Gestión invisible" },
    { id: "cuidado_vehiculo", nombre: "Cuidado del vehículo" },
  ];

  const TAREAS_POR_MODULO = {
    limpieza_general: [
      "Barrer y fregar suelos",
      "Limpiar el polvo de muebles",
      "Pasar aspiradora",
      "Ventilar habitaciones",
      "Vaciar papeleras",
    ],
    limpieza_especifica: [
      "Limpiar cristales y ventanas",
      "Limpiar paredes y puertas",
      "Limpiar ducha o banera",
      "Limpiar lavabo e inodoro",
      "Limpiar terraza o balcon",
    ],
    cocina_alimentacion: [
      "Cocinar comidas principales",
      "Fregar platos o lavar lavavajillas",
      "Planificar menu semanal",
      "Vaciar alimentos caducados",
      "Gestionar basura y reciclaje",
    ],
    ropa_lavanderia: [
      "Poner lavadoras",
      "Tender ropa",
      "Planchar ropa",
      "Doblar y guardar ropa",
      "Revisar ropa sucia/acumulada",
    ],
    habitaciones_organizacion: [
      "Hacer las camas",
      "Cambiar sabanas",
      "Organizar armarios",
      "Ordenar habitaciones",
    ],
    bano_higiene: [
      "Limpiar inodoro",
      "Limpiar lavabo y espejo",
      "Limpiar ducha/banera",
      "Reponer papel higienico y jabon",
      "Cambiar toallas",
    ],
    cuidados_familiares: [
      "Ayudar higiene personal ninos/as",
      "Supervisar deberes escolares",
      "Acompanhar a actividades extraescolares",
      "Preparar mochilas escolares",
    ],
    mantenimiento_hogar: [
      "Revisar bombillas y fusibles",
      "Realizar arreglos menores",
      "Revisar electrodomesticos",
      "Montar o desmontar muebles",
    ],
    plantas_mascotas: [
      "Regar plantas",
      "Podar plantas",
      "Cuidar jardin",
      "Sacar mascotas a pasear",
      "Limpiar jaulas o areneros",
    ],
    recados_abastecimiento: [
      "Hacer la compra",
      "Comprar medicamentos",
      "Sacar la basura",
    ],
    gestion_invisible: [
      "Planificar calendario familiar",
      "Coordinar citas y eventos",
      "Revisar y pagar facturas",
      "Hacer gestiones administrativas",
    ],
    cuidado_vehiculo: [
      "Llevar coche al taller",
      "Llenar deposito de gasolina",
      "Renovar ITV o documentacion",
    ],
  };

  useEffect(() => {
    const cargarUnidad = async () => {
      if (state.user?.unidadAsignada) {
        const info = await getUnidadInfoCompleta(state.user.unidadAsignada);
        setUnidad(info);
        if (info?.modulosActivados?.length) {
          setModulosSeleccionados(info.modulosActivados);
          setDuracionCiclo(info.cicloCorresponsabilidad?.toString());
        }
      }
    };
    cargarUnidad();
  }, [state.user?.unidadAsignada]);

  useEffect(() => {
    if (route.params?.nuevaTarea) {
      const nueva = route.params.nuevaTarea;

      // 1. Añadir a tareasUnidad (sin duplicados)
      setTareasUnidad((prev) => {
        const sinDuplicados = prev.filter((t) => t.id !== nueva.id);
        return [...sinDuplicados, nueva];
      });

      // 2. Si modal abierto y es del mismo módulo
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

      navigation.setParams({ nuevaTarea: null }); // limpiar
    }
  }, [route.params?.nuevaTarea]);

  const toggleModulo = (moduloId) => {
    const tareasDeModulo = tareasUnidad.filter(
      (t) => t.modulo === moduloId || t.moduloId === moduloId
    );
    if (tareasDeModulo.length === 0) {
      setModulosSeleccionados(
        modulosSeleccionados.filter((m) => m !== moduloId)
      );
      return;
    }
    if (modulosSeleccionados.includes(moduloId)) {
      setModulosSeleccionados(
        modulosSeleccionados.filter((m) => m !== moduloId)
      );
    } else {
      setModulosSeleccionados([...modulosSeleccionados, moduloId]);
    }
  };

  const abrirModal = (moduloId) => {
    setModuloActivo(moduloId);

    const tareasPersonalizadas = tareasUnidad.filter(
      (t) => t.modulo === moduloId
    );

    const tareasPredefinidas = (TAREAS_POR_MODULO[moduloId] || []).map(
      (nombre) => ({
        id: `${moduloId}_${nombre.replace(/\s+/g, "_").toLowerCase()}`,
        nombre,
        modulo: moduloId,
        personalizada: false,
      })
    );

    const todasLasTareas = [
      ...tareasPredefinidas,
      ...tareasPersonalizadas,
    ].filter(
      (t, index, self) => self.findIndex((o) => o.id === t.id) === index
    );

    // 👇 recuperar las tareas que ya había confirmado el usuario en este módulo
    const yaSeleccionadas = tareasUnidad.filter((t) => t.modulo === moduloId);

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
      nombre: t.nombre,
      modulo: t.modulo,
      tiempoEstimado: t.tiempoEstimado || 0,
      definicion: t.definicion,
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

  if (!unidad) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Configuración de la unidad:</Text>
      <Text style={styles.title}>{unidad.nombre} </Text>

      <Text style={styles.subtitle}>Duración del ciclo (días):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duracionCiclo}
        onChangeText={setDuracionCiclo}
      />

      <Text style={styles.subtitle}>Selecciona los módulos:</Text>
      {MODULOS_DISPONIBLES.map((modulo) => (
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
});
