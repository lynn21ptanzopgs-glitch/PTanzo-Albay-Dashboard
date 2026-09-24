"use client";

import { useEffect, useMemo, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzDG5qtgL4Pzt__QWAByxmrow82P4o88MAUgPsHkc8lemp6gcy7Tel7IzKO_-76PY8U0w/exec";

const icons = {
  sales: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 4-4 3 2 5-6" />
    </svg>
  ),

  receivable: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.5c-.7-.7-1.7-1-3-1-1.7 0-3 .8-3 2s1.2 2 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.3-.3-3-1" />
      <path d="M12 6v12" />
    </svg>
  ),

  purchase: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  ),

  inventory: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  ),

  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </svg>
  ),

  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-3 3 2 5-6" />
    </svg>
  ),
};

function formatMoney(value) {
  if (typeof value !== "number") return "—";

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

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch(API_URL + "?t=" + Date.now(), {
        cache: "no-store",
      });

      const json = await response.json();

      setData(json);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard API error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const cards = [
    {
      label: "Today's Sales",
      value: data?.["Today's Sales"],
      icon: icons.sales,
      className: "sales",
    },
    {
      label: "MTD Sales",
      value: data?.["MTD Sales"],
      icon: icons.sales,
      className: "sales",
    },
    {
      label: "YTD Sales",
      value: data?.["YTD Sales"],
      icon: icons.sales,
      className: "sales",
    },
    {
      label: "Accounts Receivable",
      value: data?.["Pending / Unpaid"],
      icon: icons.receivable,
      className: "receivable",
    },
    {
      label: "Purchases MTD",
      value: data?.["Purchases MTD"],
      icon: icons.purchase,
      className: "purchase",
    },
    {
      label: "Goods Inventory",
      value: data?.["Goods Inventory"],
      icon: icons.inventory,
      className: "inventory",
    },
    {
      label: "Expenses MTD",
      value: data?.["Expenses MTD"],
      icon: icons.expense,
      className: "expense",
    },
  ];

  const dailyData =
    data?.dailyNetworth?.filter(
      (item) => item.sales > 0 || item.inventory > 0
    ) || [];

  const chart = useMemo(() => {
    if (!dailyData.length) return null;

    const width = Math.max(950, dailyData.length * 58);
    const height = 370;

    const padding = {
      left: 65,
      right: 25,
      top: 25,
      bottom: 55,
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxData = Math.max(
      ...dailyData.map((item) =>
        Math.max(item.sales || 0, item.inventory || 0)
      )
    );

    const maxValue = Math.ceil(maxData / 100000) * 100000;

    const getX = (index) =>
      padding.left +
      (index / Math.max(dailyData.length - 1, 1)) * chartWidth;

    const getY = (value) =>
      padding.top +
      chartHeight -
      ((value || 0) / maxValue) * chartHeight;

    const salesPoints = dailyData
      .map((item, index) => getX(index) + "," + getY(item.sales))
      .join(" ");

    const inventoryPoints = dailyData
      .map((item, index) => getX(index) + "," + getY(item.inventory))
      .join(" ");

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      maxValue,
      getX,
      getY,
      salesPoints,
      inventoryPoints,
    };
  }, [dailyData]);

  return (
    <main className="dashboard">
      <div className="backgroundGlow glowOne" />
      <div className="backgroundGlow glowTwo" />

      <header className="header">
        <div>
          <div className="brand">PTANZO ALBAY</div>
          <h1>Sales &amp; Operations Dashboard</h1>
          <p>Business performance overview</p>
        </div>

        <div className="headerRight">
          <div className="date">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <button className="refreshButton" onClick={loadData}>
            <span className={loading ? "spin" : ""}>↻</span>
            Refresh
          </button>
        </div>
      </header>

      <section className="kpiGrid">
        {cards.map((card) => (
          <div
            key={card.label}
            className={"kpiCard " + card.className}
          >
            <div className="cardGlow" />

            <div className="iconBox">
              {card.icon}
            </div>

            <div className="kpiContent">
              <div className="kpiLabel">{card.label}</div>

              <div className="kpiValue">
                {loading ? "Loading..." : formatMoney(card.value)}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="chartCard">
        <div className="chartHeader">
          <div className="chartTitleArea">
            <div className="chartIcon">
              {icons.chart}
            </div>

            <div>
              <h2>Daily Sales &amp; Goods Inventory</h2>
              <p>Historical daily movement from Daily Networth</p>
            </div>
          </div>

          <div className="periodBadge">
            September 2026
          </div>
        </div>

        <div className="legend">
          <div>
            <span className="legendDot salesDot" />
            Daily Sales
          </div>

          <div>
            <span className="legendDot inventoryDot" />
            Goods Inventory
          </div>
        </div>

        <div className="chartScroll">
          {chart ? (
            <svg
              width={chart.width}
              height={chart.height}
              className="chart"
              viewBox={
                "0 0 " +
                chart.width +
                " " +
                chart.height
              }
            >
              {[0, 1, 2, 3, 4, 5].map((level) => {
                const value =
                  chart.maxValue -
                  (chart.maxValue / 5) * level;

                const y = chart.getY(value);

                return (
                  <g key={level}>
                    <line
                      x1={chart.padding.left}
                      x2={chart.width - chart.padding.right}
                      y1={y}
                      y2={y}
                      className="gridLine"
                    />

                    <text
                      x={chart.padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="axisText"
                    >
                      {formatCompact(value)}
                    </text>
                  </g>
                );
              })}

              <polyline
                points={chart.inventoryPoints}
                className="inventoryLine"
              />

              <polyline
                points={chart.salesPoints}
                className="salesLine"
              />

              {dailyData.map((item, index) => {
                const x = chart.getX(index);
                const salesY = chart.getY(item.sales);
                const inventoryY = chart.getY(item.inventory);

                const date = new Date(
                  item.date + "T00:00:00"
                );

                const label = date.toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                );

                return (
                  <g key={item.date}>
                    <circle
                      cx={x}
                      cy={salesY}
                      r="5"
                      className="salesPoint"
                    >
                      <title>
                        {label} — Sales:{" "}
                        {formatMoney(item.sales)}
                      </title>
                    </circle>

                    <circle
                      cx={x}
                      cy={inventoryY}
                      r="5"
                      className="inventoryPoint"
                    >
                      <title>
                        {label} — Inventory:{" "}
                        {formatMoney(item.inventory)}
                      </title>
                    </circle>

                    <text
                      x={x}
                      y={chart.height - 20}
                      textAnchor="middle"
                      className="dateText"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="emptyChart">
              No daily data available.
            </div>
          )}
        </div>

        <div className="chartNote">
          Hover over a point to view the exact amount.
        </div>
      </section>

      {lastUpdated && (
        <div className="lastUpdated">
          Last updated{" "}
          {lastUpdated.toLocaleTimeString("en-PH", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
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
          padding: 34px 42px 45px;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(59, 130, 246, 0.08),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 10%,
              rgba(16, 185, 129, 0.07),
              transparent 28%
            ),
            #f7f9fc;
          color: #172033;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .backgroundGlow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }

        .glowOne {
          width: 260px;
          height: 260px;
          background: rgba(37, 99, 235, 0.06);
          top: 250px;
          left: -100px;
        }

        .glowTwo {
          width: 280px;
          height: 280px;
          background: rgba(16, 185, 129, 0.05);
          right: -120px;
          bottom: 100px;
        }

        .header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 30px;
        }

        .brand {
          display: inline-block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
          color: #2563eb;
        }

        h1 {
          margin: 0;
          font-size: clamp(27px, 3vw, 40px);
          line-height: 1.1;
          letter-spacing: -1.2px;
          color: #111827;
        }

        .header p {
          margin: 8px 0 0;
          color: #667085;
          font-size: 14px;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .date {
          color: #667085;
          font-size: 13px;
          white-space: nowrap;
        }

        .refreshButton {
          border: 1px solid #dfe5ee;
          background: rgba(255, 255, 255, 0.9);
          color: #344054;
          border-radius: 11px;
          padding: 10px 15px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: 0.2s ease;
        }

        .refreshButton:hover {
          transform: translateY(-2px);
          border-color: #b9c7dc;
          box-shadow: 0 8px 22px rgba(16, 24, 40, 0.08);
        }

        .refreshButton span {
          font-size: 17px;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .kpiGrid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-bottom: 22px;
        }

        .kpiCard {
          position: relative;
          overflow: hidden;
          min-height: 145px;
          padding: 21px;
          border: 1px solid #e6eaf0;
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 8px 25px rgba(16, 24, 40, 0.055);
          display: flex;
          gap: 15px;
          align-items: flex-start;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .kpiCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 35px rgba(16, 24, 40, 0.1);
        }

        .kpiCard::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          border-radius: 17px 0 0 17px;
        }

        .kpiCard.sales::before {
          background: #2563eb;
        }

        .kpiCard.receivable::before {
          background: #d97706;
        }

        .kpiCard.purchase::before {
          background: #7c3aed;
        }

        .kpiCard.inventory::before {
          background: #059669;
        }

        .kpiCard.expense::before {
          background: #dc2626;
        }

        .cardGlow {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          right: -45px;
          top: -45px;
          opacity: 0.5;
          filter: blur(8px);
        }

        .sales .cardGlow {
          background: rgba(37, 99, 235, 0.1);
        }

        .receivable .cardGlow {
          background: rgba(217, 119, 6, 0.1);
        }

        .purchase .cardGlow {
          background: rgba(124, 58, 237, 0.1);
        }

        .inventory .cardGlow {
          background: rgba(5, 150, 105, 0.1);
        }

        .expense .cardGlow {
          background: rgba(220, 38, 38, 0.1);
        }

        .iconBox {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .iconBox svg {
          width: 24px;
          height: 24px;
        }

        .sales .iconBox {
          color: #2563eb;
          background: #eff6ff;
        }

        .receivable .iconBox {
          color: #d97706;
          background: #fffbeb;
        }

        .purchase .iconBox {
          color: #7c3aed;
          background: #f5f3ff;
        }

        .inventory .iconBox {
          color: #059669;
          background: #ecfdf5;
        }

        .expense .iconBox {
          color: #dc2626;
          background: #fef2f2;
        }

        .kpiContent {
          position: relative;
          z-index: 1;
          min-width: 0;
        }

        .kpiLabel {
          margin-top: 3px;
          color: #667085;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .kpiValue {
          margin-top: 9px;
          color: #101828;
          font-size: clamp(21px, 2vw, 29px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.7px;
          white-space: nowrap;
        }

        .chartCard {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border: 1px solid #e6eaf0;
          border-radius: 19px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 8px 25px rgba(16, 24, 40, 0.055);
          padding: 24px 25px 18px;
        }

        .chartHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .chartTitleArea {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .chartIcon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef4ff;
          color: #2563eb;
        }

        .chartIcon svg {
          width: 22px;
          height: 22px;
        }

        .chartTitleArea h2 {
          margin: 0;
          font-size: 18px;
          color: #101828;
          letter-spacing: -0.3px;
        }

        .chartTitleArea p {
          margin: 4px 0 0;
          color: #667085;
          font-size: 12px;
        }

        .periodBadge {
          padding: 8px 12px;
          border: 1px solid #e3e8ef;
          border-radius: 9px;
          color: #475467;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .legend {
          display: flex;
          gap: 20px;
          margin: 22px 0 3px 55px;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }

        .legend > div {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .legendDot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .salesDot {
          background: #2563eb;
        }

        .inventoryDot {
          background: #059669;
        }

        .chartScroll {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          padding-bottom: 3px;
        }

        .chart {
          display: block;
          min-width: 950px;
        }

        .gridLine {
          stroke: #e9edf3;
          stroke-width: 1;
        }

        .axisText {
          fill: #98a2b3;
          font-size: 10px;
        }

        .dateText {
          fill: #98a2b3;
          font-size: 10px;
        }

        .salesLine {
          fill: none;
          stroke: #2563eb;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .inventoryLine {
          fill: none;
          stroke: #059669;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .salesPoint {
          fill: #ffffff;
          stroke: #2563eb;
          stroke-width: 3;
          cursor: pointer;
        }

        .inventoryPoint {
          fill: #ffffff;
          stroke: #059669;
          stroke-width: 3;
          cursor: pointer;
        }

        .salesPoint:hover,
        .inventoryPoint:hover {
          r: 7;
        }

        .chartNote {
          margin-top: 5px;
          color: #98a2b3;
          font-size: 11px;
          text-align: right;
        }

        .emptyChart {
          height: 370px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #98a2b3;
        }

        .lastUpdated {
          position: relative;
          z-index: 1;
          margin-top: 12px;
          text-align: right;
          color: #98a2b3;
          font-size: 11px;
        }

        @media (max-width: 1050px) {
          .kpiGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .dashboard {
            padding: 24px 16px 35px;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .headerRight {
            width: 100%;
            justify-content: space-between;
          }

          .kpiGrid {
            grid-template-columns: 1fr;
          }

          .chartHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .legend {
            margin-left: 0;
          }
        }
      `}
      </style>
    </main>
  );
}
