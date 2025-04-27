import React, { useState, useEffect, useRef } from "react";
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
import LottieView from "lottie-react-native";
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
  const [moduloActivo, setModuloActivo] = useState(null);
  const [tareasDelModulo, setTareasDelModulo] = useState([]);
  const [tareasSeleccionadas, setTareasSeleccionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  const animationRef = useRef(null);

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
      "Limpiar ducha o bañera",
      "Limpiar lavabo e inodoro",
      "Limpiar terraza o balcón",
    ],
    cocina_alimentacion: [
      "Cocinar comidas principales",
      "Fregar platos o lavar lavavajillas",
      "Planificar menú semanal",
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
      "Cambiar sábanas",
      "Organizar armarios",
      "Ordenar habitaciones",
    ],
    bano_higiene: [
      "Limpiar inodoro",
      "Limpiar lavabo y espejo",
      "Limpiar ducha/bañera",
      "Reponer papel higiénico y jabón",
      "Cambiar toallas",
    ],
    cuidados_familiares: [
      "Ayudar higiene personal niños/as",
      "Supervisar deberes escolares",
      "Acompañar a actividades extraescolares",
      "Preparar mochilas escolares",
    ],
    mantenimiento_hogar: [
      "Revisar bombillas y fusibles",
      "Realizar arreglos menores",
      "Revisar electrodomésticos",
      "Montar o desmontar muebles",
    ],
    plantas_mascotas: [
      "Regar plantas",
      "Podar plantas",
      "Cuidar jardín",
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
      "Llenar depósito de gasolina",
      "Renovar ITV o documentación",
    ],
  };

  useEffect(() => {
    const cargarUnidad = async () => {
      try {
        if (state.user?.unidadAsignada) {
          const info = await getUnidadInfoCompleta(state.user.unidadAsignada);
          setUnidad(info);
          if (info?.modulosActivados?.length) {
            setModulosSeleccionados(info.modulosActivados);
            setDuracionCiclo(info.cicloCorresponsabilidad?.toString());
          }
          animationRef.current?.play();
        }
      } catch (error) {
        console.error("❌ Error al cargar unidad:", error);
      }
    };
    cargarUnidad();
  }, [state.user?.unidadAsignada]);

  useEffect(() => {
    if (route.params?.nuevaTarea) {
      setTareasUnidad((prev) => [
        ...prev,
        { ...route.params.nuevaTarea, personalizada: true },
      ]);
    }
  }, [route.params?.nuevaTarea]);

  const toggleModulo = (moduloId) => {
    if (modulosSeleccionados.includes(moduloId)) {
      setModulosSeleccionados(
        modulosSeleccionados.filter((m) => m !== moduloId)
      );
      setTareasUnidad(tareasUnidad.filter((t) => t.moduloId !== moduloId));
    } else {
      setModulosSeleccionados([...modulosSeleccionados, moduloId]);
      abrirModal(moduloId);
    }
  };

  const abrirModal = (moduloId) => {
    setModuloActivo(moduloId);
    const tareasIniciales = [
      ...(TAREAS_POR_MODULO[moduloId] || []).map((nombre) => ({
        id: `${moduloId}_${nombre.replace(/\s+/g, "_").toLowerCase()}`,
        nombre,
        moduloId,
        definicion: "Pendiente de definir",
        tiempoEstimado: 30,
        agrupacionId: moduloId,
        completada: false,
        personalizada: false,
      })),
      ...(tareasUnidad.filter((t) => t.moduloId === moduloId) || []),
    ];
    setTareasDelModulo(tareasIniciales);
    setTareasSeleccionadas(tareasIniciales);
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

  const confirmarTareasModulo = () => {
    const nuevasTareas = tareasUnidad.filter(
      (t) => t.moduloId !== moduloActivo
    );
    setTareasUnidad([...nuevasTareas, ...tareasSeleccionadas]);
    setModalVisible(false);
  };

  const handleGuardarConfiguracion = async () => {
    if (modulosSeleccionados.length === 0 || !duracionCiclo.trim()) {
      Alert.alert(
        "Campos incompletos",
        "Selecciona al menos un módulo y duración del ciclo."
      );
      return;
    }
    setLoading(true);
    try {
      await actualizarConfiguracionUnidad({
        unidadId: state.user.unidadAsignada,
        modulosActivados: modulosSeleccionados,
        cicloCorresponsabilidad: parseInt(duracionCiclo),
        tareasUnidad,
      });
      await actualizarEstadoFase1(state.user.unidadAsignada, "momento2");
      Alert.alert(
        "✅ Configuración guardada",
        "Se ha actualizado correctamente."
      );
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!unidad) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Unidad: {unidad.nombre}</Text>
      <LottieView
        ref={animationRef}
        source={require("../../assets/animations/fireworks.json")}
        autoPlay={false}
        loop={false}
        style={styles.lottie}
      />

      <Text style={styles.subtitle}>Selecciona los módulos:</Text>
      <View style={styles.modulesContainer}>
        {MODULOS_DISPONIBLES.map((modulo) => (
          <TouchableOpacity
            key={modulo.id}
            onPress={() => toggleModulo(modulo.id)}
            style={[
              styles.moduloButton,
              modulosSeleccionados.includes(modulo.id) && styles.selectedModulo,
            ]}
          >
            <Text style={styles.moduloText}>{modulo.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.subtitle}>Duración del ciclo (días):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={duracionCiclo}
        onChangeText={setDuracionCiclo}
      />

      <Button
        title={loading ? "Guardando..." : "Guardar configuración"}
        onPress={handleGuardarConfiguracion}
        disabled={loading}
      />

      {/* Modal con scroll para muchas tareas */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Módulo:{" "}
            {MODULOS_DISPONIBLES.find((m) => m.id === moduloActivo)?.nombre ||
              ""}
          </Text>

          <Button
            title="➕ Crear nueva tarea personalizada"
            onPress={() => {
              setModalVisible(false);
              navigation.navigate("CreateTaskScreen", {
                moduloId: moduloActivo,
              });
            }}
          />

          <Text style={styles.modalSubtitle}>Tareas del módulo:</Text>

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
                  item.personalizada && styles.tareaItemPersonalizada,
                ]}
              >
                <Text>{item.nombre}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 80 }} // Para que no se superponga con botones
          />

          <Button title="Confirmar selección" onPress={confirmarTareasModulo} />
          <Button
            title="Cancelar"
            color="red"
            onPress={() => setModalVisible(false)}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  subtitle: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    width: "100%",
    marginBottom: 16,
  },
  modulesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  moduloButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
    margin: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },

  selectedModulo: { backgroundColor: "#007AFF" },
  moduloText: { color: "#000", fontWeight: "bold" },
  lottie: { width: 160, height: 160, alignSelf: "center", marginBottom: 10 },
  modalContainer: { flex: 1, padding: 24, backgroundColor: "#fff" },
  tareaItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  tareaItemSelected: { backgroundColor: "#d0f0c0" },
  tareaItemPersonalizada: { backgroundColor: "#fff8dc" },
});
