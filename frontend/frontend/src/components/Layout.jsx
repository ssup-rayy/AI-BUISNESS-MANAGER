import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/sales", label: "Sales", icon: "💼" },
    { path: "/summary", label: "Summary", icon: "📝" },
    { path: "/anomalies", label: "Anomalies", icon: "🔍" },
    { path: "/analytics", label: "Analytics", icon: "📈" },
    { path: "/export", label: "Export", icon: "📥" }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🤖 AI Business Manager</h1>
              <p className="text-blue-100 text-sm">Intelligent Analytics Platform</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user?.username || "User"}</p>
                <p className="text-blue-100 text-sm">{user?.email || ""}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation */}
      <div className="flex">
        <aside className="w-64 bg-white min-h-screen shadow-lg">
          <div className="p-6">
            <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-4">
              Navigation
            </h2>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-6 border-t">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Status</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  ● Active
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Version</span>
                <span className="text-gray-900 font-semibold">v2.0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}