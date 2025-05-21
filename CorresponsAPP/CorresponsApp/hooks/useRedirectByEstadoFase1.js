import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export function useRedirectByEstadoFase1(
  momentoActual,
  pantallaDestino,
  refreshTrigger
) {
  const { state, getEstadoFase1 } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const verificarRedireccion = async () => {
      try {
        if (!state.user) {
          console.warn("⚠️ state.user no está disponible aún.");
          return;
        }
        const unidadId = state.user.unidadAsignada;
        if (!unidadId) {
          console.warn("⚠️ unidadAsignada no disponible todavía.");
          return;
        }

        const estadoActual = await getEstadoFase1(unidadId);
        if (!estadoActual) {
          console.warn("⚠️ No recibo estadoFase1 del servidor.");
          return;
        }

        if (estadoActual === "completada") {
          console.log(
            "🏁 Fase1 completada, navegando a ExecutionDashboardScreen"
          );
          navigation.replace("ExecutionDashboardScreen");
          return;
        }

        if (estadoActual !== momentoActual) {
          console.log(
            `🔁 Estado Fase1="${estadoActual}" no es "${momentoActual}", navegando a "${pantallaDestino}"`
          );
          navigation.replace(pantallaDestino);
        } else {
          console.log(
            `✅ Estás en la pantalla correcta para estadoFase1: ${estadoActual}`
          );
        }
      } catch (error) {
        console.error("❌ Error al verificar estadoFase1:", error.message);
      }
    };

    verificarRedireccion();
  }, [state.user?.unidadAsignada, refreshTrigger]);
}
