"use client";

import { useEffect, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    setError("");

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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const money = (value) => {
    if (typeof value !== "number") return "—";

    return `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cards = [
    {
      title: "Today's Sales",
      value: data?.["Today's Sales"],
      icon: "₱",
      type: "sales",
    },
    {
      title: "MTD Sales",
      value: data?.["MTD Sales"],
      icon: "↗",
      type: "sales",
    },
    {
      title: "YTD Sales",
      value: data?.["YTD Sales"],
      icon: "▣",
      type: "sales",
    },
    {
      title: "Pending / Unpaid",
      value: data?.["Pending / Unpaid"],
      icon: "!",
      type: "pending",
    },
    {
      title: "Paid",
      value: data?.["Paid"],
      icon: "✓",
      type: "paid",
    },
    {
      title: "Purchases MTD",
      value: data?.["Purchases MTD"],
      icon: "🛒",
      type: "purchase",
    },
    {
      title: "Goods Inventory",
      value: data?.["Goods Inventory"],
      icon: "📦",
      type: "inventory",
    },
    {
      title: "Expenses MTD",
      value: data?.["Expenses MTD"],
      icon: "−",
      type: "expense",
    },
  ];

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">PTANZO ALBAY</div>
          <h1>Sales & Operations Dashboard</h1>
          <p className="date">{today}</p>
        </div>

        <button className="refresh" onClick={loadData} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      {loading && !data ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <section className="section">
            <div className="section-title">
              <h2>Key Performance Indicators</h2>
              <span>Live from Google Sheets</span>
            </div>

            <div className="cards">
              {cards.map((card) => (
                <div className={`card ${card.type}`} key={card.title}>
                  <div className="card-top">
                    <div className="icon">{card.icon}</div>
                    <span className="card-label">{card.title}</span>
                  </div>

                  <div className="amount">{money(card.value)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="overview">
            <div className="overview-card">
              <div className="overview-label">MTD SALES</div>
              <div className="overview-value">
                {money(data?.["MTD Sales"])}
              </div>
              <div className="overview-note">
                Month-to-date sales performance
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-label">GOODS INVENTORY</div>
              <div className="overview-value">
                {money(data?.["Goods Inventory"])}
              </div>
              <div className="overview-note">
                Current goods inventory value
              </div>
            </div>

            <div className="overview-card">
              <div className="overview-label">AR OUTSTANDING</div>
              <div className="overview-value">
                {money(data?.["Pending / Unpaid"])}
              </div>
              <div className="overview-note">
                Accounts pending collection
              </div>
            </div>
          </section>
        </>
      )}

      <footer>
        <span>PTanzo Albay Dashboard</span>
        <span>Connected to Google Sheets</span>
      </footer>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard {
          min-height: 100vh;
          background: #f4f6f8;
          color: #17202a;
          padding: 32px 42px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .header {
          max-width: 1400px;
          margin: 0 auto 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #68717d;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .date {
          margin: 8px 0 0;
          color: #707984;
          font-size: 14px;
        }

        .refresh {
          border: 0;
          border-radius: 10px;
          padding: 12px 18px;
          background: #17202a;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .refresh:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .section,
        .overview,
        footer {
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
        }

        .section-title {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .section-title h2 {
          margin: 0;
          font-size: 18px;
        }

        .section-title span {
          color: #7b838d;
          font-size: 12px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .card {
          background: white;
          border: 1px solid #e7eaee;
          border-radius: 14px;
          padding: 20px;
          min-height: 145px;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f4;
          font-size: 16px;
          font-weight: 700;
        }

        .card-label {
          color: #69727d;
          font-size: 13px;
          font-weight: 600;
        }

        .amount {
          margin-top: 23px;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .pending .icon {
          background: #fff1e8;
        }

        .paid .icon {
          background: #eaf7ef;
        }

        .inventory .icon {
          background: #eef3ff;
        }

        .purchase .icon {
          background: #f5efff;
        }

        .expense .icon {
          background: #fff0f0;
        }

        .overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 30px;
        }

        .overview-card {
          background: #17202a;
          color: white;
          border-radius: 14px;
          padding: 23px;
        }

        .overview-label {
          font-size: 11px;
          letter-spacing: 1.5px;
          font-weight: 700;
          opacity: 0.65;
        }

        .overview-value {
          margin-top: 10px;
          font-size: 26px;
          font-weight: 700;
        }

        .overview-note {
          margin-top: 7px;
          font-size: 12px;
          opacity: 0.65;
        }

        .loading {
          max-width: 1400px;
          margin: 80px auto;
          text-align: center;
          color: #707984;
        }

        .error {
          max-width: 1400px;
          margin: 0 auto 20px;
          padding: 14px 18px;
          border-radius: 10px;
          background: #fff0f0;
          color: #a33a3a;
        }

        footer {
          display: flex;
          justify-content: space-between;
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          color: #8a929b;
          font-size: 11px;
        }

        @media (max-width: 1000px) {
          .cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .overview {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .dashboard {
            padding: 24px 16px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          h1 {
            font-size: 25px;
          }

          .cards {
            grid-template-columns: 1fr;
          }

          .section-title {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          footer {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </main>
  );
}
