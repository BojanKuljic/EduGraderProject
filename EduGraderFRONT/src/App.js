import React from "react";
import { Routes, Route } from "react-router-dom";
import Navig from "./components/home/Navig";
import { PrivateRoute } from "./components/auth/AuthContext";

// Home/Auth
import Login from "./components/home/Login";
import Signup from "./components/home/Signup";
import Welcome from "./components/home/Welcome";

import Forbidden from "./components/auth/Forbidden";

// Student Components
import Upload from "./components/student/Upload";
import Status from "./components/student/Status";
import Review from "./components/student/Review";
import Recommendation from "./components/student/Recommendation";
import Progress from "./components/student/Progress";

// Professor Components
import StudentsUploads from "./components/professor/StudentsUploads";
import Grades from "./components/professor/Grades";
import GeneratedReport from "./components/professor/GeneratedReport";
import StudentsProgress from "./components/professor/Studentsprogress";
import Suggestions from "./components/professor/Suggestions";

// Admin Components
import ManageAllUsers from "./components/admin/ManageAllUsers";
import SystemsSettings from "./components/admin/SystemsSettings";

import "./App.css";

function App() {
  return (
    <div className="App">
      <Navig />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Student routes */}
        <Route
          path="/upload"
          element={
            <PrivateRoute allowedRoles={["Student"]}>
              <Upload />
            </PrivateRoute>
          }
        />
        <Route
          path="/status"
          element={
            <PrivateRoute allowedRoles={["Student"]}>
              <Status />
            </PrivateRoute>
          }
        />
        <Route
          path="/review"
          element={
            <PrivateRoute allowedRoles={["Student"]}>
              <Review />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendation"
          element={
            <PrivateRoute allowedRoles={["Student"]}>
              <Recommendation />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute allowedRoles={["Student"]}>
              <Progress />
            </PrivateRoute>
          }
        />

        {/* Professor routes */}
        <Route
          path="/studentsuploads"
          element={
            <PrivateRoute allowedRoles={["Professor"]}>
              <StudentsUploads />
            </PrivateRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <PrivateRoute allowedRoles={["Professor"]}>
              <Grades />
            </PrivateRoute>
          }
        />
        <Route
          path="/generatedreport"
          element={
            <PrivateRoute allowedRoles={["Professor"]}>
              <GeneratedReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/studentsprogress"
          element={
            <PrivateRoute allowedRoles={["Professor"]}>
              <StudentsProgress />
            </PrivateRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <PrivateRoute allowedRoles={["Professor"]}>
              <Suggestions />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/manageusers"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <ManageAllUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/systemsettings"
          element={
            <PrivateRoute allowedRoles={["Admin"]}>
              <SystemsSettings />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
