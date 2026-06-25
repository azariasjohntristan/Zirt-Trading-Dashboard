import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pnlClass, fmtPnL } from "../data/constants";

const COLUMNS = [
  { key: "date", label: "Date" },
  { key: "instrument", label: "Instrument" },
  { key: "session", label: "Session" },
  { key: "direction", label: "Direction" },
  { key: "entry", label: "Entry" },
  { key: "exit", label: "Exit" },
  { key: "rr", label: "R:R" },
  { key: "result", label: "Result" },
  { key: "pnl", label: "P&L" },
  { key: "emotion", label: "Emotion" },
  { key: "discipline", label: "Discipline" },
  { key: "notes", label: "Notes" },
  { key: "screenshot", label: "Screenshots" },
  { key: "actions", label: "" },
];

const SESSION_MAP = { 1: "London", 2: "NY", 3: "Asia" };

export default function TradeJournal({ data, onEditTrade, onDeleteTrade }) {
  const trades = data.recentTrades || [];
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [notesModalTrade, setNotesModalTrade] = useState(null);

  const handleSort = (key) => {
    if (key === "notes" || key === "screenshot" || key === "actions") return;
    if (sortKey === key) {
      setSortDir((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    const arr = [...trades];
    arr.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === "session") {
        av = av || 0;
        bv = bv || 0;
      }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [trades, sortKey, sortDir]);

  return (
    <>
    <div className="card" data-card-id="trade-journal">
      <div className="card-title">Trade Journal</div>
      {sorted.length === 0 ? (
        <div className="empty">No trades recorded yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={col.key !== "notes" && col.key !== "screenshot" && col.key !== "actions" ? "sortable-th" : ""}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span className="sort-arrow">{sortDir === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((t, i) => {
                  let rowCls = "";
                  let resultCls = "";
                  if (t.result === "Win" || t.pnl > 0) {
                    rowCls = "row-win";
                    resultCls = "result-win";
                  } else if (t.result === "Loss" || t.pnl < 0) {
                    rowCls = "row-loss";
                    resultCls = "result-loss";
                  } else {
                    rowCls = "row-no-trade";
                    resultCls = "result-no";
                  }
                  const dirCls =
                    t.direction === "Long" || t.direction === "Buy"
                      ? "direction-long"
                      : t.direction === "Short"
                        ? "direction-short"
                        : "direction-na";

                  return (
                    <motion.tr
                      key={t.date + "-" + i}
                      className={rowCls}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <td>{t.date}</td>
                      <td>{t.instrument || "—"}</td>
                      <td>{SESSION_MAP[t.session] || t.session}</td>
                      <td>
                        <span className={dirCls}>{t.direction}</span>
                      </td>
                      <td>{t.entry}</td>
                      <td>{t.exit}</td>
                      <td>{t.rr}</td>
                      <td>
                        <span className={`result-pill ${resultCls}`}>{t.result}</span>
                      </td>
                      <td>
                        <span className={pnlClass(t.pnl)}>
                          {fmtPnL(t.pnl)}
                        </span>
                      </td>
                      <td>
                        <div className="bar-cell">
                          <span className="bar-num">{t.emotion}/10</span>
                          <span className="bar-track emotion">
                            <span style={{ width: (t.emotion / 10) * 100 + "%" }}></span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="bar-cell">
                          <span className="bar-num">{t.discipline}/10</span>
                          <span className="bar-track discipline">
                            <span style={{ width: (t.discipline / 10) * 100 + "%" }}></span>
                          </span>
                        </div>
                      </td>
                      <td>
                        {t.notes ? (
                          <button className="tag tag-bullish" style={{ fontSize: "0.7rem", cursor: "pointer", border: "none" }} onClick={() => setNotesModalTrade(t)}>📝 View</button>
                        ) : (
                          <span className="ta-na">—</span>
                        )}
                      </td>
                      <td>
                        {t.screenshot ? (
                          <a href={t.screenshot} target="_blank" rel="noopener noreferrer" className="tag tag-bullish" style={{ fontSize: "0.7rem" }}>🔗 View</a>
                        ) : (
                          <span className="ta-na">—</span>
                        )}
                      </td>
                      <td>
                        <div className="trade-actions">
                          <button className="ta-btn ta-edit" onClick={() => onEditTrade && onEditTrade(t)} title="Edit trade">✎</button>
                          <button className="ta-btn ta-delete" onClick={() => onDeleteTrade && onDeleteTrade(t._tradeId)} title="Delete trade">✕</button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
      {notesModalTrade && (
        <div className="modal-overlay" onClick={() => setNotesModalTrade(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setNotesModalTrade(null)}>✕</button>
            <h2>Trade Notes</h2>
            <div className="modal-date">{notesModalTrade.date} · {notesModalTrade.instrument || "—"}</div>
            <div className="notes-modal-text">{notesModalTrade.notes}</div>
          </div>
        </div>
      )}
    </>
  );
}
