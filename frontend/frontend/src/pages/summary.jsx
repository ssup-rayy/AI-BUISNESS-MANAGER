import { useState } from "react";

function Summary() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState("");

  const summarize = () => {
    fetch("http://127.0.0.1:5000/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: inputText }),
    })
      .then((res) => res.json())
      .then((data) => setResult(data.summary))
      .catch(() => setResult("Backend not reachable"));
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Meeting Summarizer</h1>

      <textarea
        rows={6}
        style={{ width: "100%", marginTop: 20 }}
        placeholder="Paste meeting text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={summarize}
        style={{ marginTop: 20, padding: "10px 30px", fontSize: 18 }}
      >
        Summarize
      </button>

      {result && (
        <div style={{ marginTop: 30, fontSize: 20 }}>
          <b>Summary Output:</b>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default Summary;
