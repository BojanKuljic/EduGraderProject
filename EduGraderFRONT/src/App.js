import { Routes, Route, Navigate } from "react-router-dom";
import Navig from "./components/home/Navig";
import {  PrivateRoute } from "./components/auth/AuthContext";
import { useAuth } from "./components/auth/AuthContext"; // ili tvoj tačan path


// Home/Auth
import Login from "./components/home/Login";
import Signup from "./components/home/Signup";
import Welcome from "./components/home/Welcome";
import Forbidden from "./components/auth/Forbidden";

// Student Components
import Upload from "./components/student/Upload";
import Status from "./components/student/Status";
import Review from "./components/student/Review";
import Progress from "./components/student/Progress";
import Recommendation from "./components/student/Recommendation";

// Professor Components
import StudentsUploads from "./components/professor/StudentsUploads";
import Suggestions from "./components/professor/Suggestions";
import StudentsProgress from "./components/professor/StudentsProgress";
import GeneratedReport from "./components/professor/GeneratedReport";

// Admin Components
import ManageAllUsers from "./components/admin/ManageAllUsers";
import SystemsSettings from "./components/admin/SystemsSettings";

import "./App.css";

function App() {

  return (
    <div className="App">
      <Navig />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Student */}
        <Route
          path="/upload"
          element={
            <PrivateRoute allowedRoles={["Student"]} routeKey="upload">
              <Upload />
            </PrivateRoute>
          }
        />
          <Route
          path="/status"
          element={
            <PrivateRoute allowedRoles={["Student"]} routeKey="status">
              <Status />
            </PrivateRoute>
          }
       />
        
        <Route
          path="/review"
          element={
            <PrivateRoute allowedRoles={["Student"]} routeKey="review">
              <Review />
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute allowedRoles={["Student"]} routeKey="progress">
              <Progress />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendation"
          element={
            <PrivateRoute allowedRoles={["Student"]} routeKey="recommendation">
              <Recommendation />
            </PrivateRoute>
          }
        />

        {/* Professor */}
        <Route
          path="/studentsuploads"
          element={
            <PrivateRoute allowedRoles={["Professor"]} routeKey="studentsuploads">
              <StudentsUploads />
            </PrivateRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <PrivateRoute allowedRoles={["Professor"]} routeKey="suggestions">
              <Suggestions />
            </PrivateRoute>
          }
        />
        <Route
          path="/studentsprogress"
          element={
            <PrivateRoute allowedRoles={["Professor"]} routeKey="studentsprogress">
              <StudentsProgress />
            </PrivateRoute>
          }
        />
        <Route
          path="/generatedreport"
          element={
            <PrivateRoute allowedRoles={["Professor"]} routeKey="generatedreport">
              <GeneratedReport />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/manageusers"
          element={
            <PrivateRoute allowedRoles={["Admin"]} routeKey="manageusers">
              <ManageAllUsers />
            </PrivateRoute>
          }
        />
        <Route
          path="/systemsettings"
          element={
            <PrivateRoute allowedRoles={["Admin"]} routeKey="systemsettings">
              <SystemsSettings />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
