"use client";

import { useEffect, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

function money(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function compact(value) {
  const n = Number(value) || 0;

  if (n >= 1000000) return `₱${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `₱${Math.round(n / 1000)}K`;

  return `₱${Math.round(n)}`;
}

function Icon({ type }) {
  const icons = {
    sales: "₱",
    receivable: "₱",
    purchase: "↗",
    inventory: "▦",
    expense: "−",
  };

  return (
    <div className="kpi-icon">
      {icons[type] || "•"}
    </div>
  );
}

function YtdChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="empty-chart">No sales data available.</div>;
  }

  const max = Math.max(
    ...data.map((item) => Number(item.sales) || 0),
    1
  );

  return (
    <div className="chart-area">
      <div className="bar-chart">
        <div className="chart-bars">
          {data.map((item, index) => {
            const sales = Number(item.sales) || 0;
            const height = Math.max((sales / max) * 100, 3);

            return (
              <div
                className="bar-column"
                key={`${item.month}-${index}`}
              >
                <div className="bar-value">
                  {compact(sales)}
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${height}%` }}
                  />
                </div>

                <div className="bar-label">
                  {String(item.month).slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamPerformanceCard({ name, data }) {
  if (!data) {
    return null;
  }

  const sales = Number(data.sales) || 0;
  const target = Number(data.target) || 1500000;
  const performanceRaw = Number(data.performance) || 0;
const performance =
  performanceRaw <= 1
    ? performanceRaw * 100
    : performanceRaw;
  const balanceToSell = Math.max(target - sales, 0);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-wrap">
          <div className="chart-icon">↗</div>

          <div>
            <div className="chart-title">
              {name} Performance
            </div>

            <div className="chart-subtitle">
              YTD sales performance
            </div>
          </div>
        </div>
      </div>

      <div className="team-performance">

        <div className="team-main-value">
          {money(sales)}
        </div>

        <div className="team-progress">
          <div className="team-progress-label">
            <span>Performance</span>
            <strong>{performance}%</strong>
          </div>

          <div className="team-progress-track">
            <div
              className="team-progress-fill"
              style={{
                width: `${Math.min(performance, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="team-details">

          <div className="team-detail">
            <span>Target</span>
            <strong>{money(target)}</strong>
          </div>

          <div className="team-detail">
            <span>Balance to Sell</span>
            <strong>{money(balanceToSell)}</strong>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }

        return response.json();
      })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load dashboard data.");
      });
  }, []);

  if (error) {
    return (
      <main className="dashboard">
        <div className="container">
          <div className="error">{error}</div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="dashboard">
        <div className="container">
          <div className="status">
            Loading dashboard...
          </div>
        </div>
      </main>
    );
  }

  const ytdSales = Array.isArray(data.ytdSales)
    ? data.ytdSales
    : [];

  const teamPerformance =
    data.teamPerformance || {};

  return (
    <main className="dashboard">
      <div className="container">

        {/* HEADER */}

        <header className="header">

          <div className="brand">

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
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>

          </div>

        </header>


        {/* KPI CARDS */}

        <section className="kpi-grid">

          <div className="kpi-card sales-card">
            <div className="kpi-top">
              <div className="kpi-title">
                Today's Sales
              </div>

              <Icon type="sales" />
            </div>

            <div className="kpi-value">
              {money(data["Today's Sales"])}
            </div>
          </div>


          <div className="kpi-card sales-card">
            <div className="kpi-top">
              <div className="kpi-title">
                MTD Sales
              </div>

              <Icon type="sales" />
            </div>

            <div className="kpi-value">
              {money(data["MTD Sales"])}
            </div>
          </div>


          <div className="kpi-card sales-card">
            <div className="kpi-top">
              <div className="kpi-title">
                YTD Sales
              </div>

              <Icon type="sales" />
            </div>

            <div className="kpi-value">
              {money(data["YTD Sales"])}
            </div>
          </div>


          <div className="kpi-card receivable-card">
            <div className="kpi-top">
              <div className="kpi-title">
                Accounts Receivable
              </div>

              <Icon type="receivable" />
            </div>

            <div className="kpi-value">
              {money(data["Pending / Unpaid"])}
            </div>
          </div>


          <div className="kpi-card purchase-card">
            <div className="kpi-top">
              <div className="kpi-title">
                Purchases MTD
              </div>

              <Icon type="purchase" />
            </div>

            <div className="kpi-value">
              {money(data["Purchases MTD"])}
            </div>
          </div>


          <div className="kpi-card inventory-card">
            <div className="kpi-top">
              <div className="kpi-title">
                Goods Inventory
              </div>

              <Icon type="inventory" />
            </div>

            <div className="kpi-value">
              {money(data["Goods Inventory"])}
            </div>
          </div>


          <div className="kpi-card expense-card">
            <div className="kpi-top">
              <div className="kpi-title">
                Expenses MTD
              </div>

              <Icon type="expense" />
            </div>

            <div className="kpi-value">
              {money(data["Expenses MTD"])}
            </div>
          </div>

        </section>


                {/* YTD + DSS / KAS PERFORMANCE */}

        <section className="performance-layout">

          {/* YTD SALES — 2x width */}

          <div className="chart-card ytd-card">

            <div className="chart-header">

              <div className="chart-title-wrap">

                <div className="chart-icon">
                  ▦
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

            <YtdChart data={ytdSales} />

          </div>


          {/* DSS */}

          <TeamPerformanceCard
            name="DSS"
            data={teamPerformance.DSS}
          />


          {/* KAS */}

          <TeamPerformanceCard
            name="KAS"
            data={teamPerformance.KAS}
          />

                </section>

      </div>
    </main>
  );
}
