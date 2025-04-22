import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../styles/Signup.css";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("role", form.role);

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Network or server error!");
    }
  };

  return (
    <div className="Box2">
      <span className="BorderLine2"></span>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <div className="InputBox2">
          <input
            type="text"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <span>Full Name</span>
          <i></i>
        </div>

        <div className="InputBox2">
          <input
            type="email"
            required
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <span>Email</span>
          <i></i>
        </div>

        <div className="InputBox2">
          <input
            type="password"
            required
            name="password"
            value={form.password}
            onChange={handleChange}
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
                checked={form.role === "Student"}
                onChange={handleChange}
              />
              Student
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Profesor"
                checked={form.role === "Profesor"}
                onChange={handleChange}
              />
              Professor
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="Admin"
                checked={form.role === "Admin"}
                onChange={handleChange}
              />
              Admin
            </label>
          </div>
        </div>

        <input type="submit" id="Submit2" value="Sign Up" />
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;
