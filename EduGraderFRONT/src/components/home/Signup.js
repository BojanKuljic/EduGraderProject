import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "../../styles/home/Signup.css";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      role: prev.role === value ? "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      toast.error("Please select a role.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("role", form.role);

    try {
const response = await axios.post("http://localhost:8845/signup", formData);


      if (response.status === 200) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(response.data?.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Network or server error!");
    }
  };

  return (
    <div className="Box2">
      <span className="BorderLine2"></span>
      <form onSubmit={handleSubmit} autoComplete="off">
        <h2 className="SignUp">Sign Up</h2>

        <div className="InputBox2">
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            autoComplete="off"
          />
          <span>Full Name</span>
          <i></i>
        </div>

        <div className="InputBox2">
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="off"
          />
          <span>Email</span>
          <i></i>
        </div>

        <div className="InputBox2">
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <span>Password</span>
          <i></i>
        </div>

        <div className="roleBox">
          <span className={form.role ? "roleLabel active" : "roleLabel"}>Role</span>
          <div className="roleOptions">
            {["Student", "Professor", "Admin"].map((role) => (
              <label key={role}>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={() => handleRoleChange(role)}
                />
                {role}
              </label>
            ))}
          </div>
        </div>

        <input type="submit" id="Submit2" value="Sign Up" />

        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ marginTop: "60px" }}
        />
      </form>
    </div>
  );
};

export default Signup;
