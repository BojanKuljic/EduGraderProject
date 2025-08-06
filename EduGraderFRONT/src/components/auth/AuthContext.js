import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedState = localStorage.getItem("authState");
    return storedState
      ? JSON.parse(storedState)
      : {
          isAuthenticated: false,
          role: null,
          email: null,
          restrictions: [],
        };
  });

  useEffect(() => {
    localStorage.setItem("authState", JSON.stringify(authState));
  }, [authState]);

  useEffect(() => {
    if (authState.isAuthenticated && authState.email) {
      refreshRestrictions(authState.email);
    }
  }, []);

  const login = (user) => {
    const { role, email, restrictions = [] } = user;
    setAuthState({
      isAuthenticated: true,
      role,
      email,
      restrictions,
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      email: null,
      restrictions: [],
    });
  };

  const refreshRestrictions = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:8845/user/${email}/restrictions`
      );
      const freshRestrictions = response.data || [];

      setAuthState((prev) => ({
        ...prev,
        restrictions: freshRestrictions,
      }));
    } catch (err) {
      console.error("❌ Failed to refresh restrictions:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...authState, login, logout, refreshRestrictions }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook za korišćenje auth konteksta
export const useAuth = () => useContext(AuthContext);

// PrivateRoute komponenta
export const PrivateRoute = ({ allowedRoles, routeKey, children }) => {
  const {
    isAuthenticated,
    role,
    restrictions,
    email,
    refreshRestrictions,
  } = useAuth();

  const [blocked, setBlocked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Provera pristupa
  useEffect(() => {
    if (!isAuthenticated || !role) return;

    const isBlocked =
      !allowedRoles.includes(role) || restrictions.includes(routeKey);

    setBlocked(isBlocked);
  }, [restrictions, role, routeKey]);

  // Povremeni refresh
  useEffect(() => {
    if (isAuthenticated && email) {
      const interval = setInterval(() => {
        refreshRestrictions(email);
      }, 500); // manji refresh interval ako ne koristiš Gemini
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, email]);

  // Čuvaj poslednju validnu rutu osim forbidden
  useEffect(() => {
    if (!blocked && location.pathname !== "/forbidden") {
      sessionStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname, blocked]);

  // Ako mu je restrikcija uklonjena, vrati ga sa forbidden
  useEffect(() => {
    if (!blocked && location.pathname === "/forbidden") {
      const last = sessionStorage.getItem("lastRoute") || "/";
      navigate(last, { replace: true });
    }
  }, [blocked, location.pathname, navigate]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (blocked) return <Navigate to="/forbidden" replace />;

  return children;
};
