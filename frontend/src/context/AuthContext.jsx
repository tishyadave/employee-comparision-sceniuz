import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("sa_token");
    const userRaw = localStorage.getItem("sa_user");
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        dispatch({ type: "LOGIN", payload: { user, token } });
      } catch {
        localStorage.removeItem("sa_token");
        localStorage.removeItem("sa_user");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authService.login(email, password);
    const { token, user } = data.data;
    localStorage.setItem("sa_token", token);
    localStorage.setItem("sa_user", JSON.stringify(user));
    dispatch({ type: "LOGIN", payload: { user, token } });
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sa_token");
    localStorage.removeItem("sa_user");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
