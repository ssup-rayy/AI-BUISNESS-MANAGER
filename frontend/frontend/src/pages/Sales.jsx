import React, { useState } from "react";
import axios from "axios";

function Sales() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRecommendations = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.get("http://127.0.0.1:5000/recommendation");
      
      // FIX: Access the recommendations array correctly
      setRecommendations(res.data.recommendations || []);
      
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Make sure the backend is running.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Sales Recommendation Engine</h2>

      <button
        onClick={getRecommendations}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Recommended Products</h3>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left border-b">Product</th>
                <th className="px-4 py-3 text-left border-b">Probability</th>
                <th className="px-4 py-3 text-left border-b">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((item, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.product}</td>
                  <td className="px-4 py-3 font-medium">
                    {(item.probability * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.probability * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Sales;