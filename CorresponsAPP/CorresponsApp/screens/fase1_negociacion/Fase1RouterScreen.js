import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Fase1RouterScreen() {
  const { state, getUnidadById } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unidadId = state.user.unidadAsignada;
    console.log("🔍 unidadId actual:", unidadId);

    const redirigirSegunEstadoFase1 = async () => {
      if (!unidadId) {
        console.warn(
          "⚠️ Usuario sin unidad asignada. Redirigiendo a SelectUnitTypeScreen."
        );
        setTimeout(() => {
          navigation.replace("SelectUnitTypeScreen");
        }, 10);
        return;
      } else {
        try {
          const unidad = await getUnidadById(unidadId);
          const estado = unidad?.estadoFase1;

          switch (estado) {
            case "momento0":
              navigation.replace("SelectUnitTypeScreen");
              break;
            case "momento1":
              navigation.replace("UnitConfigurationScreen");
              break;
            case "momento2":
              navigation.replace("SurveyParametersScreen");
              break;
            case "momento3":
              navigation.replace("TaskNegotiationThresholdScreen");
              break;
            case "momento4":
              navigation.replace("TaskNegotiationAssignmentScreen");
              break;
            case "completada":
              navigation.replace("ExecutionDashboardScreen");
              break;
            default:
              console.warn("⚠️ Estado de Fase 1 no reconocido:", estado);
              navigation.replace("SelectUnitTypeScreen");
          }
        } catch (error) {
          console.error(
            "❌ Error al obtener estado de la unidad:",
            error.message
          );
          navigation.replace("SelectUnitTypeScreen");
        }
      }
    };

    redirigirSegunEstadoFase1();
  }, [state.user?.unidadAsignada]);

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Unidad Asignada: {state.user.nombre}</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  texto: {
    fontSize: 20,
    color: "#000",
  },
});
