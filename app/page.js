"use client";

import { useEffect, useMemo, useState } from "react";

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
    },
    {
      label: "MTD Sales",
      value: data?.["MTD Sales"],
      className: "sales",
    },
    {
      label: "YTD Sales",
      value: data?.["YTD Sales"],
      className: "sales",
    },
    {
      label: "Accounts Receivable",
      value: data?.["Pending / Unpaid"],
      className: "receivable",
    },
    {
      label: "Purchases MTD",
      value: data?.["Purchases MTD"],
      className: "purchase",
    },
    {
      label: "Goods Inventory",
      value: data?.["Goods Inventory"],
      className: "inventory",
    },
    {
      label: "Expenses MTD",
      value: data?.["Expenses MTD"],
      className: "expense",
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

    const width = Math.max(900, dailyData.length * 58);
    const height = 360;

    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 55;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxValue =
      Math.ceil(
        Math.max(...dailyData.map((d) =>
          Math.max(d.sales, d.inventory)
        )) / 100000
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
          {/* KPI SECTION */}
          <section className="kpiGrid">
            {cards.map((card) => (
              <div
                className={`kpiCard ${card.className}`}
                key={card.label}
              >
                <div className="cardTop">
                  <div className="kpiLabel">
                    {card.label}
                  </div>

                  <div className="cardIndicator"></div>
                </div>

                <div className="kpiValue">
                  {formatMoney(card.value)}
                </div>

                <div className="cardFooter">
                  Current figure
                </div>
              </div>
            ))}
          </section>

          {/* CHART */}
          <section className="trendSection">
            <div className="sectionHeader">
              <div>
                <div className="sectionTitle">
                  Daily Sales & Goods Inventory
                </div>

                <div className="sectionSubtitle">
                  Historical daily movement from Daily Networth
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
                              x1="20"
                              x2={chart.width - 20}
                              y1={yPosition}
                              y2={yPosition}
                              className="gridLine"
                            />

                            <text
                              x="4"
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
              circle at top right,
              #eef3f8 0,
              #f5f7fa 38%,
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
          color: #536174;
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
          box-shadow: 0 2px 6px rgba(23, 32, 51, 0.04);
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .refreshButton:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(23, 32, 51, 0.08);
        }

        /* KPI */

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .kpiCard {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid #e2e7ee;
          border-radius: 15px;
          padding: 21px 22px 18px;
          min-height: 137px;
          box-shadow: 0 4px 16px rgba(23, 32, 51, 0.035);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .kpiCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 24px rgba(23, 32, 51, 0.08);
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
          background: #9b6b2f;
        }

        .kpiCard.purchase::before {
          background: #667085;
        }

        .kpiCard.inventory::before {
          background: #4f7c68;
        }

        .kpiCard.expense::before {
          background: #8b5963;
        }

        .cardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpiLabel {
          font-size: 11px;
          color: #697386;
          font-weight: 800;
          letter-spacing: 0.35px;
          text-transform: uppercase;
        }

        .cardIndicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d5dbe3;
        }

        .sales .cardIndicator {
          background: #172033;
        }

        .receivable .cardIndicator {
          background: #9b6b2f;
        }

        .purchase .cardIndicator {
          background: #667085;
        }

        .inventory .cardIndicator {
          background: #4f7c68;
        }

        .expense .cardIndicator {
          background: #8b5963;
        }

        .kpiValue {
          margin-top: 14px;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.6px;
        }

        .cardFooter {
          margin-top: 8px;
          font-size: 10px;
          color: #9aa3b1;
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

        .sectionTitle {
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -0.3px;
        }

        .sectionSubtitle {
          color: #7d8796;
          font-size: 12px;
          margin-top: 5px;
        }

        .chartPeriod {
          background: white;
          border: 1px solid #e1e6ed;
          border-radius: 8px;
          padding: 7px 11px;
          color: #697386;
          font-size: 11px;
          font-weight: 700;
        }

        .chartCard {
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e2e7ee;
          border-radius: 15px;
          padding: 22px 22px 16px;
          box-shadow: 0 4px 18px rgba(23, 32, 51, 0.035);
        }

        .chartLegend {
          display: flex;
          align-items: center;
          gap: 25px;
          margin-bottom: 6px;
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
          display: inline-block;
          width: 22px;
          height: 3px;
          border-radius: 5px;
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
          padding-bottom: 3px;
        }

        .svgChart {
          display: block;
          min-width: 900px;
          overflow: visible;
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
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .inventoryChartLine {
          stroke: #718096;
          stroke-width: 3;
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
          margin-top: 5px;
          padding-top: 12px;
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
