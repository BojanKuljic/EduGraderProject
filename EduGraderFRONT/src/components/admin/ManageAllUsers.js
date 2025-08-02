import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/ManageAllUsers.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [editState, setEditState] = useState({});
  const [restrictionMap, setRestrictionMap] = useState({});
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [createUserState, setCreateUserState] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8845/admin/all-users");
      setUsers(response.data);
      const map = {};
      response.data.forEach((u) => {
        map[u.email] = u.restrictions && u.restrictions.includes("login");
      });
      setRestrictionMap(map);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  };

  const toggleCard = (email) => {
    setActiveCard((prev) => (prev === email ? null : email));
    const user = users.find((u) => u.email === email);
    setEditState((prev) => ({
      ...prev,
      [email]: {
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      },
    }));
  };

  const handleChange = (email, field, value) => {
    setEditState((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async (originalEmail) => {
    try {
      await axios.put(
        `http://localhost:8845/admin/update/${originalEmail}`,
        editState[originalEmail],
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("User updated successfully.");
      setActiveCard(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user.");
    }
  };

  const handleRoleChange = async (email, newRole) => {
    try {
      await axios.put(
        `http://localhost:8845/admin/role/${email}`,
        JSON.stringify(newRole),
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success("Role updated.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role.");
    }
  };

  const toggleRestriction = async (email) => {
    const isRestricted = restrictionMap[email];
    const route = isRestricted ? "unrestrict" : "restrict";

    try {
      const response = await axios.post(
        `http://localhost:8845/admin/${route}`,
        { restriction: "login", email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success(isRestricted ? "Restriction removed." : "Restriction added.");
        setRestrictionMap((prev) => ({ ...prev, [email]: !isRestricted }));
      } else {
        toast.error("Server rejected restriction request.");
      }
    } catch (error) {
      console.error("RESTRICT ERROR FULL:", error);
      const msg = error.response?.data || "Unknown error.";
      toast.error(`Server error: ${JSON.stringify(msg)}`);
    }
  };

  const handleDelete = async (email) => {
    try {
      await axios.delete(`http://localhost:8845/admin/delete/${email}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const handleCreateUser = async () => {
    const formData = new FormData();
    formData.append("name", createUserState.name);
    formData.append("email", createUserState.email);
    formData.append("password", createUserState.password);
    formData.append("role", createUserState.role);

    try {
      const response = await axios.post("http://localhost:8845/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        toast.success("User created successfully.");
        setCreateUserState({ name: "", email: "", password: "", role: "Student" });
        setShowCreateCard(false);
        fetchUsers();
      } else {
        toast.error("Failed to create user.");
      }
    } catch (error) {
      toast.error("Server error while creating user.");
    }
  };

  return (
    <div>
      <div className="manage-users-container">
        <h2>All Users in System</h2>
        <div className="users-list">
          <button
            className="create-btn"
            onClick={() => setShowCreateCard((prev) => !prev)}
          >
            {showCreateCard ? "🢁 Close Form 🢁 " : "+ Create New User +"}
          </button>

          {showCreateCard && (

            <div className="user-card" autoComplete="off">
              <h3><strong>Create New User</strong></h3>
              <input
                className="edit-input-2"
                placeholder="Name"
                value={createUserState.name}
                onChange={(e) => setCreateUserState({ ...createUserState, name: e.target.value })}
                autoComplete="off"
              />
              <input
                className="edit-input-2"
                placeholder="Email"
                value={createUserState.email}
                onChange={(e) => setCreateUserState({ ...createUserState, email: e.target.value })}
                autoComplete="off"
                name="new-user-email"
              />
              <input
                className="edit-input-2"
                type="password"
                placeholder="Password"
                value={createUserState.password}
                onChange={(e) => setCreateUserState({ ...createUserState, password: e.target.value })}
                autoComplete="new-password"
                name="BIG-password"  // ovo sprečava autofill
              />
              <select
                className="edit-input-2"
                value={createUserState.role}
                onChange={(e) => setCreateUserState({ ...createUserState, role: e.target.value })}
                autoComplete="off"
                name="new-user-role"
              >
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
                <option value="Admin">Admin</option>
              </select>
              <button className="create-btn" onClick={handleCreateUser}>Create</button>
            </div>

          )}


          {users.map((user) => (
            <div key={user.email} className="user-card">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Status:</strong> {restrictionMap[user.email] ? "Restricted" : "Unrestricted"}</p>
              <button className="manage-btn" onClick={() => toggleCard(user.email)}>
                {activeCard === user.email ? "Close" : "Manage"}
              </button>

              {activeCard === user.email && (
                <div className="manage-section">
                  <input
                    className="edit-input"
                    value={editState[user.email]?.name || ""}
                    onChange={(e) => handleChange(user.email, "name", e.target.value)}
                    placeholder="Name"
                    autoComplete="off"
                  />
                  <input
                    className="edit-input"
                    value={editState[user.email]?.email || ""}
                    onChange={(e) => handleChange(user.email, "email", e.target.value)}
                    placeholder="Email"
                    autoComplete="off"
                  />
                  <input
                    className="edit-input"
                    type="password"
                    value={editState[user.email]?.password || ""}
                    onChange={(e) => handleChange(user.email, "password", e.target.value)}
                    placeholder="New Password"
                    autoComplete="new-password"
                  />
                  <select
                    className="edit-input"
                    value={editState[user.email]?.role}
                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                  >
                    <option value="Student">Student</option>
                    <option value="Professor">Professor</option>
                    <option value="Admin">Admin</option>
                  </select>

                  <div className="manage-actions">
                    <button className="update-btn" onClick={() => handleUpdate(user.email)}>Save Changes</button>
                    <button className="restriction-btn" onClick={() => toggleRestriction(user.email)}>
                      {restrictionMap[user.email] ? "Unrestrict" : "Restrict"}
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(user.email)}>Delete</button>
                  </div>
                </div>
              )}
            </div>

          ))}

        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "55px" }} />

    </div>
  );
};

export default ManageAllUsers;
