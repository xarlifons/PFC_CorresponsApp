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

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        logout,
        register,
        crearYAsignarUnidad,
        asignarUnidad,
        unirseUnidadPorCodigo,
        getUnidadById,
        getUnidadInfoCompleta,
        refreshToken,
        actualizarConfiguracionUnidad,
        actualizarEstadoFase1,
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
