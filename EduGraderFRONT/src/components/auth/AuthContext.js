import { Navigate } from "react-router-dom";
import React, { createContext, useContext, useEffect, useState } from "react";

// Kontekst za autentifikaciju
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedState = localStorage.getItem("authState");
    return storedState
      ? JSON.parse(storedState)
      : { isAuthenticated: false, role: null, email: null };
  });

  useEffect(() => {
    localStorage.setItem("authState", JSON.stringify(authState));
  }, [authState]);

  const login = (role, email) => {
    setAuthState({ isAuthenticated: true, role, email });
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, role: null, email: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook za korišćenje auth konteksta
export const useAuth = () => useContext(AuthContext);

// Ruta za zaštitu stranica po rolama
export const PrivateRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

