import React, { useEffect, useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Navig.css';
import { useAuth, AuthContext } from './AuthContext';

const Navig = () => {
  const { logout } = useAuth();
  const { role } = useContext(AuthContext);
  const [storedRole, setStoredRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStoredRole(role);
  }, [role]);

  const handleLogout = () => {
    logout();
    setStoredRole(null);
    navigate('/login');
  };

  return (
    <>
      {!storedRole && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/login" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
                Login
              </NavLink>
            </li>
            <li className="navbar-item">
              <NavLink to="/signup" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
                Sign Up
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      {storedRole === 'Student' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/student-dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
                Moj Napredak
              </NavLink>
            </li>
            <li className="navbar-item">
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>
      )}

      {storedRole === 'Profesor' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/professor-dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
                Pregled Radova
              </NavLink>
            </li>
            <li className="navbar-item">
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>
      )}

      {storedRole === 'Admin' && (
        <nav className="navbar">
          <ul className="navbar-list">
            <li className="navbar-item">
              <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? 'navbar-link active' : 'navbar-link'}>
                Admin Panel
              </NavLink>
            </li>
            <li className="navbar-item">
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Navig;