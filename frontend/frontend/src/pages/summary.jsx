import { useState } from "react";
import axios from "axios";

function Summary() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sample hints for users
  const sampleTexts = [
    {
      title: "Quarterly Sales Meeting",
      text: "Our quarterly sales meeting discussed the impressive performance across all regions. North region achieved 125% of their target with laptop sales leading the way. The marketing team proposed a new digital campaign focusing on social media influencers. Customer feedback has been overwhelmingly positive with a 95% satisfaction rate. However, we identified supply chain challenges that need immediate attention. The operations team will implement a new inventory management system by next month. Sales projections for Q4 are optimistic with expected growth of 30%. The team also discussed expanding into new markets in Southeast Asia."
    },
    {
      title: "Product Development Discussion",
      text: "The product development team presented three new product concepts for review. Concept A focuses on AI-powered analytics with machine learning capabilities. Concept B introduces a mobile-first approach with offline functionality. Concept C combines both approaches with cloud integration. The engineering team estimates 6 months for full development. Budget allocation of $500,000 was approved for the MVP. User testing will begin in Q2 with selected beta users. The design team will create prototypes by end of month. Marketing team will prepare launch campaigns targeting tech-savvy millennials."
    },
    {
      title: "Customer Feedback Review",
      text: "This month's customer feedback analysis revealed several key insights. Response time has improved by 40% after implementing the new ticketing system. Customers appreciate the 24/7 chat support feature. However, there are complaints about the mobile app's loading speed. The development team will optimize the app in the next update. Net Promoter Score increased from 65 to 78. Customer retention rate is at an all-time high of 92%. The support team resolved 95% of issues on first contact. New feature requests include dark mode and advanced reporting tools."
    }
  ];

  const summarize = async () => {
    if (!inputText.trim() || inputText.length < 50) {
      setError("Please enter at least 50 characters to get a meaningful summary");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Summarization failed");
      }

      const data = await response.json();
      setResult(data);
      
    } catch (err) {
      console.error("Summarize error:", err);
      setError("AI summarization failed. Please make sure the backend is running with the AI model loaded.");
    } finally {
      setLoading(false);
    }
  };

  const useSampleText = (sample) => {
    setInputText(sample.text);
    setError("");
    setResult(null);
  };

  const clearAll = () => {
    setInputText("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AI Meeting Summarizer
          </h1>
          <p className="text-gray-600 text-lg">Transform lengthy meeting notes into concise, actionable summaries using advanced AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Meeting Notes</h2>
                <span className="text-sm text-gray-500">{inputText.length} characters</span>
              </div>
              
              <textarea
                rows={10}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Paste your meeting notes, discussion points, or any lengthy text here...&#10;&#10;Minimum 50 characters required for AI summarization."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={summarize}
                  disabled={loading || !inputText.trim()}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                    loading || !inputText.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      AI is Summarizing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Summarize with AI
                    </span>
                  )}
                </button>

                <button
                  onClick={clearAll}
                  className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition-all"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg animate-shake">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold text-red-800">Error</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-xl p-6 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-purple-800 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    AI Summary
                  </h2>
                  <button
                    onClick={() => navigator.clipboard.writeText(result.summary)}
                    className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
                
                <p className="text-gray-800 text-lg leading-relaxed mb-4 bg-white p-4 rounded-xl">
                  {result.summary}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-gray-600 text-xs font-medium">Original</p>
                    <p className="text-purple-600 text-xl font-bold">{result.original_length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-gray-600 text-xs font-medium">Summary</p>
                    <p className="text-purple-600 text-xl font-bold">{result.summary_length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-gray-600 text-xs font-medium">Compression</p>
                    <p className="text-purple-600 text-xl font-bold">{result.compression_ratio}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar with Sample Texts */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Try Sample Texts
              </h3>
              
              <div className="space-y-3">
                {sampleTexts.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => useSampleText(sample)}
                    className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl cursor-pointer hover:shadow-lg transition-all group"
                  >
                    <h4 className="font-semibold text-purple-800 mb-1 group-hover:text-purple-600">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{sample.text}</p>
                    <button className="text-xs text-purple-600 font-semibold mt-2 flex items-center">
                      Use this text
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">✨ AI Features</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Powered by Hugging Face transformers</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Extracts key points automatically</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Saves to database for future reference</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Works with any language</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Summary;