import React, { useState, useEffect } from "react";
import axios from "axios";

export default function DataManagement() {
  const [formData, setFormData] = useState({
    product: "",
    sales: "",
    month: "",
    category: ""
  });
  
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const categories = ["Electronics", "Accessories", "Furniture", "Software", "Services", "Other"];

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:5000/get-all-sales", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesData(res.data.data || []);
    } catch (err) {
      console.error("Failed to load sales data:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:5000/add-sales",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === "success") {
        setMessage({ type: "success", text: "✓ Sales data added successfully!" });
        setFormData({ product: "", sales: "", month: "", category: "" });
        loadSalesData();
      }
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to add sales data" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:5000/delete-sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "✓ Sales entry deleted!" });
      loadSalesData();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete entry" });
    }
  };

  const getCurrentMonth = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthNames[new Date().getMonth()];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Sales Data Management
          </h1>
          <p className="text-gray-600 text-lg">Add and manage daily sales & finance data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Sales Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Sales Entry
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="e.g., Laptop, Mouse, Keyboard"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Sales Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sales Amount ($) *
                  </label>
                  <input
                    type="number"
                    name="sales"
                    value={formData.sales}
                    onChange={handleInputChange}
                    placeholder="e.g., 150.50"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month *
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>
                        {month} {month === getCurrentMonth() && "(Current)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-white font-bold transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : (
                    "Add Sales Entry"
                  )}
                </button>
              </form>

              {/* Message Display */}
              {message.text && (
                <div className={`mt-4 p-4 rounded-xl ${
                  message.type === "success" 
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "bg-red-100 border border-red-400 text-red-700"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Quick Add Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-gray-700">
                  <strong>💡 Quick Tip:</strong> Add daily sales data to keep your analytics and anomaly detection up-to-date!
                </p>
              </div>
            </div>
          </div>

          {/* Sales Data Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  All Sales Data ({salesData.length})
                </h2>
                <button
                  onClick={loadSalesData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-indigo-100">
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Sales</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Month</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Date Added</th>
                      <th className="px-4 py-3 text-center text-sm font-bold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No sales data found. Add your first entry!
                        </td>
                      </tr>
                    ) : (
                      salesData.map((sale) => (
                        <tr key={sale.id} className="border-b hover:bg-gray-50 transition-all">
                          <td className="px-4 py-3 font-semibold text-gray-800">{sale.product}</td>
                          <td className="px-4 py-3 text-green-600 font-bold">${sale.sales.toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-700">{sale.month}</td>
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                              {sale.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{sale.timestamp}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-semibold text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              {salesData.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                    <p className="text-sm text-gray-600">Total Entries</p>
                    <p className="text-2xl font-bold text-green-600">{salesData.length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${salesData.reduce((sum, s) => sum + s.sales, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center">
                    <p className="text-sm text-gray-600">Avg per Entry</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${(salesData.reduce((sum, s) => sum + s.sales, 0) / salesData.length).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}