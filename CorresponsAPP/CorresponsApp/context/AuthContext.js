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

      await asignarUnidad(unidad.id); // 💡 reutilizamos función
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

      // Reutilizamos función existente
      await asignarUnidad(unidad.id);
    } catch (error) {
      console.error("❌ Error al unirse por código:", error);
      throw error;
    }
  };

  // Acción: cerrar sesión
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    } catch (e) {
      console.error("Error borrando datos de sesión: ", e);
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
