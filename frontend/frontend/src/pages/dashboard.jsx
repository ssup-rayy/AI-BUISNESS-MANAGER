import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    avgConfidence: 0,
    topProduct: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/recommendation");
      const recommendations = res.data.recommendations || [];
      setData(recommendations);
      
      // Calculate stats
      if (recommendations.length > 0) {
        const totalSales = recommendations.reduce((sum, item) => sum + (item.avg_sales || 0), 0);
        const avgConf = recommendations.reduce((sum, item) => sum + item.probability, 0) / recommendations.length;
        
        setStats({
          totalSales: totalSales.toFixed(2),
          avgConfidence: (avgConf * 100).toFixed(0),
          topProduct: recommendations[0]?.product || "N/A"
        });
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          AI Business Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Real-time business intelligence at your fingertips</p>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Sales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">${stats.totalSales}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg Confidence</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.avgConfidence}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Top Product</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.topProduct}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">System Status</p>
              <p className="text-2xl font-bold text-green-600 mt-2 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Active
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Recommendations Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">Sales Engine</h2>
                <p className="text-blue-100 mt-1">AI-Powered Recommendations</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {data.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                        <span className="font-semibold text-gray-800">{item.product}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${item.probability * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          {(item.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => navigate("/sales")}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  View All Recommendations →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Meeting Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">AI Summarizer</h2>
                <p className="text-purple-100 mt-1">Transform Notes to Insights</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Instant Summarization</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-gray-700">Powered by Hugging Face</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Save 90% Time</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/summary")}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Start Summarizing →
            </button>
          </div>
        </div>

        {/* Anomaly Detection Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">Anomaly Detector</h2>
                <p className="text-red-100 mt-1">Financial Pattern Analysis</p>
              </div>
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-gray-700">Z-Score Analysis</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span className="text-gray-700">Real-time Monitoring</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-gray-700">Instant Alerts</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/anomalies")}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Detect Anomalies →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;