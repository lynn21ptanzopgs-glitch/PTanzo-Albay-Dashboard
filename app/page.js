```javascript
"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

function formatMoney(value) {
  if (typeof value !== "number" || isNaN(value)) return "—";

  return "₱" + value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCompact(value) {
  if (value >= 1000000) {
    return "₱" + (value / 1000000).toFixed(1) + "M";
  }

  if (value >= 1000) {
    return "₱" + (value / 1000).toFixed(0) + "K";
  }

  return "₱" + value.toFixed(0);
}

function Icon({ type }) {
  if (type === "sales") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 19V5M4 19H20" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 15L11 11L14 14L20 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "receivable") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 7V17M15 9.5C15 8.4 13.9 7.5 12.5 7.5H11.7C10.2 7.5 9 8.5 9 9.7C9 10.9 10 11.6 11.2 11.9L13 12.4C14.2 12.7 15 13.4 15 14.5C15 15.7 13.8 16.5 12.3 16.5H11.5C10.1 16.5 9 15.6 9 14.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (type === "purchase") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5H6L8.2 15.2C8.4 16.2 9.3 17 10.3 17H17.5C18.5 17 19.4 16.3 19.7 15.3L21 9H7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="20" r="1.5" fill="currentColor" />
        <circle cx="18" cy="20" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (type === "inventory") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7L12 3L20 7L12 11L4 7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M4 12L12 16L20 12M4 17L12 21L20 17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "expense") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M5 4H19V20H5V4Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 8H16M8 12H16M8 16H13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 19V5M4 19H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="7" y="12" width="2.8" height="5" rx="1" fill="currentColor" />
      <rect x="11" y="9" width="2.8" height="8" rx="1" fill="currentColor" />
      <rect x="15" y="6" width="2.8" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

function BarChart({ data, valueKey, labelKey }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart">
        No sales data available.
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.map(function (item) {
      return Number(item[valueKey]) || 0;
    }),
    1
  );

  return (
    <div className="bar-chart">
      <div className="chart-bars">
        {data.map(function (item, index) {
          const value = Number(item[valueKey]) || 0;

          const height =
            value > 0
              ? Math.max((value / maxValue) * 100, 4)
              : 0;

          let label = item[labelKey];

          if (labelKey === "date" && label) {
            const parts = String(label).split("-");
            if (parts.length === 3) {
              label = parts[2];
            }
          }

          return (
            <div className="bar-column" key={index}>
              <div className="bar-value">
                {value > 0 ? formatCompact(value) : ""}
              </div>

              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: height + "%" }}
                  title={formatMoney(value)}
                />
              </div>

              <div className="bar-label">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const json = await response.json();

      setData(json);
    } catch (err) {
      setError(
        err.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadDashboard();
  }, []);

  const reportDate = useMemo(function () {
    const today = new Date();

    return today.toLocaleDateString("en-PH", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const dailySales = useMemo(function () {
    return (
      data?.dailyNetworth?.filter(function (item) {
        return Number(item.sales) > 0;
      }) || []
    );
  }, [data]);

  const ytdSales = useMemo(function () {
    return (
      data?.ytdSales?.map(function (item) {
        return {
          month: item.month,
          sales: Number(item.sales) || 0,
        };
      }) || []
    );
  }, [data]);

  const kpis = [
    {
      title: "Today's Sales",
      value: data?.["Today's Sales"],
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "MTD Sales",
      value: data?.["MTD Sales"],
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "YTD Sales",
      value: data?.["YTD Sales"],
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "Accounts Receivable",
      value: data?.["Pending / Unpaid"],
      icon: "receivable",
      className: "receivable-card",
    },
    {
      title: "Purchases MTD",
      value: data?.["Purchases MTD"],
      icon: "purchase",
      className: "purchase-card",
    },
    {
      title: "Goods Inventory",
      value: data?.["Goods Inventory"],
      icon: "inventory",
      className: "inventory-card",
    },
    {
      title: "Expenses MTD",
      value: data?.["Expenses MTD"],
      icon: "expense",
      className: "expense-card",
    },
  ];

  return (
    <main className="dashboard">
      <div className="container">

        <header className="header">

          <div className="brand">
            <div className="brand-icon">
              <Icon type="chart" />
            </div>

            <div>
              <div className="brand-title">
                PTANZO ALBAY
              </div>

              <div className="brand-subtitle">
                Sales & Operations Dashboard
              </div>
            </div>
          </div>

          <div className="report-date">

            <div className="report-date-label">
              REPORT DATE
            </div>

            <div className="report-date-value">
              {reportDate}
            </div>

          </div>

        </header>

        {loading && !data ? (

          <div className="status">
            Loading dashboard...
          </div>

        ) : error ? (

          <div className="status error">

            {error}

            <br />

            <button
              className="refresh-button"
              onClick={loadDashboard}
            >
              Try Again
            </button>

          </div>

        ) : (

          <>

            <section className="kpi-grid">

              {kpis.map(function (kpi) {

                return (
                  <div
                    className={"kpi-card " + kpi.className}
                    key={kpi.title}
                  >

                    <div className="kpi-top">

                      <div className="kpi-title">
                        {kpi.title}
                      </div>

                      <div className="kpi-icon">
                        <Icon type={kpi.icon} />
                      </div>

                    </div>

                    <div className="kpi-value">
                      {formatMoney(Number(kpi.value))}
                    </div>

                  </div>
                );

              })}

            </section>

            <section className="chart-grid">

              <div className="chart-card">

                <div className="chart-header">

                  <div className="chart-title-wrap">

                    <div className="chart-icon">
                      <Icon type="chart" />
                    </div>

                    <div>

                      <div className="chart-title">
                        MTD Sales Performance
                      </div>

                      <div className="chart-subtitle">
                        Daily sales for the current month
                      </div>

                    </div>

                  </div>

                </div>

                <div className="chart-area">

                  <BarChart
                    data={dailySales}
                    valueKey="sales"
                    labelKey="date"
                  />

                </div>

              </div>


              <div className="chart-card">

                <div className="chart-header">

                  <div className="chart-title-wrap">

                    <div className="chart-icon">
                      <Icon type="chart" />
                    </div>

                    <div>

                      <div className="chart-title">
                        YTD Sales Performance
                      </div>

                      <div className="chart-subtitle">
                        Monthly sales performance for 2026
                      </div>

                    </div>

                  </div>

                </div>

                <div className="chart-area">

                  <BarChart
                    data={ytdSales}
                    valueKey="sales"
                    labelKey="month"
                  />

                </div>

              </div>

            </section>

          </>

        )}

      </div>


      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          background: #f4f7fb;
          color: #172033;
        }

        .dashboard {
          min-height: 100vh;
          padding: 30px;
          background: #f4f7fb;
        }

        .container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 25px;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .brand-icon {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #172033;
          color: white;
          box-shadow: 0 10px 25px rgba(23, 32, 51, 0.18);
        }

        .brand-icon svg {
          width: 28px;
          height: 28px;
        }

        .brand-title {
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .brand-subtitle {
          margin-top: 3px;
          font-size: 13px;
          color: #718096;
          font-weight: 500;
        }

        .report-date {
          text-align: right;
          padding: 17px 24px;
          border-radius: 18px;
          background: white;
          border: 1px solid #e4eaf2;
          box-shadow: 0 8px 25px rgba(35, 50, 75, 0.07);
        }

        .report-date-label {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #7b8799;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .report-date-value {
          font-size: 25px;
          line-height: 1.2;
          font-weight: 850;
          color: #172033;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 17px;
          margin-bottom: 24px;
        }

        .kpi-card {
          position: relative;
          overflow: hidden;
          min-height: 145px;
          padding: 21px;
          border-radius: 20px;
          background: white;
          border: 1px solid #e6ebf2;
          box-shadow: 0 8px 24px rgba(35, 50, 75, 0.06);
        }

        .kpi-card::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          right: -35px;
          bottom: -45px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.06);
        }

        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-title {
          font-size: 13px;
          color: #718096;
          font-weight: 700;
        }

        .kpi-icon {
          width: 39px;
          height: 39px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon svg {
          width: 21px;
          height: 21px;
        }

        .sales-card .kpi-icon {
          background: #eaf2ff;
          color: #2563eb;
        }

        .receivable-card .kpi-icon {
          background: #fff5e6;
          color: #d97706;
        }

        .purchase-card .kpi-icon {
          background: #eeeafe;
          color: #6d4aff;
        }

        .inventory-card .kpi-icon {
          background: #e8f8f0;
          color: #15905b;
        }

        .expense-card .kpi-icon {
          background: #ffecef;
          color: #dc3f68;
        }

        .kpi-value {
          margin-top: 19px;
          font-size: 26px;
          font-weight: 850;
          letter-spacing: -0.6px;
          color: #172033;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .chart-card {
          background: white;
          border: 1px solid #e6ebf2;
          border-radius: 22px;
          padding: 23px;
          box-shadow: 0 8px 24px rgba(35, 50, 75, 0.06);
          min-width: 0;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chart-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #eef4ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-icon svg {
          width: 22px;
          height: 22px;
        }

        .chart-title {
          font-size: 17px;
          font-weight: 800;
        }

        .chart-subtitle {
          margin-top: 2px;
          font-size: 12px;
          color: #8994a5;
        }

        .chart-area {
          height: 360px;
          overflow-x: auto;
          overflow-y: hidden;
          padding-top: 8px;
        }

        .bar-chart {
          height: 100%;
          min-width: 680px;
        }

        .chart-bars {
          height: 100%;
          display: flex;
          align-items: stretch;
          gap: 10px;
          padding: 20px 8px 0;
          border-bottom: 1px solid #e4e9f0;
        }

        .bar-column {
          flex: 1;
          min-width: 35px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }

        .bar-value {
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #657187;
          white-space: nowrap;
          font-weight: 700;
        }

        .bar-track {
          width: 100%;
          max-width: 44px;
          height: calc(100% - 62px);
          display: flex;
          align-items: flex-end;
          border-radius: 8px 8px 0 0;
          background: #f1f4f8;
          overflow: hidden;
        }

        .bar-fill {
          width: 100%;
          border-radius: 8px 8px 0 0;
          background: #2563eb;
          transition: height 0.4s ease;
        }

        .bar-label {
          width: 100%;
          height: 32px;
          margin-top: 7px;
          text-align: center;
          font-size: 10px;
          font-weight: 700;
          color: #68758a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .empty-chart {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8994a5;
          font-size: 14px;
        }

        .status {
          padding: 25px;
          background: white;
          border-radius: 18px;
          text-align: center;
          border: 1px solid #e6ebf2;
        }

        .error {
          color: #c53030;
        }

        .refresh-button {
          margin-top: 14px;
          border: 0;
          padding: 10px 16px;
          border-radius: 10px;
          background: #172033;
          color: white;
          cursor: pointer;
          font-weight: 700;
        }

        @media (max-width: 1100px) {

          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 700px) {

          .dashboard {
            padding: 16px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .report-date {
            width: 100%;
            text-align: left;
          }

          .report-date-value {
            font-size: 21px;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-value {
            font-size: 24px;
          }

        }

      `}</style>

    </main>
  );
}
```
