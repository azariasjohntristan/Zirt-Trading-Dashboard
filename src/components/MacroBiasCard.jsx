import { useState } from "react";
import useBiasFetcher from "../hooks/useBiasFetcher";
import BacktestBadge from "./BacktestBadge";

export default function MacroBiasCard({ data }) {
  const liveData = useBiasFetcher();
  const mb = liveData || data.macroBias;

  const biasTag =
    mb.bias === "Bullish"
      ? "tag-bullish"
      : mb.bias === "Bearish"
        ? "tag-bearish"
        : "tag-neutral";
  const confTag = "tag-" + (mb.confidence || "neutral").toLowerCase();
  const biasGlowClass =
    mb.bias === "Bullish"
      ? "bias-glow-bullish"
      : mb.bias === "Bearish"
        ? "bias-glow-bearish"
        : "";
  const correctText =
    mb.correct === true
      ? "✓ Correct — " + (mb.actual4H || "—") + " candle matched bias"
      : mb.correct === false
        ? "✗ Wrong — " + (mb.actual4H || "—") + " candle opposed bias"
        : "— Pending";

  return (
    <div
      className={`card ${biasGlowClass}`}
      id="macro-bias-card"
      data-card-id="macro-bias"
    >
      <div className="card-title">
        Macro Bias — {mb.date}{" "}
        <span
          id="live-bias-badge"
          style={{
            fontSize: "0.65rem",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            padding: "2px 8px",
            borderRadius: "4px",
            border: "1px solid var(--accent)",
            marginLeft: "8px",
          }}
        >
          LIVE
        </span>
      </div>
      <div className="macro-detail-block" id="live-macro-detail">
        <div className="macro-detail-line">
          <span className="macro-label">[BIAS]</span>{" "}
          <span style={{ fontSize: "1.1rem" }}>🔴</span>{" "}
          <span className={`tag ${biasTag}`} id="live-bias-tag">
            {mb.bias}
          </span>
        </div>
        <div className="macro-detail-line">
          <span className="macro-label">[CONFIDENCE]</span>{" "}
          <span className={`tag ${confTag}`} id="live-conf-tag">
            {mb.confidence}
          </span>
        </div>
        <div className="macro-detail-line">
          <span className="macro-label">[SIGNALS]</span>{" "}
          <span id="live-signals">{mb.signals || ""}</span>
        </div>
        <div className="macro-detail-line">
          <span className="macro-label">[KEY LEVELS]</span>{" "}
          {(mb.keyLevels || "").split(" · ").map((level, i) => (
            <span className="key-level-chip" key={i}>
              {level}
            </span>
          ))}
        </div>
        <div className="macro-detail-line macro-notes-full" id="live-bias-notes">
          {mb.notes}
        </div>
        <div className="macro-detail-line" id="live-validation">
          <span className="macro-label">[VALIDATION]</span>{" "}
          <span
            className={
              mb.correct === true
                ? "validation-correct"
                : mb.correct === false
                  ? "validation-wrong"
                  : ""
            }
            id="live-correct"
          >
            {correctText}
          </span>
        </div>
      </div>
      <BacktestBadge />
    </div>
  );
}