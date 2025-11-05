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
} from "recharts";

export default function Anomalies() {
  const [data, setData] = useState([]);

  useEffect(() => {
  fetch("http://127.0.0.1:5000/anomalies")
    .then((res) => res.json())
    .then((json) => {
      console.log("Fetched anomalies:", json);
      setData(json.data || []);
    })
    .catch((err) => {
      console.error("Anomalies fetch error:", err);
      setData([]);
    });
}, []);


  return (
    <div className="mt-6 bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Financial Anomaly Detection</h2>

      <p className="text-sm text-gray-600 mb-4">
        Simple anomaly detection using z-score. Points with |z| ≥ 2 are flagged.
      </p>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} dot />
            {/* Draw red dots for anomalies */}
            {data.map((d, i) =>
              d.anomaly ? (
                <ReferenceDot
                  key={`anom-${i}`}
                  x={d.month}
                  y={d.sales}
                  r={5}
                  fill="red"
                  stroke="red"
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Anomaly Table</h3>
        <table className="w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Month</th>
              <th className="px-3 py-2 text-left">Sales</th>
              <th className="px-3 py-2 text-left">Z-Score</th>
              <th className="px-3 py-2 text-left">Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="px-3 py-2">{row.month}</td>
                <td className="px-3 py-2">{row.sales}</td>
                <td className="px-3 py-2">{row.z_score}</td>
                <td className="px-3 py-2">
                  {row.anomaly ? (
                    <span className="text-white bg-red-500 px-2 py-1 rounded">Yes</span>
                  ) : (
                    <span className="text-gray-700 bg-gray-200 px-2 py-1 rounded">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
