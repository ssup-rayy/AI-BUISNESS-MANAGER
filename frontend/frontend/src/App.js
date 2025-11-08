import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Summary from "./pages/summary";
import Sales from "./pages/Sales";
import Anomalies from "./pages/Anomalies";
import Layout from "./components/Layout";
import DataManagement from "./pages/DataManagement";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      setLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setLoggedIn(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!loggedIn ? (
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route path="/data" element={<DataManagement />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;