import React, { useState } from "react";
import axios from "axios";

function Sales() {

  const [recommendations, setRecommendations] = useState([]);

  const getRecommendations = async () => {
    const res = await axios.get("http://127.0.0.1:5000/recommendation");

    setRecommendations(res.data);
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Sales Recommendation Engine</h2>

      <button
        onClick={getRecommendations}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Get Recommendation
      </button>

      {recommendations.length > 0 && (
        <table className="w-full mt-6 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left border-b">Product</th>
              <th className="px-4 py-2 text-left border-b">Score</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="px-4 py-2">{item.product}</td>
                <td className="px-4 py-2 font-medium">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Sales;
