import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { SERVER_PROD_API } from "../common-constants";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${SERVER_PROD_API}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.jwt) {
        // Save JWT token and set isAuthenticated to true
        localStorage.setItem("token", data.jwt);
        let sessionID = new Date().getTime();

        localStorage.setItem(
          "user",
          JSON.stringify({ userId: data.user.id, userName: data.user.username, sessionId: sessionID })
        );
        navigate("/chat");
      } else {
        console.error("Login failed:", data);
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Login;
