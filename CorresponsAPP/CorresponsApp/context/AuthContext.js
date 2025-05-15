import { createContext, useContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authReducer, initialAuthState } from "./AuthReducer";
import { API_BASE_URL } from "../utils/apiConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userJson = await AsyncStorage.getItem("user");
        const user = userJson ? JSON.parse(userJson) : null;

        if (token && user) {
          const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) throw new Error("Token expirado o inválido");

          const data = await response.json();

          await AsyncStorage.setItem("token", data.token);
          await AsyncStorage.setItem(
            "user",
            JSON.stringify({
              nombre: data.nombre,
              email: data.email,
              role: data.role,
              unidadAsignada: data.unidadAsignada || null,
            })
          );

          dispatch({
            type: "LOGIN",
            payload: {
              token: data.token,
              user: {
                nombre: data.nombre,
                email: data.email,
                role: data.role,
                unidadAsignada: data.unidadAsignada || null,
              },
            },
          });
        } else {
          throw new Error("No hay token o usuario");
        }
      } catch (e) {
        console.warn("No se pudo renovar el token:", e.message);
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        dispatch({
          type: "RESTORE_TOKEN",
          payload: { token: null, user: null },
        });
      }
    };

    checkToken();
  }, []);

  const register = async ({ nombre, email, password }) => {
    try {
      console.log("📤 Enviando al backend:", { nombre, email, password });
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const text = await response.text(); // Captura incluso si no es JSON

      if (!response.ok) {
        console.error("Error en el backend:", response.status, text);
        throw new Error(`(${response.status}) ${text}`);
      }

      const data = JSON.parse(text);

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          role: data.role,
          unidadAsignada: data.unidadAsignada || null,
        })
      );

      dispatch({
        type: "LOGIN",
        payload: {
          token: data.token,
          user: {
            nombre: data.nombre,
            email: data.email,
            role: data.role,
            unidadAsignada: data.unidadAsignada || null,
          },
        },
      });
    } catch (e) {
      console.error("❌ Error en el registro:", e);
      throw e;
    }
  };

  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`(${response.status}) ${errorText}`);
      }

      const data = await response.json();

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          role: data.role,
          unidadAsignada: data.unidadAsignada || null,
        })
      );

      dispatch({
        type: "LOGIN",
        payload: {
          token: data.token,
          user: {
            nombre: data.nombre,
            email: data.email,
            role: data.role,
            unidadAsignada: data.unidadAsignada || null,
          },
        },
      });
    } catch (e) {
      alert("Error al iniciar sesión:\n" + e.message);
    }
  };

  const asignarUnidad = async (unidadId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/asignar-unidad/${unidadId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al asignar unidad: ${errorText}`);
      }

      const updatedUser = {
        ...state.user,
        unidadAsignada: unidadId,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      dispatch({
        type: "LOGIN",
        payload: {
          token: state.token,
          user: updatedUser,
        },
      });

      console.log("✅ Unidad asignada correctamente:", unidadId);
    } catch (error) {
      console.error("❌ Error asignando unidad:", error);
      throw error;
    }
  };

  const crearYAsignarUnidad = async (nombreUnidad) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/unidad/crear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ nombre: nombreUnidad }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear unidad: ${errorText}`);
      }

      const unidad = await response.json();
      await asignarUnidad(unidad.id);

      return unidad; // ✅ Ahora se devuelve correctamente
    } catch (error) {
      console.error("❌ Error creando y asignando unidad:", error);
      throw error;
    }
  };

  const unirseUnidadPorCodigo = async (codigoAcceso) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/unidad/unirse?codigo=${codigoAcceso}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al unirse: ${errorText}`);
      }

      const unidad = await response.json();
      await asignarUnidad(unidad.id);

      return unidad; // ✅ También aquí
    } catch (error) {
      console.error("❌ Error al unirse por código:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    } catch (e) {
      console.error("Error borrando datos de sesión: ", e);
    }
  };

  const getUnidadById = async (unidadId) => {
    console.log("📡 getUnidadById -> unidadId:", unidadId);
    console.log("🔐 Token utilizado:", state.token);

    try {
      const response = await fetch(`${API_BASE_URL}/api/unidad/${unidadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ Error al obtener unidad: ${errorText}`);
      }

      const unidad = await response.json();
      return unidad;
    } catch (error) {
      console.error("⚠️ Error en getUnidadById:", error.message);
      throw error;
    }
  };

  const getUnidadInfoCompleta = async (unidadId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/unidad/${unidadId}/info-completa`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al obtener info completa: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getUnidadInfoCompleta:", error.message);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (!response.ok) throw new Error("Error al renovar token");

      const data = await response.json();

      await AsyncStorage.setItem("user", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: { ...data, token: state.token } });
    } catch (error) {
      console.error("❌ Error al refrescar token:", error.message);
      throw error;
    }
  };

  const actualizarConfiguracionUnidad = async (unidadId, configuracion) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/unidad/${unidadId}/configurar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify(configuracion),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al actualizar configuración: ${text}`);
      }

      console.log("✅ Configuración de unidad actualizada.");
    } catch (error) {
      console.error(
        "❌ Error en actualizarConfiguracionUnidad:",
        error.message
      );
      throw error;
    }
  };

  const actualizarEstadoFase1 = async (unidadId, nuevoEstado) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/unidad/${unidadId}/estado-fase1`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
          body: JSON.stringify({ estadoFase1: nuevoEstado }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al actualizar estadoFase1: ${text}`);
      }

      console.log("🌀 estadoFase1 actualizado a:", nuevoEstado);
    } catch (error) {
      console.error("❌ Error en actualizarEstadoFase1:", error.message);
      throw error;
    }
  };

  const getConsensoFase1 = async (unidadId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/unidad/${unidadId}/consenso-fase1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al obtener consenso fase 1: ${text}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getConsensoFase1:", error.message);
      throw error;
    }
  };

  const getModulosYTareas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/modulos-tareas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al obtener módulos y tareas: ${text}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        const modulosArray = Object.values(data);
        return modulosArray;
      }
      return data;
    } catch (error) {
      console.error("❌ Error en getModulosYTareas:", error.message);
      throw error;
    }
  };

  const getGruposIniciales = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/modulos-tareas/grupos-iniciales`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al obtener grupos de encuesta: ${text}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error en getGruposIniciales:", error.message);
      throw error;
    }
  };

  const getGruposTareas = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/modulos-tareas/grupos-tareas`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al obtener grupos de tareas: ${text}`);
      }

      const data = await response.json();
      return Object.values(data); // Convertimos de {id: {...}} a [{...}, {...}]
    } catch (error) {
      console.error("❌ Error en getGruposTareas:", error.message);
      throw error;
    }
  };

  // Obtiene módulos, tareasUnidad y estadoFase1
  const getUnidadConfiguracion = async (unidadId) => {
    const response = await fetch(`${API_BASE_URL}/api/unidad/${unidadId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      },
    });
    +(
      // --- NUEVO: inspeccionamos status y body ---
      console.log("📝 getUnidadConfiguracion → status:", response.status)
    );
    const raw = await response.text();
    console.log("📝 getUnidadConfiguracion → body:", raw);

    if (!response.ok) {
      // incluimos el status en el error
      throw new Error(
        `Error al obtener configuración de unidad (status ${response.status}): ${raw}`
      );
    }
    // Si aquí llega, raw es JSON válido
    return JSON.parse(raw);
    // if (!response.ok) {
    //   const text = await response.text();
    //   throw new Error(`Error al obtener configuración de unidad: ${text}`);
    // }
    // return response.json(); // { modulosActivados, cicloCorresponsabilidad, tareasUnidad, estadoFase1 }
  };

  const getEstadoFase1 = async (unidadId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/estado-fase1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      }
    );
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`Error al obtener estadoFase1: ${msg}`);
    }
    // si tu endpoint devuelve { estadoFase1: "momentoX" }:
    const { estadoFase1 } = await response.json();
    return estadoFase1;
  };

  const enviarEncuestaYRecibirUmbral = async (unidadId, respuestas) => {
    console.log("📤 Enviando respuestas de encuesta al backend:");
    respuestas.forEach((r, idx) => {
      console.log(
        `  [${idx}] grupo=${r.grupo}, tarea=${r.tarea}, periodicidad=${r.periodicidad}, intensidad=${r.intensidad}, cargaMental=${r.cargaMental}`
      );
    });

    const response = await fetch(
      `${API_BASE_URL}/api/encuesta/parametros/devolver/${unidadId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(respuestas),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`(${response.status}) ${text}`);
    }
    const { umbralLimpieza } = await response.json();
    return umbralLimpieza;
  };

  const guardarConsensoFinal = async (unidadId, consensoFinal) => {
    const response = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/consenso-final`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(consensoFinal),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(${response.status}) ${errorText}`);
    }
  };

  // GET la media de encuesta por grupo
  const getInitialConsensus = async (unidadId) => {
    const res = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/consenso-fase1`,

      { headers: { Authorization: `Bearer ${state.token}` } }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // Map<grupoId, SurveyParametersDTO>
  };

  // POST para persistir ese consenso en la unidad
  const persistInitialConsensus = async (unidadId, consensoList) => {
    const res = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/consenso-inicial`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(consensoList), // List<ConsensoUmbralLimpiezaUnidad>
      }
    );
    if (!res.ok) throw new Error(await res.text());
  };

  const guardarConsensoInicial = async (unidadId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/consenso-inicial`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(${response.status}) ${errorText}`);
    }
  };

  const instanciarTareas = async (unidadId, instances) => {
    const response = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/tareas/instanciar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(instances),
      }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`(${response.status}) ${text}`);
    }
    return response.json(); // devuelve la lista de Tarea instanciadas
  };

  const getTareasInstanciadas = async (unidadId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/unidad/${unidadId}/tareas/instanciadas`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`(${response.status}) ${errorText}`);
    }

    return await response.json(); // Lista de tareas instanciadas
  };

  const getTareasBase = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tareas`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Error al obtener tareas base: ${text}`);
      }

      const data = await response.json();
      return data; // debería ser un objeto tipo { "1": { nombre: "..." }, ... }
    } catch (error) {
      console.error("❌ Error en getTareasBase:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        register,
        getUnidadById,
        getUnidadInfoCompleta,
        getConsensoFase1,
        getModulosYTareas,
        getGruposIniciales,
        getGruposTareas,
        getUnidadConfiguracion,
        getEstadoFase1,
        crearYAsignarUnidad,
        asignarUnidad,
        unirseUnidadPorCodigo,
        refreshToken,
        actualizarConfiguracionUnidad,
        actualizarEstadoFase1,
        enviarEncuestaYRecibirUmbral,
        guardarConsensoFinal,
        guardarConsensoInicial,
        getInitialConsensus,
        persistInitialConsensus,
        instanciarTareas,
        getTareasInstanciadas,
        getTareasBase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para acceder fácilmente al contexto
export function useAuth() {
  return useContext(AuthContext);
}
