import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";
import { apiUrl } from "../config/api";

const API_URL = apiUrl("/users");

function AdminUsers() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  function getToken() {
    return localStorage.getItem("token") || user?.token || "";
  }

  function getAxiosConfig() {
    return {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    };
  }

  function handleAuthenticationError(currentError) {
    if (
      currentError.response?.status === 401 ||
      currentError.response?.status === 403
    ) {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        API_URL,
        getAxiosConfig()
      );

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
        ? data.users
        : [];

      setUsers(userList);
    } catch (currentError) {
      console.error("Fetch users error:", currentError);

      if (handleAuthenticationError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Could not load users."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id) {
    const selectedUser = users.find(
      (currentUser) => currentUser._id === id
    );

    if (selectedUser?.isAdmin) {
      setError("An administrator account cannot be deleted here.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/${id}`,
        getAxiosConfig()
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) => currentUser._id !== id
        )
      );

      setSuccess("User deleted successfully.");
    } catch (currentError) {
      console.error("Delete user error:", currentError);

      if (handleAuthenticationError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Could not delete the user."
      );
    } finally {
      setDeletingId("");
    }
  }

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return users;
    }

    return users.filter((currentUser) => {
      const name = String(
        currentUser.name || ""
      ).toLowerCase();

      const email = String(
        currentUser.email || ""
      ).toLowerCase();

      return (
        name.includes(searchText) ||
        email.includes(searchText)
      );
    });
  }, [users, search]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <p style={smallLabelStyle}>Riani Shop Admin</p>

            <h1 style={titleStyle}>Users Management</h1>

            <p style={subtitleStyle}>
              View and manage registered customer accounts.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            style={{
              ...refreshButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading..." : "Refresh Users"}
          </button>
        </div>

        {error && (
          <div style={errorMessageStyle}>
            {error}
          </div>
        )}

        {success && (
          <div style={successMessageStyle}>
            {success}
          </div>
        )}

        <section style={summaryGridStyle}>
          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              Total users
            </span>

            <strong style={summaryNumberStyle}>
              {users.length}
            </strong>
          </div>

          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              Customers
            </span>

            <strong style={summaryNumberStyle}>
              {
                users.filter(
                  (currentUser) => !currentUser.isAdmin
                ).length
              }
            </strong>
          </div>

          <div style={summaryCardStyle}>
            <span style={summaryLabelStyle}>
              Administrators
            </span>

            <strong style={summaryNumberStyle}>
              {
                users.filter(
                  (currentUser) => currentUser.isAdmin
                ).length
              }
            </strong>
          </div>
        </section>

        <section style={controlsStyle}>
          <input
            type="search"
            placeholder="Search name or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            style={searchInputStyle}
          />
        </section>

        {loading ? (
          <div style={messageCardStyle}>
            <h2>Loading users...</h2>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={messageCardStyle}>
            <h2>No users found</h2>

            <p style={mutedTextStyle}>
              No user matches your current search.
            </p>
          </div>
        ) : (
          <section style={tableCardStyle}>
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((currentUser) => (
                    <tr key={currentUser._id}>
                      <td style={tdStyle}>
                        <div style={userCellStyle}>
                          <div style={avatarStyle}>
                            {currentUser.name
                              ? currentUser.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}
                          </div>

                          <strong>
                            {currentUser.name || "Unknown user"}
                          </strong>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {currentUser.email || "-"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            ...roleBadgeStyle,
                            ...(currentUser.isAdmin
                              ? adminBadgeStyle
                              : customerBadgeStyle),
                          }}
                        >
                          {currentUser.isAdmin
                            ? "Administrator"
                            : "Customer"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            deleteUser(currentUser._id)
                          }
                          disabled={
                            currentUser.isAdmin ||
                            deletingId === currentUser._id
                          }
                          style={{
                            ...deleteButtonStyle,
                            opacity:
                              currentUser.isAdmin ||
                              deletingId === currentUser._id
                                ? 0.5
                                : 1,
                            cursor:
                              currentUser.isAdmin ||
                              deletingId === currentUser._id
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {deletingId === currentUser._id
                            ? "Deleting..."
                            : currentUser.isAdmin
                            ? "Protected"
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 6% 90px",
  backgroundColor: "#f5f6f8",
};

const containerStyle = {
  maxWidth: "1300px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "30px",
};

const smallLabelStyle = {
  margin: "0 0 6px",
  color: "#777777",
  fontSize: "12px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 44px)",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#666666",
  lineHeight: 1.6,
};

const refreshButtonStyle = {
  padding: "13px 20px",
  border: "1px solid #111111",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#111111",
  fontWeight: "700",
};

const errorMessageStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  border: "1px solid #efb7b7",
  borderRadius: "8px",
  backgroundColor: "#fff0f0",
  color: "#a00000",
};

const successMessageStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  border: "1px solid #b8dfc1",
  borderRadius: "8px",
  backgroundColor: "#edf9f0",
  color: "#146c2e",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "18px",
  marginBottom: "24px",
};

const summaryCardStyle = {
  padding: "22px",
  border: "1px solid #e3e3e3",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const summaryLabelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#777777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
};

const summaryNumberStyle = {
  fontSize: "30px",
};

const controlsStyle = {
  marginBottom: "22px",
};

const searchInputStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "14px 16px",
  border: "1px solid #d5d5d5",
  borderRadius: "8px",
  fontSize: "15px",
  outline: "none",
};

const tableCardStyle = {
  overflow: "hidden",
  border: "1px solid #e2e2e2",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: "760px",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "16px",
  textAlign: "left",
  backgroundColor: "#f3f4f6",
  borderBottom: "1px solid #dddddd",
  color: "#555555",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "16px",
  borderBottom: "1px solid #eeeeee",
};

const userCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const avatarStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontWeight: "800",
};

const roleBadgeStyle = {
  display: "inline-block",
  padding: "7px 11px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
};

const adminBadgeStyle = {
  backgroundColor: "#e8e5ff",
  color: "#4d3ca6",
};

const customerBadgeStyle = {
  backgroundColor: "#e8f4ff",
  color: "#1f5f91",
};

const deleteButtonStyle = {
  padding: "9px 14px",
  border: "1px solid #c62828",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#c62828",
  fontWeight: "700",
};

const messageCardStyle = {
  padding: "50px 20px",
  textAlign: "center",
  border: "1px solid #e2e2e2",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const mutedTextStyle = {
  color: "#777777",
};

export default AdminUsers;