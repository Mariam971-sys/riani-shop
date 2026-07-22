import { useEffect, useState } from "react";
import axios from "axios";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/users"
      );

      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "50px auto",
        padding: "0 20px",
        minHeight: "60vh",
      }}
    >
      <h1>Users Management</h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "30px",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Admin</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td style={tdStyle}>{user.name}</td>

              <td style={tdStyle}>{user.email}</td>

              <td style={tdStyle}>
                {user.isAdmin ? "✅ Admin" : "👤 User"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

const thStyle = {
  padding: "15px",
  textAlign: "left",
  background: "#f5f5f5",
  borderBottom: "2px solid #222",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #ddd",
};

export default AdminUsers;