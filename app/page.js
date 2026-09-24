```jsx
"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

const icons = {
  sales: (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 19V5" />
      <path d="M4 19H20" />
      <path d="M7 15L11 11L14 13L20 7" />
    </svg>
  ),

  receivable: (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7V17" />
      <path d="M15 9.5C14.4 8.8 13.4 8.5 12 8.5C10.3 8.5 9.2 9.3 9.2 10.5C9.2 11.7 10.2 12.2 12.1 12.6C14 13 14.8 13.5 14.8 14.7C14.8 16 13.7 16.8 12 16.8C10.6 16.8 9.5 16.3 8.8 15.5" />
    </svg>
  ),

  purchase: (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 5H6L8 16H18L20 8H7" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </svg>
  ),

  inventory: (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 8L12 4L20 8L12 12L4 8Z" />
      <path d="M4 8V16L12 20L20 16V8" />
      <path d="M12 12V20" />
    </svg>
  ),

  expense: (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9H16" />
      <path d="M8 13H13" />
      <path d="M8 16H11" />
    </svg>
  ),

  chart: (
    <svg viewBox="0 0 24 24" className="sectionIcon">
      <path d="M4 19V5" />
      <path d="M4 19H20" />
      <path d="M7 15L10.5 11.5L13.5 13.5L19 7" />
    </svg>
  ),
};

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

  const formatMoney = (value) => {
    if (typeof value !== "number") return "—";

    return `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatCompact = (value) => {
    if (value >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `₱${Math.round(value / 1000)}K`;
    }

    return `₱${Math.round(value)}`;
  };

  const cards = [
    {
      label: "Today's Sales",
      value: data?.["Today's Sales"],
      className: "sales",
      icon: icons.sales,
    },
    {
      label: "MTD Sales",
      value: data?.["MTD Sales"],
      className: "sales",
      icon: icons.sales,
    },
    {
      label: "YTD Sales",
      value: data?.["YTD Sales"],
      className: "sales",
      icon: icons.sales,
    },
    {
      label: "Accounts Receivable",
      value: data?.["Pending / Unpaid"],
      className: "receivable",
      icon: icons.receivable,
    },
    {
      label: "Purchases MTD",
      value: data?.["Purchases MTD"],
      className: "purchase",
      icon: icons.purchase,
    },
    {
      label: "Goods Inventory",
      value: data?.["Goods Inventory"],
      className: "inventory",
      icon: icons.inventory,
    },
    {
      label: "Expenses MTD",
      value: data?.["Expenses MTD"],
      className: "expense",
      icon: icons.expense,
    },
  ];

  const dailyData = useMemo(() => {
    return (
      data?.dailyNetworth?.filter(
        (item) => item.sales > 0 || item.inventory > 0
      ) || []
    );
  }, [data]);

  const chart = useMemo(() => {
    if (!dailyData.length) return null;

    const width = Math.max(950, dailyData.length * 58);
    const height = 370;

    const paddingLeft = 65;
    const paddingRight = 25;
    const paddingTop = 25;
    const paddingBottom = 55;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxValue =
      Math.ceil(
        Math.max(
          ...dailyData.map((d) =>
            Math.max(d.sales, d.inventory)
          )
        ) / 100000
      ) * 100000;

    const x = (index) => {
      if (dailyData.length === 1) {
        return width / 2;
      }

      return (
        paddingLeft +
        (index / (dailyData.length - 1)) * chartWidth
      );
    };

    const y = (value) => {
      return (
        paddingTop +
        chartHeight -
        (value / maxValue) * chartHeight
      );
    };

    const salesPoints = dailyData
      .map((item, index) => `${x(index)},${y(item.sales)}`)
      .join(" ");

    const inventoryPoints = dailyData
      .map((item, index) => `${x(index)},${y(item.inventory)}`)
      .join(" ");

    const gridValues = [];

    for (let i = 0; i <= 5; i++) {
      gridValues.push((maxValue / 5) * i);
    }

    return {
      width,
      height,
      maxValue,
      x,
      y,
      salesPoints,
      inventoryPoints,
      gridValues,
    };
  }, [dailyData]);

  return (
    <main className="dashboard">
      {/* HEADER */}
      <header className="header">
        <div>
          <div className="brand">PTANZO ALBAY</div>

          <h1>Sales & Operations Dashboard</h1>

          <div className="headerDescription">
            Business performance overview
          </div>
        </div>

        <div className="headerRight">
          <div className="currentDate">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <button
            className="refreshButton"
            onClick={() => window.location.reload()}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {error && <div className="errorBox">{error}</div>}

      {!data && !error && (
        <div className="loading">
          <div className="loadingSpinner"></div>
          Loading dashboard...
        </div>
      )}

      {data && (
        <>
          {/* KPI CARDS */}
          <section className="kpiGrid">
            {cards.map((card) => (
              <div
                className={`kpiCard ${card.className}`}
                key={card.label}
              >
                <div className="cardGlow"></div>

                <div className="cardTop">
                  <div className="kpiLabel">
                    {card.label}
                  </div>

                  <div className="iconBox">
                    {card.icon}
                  </div>
                </div>

                <div className="kpiValue">
                  {formatMoney(card.value)}
                </div>
              </div>
            ))}
          </section>

          {/* CHART */}
          <section className="trendSection">
            <div className="sectionHeader">
              <div className="sectionHeading">
                <div className="sectionIconBox">
                  {icons.chart}
                </div>

                <div>
                  <div className="sectionTitle">
                    Daily Sales & Goods Inventory
                  </div>

                  <div className="sectionSubtitle">
                    Historical daily movement from Daily Networth
                  </div>
                </div>
              </div>

              <div className="chartPeriod">
                September 2026
              </div>
            </div>

            <div className="chartCard">
              {dailyData.length === 0 || !chart ? (
                <div className="noData">
                  No daily networth data available.
                </div>
              ) : (
                <>
                  <div className="chartLegend">
                    <div className="legendItem">
                      <span className="legendLine salesLine"></span>
                      <span>Daily Sales</span>
                    </div>

                    <div className="legendItem">
                      <span className="legendLine inventoryLine"></span>
                      <span>Goods Inventory</span>
                    </div>
                  </div>

                  <div className="chartScroll">
                    <svg
                      width={chart.width}
                      height={chart.height}
                      viewBox={`0 0 ${chart.width} ${chart.height}`}
                      className="svgChart"
                    >
                      {/* GRID */}
                      {chart.gridValues.map((value, index) => {
                        const yPosition = chart.y(value);

                        return (
                          <g key={index}>
                            <line
                              x1="65"
                              x2={chart.width - 25}
                              y1={yPosition}
                              y2={yPosition}
                              className="gridLine"
                            />

                            <text
                              x="5"
                              y={yPosition + 4}
                              className="axisText"
                            >
                              {formatCompact(value)}
                            </text>
                          </g>
                        );
                      })}

                      {/* INVENTORY LINE */}
                      <polyline
                        points={chart.inventoryPoints}
                        fill="none"
                        className="inventoryChartLine"
                      />

                      {/* SALES LINE */}
                      <polyline
                        points={chart.salesPoints}
                        fill="none"
                        className="salesChartLine"
                      />

                      {/* INVENTORY POINTS */}
                      {dailyData.map((item, index) => (
                        <circle
                          key={`inventory-${item.date}`}
                          cx={chart.x(index)}
                          cy={chart.y(item.inventory)}
                          r="4.5"
                          className="inventoryChartPoint"
                        >
                          <title>
                            {item.date} — Inventory:{" "}
                            {formatMoney(item.inventory)}
                          </title>
                        </circle>
                      ))}

                      {/* SALES POINTS */}
                      {dailyData.map((item, index) => (
                        <circle
                          key={`sales-${item.date}`}
                          cx={chart.x(index)}
                          cy={chart.y(item.sales)}
                          r="4.5"
                          className="salesChartPoint"
                        >
                          <title>
                            {item.date} — Sales:{" "}
                            {formatMoney(item.sales)}
                          </title>
                        </circle>
                      ))}

                      {/* DATE LABELS */}
                      {dailyData.map((item, index) => (
                        <text
                          key={`date-${item.date}`}
                          x={chart.x(index)}
                          y={chart.height - 20}
                          textAnchor="middle"
                          className="dateText"
                        >
                          {new Date(
                            item.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </text>
                      ))}
                    </svg>
                  </div>

                  <div className="chartNote">
                    Hover over a point to view the exact amount.
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      )}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .dashboard {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 90% 0%,
              #e9f0f7 0,
              #f5f7fa 34%,
              #f5f7fa 100%
            );
          color: #172033;
          padding: 34px 42px 55px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* HEADER */

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .brand {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2.5px;
          color: #526174;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 31px;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .headerDescription {
          margin-top: 7px;
          font-size: 13px;
          color: #8a94a5;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .currentDate {
          color: #697386;
          font-size: 13px;
          white-space: nowrap;
        }

        .refreshButton {
          border: 1px solid #d8dee7;
          background: white;
          padding: 10px 15px;
          border-radius: 9px;
          font-weight: 750;
          cursor: pointer;
          color: #172033;
          box-shadow: 0 2px 7px rgba(23, 32, 51, 0.05);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .refreshButton:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 5px 14px rgba(23, 32, 51, 0.09);
        }

        /* KPI */

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 34px;
        }

        .kpiCard {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e1e6ed;
          border-radius: 16px;
          padding: 21px 22px;
          min-height: 132px;
          box-shadow:
            0 5px 18px rgba(23, 32, 51, 0.045),
            0 1px 2px rgba(23, 32, 51, 0.03);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .kpiCard:hover {
          transform: translateY(-3px);
          box-shadow:
            0 12px 28px rgba(23, 32, 51, 0.10),
            0 2px 4px rgba(23, 32, 51, 0.03);
        }

        .kpiCard::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .kpiCard.sales::before {
          background: #172033;
        }

        .kpiCard.receivable::before {
          background: #a36d2d;
        }

        .kpiCard.purchase::before {
          background: #65758a;
        }

        .kpiCard.inventory::before {
          background: #4e8069;
        }

        .kpiCard.expense::before {
          background: #8b5963;
        }

        .cardGlow {
          position: absolute;
          width: 110px;
          height: 110px;
          right: -48px;
          bottom: -58px;
          border-radius: 50%;
          opacity: 0.10;
          filter: blur(1px);
        }

        .sales .cardGlow {
          background: #172033;
        }

        .receivable .cardGlow {
          background: #a36d2d;
        }

        .purchase .cardGlow {
          background: #65758a;
        }

        .inventory .cardGlow {
          background: #4e8069;
        }

        .expense .cardGlow {
          background: #8b5963;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .kpiLabel {
          font-size: 11px;
          color: #697386;
          font-weight: 800;
          letter-spacing: 0.35px;
          text-transform: uppercase;
        }

        .iconBox {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .sales .iconBox {
          background: #edf0f4;
          color: #172033;
        }

        .receivable .iconBox {
          background: #f7efe4;
          color: #a36d2d;
        }

        .purchase .iconBox {
          background: #edf0f4;
          color: #65758a;
        }

        .inventory .iconBox {
          background: #eaf3ee;
          color: #4e8069;
        }

        .expense .iconBox {
          background: #f4eaed;
          color: #8b5963;
        }

        .icon {
          width: 19px;
          height: 19px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .kpiValue {
          position: relative;
          z-index: 2;
          margin-top: 15px;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.6px;
        }

        /* CHART */

        .trendSection {
          margin-top: 4px;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 14px;
        }

        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .sectionIconBox {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #172033;
          color: white;
          box-shadow: 0 5px 12px rgba(23, 32, 51, 0.16);
        }

        .sectionIcon {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .sectionTitle {
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -0.3px;
        }

        .sectionSubtitle {
          color: #7d8796;
          font-size: 12px;
          margin-top: 4px;
        }

        .chartPeriod {
          background: white;
          border: 1px solid #e1e6ed;
          border-radius: 9px;
          padding: 8px 12px;
          color: #697386;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(23, 32, 51, 0.035);
        }

        .chartCard {
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid #e1e6ed;
          border-radius: 16px;
          padding: 22px 22px 15px;
          box-shadow:
            0 5px 18px rgba(23, 32, 51, 0.04),
            0 1px 2px rgba(23, 32, 51, 0.03);
        }

        .chartLegend {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-bottom: 4px;
          font-size: 12px;
          color: #697386;
          font-weight: 700;
        }

        .legendItem {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legendLine {
          width: 25px;
          height: 3px;
          border-radius: 5px;
          display: inline-block;
        }

        .salesLine {
          background: #172033;
        }

        .inventoryLine {
          background: #718096;
        }

        .chartScroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 2px;
        }

        .svgChart {
          display: block;
          min-width: 950px;
        }

        .gridLine {
          stroke: #edf0f3;
          stroke-width: 1;
          stroke-dasharray: 4 5;
        }

        .axisText {
          fill: #9aa3b1;
          font-size: 10px;
        }

        .salesChartLine {
          stroke: #172033;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .inventoryChartLine {
          stroke: #718096;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .salesChartPoint {
          fill: #172033;
          stroke: white;
          stroke-width: 2;
          cursor: pointer;
        }

        .inventoryChartPoint {
          fill: #718096;
          stroke: white;
          stroke-width: 2;
          cursor: pointer;
        }

        .salesChartPoint:hover,
        .inventoryChartPoint:hover {
          r: 7;
        }

        .dateText {
          fill: #7d8796;
          font-size: 10px;
        }

        .chartNote {
          border-top: 1px solid #eef1f4;
          margin-top: 2px;
          padding-top: 11px;
          font-size: 10px;
          color: #9aa3b1;
        }

        /* STATES */

        .loading {
          background: white;
          border: 1px solid #e2e7ee;
          border-radius: 14px;
          padding: 45px;
          text-align: center;
          color: #697386;
        }

        .loadingSpinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e5e9ef;
          border-top-color: #172033;
          border-radius: 50%;
          margin: 0 auto 12px;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .errorBox {
          background: #fff1f1;
          border: 1px solid #f0caca;
          color: #b42318;
          padding: 15px 18px;
          border-radius: 10px;
          margin-bottom: 25px;
        }

        .noData {
          padding: 55px;
          text-align: center;
          color: #8992a2;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .dashboard {
            padding: 28px;
          }

          .kpiGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .dashboard {
            padding: 18px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .headerRight {
            width: 100%;
            justify-content: space-between;
          }

          .currentDate {
            font-size: 11px;
          }

          h1 {
            font-size: 24px;
          }

          .kpiGrid {
            grid-template-columns: 1fr;
          }

          .sectionHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .chartPeriod {
            align-self: flex-start;
          }

          .chartCard {
            padding: 16px;
          }
        }
      `}</style>
    </main>
  );
}
```
