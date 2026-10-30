import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // State definitions
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Sheet Data Fetching States
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [fetching, setFetching] = useState(false);

  // File Change Handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setSaveStatus("");
  };

  // 1. PDF Upload & Extraction Handler
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF file first!");
      return;
    }

    const uploadData = new FormData();
    uploadData.append("file", file);

    setLoading(true);
    setError("");
    setFormData(null);
    setSaveStatus("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/extract-invoice",
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.data) {
        setFormData(response.data.data);
      } else {
        setError("Extracted data format is invalid.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Something went wrong during extraction!",
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Dynamic Input Change Handler for Editing
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // 3. Save & Sync to Google Sheets Handler
  const handleSaveToSheet = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      await axios.post("http://127.0.0.1:8000/api/save-invoice", {
        data: formData,
      });
      setSaveStatus("Successfully saved and synced to Google Sheets! ✓");
      // Save করার পর অটোমেটিক রিফ্রেশ করে শিটের আপডেট ডেটা লোড করবে
      fetchSavedInvoices();
    } catch (err) {
      console.error(err);
      setSaveStatus("Failed to save to Google Sheets.");
    } finally {
      setSaving(false);
    }
  };

  // 4. Fetch Saved Invoices from Google Sheets
  const fetchSavedInvoices = async () => {
    setFetching(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/invoices");
      if (response.data?.data) {
        setSavedInvoices(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setFetching(false);
    }
  };

  // Initial Load-এ একবার Sheet এর ডেটা ফেচ করে আনবে
  useEffect(() => {
    fetchSavedInvoices();
  }, []);

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h2>AI-Powered Document Intelligence Dashboard</h2>
      <p>
        Upload enterprise invoices for automated extraction, review, manual
        correction, and Google Sheets sync.
      </p>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        style={{
          margin: "20px 0",
          padding: "20px",
          border: "2px dashed #cbd5e0",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "block", marginBottom: "15px" }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#007BFF",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Extracting with AI..." : "Upload & Extract Invoice"}
        </button>
      </form>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      {/* Editable Dashboard UI */}
      {formData && (
        <div
          style={{
            marginTop: "30px",
            background: "#f8fafc",
            padding: "25px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              color: "#2b6cb0",
              borderBottom: "2px solid #cbd5e0",
              paddingBottom: "8px",
              marginTop: 0,
            }}
          >
            Review & Edit Extracted Information
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "15px",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Invoice No:
              </label>
              <input
                type="text"
                value={formData.invoice_details?.invoice_number || ""}
                onChange={(e) =>
                  handleInputChange(
                    "invoice_details",
                    "invoice_number",
                    e.target.value,
                  )
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                Invoice Date:
              </label>
              <input
                type="text"
                value={formData.invoice_details?.invoice_date || ""}
                onChange={(e) =>
                  handleInputChange(
                    "invoice_details",
                    "invoice_date",
                    e.target.value,
                  )
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                PO Number:
              </label>
              <input
                type="text"
                value={formData.invoice_details?.po_number || ""}
                onChange={(e) =>
                  handleInputChange(
                    "invoice_details",
                    "po_number",
                    e.target.value,
                  )
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "bold" }}>
                Supplier Name:
              </label>
              <input
                type="text"
                value={formData.supplier?.name || ""}
                onChange={(e) =>
                  handleInputChange("supplier", "name", e.target.value)
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                Customer Name:
              </label>
              <input
                type="text"
                value={formData.customer?.name || ""}
                onChange={(e) =>
                  handleInputChange("customer", "name", e.target.value)
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                Total Amount:
              </label>
              <input
                type="text"
                value={formData.financial_summary?.total_amount || ""}
                onChange={(e) =>
                  handleInputChange(
                    "financial_summary",
                    "total_amount",
                    e.target.value,
                  )
                }
                style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>
          </div>

          {/* Line Items Section */}
          <h4 style={{ marginTop: "25px", color: "#2d3748" }}>Line Items</h4>
          <ul
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "4px",
              listStyle: "none",
            }}
          >
            {formData.line_items?.map((item, index) => (
              <li
                key={index}
                style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}
              >
                <strong>{item.item_code}</strong> - {item.description} (Qty:{" "}
                {item.quantity}) = ${item.total}
              </li>
            ))}
          </ul>

          {/* Save & Sync Button */}
          <div style={{ marginTop: "25px", textAlign: "right" }}>
            <button
              onClick={handleSaveToSheet}
              disabled={saving}
              style={{
                padding: "12px 25px",
                background: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving
                ? "Saving to Google Sheets..."
                : "Confirm & Save to Google Sheets"}
            </button>
            {saveStatus && (
              <p
                style={{
                  fontWeight: "bold",
                  marginTop: "10px",
                  color: saveStatus.includes("Successfully") ? "green" : "red",
                }}
              >
                {saveStatus}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Saved Invoices Table Section */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#fff",
          borderRadius: "8px",
          border: "1px solid #cbd5e0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>Saved Invoices from Google Sheets</h3>
          <button
            onClick={fetchSavedInvoices}
            disabled={fetching}
            style={{
              padding: "8px 15px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: fetching ? "not-allowed" : "pointer",
            }}
          >
            {fetching ? "Loading..." : "Refresh Sheet Data"}
          </button>
        </div>

        <table
          style={{
            width: "100%",
            marginTop: "15px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#2b6cb0",
                color: "#fff",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "10px" }}>Invoice No</th>
              <th style={{ padding: "10px" }}>Supplier</th>
              <th style={{ padding: "10px" }}>Customer</th>
              <th style={{ padding: "10px" }}>Total</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {savedInvoices && savedInvoices.length > 0 ? (
              savedInvoices.map((inv, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>
                    {inv["Invoice Number"] || inv.invoice_number || "-"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {inv["Supplier Name"] || inv.supplier_name || "-"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {inv["Customer Name"] || inv.customer_name || "-"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    ${inv["Total Amount"] || inv.total_amount || "0"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    {inv["Math Validation Status"] ||
                      inv.math_validation_status ||
                      "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    color: "#718096",
                  }}
                >
                  {fetching
                    ? "Fetching invoices..."
                    : "No saved invoices found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
