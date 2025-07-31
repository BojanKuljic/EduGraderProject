import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/admin/ManageAllUsers.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingRole, setEditingRole] = useState({});
  const [restrictionMap, setRestrictionMap] = useState({});
  const [editMode, setEditMode] = useState({});
  const [updatedUser, setUpdatedUser] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8845/admin/all-users");
      setUsers(response.data);

      const map = {};
      response.data.forEach((u) => {
        map[u.email] = false;
      });
      setRestrictionMap(map);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  };

  const handleRoleChange = async (email, newRole) => {
    try {
      await axios.put(`http://localhost:8845/admin/role/${email}`, newRole, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Role updated.");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update role.");
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

  const toggleRestriction = async (email) => {
    const isRestricted = restrictionMap[email];
    try {
      const route = isRestricted ? "unrestrict" : "restrict";
      await axios.post(`http://localhost:8845/admin/${route}`, {
        restriction: "login",
        email,
      });
      toast.info(isRestricted ? "Restriction removed." : "Restriction added.");
      setRestrictionMap((prev) => ({ ...prev, [email]: !isRestricted }));
    } catch (error) {
      toast.error("Failed to update restriction.");
    }
  };

  const handleUpdateUser = async (originalEmail) => {
    try {
      await axios.put(
        `http://localhost:8845/admin/update/${originalEmail}`,
        updatedUser
      );
      toast.success("User updated successfully.");
      setEditMode({ ...editMode, [originalEmail]: false });
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user.");
    }
  };

  return (
    <div className="manage-users-container">
      <h2>Manage All Users In System</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Change Role</th>
            <th>Restriction</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isEditing = editMode[user.email];
            return (
              <tr key={user.email}>
                <td>
                  {isEditing ? (
                    <input
                      className="edit-input"
                      value={updatedUser.name}
                      onChange={(e) =>
                        setUpdatedUser({ ...updatedUser, name: e.target.value })
                      }
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      className="edit-input"
                      value={updatedUser.email}
                      onChange={(e) =>
                        setUpdatedUser({ ...updatedUser, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </td>

                <td>{user.role}</td>
                <td>
                  <div className="role-action-container">
                    <select
                      value={editingRole[user.email] || user.role}
                      onChange={(e) =>
                        setEditingRole({
                          ...editingRole,
                          [user.email]: e.target.value,
                        })
                      }
                    >
                      <option value="Student">Student</option>
                      <option value="Professor">Professor</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <button
                      className="action-btn"
                      onClick={() =>
                        handleRoleChange(
                          user.email,
                          editingRole[user.email] || user.role
                        )
                      }
                    >
                      Save
                    </button>
                  </div>
                </td>
                <td>
                  <button
                    className={`restriction-btn ${restrictionMap[user.email] ? "restricted" : ""
                      }`}
                    onClick={() => toggleRestriction(user.email)}
                  >
                    {restrictionMap[user.email] ? "Restricted" : "Unrestricted"}
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    {isEditing ? (
                      <button
                        className="update-btn"
                        onClick={() => handleUpdateUser(user.email)}
                      >
                        Update
                      </button>
                    ) : (
                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditMode({ ...editMode, [user.email]: true });
                          setUpdatedUser({
                            name: user.name,
                            email: user.email,
                            password: user.password,
                          });
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.email)}
                    >
                      Delete
                    </button>
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default ManageAllUsers;
