import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";

function Login() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email,
          password,
        }
      );

      const userData = response.data;

      // Kaydi user + token
      localStorage.setItem(
        "userInfo",
        JSON.stringify(userData)
      );

      // Ku kaydi Context
      setUser(userData);

      alert("Login successful!");

      // U gudub home
      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message || "Login failed"
      );
    }
  }

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        Login
      </h1>

      <form onSubmit={handleLogin}>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          Login
        </button>

      </form>
    </main>
  );
}

export default Login;