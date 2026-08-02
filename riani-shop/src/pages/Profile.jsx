import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { apiUrl } from "../config/api";

function Profile() {
  const { user, login, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name || "");
    setEmail(user.email || "");
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let token = localStorage.getItem("token");

    if (!token && user?.token) {
      token = user.token;
    }

    if (!token) {
      logout();
      navigate("/login");
      return;
    }

    const updatedProfile = {
      name: name.trim(),
      email: email.trim(),
    };

    if (password.trim()) {
      updatedProfile.password = password;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        apiUrl("/api/users/profile"),
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      login(data);

      setName(data.name || "");
      setEmail(data.email || "");
      setPassword("");
      setConfirmPassword("");

      setSuccess(
        data.message || "Profile updated successfully."
      );
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Could not update your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) {
    return null;
  }

  const firstLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <main style={pageStyle}>
      <section style={profileCardStyle}>
        <div style={profileHeaderStyle}>
          <div style={avatarStyle}>{firstLetter}</div>

          <div>
            <p style={smallLabelStyle}>Riani Shop Account</p>

            <h1 style={titleStyle}>My Profile</h1>

            <p style={subtitleStyle}>
              Update your account information and password.
            </p>
          </div>
        </div>

        <div style={accountInformationStyle}>
          <div>
            <span style={informationLabelStyle}>
              Account type
            </span>

            <strong>
              {user.isAdmin ? "Administrator" : "Customer"}
            </strong>
          </div>

          <div>
            <span style={informationLabelStyle}>
              Current email
            </span>

            <strong style={emailTextStyle}>{user.email}</strong>
          </div>
        </div>

        {error && (
          <div style={errorMessageStyle}>{error}</div>
        )}

        {success && (
          <div style={successMessageStyle}>{success}</div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label htmlFor="profile-name" style={labelStyle}>
              Full Name
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              style={inputStyle}
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="profile-email" style={labelStyle}>
              Email
            </label>

            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              style={inputStyle}
              required
            />
          </div>

          <div style={passwordGridStyle}>
            <div style={formGroupStyle}>
              <label
                htmlFor="profile-password"
                style={labelStyle}
              >
                New Password
              </label>

              <input
                id="profile-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Leave empty to keep password"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label
                htmlFor="profile-confirm-password"
                style={labelStyle}
              >
                Confirm Password
              </label>

              <input
                id="profile-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                style={inputStyle}
              />
            </div>
          </div>

          <p style={passwordHelpStyle}>
            Leave both password fields empty if you do not want
            to change your password.
          </p>

          <div style={buttonContainerStyle}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...saveButtonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              style={logoutButtonStyle}
            >
              Logout
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "75vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "60px 20px 100px",
  backgroundColor: "#f7f7f7",
};

const profileCardStyle = {
  width: "100%",
  maxWidth: "850px",
  padding: "35px",
  border: "1px solid #e4e4e4",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 35px rgba(0, 0, 0, 0.06)",
};

const profileHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  paddingBottom: "28px",
  borderBottom: "1px solid #eeeeee",
};

const avatarStyle = {
  width: "82px",
  height: "82px",
  flexShrink: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "34px",
  fontWeight: "800",
};

const smallLabelStyle = {
  margin: "0 0 5px",
  color: "#777777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 42px)",
};

const subtitleStyle = {
  margin: "7px 0 0",
  color: "#666666",
  lineHeight: 1.6,
};

const accountInformationStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  margin: "28px 0",
  padding: "20px",
  borderRadius: "10px",
  backgroundColor: "#f8f8f8",
};

const informationLabelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#888888",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const emailTextStyle = {
  overflowWrap: "anywhere",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const formGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  color: "#222222",
  fontSize: "14px",
  fontWeight: "700",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 15px",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  outline: "none",
  fontSize: "15px",
  backgroundColor: "#ffffff",
};

const passwordGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "20px",
};

const passwordHelpStyle = {
  margin: "-8px 0 0",
  color: "#777777",
  fontSize: "13px",
  lineHeight: 1.6,
};

const buttonContainerStyle = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap",
  paddingTop: "5px",
};

const saveButtonStyle = {
  padding: "14px 26px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
};

const logoutButtonStyle = {
  padding: "14px 26px",
  border: "1px solid #d2d2d2",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#b00020",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const errorMessageStyle = {
  marginBottom: "24px",
  padding: "14px 16px",
  borderRadius: "7px",
  backgroundColor: "#ffe7e7",
  color: "#b00020",
  lineHeight: 1.5,
};

const successMessageStyle = {
  marginBottom: "24px",
  padding: "14px 16px",
  borderRadius: "7px",
  backgroundColor: "#e7f7eb",
  color: "#167329",
  lineHeight: 1.5,
};

export default Profile;