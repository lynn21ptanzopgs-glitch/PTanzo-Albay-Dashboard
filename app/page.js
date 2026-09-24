"use client";

import { useEffect, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load dashboard data.");
        }
        return response.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const cards = [
    ["Today's Sales", data?.["Today's Sales"]],
    ["MTD Sales", data?.["MTD Sales"]],
    ["YTD Sales", data?.["YTD Sales"]],
    ["Pending / Unpaid", data?.["Pending / Unpaid"]],
    ["Paid", data?.["Paid"]],
    ["Purchases MTD", data?.["Purchases MTD"]],
    ["Goods Inventory", data?.["Goods Inventory"]],
    ["Expenses MTD", data?.["Expenses MTD"]],
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f5f6f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>PTanzo Albay Dashboard</h1>

      {error && <p>{error}</p>}

      {!data && !error && <p>Loading dashboard...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {cards.map(([label, value]) => (
          <div
            key={label}
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ color: "#666", marginBottom: "10px" }}>
              {label}
            </div>

            <div style={{ fontSize: "28px", fontWeight: "700" }}>
              {typeof value === "number"
                ? `₱${value.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "—"}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
