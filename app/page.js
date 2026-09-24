"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

function formatMoney(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return (
    "₱" +
    number.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatCompact(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return "₱" + (number / 1000000).toFixed(1) + "M";
  }

  if (number >= 1000) {
    return "₱" + (number / 1000).toFixed(0) + "K";
  }

  return "₱" + number.toFixed(0);
}

function Icon({ type }) {
  if (type === "receivable") {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
        />
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
        />
        <path
          d="M4 12L12 16L20 12M4 17L12 21L20 17"
          stroke="currentColor"
          strokeWidth="2"
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
      />
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

function BarChart({ data, labelKey }) {
  if (!data || data.length === 0) {
    return <div className="empty-chart">No sales data available.</div>;
  }

  const maxValue = Math.max(
    ...data.map(function (item) {
      return Number(item.sales) || 0;
    }),
    1
  );

  return (
    <div className="bar-chart">
      <div className="chart-bars">
        {data.map(function (item, index) {
          const value = Number(item.sales) || 0;

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
                  style={{
                    height: height + "%",
                  }}
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

  useEffect(function () {
    async function getData() {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        const result = await response.json();

        setData(result);
      } catch (err) {
        setError(
          err && err.message
            ? err.message
            : "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, []);

  const reportDate = useMemo(function () {
    return new Date().toLocaleDateString("en-PH", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const dailySales = useMemo(function () {
    if (!data || !Array.isArray(data.dailyNetworth)) {
      return [];
    }

    return data.dailyNetworth.filter(function (item) {
      return Number(item.sales) > 0;
    });
  }, [data]);

  const ytdSales = useMemo(function () {
    if (!data || !Array.isArray(data.ytdSales)) {
      return [];
    }

    return data.ytdSales.map(function (item) {
      return {
        month: item.month,
        sales: Number(item.sales) || 0,
      };
    });
  }, [data]);

  const kpis = [
    {
      title: "Today's Sales",
      value: data ? data["Today's Sales"] : null,
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "MTD Sales",
      value: data ? data["MTD Sales"] : null,
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "YTD Sales",
      value: data ? data["YTD Sales"] : null,
      icon: "sales",
      className: "sales-card",
    },
    {
      title: "Accounts Receivable",
      value: data ? data["Pending / Unpaid"] : null,
      icon: "receivable",
      className: "receivable-card",
    },
    {
      title: "Purchases MTD",
      value: data ? data["Purchases MTD"] : null,
      icon: "purchase",
      className: "purchase-card",
    },
    {
      title: "Goods Inventory",
      value: data ? data["Goods Inventory"] : null,
      icon: "inventory",
      className: "inventory-card",
    },
    {
      title: "Expenses MTD",
      value: data ? data["Expenses MTD"] : null,
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

        {loading ? (

          <div className="status">
            Loading dashboard...
          </div>

        ) : error ? (

          <div className="status error">

            {error}

            <br />

            <button
              className="refresh-button"
              onClick={function () {
                window.location.reload();
              }}
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
                      {formatMoney(kpi.value)}
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
                    labelKey="month"
                  />

                </div>

              </div>

            </section>

          </>

        )}

      </div>
    </main>
  );
}
