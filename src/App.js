// import logo from "./logo.svg";
// import "./App.css";
// import Chat from "./Chat";

// function App() {
//   return (
//     <div className="App">
//       <Chat />
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import ChatComponent from "./ChatComponet";

const App = () => {
  // Add user authentication logic here
  let isAuthenticated = false; // Change this based on authentication
  const token = localStorage.getItem("token");
  if (token) isAuthenticated = true;
  console.log(">>>>..is >>", isAuthenticated);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Route */}
        <Route path="/chat" element={isAuthenticated ? <ChatComponent /> : <Navigate to="/login" />} />

        {/* Redirect to Login by default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
