import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  AreaChart,
  Area
} from "recharts";

export default function Anomalies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://127.0.0.1:5000/anomalies");
      
      if (!res.ok) {
        throw new Error("Failed to load anomalies");
      }
      
      const json = await res.json();
      console.log("Fetched anomalies:", json);
      setData(json.data || []);
      
    } catch (err) {
      console.error("Anomalies fetch error:", err);
      setError("Failed to load anomalies. Make sure the backend is running.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const anomalyCount = data.filter(d => d.anomaly).length;
  const avgSales = data.length > 0 ? (data.reduce((sum, d) => sum + d.sales, 0) / data.length).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Financial Anomaly Detection
          </h1>
          <p className="text-gray-600 text-lg">AI-powered statistical analysis using Z-score methodology</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Data Points</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{data.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Anomalies Detected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{anomalyCount}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Average Sales</p>
                <p className="text-3xl font-bold text-green-600 mt-2">${avgSales}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading anomaly detection data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-bold text-red-800">Error Loading Data</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={loadAnomalies}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Charts and Data */}
        {!loading && !error && data.length > 0 && (
          <>
            {/* Line Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Sales Trend with Anomalies</h2>
                <button
                  onClick={loadAnomalies}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '2px solid #EF4444',
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    fill="url(#colorSales)"
                  />
                  {data.map((d, i) =>
                    d.anomaly ? (
                      <ReferenceDot
                        key={`anom-${i}`}
                        x={d.month}
                        y={d.sales}
                        r={8}
                        fill="#DC2626"
                        stroke="#FFF"
                        strokeWidth={2}
                      />
                    ) : null
                  )}
                </AreaChart>
              </ResponsiveContainer>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Z-Score Method:</strong> Data points with absolute Z-score ≥ 2 are marked as anomalies (red dots). 
                  This indicates values that deviate significantly from the mean.
                </p>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-100 to-pink-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Month</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Sales ($)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Z-Score</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-800">Alert Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr 
                        key={i} 
                        className={`border-b transition-all hover:bg-gray-50 ${
                          row.anomaly ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">{row.month}</td>
                        <td className="px-6 py-4 text-gray-800 font-semibold">${row.sales.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${
                            Math.abs(row.z_score) >= 2 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {row.z_score.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {row.anomaly ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Anomaly
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {row.anomaly ? (
                            <span className="inline-flex items-center">
                              {[...Array(3)].map((_, idx) => (
                                <svg key={idx} className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}