import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const SESSION_MAP = { 1: "London", 2: "NY", 3: "Asia" };

export default function TradeFilters({ filters, onFilterChange, tradeCount, totalCount }) {
  const [collapsed, setCollapsed] = useState(true);
  const activeCount = Object.values(filters).filter((v) => v !== "" && v !== null).length;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onFilterChange({ dateFrom: "", dateTo: "", session: "", result: "", direction: "" });
  };

  return (
    <motion.div
      className="trade-filters"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="filter-header">
        <button className="filter-collapse-btn" onClick={() => setCollapsed((p) => !p)} title={collapsed ? "Show filters" : "Hide filters"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <span className="filter-title">Filters</span>
        {activeCount > 0 && (
          <span className="filter-badge">{activeCount}</span>
        )}
        <span className="filter-count">
          {tradeCount} of {totalCount} trades
        </span>
        {activeCount > 0 && (
          <button className="filter-clear" onClick={clearAll}>Clear all</button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            className="filter-controls"
            key="controls"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="filter-group">
              <label className="filter-label">From</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateFrom}
                onChange={(e) => handleChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To</label>
              <input
                type="date"
                className="filter-input"
                value={filters.dateTo}
                onChange={(e) => handleChange("dateTo", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Session</label>
              <select
                className="filter-select"
                value={filters.session}
                onChange={(e) => handleChange("session", e.target.value)}
              >
                <option value="">All Sessions</option>
                {Object.entries(SESSION_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Result</label>
              <select
                className="filter-select"
                value={filters.result}
                onChange={(e) => handleChange("result", e.target.value)}
              >
                <option value="">All Results</option>
                <option value="Win">Win</option>
                <option value="Loss">Loss</option>
                <option value="BE">Breakeven</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Direction</label>
              <select
                className="filter-select"
                value={filters.direction}
                onChange={(e) => handleChange("direction", e.target.value)}
              >
                <option value="">All Directions</option>
                <option value="Buy">Buy</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
