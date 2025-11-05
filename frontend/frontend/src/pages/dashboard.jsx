import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/recommendation").then(res => {
      setData(res.data.recommendations);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">AI Business Manager Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* SALES CARD */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-blue-700">Sales Recommendations</h2>
          <ul className="mt-3">
            {data.map((item,i)=>(
              <li key={i}>{item.product} — {item.probability}</li>
            ))}
          </ul>
        </div>

        {/* SUMMARY CARD */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-purple-700">Meeting Summary</h2>
          <textarea className="border w-full p-2 mt-3 rounded" placeholder="Paste meeting text..." />
          <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded">Summarize</button>
        </div>

        {/* ANOMALY CARD */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold text-red-700">Financial Anomalies</h2>
          <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
            Load Anomalies
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
