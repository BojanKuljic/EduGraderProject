import React from "react";
import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./components/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import StudentDashboard from "./components/StudentDashboard";
import ProfessorDashboard from "./components/ProfessorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Forbidden from "./components/Forbidden";
import Navig from "./components/Navig";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          <Route
            path="/student-dashboard"
            element={
              <PrivateRoute allowedRoles={["Student"]}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/professor-dashboard"
            element={
              <PrivateRoute allowedRoles={["Profesor"]}>
                <ProfessorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/forbidden" element={<Forbidden />} />
        </Routes>

        {/* Navigacija ako želiš globalnu traku */}
        <Navig />
      </header>
    </div>
  );
}

export default App;
