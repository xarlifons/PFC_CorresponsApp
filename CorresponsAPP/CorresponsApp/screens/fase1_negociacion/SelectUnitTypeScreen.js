import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import LottieView from "lottie-react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function SelectUnitTypeScreen() {
  const {
    state,
    crearYAsignarUnidad,
    unirseUnidadPorCodigo,
    actualizarEstadoFase1,
  } = useAuth();

  const [modo, setModo] = useState(null);
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [newCodigoAcceso, setNewCodigoAcceso] = useState("");
  const [unidadNombre, setUnidadNombre] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshRedirect, setRefreshRedirect] = useState(false);
  const [mostrarIconoCasa, setMostrarIconoCasa] = useState(false);
  const animationRef = useRef(null);

  useRedirectByEstadoFase1(
    "momento0",
    "UnitConfigurationScreen",
    refreshRedirect
  );

  useEffect(() => {
    if (state?.user?.unidadAsignada && !unidadNombre) {
      setUnidadNombre("tu unidad"); // O busca el nombre real si es necesario
    }
  }, [state?.user]);

  useEffect(() => {
    if (unidadNombre) {
      animationRef.current?.play();

      setTimeout(() => {
        setMostrarIconoCasa(true);
      }, 2000); // Mostrar icono 2s después del inicio de la animación
    }
  }, [unidadNombre]);

  const handleCrear = async () => {
    if (!nombreUnidad.trim()) {
      Alert.alert("⚠️ Error", "Introduce un nombre para la unidad.");
      return;
    }

    try {
      setLoading(true);
      const nombreUnidadTrim = nombreUnidad.trim();
      const unidad = await crearYAsignarUnidad(nombreUnidadTrim);
      setUnidadNombre(unidad.nombre);
      setNewCodigoAcceso(unidad.codigoAcceso);
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
      setRefreshRedirect((prev) => !prev);
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
        setRefreshRedirect((prev) => !prev);
      } catch (error) {
        Alert.alert("❌ Error", "No se pudo actualizar el estado.");
      }
    } else {
      setRefreshRedirect((prev) => !prev);
    }
  };

  if (!state.user) return null;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Bienvenido a CorresponsAPP</Text>

        {!unidadNombre && (
          <>
            <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setModo("crear")}
              >
                <Text style={styles.buttonText}>Crear unidad</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
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
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleCrear}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Creando..." : "Crear y continuar"}
                  </Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleUnirse}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Uniéndome..." : "Unirme y continuar"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {unidadNombre && (
          <View style={styles.successCard}>
            {!mostrarIconoCasa ? (
              <LottieView
                ref={animationRef}
                source={require("../../assets/animations/fireworks.json")}
                autoPlay={false}
                loop={false}
                style={{ width: 200, height: 200 }}
              />
            ) : (
              <Icon
                name="home"
                size={120}
                color="#000000"
                style={{ marginVertical: 20 }}
              />
            )}

            <Text style={styles.successText}>
              🎉 ¡Te has unido a la unidad{" "}
              <Text style={styles.unitName}>{unidadNombre}</Text>!
            </Text>
            <Text style={styles.message}>
              Facilita este código a tu compañera/o para unirse a esta unidad:
            </Text>

            <View style={styles.newCodigoAccesoBox}>
              <Text style={styles.newCodigoAccesoTexto}>
                {newCodigoAcceso ? newCodigoAcceso : codigoAcceso}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinuar}
            >
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 20,
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
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  successCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginTop: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  unitName: {
    color: "#28a745",
    fontWeight: "bold",
  },
  message: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginVertical: 10,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  newCodigoAccesoBox: {
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  newCodigoAccesoTexto: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 2,
  },
});
