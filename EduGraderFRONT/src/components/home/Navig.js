import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, AuthContext } from '../auth/AuthContext';
import '../../styles/home/Navig.css';

const Navig = () => {
  const { logout } = useAuth();
  const { role } = useContext(AuthContext);
  const [storedRole, setStoredRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (role) {
      setStoredRole(role);
    } else {
      const savedAuth = localStorage.getItem("authState");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setStoredRole(parsed.role || "Guest");
      } else {
        setStoredRole("Guest");
      }
    }
  }, [role, location]);

  const handleLogout = () => {
    logout();
    setStoredRole("Guest");
    navigate('/login');
  };

  return (
    <>
      {/* GUEST NAVBAR */}
      {storedRole === "Guest" && (
        <nav className="navbar">
          <ul className="navbar-list">
             <li className="navbar-item">
              <NavLink to="/" className="navbar-link">Welcome</NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/login" className="navbar-link">Login</NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/signup" className="navbar-link">Sign Up</NavLink>
            </li>
           
          </ul>
        </nav>
      )}

      {/* STUDENT NAVBAR */}
      {storedRole === 'Student' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item"><NavLink to="/upload" className="navbar-link">Upload</NavLink></li>
            <li className="navbar-item"><NavLink to="/status" className="navbar-link">Status</NavLink></li>
            <li className="navbar-item"><NavLink to="/review" className="navbar-link">Review</NavLink></li>
            <li className="navbar-item"><NavLink to="/recommendation" className="navbar-link">Recommendation</NavLink></li>
            <li className="navbar-item"><NavLink to="/progress" className="navbar-link">Progress</NavLink></li>
            <li className="navbar-item"><button className="logout-button" onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      )}

      {/* PROFESSOR NAVBAR */}
      {storedRole === 'Professor' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item"><NavLink to="/studentsuploads" className="navbar-link">Student Uploads</NavLink></li>
            <li className="navbar-item"><NavLink to="/grades" className="navbar-link">Grades</NavLink></li>
            <li className="navbar-item"><NavLink to="/generatedreport" className="navbar-link">Generated Report</NavLink></li>
            <li className="navbar-item"><NavLink to="/studentsprogress" className="navbar-link">Students Progress</NavLink></li>
            <li className="navbar-item"><NavLink to="/suggestions" className="navbar-link">Suggestions</NavLink></li>
            <li className="navbar-item"><button className="logout-button" onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      )}

      {/* ADMIN NAVBAR */}
      {storedRole === 'Admin' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item"><NavLink to="/manageusers" className="navbar-link">Manage Users</NavLink></li>
            <li className="navbar-item"><NavLink to="/systemsettings" className="navbar-link">System Settings</NavLink></li>
            <li className="navbar-item"><button className="logout-button" onClick={handleLogout}>Logout</button></li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navig;
