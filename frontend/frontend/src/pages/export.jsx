import React, { useState } from "react";
import axios from "axios";

export default function Export() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const exportReport = async (reportType) => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:5000/export/pdf",
        { type: reportType },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob"
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage(`✓ ${reportType} report downloaded successfully!`);
    } catch (err) {
      console.error("Export error:", err);
      setMessage(`✗ Failed to export ${reportType} report`);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      type: "sales",
      title: "Sales Report",
      description: "Export comprehensive sales data and recommendations",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "blue"
    },
    {
      type: "summaries",
      title: "Meeting Summaries",
      description: "Export all your meeting summaries and notes",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "purple"
    },
    {
      type: "anomalies",
      title: "Anomaly Report",
      description: "Export detected anomalies and financial alerts",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: "red"
    },
    {
      type: "analytics",
      title: "Full Analytics",
      description: "Export complete business analytics dashboard",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "green"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Export Reports</h1>
        <p className="text-gray-600">Download your business data in PDF format</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.startsWith("✓") 
            ? "bg-green-100 border border-green-400 text-green-700" 
            : "bg-red-100 border border-red-400 text-red-700"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <div
            key={report.type}
            className={`bg-gradient-to-br from-${report.color}-50 to-${report.color}-100 border border-${report.color}-200 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className={`text-${report.color}-600 mb-4`}>
              {report.icon}
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {report.title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {report.description}
            </p>

            <button
              onClick={() => exportReport(report.type)}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : `bg-gradient-to-r from-${report.color}-500 to-${report.color}-600 hover:from-${report.color}-600 hover:to-${report.color}-700`
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Export Tips:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Reports include data from the last 30 days</li>
              <li>• PDFs are formatted for printing and sharing</li>
              <li>• All exports are encrypted and secure</li>
              <li>• You can schedule automatic exports (coming soon)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}