import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Button,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function SelectUnitTypeScreen() {
  const {
    state,
    crearYAsignarUnidad,
    unirseUnidadPorCodigo,
    actualizarEstadoFase1,
  } = useAuth();

  const [modo, setModo] = useState(null); // 'crear' | 'unirse'
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [unidadNombre, setUnidadNombre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshRedirect, setRefreshRedirect] = useState(false);
  const animationRef = useRef(null);

  // 🔁 Redirección automática según estadoFase1
  useRedirectByEstadoFase1(
    "momento0",
    "UnitConfigurationScreen",
    refreshRedirect
  );

  // ✅ LOG de control del estado de autenticación
  console.log("🧠 Auth state en render:", state);

  // ✅ Verificamos que state.user exista antes de renderizar
  if (!state.user) {
    console.warn("⚠️ Usuario no disponible aún. Mostrando pantalla vacía...");
    return null;
  }

  const handleCrear = async () => {
    if (!nombreUnidad.trim()) {
      Alert.alert("⚠️ Error", "Introduce un nombre para la unidad.");
      return;
    }

    try {
      setLoading(true);
      const unidad = await crearYAsignarUnidad(nombreUnidad);
      setUnidadNombre(unidad.nombre);
      animationRef.current?.play();
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnirse = async () => {
    if (!codigoAcceso.trim()) {
      Alert.alert("⚠️ Error", "Introduce el código de acceso.");
      return;
    }

    try {
      setLoading(true);
      const unidad = await unirseUnidadPorCodigo(codigoAcceso);
      setUnidadNombre(unidad.nombre);
      animationRef.current?.play();
      // No actualizamos estadoFase1 aquí: ya debe estar en momento1
      setRefreshRedirect((prev) => !prev); // fuerza ejecución del hook
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContinuar = async () => {
    if (modo === "crear") {
      try {
        const unidadId = state.user.unidadAsignada;
        await actualizarEstadoFase1(unidadId, "momento1");
        setRefreshRedirect((prev) => !prev); // fuerza revalidación del hook
      } catch (error) {
        Alert.alert("❌ Error", "No se pudo actualizar el estado.");
      }
    } else {
      // Si viene de unirse, ya está en el estado correcto
      setRefreshRedirect((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a CorresponsAPP</Text>

      {!unidadNombre && (
        <>
          <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setModo("crear")}
            >
              <Text style={styles.buttonText}>Crear unidad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setModo("unirse")}
            >
              <Text style={styles.buttonText}>Unirme a una unidad</Text>
            </TouchableOpacity>
          </View>

          {modo === "crear" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la unidad"
                value={nombreUnidad}
                onChangeText={setNombreUnidad}
              />
              <Button
                title={loading ? "Creando..." : "Crear y continuar"}
                onPress={handleCrear}
                disabled={loading}
              />
            </>
          )}

          {modo === "unirse" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Código de acceso"
                value={codigoAcceso}
                onChangeText={setCodigoAcceso}
                autoCapitalize="characters"
              />
              <Button
                title={loading ? "Uniéndome..." : "Unirme y continuar"}
                onPress={handleUnirse}
                disabled={loading}
              />
            </>
          )}
        </>
      )}

      {unidadNombre && (
        <>
          <LottieView
            ref={animationRef}
            source={require("../../assets/animations/fireworks.json")}
            autoPlay={false}
            loop={false}
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.subtitle}>
            🎉 ¡Te has unido a la unidad **{unidadNombre}**!
          </Text>
          <Button title="Continuar" color="#28a745" onPress={handleContinuar} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    width: "100%",
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
