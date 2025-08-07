import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/ManageAllUsers.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [editState, setEditState] = useState({});
  const [selectedRestrictions, setSelectedRestrictions] = useState({});
  const [lastSelectedRestriction, setLastSelectedRestriction] = useState({});
  const [showCreateCard, setShowCreateCard] = useState(false);
  const availableRestrictions = {
    Student: ["upload", "status", "review", "progress", "recommendation", "login"],
    Professor: ["studentsuploads", "suggestions", "studentsprogress", "generatedreport", "login"],
    Admin: ["manageusers", "systemsettings", "login"],
  };
  const [createUserState, setCreateUserState] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8845/admin/all-users");
      setUsers(response.data);
      const initialSelected = {};
      response.data.forEach((u) => {
        initialSelected[u.email] = [];
      });
      setSelectedRestrictions(initialSelected);
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
        password: user.password,
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


  const handleRestrictionChange = (email, value) => {
    setSelectedRestrictions((prev) => {
      const current = prev[email] || [];

      if (!value || current.includes(value)) return prev;

      return {
        ...prev,
        [email]: [...current, value],
      };
    });

    setLastSelectedRestriction((prev) => ({
      ...prev,
      [email]: value,
    }));
  };


  const handleRestrict = async (email) => {
    const selected = selectedRestrictions[email] || [];
    const role = users.find((u) => u.email === email)?.role;

    if (!selected.length) {
      toast.warn("Please select a restriction.");
      return;
    }

    if (selected.includes("ALL")) {
      try {
        await axios.post("http://localhost:8845/admin/set-restrictions", {
          email,
          restrictions: availableRestrictions[role],
        });
        toast.success("All restrictions applied.");
        fetchUsers();
        return;
      } catch (err) {
        toast.error("Failed to apply all restrictions.");
        return;
      }
    }

    // Dodaj pojedinačne restrikcije jednu po jednu
    for (const restriction of selected) {
      try {
        await axios.post("http://localhost:8845/admin/restrict", {
          email,
          restriction,
        });
      } catch (err) {
        toast.error(`Failed to apply restriction: ${restriction}`);
      }
    }

    toast.success("Restriction(s) applied.");
    fetchUsers();
  };

  const handleUnrestrict = async (email) => {
    const selected = selectedRestrictions[email];
    if (!selected || selected.length === 0) {
      toast.warn("Please select a restriction.");
      return;
    }

    // Ako je izabrano ALL → obriši sve restrikcije
    if (selected.includes("ALL")) {
      try {
        await axios.post("http://localhost:8845/admin/remove-all-restrictions", { email });
        toast.success("All restrictions removed.");
        fetchUsers();
      } catch (err) {
        toast.error("Failed to remove all restrictions.");
      }
      return;
    }

    // Inače, ukloni svaku pojedinačno izabranu restrikciju
    try {
      for (const restriction of selected) {
        await axios.post("http://localhost:8845/admin/unrestrict", {
          email,
          restriction,
        });
      }
      toast.success("Selected restriction(s) removed.");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to remove restriction(s).");
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
      const response = await axios.post("http://localhost:8845/signup", formData);
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
        <button className="create-btn" onClick={() => setShowCreateCard((prev) => !prev)}>
          {showCreateCard ? "🢁 Close Form 🢁" : "+ Create New User +"}
        </button>

        {showCreateCard && (
          <div className="user-card">
            <h3>Create New User</h3>
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
            />
            <input
              className="edit-input-2"
              type="text"
              placeholder="Password"
              value={createUserState.password}
              onChange={(e) => setCreateUserState({ ...createUserState, password: e.target.value })}
              autoComplete="off"
            />
            <select
              className={`edit-input-2 ${createUserState.role === "" ? "placeholder" : ""}`}
              value={createUserState.role}
              onChange={(e) => setCreateUserState({ ...createUserState, role: e.target.value })}
            >
              <option value="" disabled hidden>Select role</option>
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
            <p><strong>Status:</strong> {user.restrictions?.length > 0 ? "Restricted" : "Unrestricted"}</p>
            <p><strong>Restrictions:</strong> {user.restrictions?.join(", ") || "None"}</p>

            <button className="manage-btn" onClick={() => toggleCard(user.email)}>
              {activeCard === user.email ? "Close" : "Manage"}
            </button>

            {activeCard === user.email && (
              <div className="manage-section">
                <input
                  className="edit-input"
                  value={editState[user.email]?.name || ""}
                  onChange={(e) => handleChange(user.email, "name", e.target.value)}
                />
                <input
                  className="edit-input"
                  value={editState[user.email]?.email || ""}
                  onChange={(e) => handleChange(user.email, "email", e.target.value)}
                />
                <input
                  className="edit-input"
                  type="text"
                  value={editState[user.email]?.password || ""}
                  onChange={(e) => handleChange(user.email, "password", e.target.value)}
                  name="custom-pasword"
                  autoComplete="off"
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

                <select
                  className="edit-input"
                  value=""
                  onChange={(e) => handleRestrictionChange(user.email, e.target.value)}
                >
                  <option value="" disabled hidden>
                    {lastSelectedRestriction[user.email] || "Select restriction"}
                  </option>
                  <option value="ALL">-- apply_all_restrictions --</option>
                  {availableRestrictions[user.role]?.map((res) => (
                    <option key={res} value={res}>{`-- ${res} --`}</option>
                  ))}
                </select>
                <div className="manage-actions">
                  <button className="update-btn" onClick={() => handleUpdate(user.email)}>Save Changes</button>
                  <button className="restriction-btn" onClick={() => handleRestrict(user.email)}>Restrict  </button>
                  <button className="restriction-btn" onClick={() => handleUnrestrict(user.email)}>Unrestrict</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.email)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}

      </div>
      <ToastContainer position="top-center" autoClose={2000} style={{ marginTop: "55px" }} />
    </div>
  );
};

export default ManageAllUsers;
