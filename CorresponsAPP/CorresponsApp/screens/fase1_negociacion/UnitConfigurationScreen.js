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
} from "react-native";
import LottieView from "lottie-react-native";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function UnitConfigurationScreen({ navigation }) {
  const {
    state,
    getUnidadInfoCompleta,
    actualizarConfiguracionUnidad,
    actualizarEstadoFase1,
  } = useAuth();
  const [unidad, setUnidad] = useState(null);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const [duracionCiclo, setDuracionCiclo] = useState("30");
  const animationRef = useRef(null);

  useRedirectByEstadoFase1("momento1", "SurveyParametersScreen");

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

  const toggleModulo = (modulo) => {
    setModulosSeleccionados((prev) =>
      prev.includes(modulo)
        ? prev.filter((m) => m !== modulo)
        : [...prev, modulo]
    );
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
      await actualizarConfiguracionUnidad({
        modulosActivados: modulosSeleccionados,
        cicloCorresponsabilidad: parseInt(duracionCiclo),
      });

      await actualizarEstadoFase1("momento2");
      Alert.alert(
        "✅ Configuración guardada",
        "Se ha actualizado correctamente."
      );
    } catch (error) {
      Alert.alert("❌ Error", "No se pudo guardar la configuración.");
      console.error(error);
    }
  };

  const MODULOS_DISPONIBLES = [
    "limpieza",
    "cocina",
    "cuidado_infancia",
    "compras",
    "gestiones",
  ];

  if (!unidad) return null;

  const yaTieneConfiguracion = unidad.modulosActivados?.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Unidad: {unidad.nombre}</Text>
      <LottieView
        ref={animationRef}
        source={require("../../assets/animations/fireworks.json")}
        autoPlay={false}
        loop={false}
        style={{
          width: 160,
          height: 160,
          alignSelf: "center",
          marginBottom: 10,
        }}
      />

      {yaTieneConfiguracion ? (
        <>
          <Text style={styles.subtitle}>🧩 Módulos activados:</Text>
          {unidad.modulosActivados.map((modulo) => (
            <Text key={modulo}>• {modulo}</Text>
          ))}
          <Text style={styles.subtitle}>
            📆 Ciclo de corresponsabilidad: {unidad.cicloCorresponsabilidad}{" "}
            días
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Selecciona los módulos:</Text>
          <View style={styles.modulesContainer}>
            {MODULOS_DISPONIBLES.map((modulo) => (
              <TouchableOpacity
                key={modulo}
                onPress={() => toggleModulo(modulo)}
                style={[
                  styles.moduloButton,
                  modulosSeleccionados.includes(modulo) &&
                    styles.selectedModulo,
                ]}
              >
                <Text style={styles.moduloText}>{modulo}</Text>
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
            title="Guardar configuración"
            onPress={handleGuardarConfiguracion}
          />
        </>
      )}

      {unidad.estadoFase1 !== "finalizado" && (
        <View style={{ marginTop: 20 }}>
          <Button
            title="Continuar con la negociación"
            color="#28a745"
            onPress={() => {
              switch (unidad.estadoFase1) {
                case "momento1":
                  navigation.replace("SurveyParametersScreen");
                  break;
                case "momento2":
                  navigation.replace("TaskNegotiationThresholdScreen");
                  break;
                case "momento3":
                  navigation.replace("TaskNegotiationAssignmentScreen");
                  break;
                default:
                  Alert.alert("Error", "Estado no reconocido");
              }
            }}
          />
        </View>
      )}

      {unidad.estadoFase1 === "finalizado" && (
        <View style={{ marginTop: 20 }}>
          <Button title="Ver Fase 2" onPress={() => {}} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
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
    marginBottom: 16,
  },
  moduloButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
    margin: 5,
  },
  selectedModulo: {
    backgroundColor: "#007AFF",
  },
  moduloText: {
    color: "#000",
    fontWeight: "bold",
  },
});
