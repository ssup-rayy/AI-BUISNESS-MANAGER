import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    onLogout(false);
    navigate("/");
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">AI Business Manager Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex gap-8 text-lg mb-6">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/sales">Sales</Link>
        <Link to="/summary">Summary</Link>
        <Link to="/anomalies">Anomalies</Link>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-lg">
        {children}
      </div>
    </div>
  );
}
