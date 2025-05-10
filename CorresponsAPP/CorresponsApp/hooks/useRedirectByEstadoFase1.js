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
        // 1) Asegurarnos de que el usuario y la unidad estén cargados
        if (!state.user) {
          console.warn("⚠️ state.user no está disponible aún.");
          return;
        }
        const unidadId = state.user.unidadAsignada;
        if (!unidadId) {
          console.warn("⚠️ unidadAsignada no disponible todavía.");
          return;
        }

        // 2) Obtener el estado actual desde el backend
        const estadoActual = await getEstadoFase1(unidadId);
        if (!estadoActual) {
          console.warn("⚠️ No recibo estadoFase1 del servidor.");
          return;
        }

        // 3) Si ya está completada, vamos al dashboard final
        if (estadoActual === "completada") {
          console.log(
            "🏁 Fase1 completada, navegando a ExecutionDashboardScreen"
          );
          navigation.replace("ExecutionDashboardScreen");
          return;
        }

        // 4) Si no coincide con el momentoActual esperado, redirigimos
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
