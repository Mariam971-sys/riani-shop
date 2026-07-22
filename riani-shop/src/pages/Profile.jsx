import { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Profile() {
  const { user } = useContext(UserContext);

  if (!user) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "80px auto",
          textAlign: "center",
        }}
      >
        <h1>My Profile</h1>
        <p>Please login first.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "60px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0 5px 20px rgba(0,0,0,.1)",
      }}
    >
      <h1>My Profile</h1>

      <div style={{ marginTop: "30px" }}>
        <p>
          <strong>Name:</strong> {user.name}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user.isAdmin ? "Administrator" : "Customer"}
        </p>
      </div>

      <button
        style={{
          marginTop: "30px",
          padding: "12px 25px",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Edit Profile
      </button>
    </main>
  );
}

export default Profile;