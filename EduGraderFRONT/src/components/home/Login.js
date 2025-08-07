import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../auth/AuthContext";
import "../../styles/home/Login.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

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
      const response = await axios.post("http://localhost:8845/login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("Login successful!");
        const data = response.data;
        console.log("LOGIN response data:", data);

        // Sacuvaj restrikcije lokalno
        sessionStorage.setItem("email", data.email);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("restrictions", JSON.stringify(data.restrictions || []));

        login({
          role: data.role,
          email: data.email,
          restrictions: data.restrictions || [],
        });

        setTimeout(() => {
          switch (data.role) {
            case "Admin":
              navigate("/manageusers");
              break;
            case "Professor":
              navigate("/studentsuploads");
              break;
            case "Student":
              navigate("/upload");
              break;
            default:
              navigate("/");
          }
        }, 2000);
      } else {
        toast.error(response.data.error || "Login failed");
      }
    } catch (error) {
      if (error.response) {
        const errMsg = error.response.data || "Invalid credentials or role";
        toast.error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
      } else {
        toast.error("Network error. Try again later.");
      }
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
          //  autoComplete="off"
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
          //  autoComplete="off"
          />
          <span>Password</span>
          <i></i>
        </div>

        <div className="roleBox">
          <span className={role ? "roleLabel active" : "roleLabel"}>
            Role
          </span>
          <div className="roleOptions">
            <label>
              <input
                type="radio"
                name="role"
                value="Student"
                checked={role === "Student"}
                onChange={(e) => {
                  setRole((prev) => (prev === e.target.value ? "" : e.target.value));
                }} />
              Student
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Professor"
                checked={role === "Professor"}
                onChange={(e) => {
                  setRole((prev) => (prev === e.target.value ? "" : e.target.value));
                }} />
              Professor
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={role === "Admin"}
                onChange={(e) => {
                  setRole((prev) => (prev === e.target.value ? "" : e.target.value));
                }} />
              Admin
            </label>
          </div>
        </div>

        <input type="submit" id="submit" value="Login" />
      </form>
      <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "60px" }} />
    </div>
  );
};

export default Login;
