import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function SelectUnitTypeScreen({ navigation }) {
  const { state, logout, crearYAsignarUnidad, unirseUnidadPorCodigo } =
    useAuth();

  const [modo, setModo] = useState(null); // 'crear' | 'unirse'
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Redirigir automáticamente si el usuario ya tiene unidad asignada
  useEffect(() => {
    console.log("🧠 Verificando unidadAsignada:", state?.user?.unidadAsignada);
    if (state?.user?.unidadAsignada) {
      navigation.replace("SurveyParametersScreen");
    }
  }, [state?.user?.unidadAsignada]);

  const handleLogout = async () => {
    await logout(); // limpia AsyncStorage y estado global
  };

  const handleCrear = async () => {
    if (!nombreUnidad.trim()) {
      Alert.alert("Error", "Introduce un nombre para la unidad.");
      return;
    }

    try {
      setLoading(true);
      await crearYAsignarUnidad(nombreUnidad);
      // 🔁 La redirección la hará el useEffect
    } catch (error) {
      Alert.alert("Error al crear unidad", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnirse = async () => {
    if (!codigoAcceso.trim()) {
      Alert.alert("Error", "Introduce el código de acceso.");
      return;
    }

    try {
      setLoading(true);
      await unirseUnidadPorCodigo(codigoAcceso);
      // 🔁 La redirección la hará el useEffect
    } catch (error) {
      Alert.alert("Error al unirse a la unidad", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a CorresponsAPP</Text>
      <Text style={styles.title}>Hola, {state.user.nombre}</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Cerrar sesión" color="#d9534f" onPress={handleLogout} />
      </View>

      {!state.user.unidadAsignada && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
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
