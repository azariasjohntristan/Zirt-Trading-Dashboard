import { motion } from "framer-motion";

function formatPrice(val, key) {
  if (val == null) return "—";
  if (key === "tnx") return val.toFixed(3) + "%";
  if (key === "nq") return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return val.toFixed(2);
}

function formatChange(change, changePct) {
  if (change == null || changePct == null) return null;
  const sign = change >= 0 ? "+" : "";
  return { text: `${sign}${change.toFixed(2)} (${sign}${changePct.toFixed(2)}%)`, positive: change >= 0 };
}

export default function LivePrices({ prices, lastUpdated, onRefresh }) {
  const items = [
    { key: "nq", label: "NQ", color: "var(--accent)" },
    { key: "dxy", label: "DXY", color: "var(--secondary)" },
    { key: "vix", label: "VIX", color: "var(--warning)" },
    { key: "tnx", label: "10Y", color: "var(--success)" },
  ];

  return (
    <div className="card" data-card-id="live-prices">
      <div className="card-title-row">
        <span className="card-title">Live Market Data</span>
        <div className="live-header-right">
          {lastUpdated && (
            <span className="live-updated">
              {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button className="live-refresh-btn" onClick={onRefresh} title="Refresh prices">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>
      <div className="live-prices-grid">
        {items.map((item) => {
          const d = prices[item.key];
          const fmt = formatChange(d?.change, d?.changePct);
          return (
            <motion.div
              key={item.key}
              className="live-price-tile"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.15 }}
            >
              <div className="lp-label" style={{ color: item.color }}>{item.label}</div>
              <div className="lp-price">
                {d?.loading ? (
                  <span className="lp-loading">...</span>
                ) : (
                  formatPrice(d?.price, item.key)
                )}
              </div>
              {fmt && (
                <div className={`lp-change ${fmt.positive ? "lp-positive" : "lp-negative"}`}>
                  {fmt.text}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
