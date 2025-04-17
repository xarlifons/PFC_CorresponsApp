export const initialAuthState = {
  isLoading: true, // true mientras se comprueba si hay token guardado
  isAuthenticated: false, // cambia a true tras login exitoso
  user: null, // opcional: podemos guardar info del usuario aquí
  token: null, // el token JWT o similar
};

export function authReducer(state, action) {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: action.payload.token ? true : false,
        isLoading: false,
      };

    case "LOGIN":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || null,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

    default:
      return state;
  }
}
