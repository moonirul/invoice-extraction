import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Doya kore prothome ekti PDF file select korun.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setExtractedText("");

    try {
      // FastAPI backend URL (default: http://127.0.0.1:8000)
      const response = await axios.post(
        "http://127.0.0.1:8000/api/extract-invoice",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setExtractedText(response.data.extracted_text);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "File upload ba extraction-e somoshsha hoyeche.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h2>Invoice & PDF Text Extraction</h2>

      <form onSubmit={handleUpload} style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#007BFF",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <textarea
            value={extractedText}
            readOnly
            rows="15"
            style={{ width: "100%", padding: "10px", fontFamily: "monospace" }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
