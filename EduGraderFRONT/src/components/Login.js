import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import "../styles/Login.css";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        login(data.role, email);
        sessionStorage.setItem("email", email);

        // Navigacija na osnovu role
        switch (data.role) {
          case "Admin":
            navigate("/admin-dashboard");
            break;
          case "Profesor":
            navigate("/professor-dashboard");
            break;
          case "Student":
            navigate("/student-dashboard");
            break;
          default:
            navigate("/"); // fallback
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Login failed");
      }
    } catch (error) {
      toast.error("Network or server error!");
    }
  };

  return (
    <div className="box">
      <span className="borderLine"></span>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="inputBox">
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span>Email</span>
          <i></i>
        </div>
        <div className="inputBox">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span>Password</span>
          <i></i>
        </div>

        <div className="roleBox">
          <span>Role</span>
          <div className="roleOptions">
            <label>
              <input
                type="radio"
                name="role"
                value="Student"
                checked={role === "Student"}
                onChange={(e) => setRole(e.target.value)}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Professor"
                checked={role === "Professor"}
                onChange={(e) => setRole(e.target.value)}
              />
              Professor
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={role === "Admin"}
                onChange={(e) => setRole(e.target.value)}
              />
              Admin
            </label>
          </div>
        </div>

        <input type="submit" id="submit" value="Login" />
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
