import { useState } from "react";
import { BACKTEST_DATA } from "../data/phases";

export default function BacktestBadge() {
  const [show, setShow] = useState(false);

  return (
    <div className="macro-card-footer">
      <span
        className="backtest-badge"
        id="backtest-badge"
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        ⚡ Backtest
      </span>
      {show && (
        <div className="backtest-tooltip show" id="backtest-tooltip">
          <div className="bt-title">{BACKTEST_DATA.title}</div>
          <div
            style={{
              color: "#e94560",
              fontWeight: 600,
              fontSize: "0.7rem",
              margin: "2px 0",
            }}
          >
            ● Bearish signals:
          </div>
          {BACKTEST_DATA.bearishSignals.map((s, i) => (
            <div className="bt-line" key={i}>
              {s.label} <em>{s.value}</em>
            </div>
          ))}
          <div
            style={{
              color: "#2ecc71",
              fontWeight: 600,
              fontSize: "0.7rem",
              margin: "4px 0 2px",
            }}
          >
            ● Bullish signal:
          </div>
          {BACKTEST_DATA.bullishSignals.map((s, i) => (
            <div className="bt-line" key={i}>
              {s.label} <em>{s.value}</em>
            </div>
          ))}
          <div
            style={{
              fontSize: "0.55rem",
              color: "var(--text-dim)",
              marginTop: "4px",
            }}
          >
            {BACKTEST_DATA.footer}
          </div>
        </div>
      )}
    </div>
  );
}