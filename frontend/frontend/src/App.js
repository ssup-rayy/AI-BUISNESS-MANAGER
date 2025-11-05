import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import Summary from "./pages/summary";
import Sales from "./pages/Sales";
import Anomalies from "./pages/Anomalies";
import Layout from "./components/Layout";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <Router>
      {/* if not logged in → show only Login page */}
      {!loggedIn ? (
        <Routes>
          <Route path="/" element={<Login onLogin={setLoggedIn} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        // once logged in → show layout with all pages
        <Layout onLogout={() => setLoggedIn(false)}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
