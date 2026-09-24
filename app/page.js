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

  const formatMoney = (value) => {
    if (typeof value !== "number") return "—";

    return `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const cards = [
    ["Today's Sales", data?.["Today's Sales"]],
    ["MTD Sales", data?.["MTD Sales"]],
    ["YTD Sales", data?.["YTD Sales"]],
    ["Accounts Receivable", data?.["Pending / Unpaid"]],
    ["Purchases MTD", data?.["Purchases MTD"]],
    ["Goods Inventory", data?.["Goods Inventory"]],
    ["Expenses MTD", data?.["Expenses MTD"]],
  ];

  const dailyData =
    data?.dailyNetworth?.filter(
      (item) => item.sales > 0 || item.inventory > 0
    ) || [];

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="brand">PTANZO ALBAY</div>

          <h1>Sales & Operations Dashboard</h1>
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
            Refresh
          </button>
        </div>
      </header>

      {error && <div className="errorBox">{error}</div>}

      {!data && !error && (
        <div className="loading">Loading dashboard...</div>
      )}

      {data && (
        <>
          {/* KPI CARDS */}
          <section className="kpiGrid">
            {cards.map(([label, value]) => (
              <div className="kpiCard" key={label}>
                <div className="kpiLabel">{label}</div>

                <div className="kpiValue">
                  {formatMoney(value)}
                </div>
              </div>
            ))}
          </section>

          {/* DAILY SALES & INVENTORY */}
          <section className="trendSection">
            <div className="sectionTitle">
              Daily Sales & Goods Inventory
            </div>

            <div className="sectionSubtitle">
              Historical daily movement from Daily Networth
            </div>

            <div className="chartCard">
              {dailyData.length === 0 ? (
                <div className="noData">
                  No daily networth data available.
                </div>
              ) : (
                <div className="lineChart">
                  <div className="chartLegend">
                    <span className="salesLegend">
                      <span className="legendDot salesDot"></span>
                      Daily Sales
                    </span>

                    <span className="inventoryLegend">
                      <span className="legendDot inventoryDot"></span>
                      Goods Inventory
                    </span>
                  </div>

                  <div className="chartWrapper">
                    <div className="yAxis">
                      <span>₱1.4M</span>
                      <span>₱1.2M</span>
                      <span>₱1.0M</span>
                      <span>₱800K</span>
                      <span>₱600K</span>
                      <span>₱400K</span>
                      <span>₱200K</span>
                      <span>₱0</span>
                    </div>

                    <div className="chartScroll">
                      <div className="lineChartArea">
                        {dailyData.map((item) => {
                          const maxValue = Math.max(
                            ...dailyData.map((d) =>
                              Math.max(d.sales, d.inventory)
                            )
                          );

                          const salesPosition =
                            100 -
                            (item.sales / maxValue) * 90;

                          const inventoryPosition =
                            100 -
                            (item.inventory / maxValue) * 90;

                          return (
                            <div
                              className="lineColumn"
                              key={item.date}
                            >
                              <div className="gridLines">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>

                              <div className="lineArea">
                                <div
                                  className="salesPoint"
                                  style={{
                                    bottom: `${100 - salesPosition}%`,
                                  }}
                                  title={`Sales: ${formatMoney(
                                    item.sales
                                  )}`}
                                />

                                <div
                                  className="inventoryPoint"
                                  style={{
                                    bottom: `${100 - inventoryPosition}%`,
                                  }}
                                  title={`Inventory: ${formatMoney(
                                    item.inventory
                                  )}`}
                                />
                              </div>

                              <div className="chartDate">
                                {new Date(
                                  item.date + "T00:00:00"
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
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
          background: #f5f7fa;
          color: #172033;
          padding: 34px 42px 50px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .brand {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #697386;
          margin-bottom: 7px;
        }

        h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .currentDate {
          color: #697386;
          font-size: 13px;
          white-space: nowrap;
        }

        .refreshButton {
          border: 1px solid #d7dce3;
          background: white;
          padding: 9px 15px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          color: #172033;
        }

        .refreshButton:hover {
          background: #f0f2f5;
        }

        .loading {
          background: white;
          border: 1px solid #e3e7ed;
          border-radius: 14px;
          padding: 40px;
          text-align: center;
          color: #697386;
        }

        .errorBox {
          background: #fff1f1;
          border: 1px solid #f0caca;
          color: #b42318;
          padding: 15px 18px;
          border-radius: 10px;
          margin-bottom: 25px;
        }

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 30px;
        }

        .kpiCard {
          background: white;
          border: 1px solid #e3e7ed;
          border-radius: 14px;
          padding: 22px;
          min-height: 120px;
        }

        .kpiLabel {
          font-size: 12px;
          color: #697386;
          font-weight: 700;
          margin-bottom: 13px;
        }

        .kpiValue {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .trendSection {
          margin-top: 5px;
        }

        .sectionTitle {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .sectionSubtitle {
          color: #7d8796;
          font-size: 12px;
          margin-bottom: 15px;
        }

        .chartCard {
          background: white;
          border: 1px solid #e3e7ed;
          border-radius: 14px;
          padding: 22px;
          overflow: hidden;
        }

        .chartLegend {
          display: flex;
          gap: 24px;
          font-size: 12px;
          color: #697386;
          margin-bottom: 20px;
        }

        .salesLegend,
        .inventoryLegend {
          display: flex;
          align-items: center;
          gap: 7px;
          font-weight: 700;
        }

        .legendDot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          display: inline-block;
        }

        .salesDot {
          background: #172033;
        }

        .inventoryDot {
          background: #9aa4b2;
        }

        .chartWrapper {
          display: flex;
          width: 100%;
        }

        .yAxis {
          width: 52px;
          height: 330px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px 8px 28px 0;
          text-align: right;
          font-size: 10px;
          color: #8992a2;
          flex-shrink: 0;
        }

        .chartScroll {
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
        }

        .lineChartArea {
          min-width: 800px;
          height: 330px;
          display: flex;
          align-items: stretch;
          gap: 7px;
          border-bottom: 1px solid #dfe3e8;
          padding: 10px 8px 0;
          position: relative;
        }

        .lineColumn {
          flex: 1;
          min-width: 28px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
        }

        .lineArea {
          height: 280px;
          position: relative;
          border-left: 1px solid #f0f2f5;
          z-index: 2;
        }

        .gridLines {
          position: absolute;
          left: 0;
          right: 0;
          top: 10px;
          height: 280px;
          pointer-events: none;
          z-index: 0;
        }

        .gridLines span {
          display: block;
          height: 35px;
          border-top: 1px dashed #edf0f3;
        }

        .salesPoint,
        .inventoryPoint {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
        }

        .salesPoint {
          background: #172033;
          box-shadow: 0 0 0 3px rgba(23, 32, 51, 0.08);
        }

        .inventoryPoint {
          background: #9aa4b2;
          box-shadow: 0 0 0 3px rgba(154, 164, 178, 0.12);
        }

        .chartDate {
          text-align: center;
          font-size: 10px;
          color: #7d8796;
          margin-top: 9px;
          white-space: nowrap;
        }

        .noData {
          padding: 50px;
          text-align: center;
          color: #8992a2;
        }

        @media (max-width: 1000px) {
          .dashboard {
            padding: 25px;
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

          h1 {
            font-size: 24px;
          }

          .kpiGrid {
            grid-template-columns: 1fr;
          }

          .kpiValue {
            font-size: 22px;
          }

          .chartCard {
            padding: 16px;
          }
        }
      `}</style>
    </main>
  );
}
