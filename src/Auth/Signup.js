import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import { SERVER_PROD_API } from "../common-constants";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${SERVER_PROD_API}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.jwt) {
        // Save JWT token and set isAuthenticated to true
        let sessionID = new Date().getTime();
        localStorage.setItem("token", data.jwt);
        localStorage.setItem(
          "user",
          JSON.stringify({ userId: data.user.id, userName: data.user.username, sessionId: sessionID })
        );
        navigate("/chat");
      } else {
        console.error("Signup failed:", data);
        setError("Username is already taken. Please choose another one.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError(null);
          }}
          required
        />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Signup;
