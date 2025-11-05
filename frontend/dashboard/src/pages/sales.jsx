import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function Sales() {
  const [salesData, setSalesData] = useState([]);

  const getSales = async () => {
    const res = await fetch("http://127.0.0.1:8000/sales");
    const data = await res.json();
    setSalesData(data.sales);
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>📊 Sales Performance Dashboard</h1>

      <div style={{ textAlign: "center", margin: 20 }}>
        <button
          onClick={getSales}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Load Sales Growth
        </button>
      </div>

      {salesData.length > 0 && (
        <>
          {/* CHART */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BarChart width={700} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="growth" fill="#0084ff" />
            </BarChart>
          </div>
        </>
      )}
    </div>
  );
}

export default Sales;
