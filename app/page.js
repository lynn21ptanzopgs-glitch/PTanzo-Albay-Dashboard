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
    ["Today's Sales", data?.["Today's Sales"], "₱"],
    ["MTD Sales", data?.["MTD Sales"], "↗"],
    ["YTD Sales", data?.["YTD Sales"], "▣"],
    ["Pending / Unpaid", data?.["Pending / Unpaid"], "!"],
    ["Paid", data?.["Paid"], "✓"],
    ["Purchases MTD", data?.["Purchases MTD"], "🛒"],
    ["Goods Inventory", data?.["Goods Inventory"], "📦"],
    ["Expenses MTD", data?.["Expenses MTD"], "−"],
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
          <div className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <button onClick={() => window.location.reload()}>
            ↻ Refresh
          </button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      {!data && !error && (
        <div className="loading">Loading dashboard...</div>
      )}

      {data && (
        <>
          <section>
            <div className="sectionTitle">Key Performance Indicators</div>
            <div className="sectionSubtitle">Live from Google Sheets</div>

            <div className="kpiGrid">
              {cards.map(([label, value, icon]) => (
                <div className="kpiCard" key={label}>
                  <div className="kpiTop">
                    <span className="icon">{icon}</span>
                  </div>

                  <div className="kpiLabel">{label}</div>

                  <div className="kpiValue">
                    {formatMoney(value)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="overviewSection">
            <div className="overviewCard">
              <div className="overviewLabel">MTD SALES</div>
              <div className="overviewValue">
                {formatMoney(data["MTD Sales"])}
              </div>
              <div className="overviewText">
                Month-to-date sales performance
              </div>
            </div>

            <div className="overviewCard">
              <div className="overviewLabel">GOODS INVENTORY</div>
              <div className="overviewValue">
                {formatMoney(data["Goods Inventory"])}
              </div>
              <div className="overviewText">
                Current goods inventory value
              </div>
            </div>

            <div className="overviewCard">
              <div className="overviewLabel">AR OUTSTANDING</div>
              <div className="overviewValue">
                {formatMoney(data["Pending / Unpaid"])}
              </div>
              <div className="overviewText">
                Accounts pending collection
              </div>
            </div>
          </section>

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
                <div className="chart">
                  <div className="chartLegend">
                    <span>● Daily Sales</span>
                    <span>● Goods Inventory</span>
                  </div>

                  <div className="chartArea">
                    {dailyData.map((item, index) => {
                      const maxValue = Math.max(
                        ...dailyData.map((d) =>
                          Math.max(d.sales, d.inventory)
                        )
                      );

                      const salesHeight =
                        maxValue > 0
                          ? (item.sales / maxValue) * 100
                          : 0;

                      const inventoryHeight =
                        maxValue > 0
                          ? (item.inventory / maxValue) * 100
                          : 0;

                      return (
                        <div className="chartColumn" key={item.date}>
                          <div className="bars">
                            <div
                              className="bar salesBar"
                              style={{
                                height: `${Math.max(
                                  salesHeight,
                                  2
                                )}%`,
                              }}
                              title={`Sales: ${formatMoney(
                                item.sales
                              )}`}
                            />

                            <div
                              className="bar inventoryBar"
                              style={{
                                height: `${Math.max(
                                  inventoryHeight,
                                  2
                                )}%`,
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
              )}
            </div>
          </section>
        </>
      )}

      <footer>
        <strong>PTanzo Albay Dashboard</strong>
        <span>Connected to Google Sheets</span>
      </footer>

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
          padding: 32px 42px;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 38px;
        }

        .brand {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
        }

        .headerRight {
          text-align: right;
        }

        .date {
          font-size: 14px;
          margin-bottom: 12px;
          color: #687386;
        }

        button {
          border: 0;
          background: #172033;
          color: white;
          padding: 9px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .sectionTitle {
          font-size: 18px;
          font-weight: 800;
        }

        .sectionSubtitle {
          margin-top: 5px;
          margin-bottom: 18px;
          color: #7b8494;
          font-size: 13px;
        }

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .kpiCard,
        .overviewCard,
        .chartCard {
          background: white;
          border: 1px solid #e6e9ee;
          border-radius: 14px;
          box-shadow: 0 3px 12px rgba(20, 30, 50, 0.04);
        }

        .kpiCard {
          padding: 20px;
        }

        .kpiTop {
          height: 25px;
        }

        .icon {
          font-size: 17px;
          font-weight: 700;
        }

        .kpiLabel {
          margin-top: 13px;
          font-size: 13px;
          color: #6d7788;
        }

        .kpiValue {
          margin-top: 7px;
          font-size: 25px;
          font-weight: 800;
        }

        .overviewSection {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-top: 30px;
        }

        .overviewCard {
          padding: 24px;
        }

        .overviewLabel {
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: 800;
          color: #707a8b;
        }

        .overviewValue {
          margin-top: 9px;
          font-size: 27px;
          font-weight: 800;
        }

        .overviewText {
          margin-top: 7px;
          font-size: 13px;
          color: #858e9d;
        }

        .trendSection {
          margin-top: 32px;
        }

        .chartCard {
          padding: 24px;
          overflow-x: auto;
        }

        .chartLegend {
          display: flex;
          gap: 22px;
          font-size: 12px;
          color: #697386;
          margin-bottom: 20px;
        }

        .chartArea {
          min-width: 800px;
          height: 330px;
          display: flex;
          align-items: stretch;
          gap: 7px;
          border-bottom: 1px solid #dfe3e8;
          padding: 20px 8px 0;
        }

        .chartColumn {
          flex: 1;
          min-width: 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .bars {
          height: 280px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3px;
        }

        .bar {
          width: 45%;
          min-height: 3px;
          border-radius: 4px 4px 0 0;
        }

        .salesBar {
          background: #172033;
        }

        .inventoryBar {
          background: #9aa4b2;
        }

        .chartDate {
          text-align: center;
          font-size: 10px;
          color: #7d8796;
          margin-top: 9px;
          white-space: nowrap;
        }

        .loading,
        .error {
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        footer {
          display: flex;
          justify-content: space-between;
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #e2e6eb;
          font-size: 12px;
          color: #7b8492;
        }

        @media (max-width: 900px) {
          .dashboard {
            padding: 24px;
          }

          .kpiGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .overviewSection {
            grid-template-columns: 1fr;
          }

          .header {
            align-items: flex-start;
            gap: 20px;
          }
        }

        @media (max-width: 600px) {
          .kpiGrid {
            grid-template-columns: 1fr;
          }

          .header {
            flex-direction: column;
          }

          .headerRight {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}
