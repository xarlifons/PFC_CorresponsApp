import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

export function useRedirectByEstadoFase1(
  momentoActual,
  pantallaDestino,
  refreshTrigger
) {
  const { state, getUnidadById } = useAuth();
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

        const unidad = await getUnidadById(unidadId);

        if (!unidad || !unidad.estadoFase1) {
          console.warn("⚠️ Unidad no encontrada o sin estadoFase1.");
          return;
        }

        const estadoActual = unidad.estadoFase1;

        if (estadoActual !== momentoActual) {
          console.log(
            `🔁 Redirigiendo desde "${momentoActual}" a "${pantallaDestino}"...`
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
