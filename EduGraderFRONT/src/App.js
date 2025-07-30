import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navig from "./components/home/Navig";
import { PrivateRoute } from "./components/auth/AuthContext";

// Home/Auth
import Login from "./components/home/Login";
import Signup from "./components/home/Signup";
import Welcome from "./components/home/Welcome";
import { useAuth } from "./components/auth/AuthContext";

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
        {/* Public routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Student routes */}
        <Route element={<PrivateRoute allowedRoles={["Student"]} />}>
          <Route path="/upload" element={<Upload />} />
          <Route path="/status" element={<Status />} />
          <Route path="/review" element={<Review />} />
           <Route path="/progress" element={<Progress />} />
          <Route path="/recommendation" element={<Recommendation />} />         
        </Route>

        {/* Professor routes */}
        <Route element={<PrivateRoute allowedRoles={["Professor"]} />}>
          <Route path="/studentsuploads" element={<StudentsUploads />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/studentsprogress" element={<StudentsProgress />} />
          <Route path="/generatedreport" element={<GeneratedReport />} />
                    
        </Route>

        {/* Admin routes */}
        <Route element={<PrivateRoute allowedRoles={["Admin"]} />}>
          <Route path="/manageusers" element={<ManageAllUsers />} />
          <Route path="/systemsettings" element={<SystemsSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;