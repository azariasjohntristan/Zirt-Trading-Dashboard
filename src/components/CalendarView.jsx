import { useState, useMemo } from "react";
import { MONTHS, DAYS, fmtPnL, pnlClass } from "../data/constants";

const SESSION_MAP = { 1: "London", 2: "NY", 3: "Asia" };

export default function CalendarView({ trades }) {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "", session: "", result: "", direction: "" });
  const [filterCollapsed, setFilterCollapsed] = useState(true);

  const filteredTrades = useMemo(() => {
    let t = trades || [];
    if (filters.dateFrom) t = t.filter((x) => x.date >= filters.dateFrom);
    if (filters.dateTo) t = t.filter((x) => x.date <= filters.dateTo);
    if (filters.session) t = t.filter((x) => String(x.session) === filters.session);
    if (filters.result) t = t.filter((x) => x.result === filters.result);
    if (filters.direction) t = t.filter((x) => x.direction === filters.direction);
    return t;
  }, [trades, filters]);

  const activeCount = Object.values(filters).filter((v) => v !== "").length;

  const clearFilters = () => setFilters({ dateFrom: "", dateTo: "", session: "", result: "", direction: "" });

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [highlighted, setHighlighted] = useState(null);
  const [dayModal, setDayModal] = useState(null);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = firstDay.getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  const tradeMap = {};
  filteredTrades.forEach((t) => {
    if (!tradeMap[t.date]) tradeMap[t.date] = [];
    tradeMap[t.date].push(t);
  });

  const prevMonth = () => {
    let m = month - 1;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    }
    setMonth(m);
    setYear(y);
    setHighlighted(null);
  };

  const nextMonth = () => {
    let m = month + 1;
    let y = year;
    if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
    setHighlighted(null);
  };

  const openDayModal = (dateStr) => {
    const dayTrades = tradeMap[dateStr] || [];
    if (dayTrades.length === 0) return;
    setDayModal({ date: dateStr, trades: dayTrades });
  };

  const cells = [];

  // Previous month padding
  for (let i = 0; i < startDow; i++) {
    const pd = prevMonthDays - startDow + 1 + i;
    cells.push(
      <div
        key={"pad-start-" + i}
        className="calendar-cell calendar-cell-empty other-month"
      >
        <div className="day-num">{pd}</div>
      </div>
    );
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr =
      year +
      "-" +
      String(month + 1).padStart(2, "0") +
      "-" +
      String(d).padStart(2, "0");
    const dayTrades = tradeMap[dateStr] || [];
    const isToday = dateStr === todayStr;
    const isHL = highlighted === dateStr;
    const hasTrades = dayTrades.length > 0;

    let cls = "calendar-cell";
    if (isToday) cls += " today";
    if (isHL) cls += " highlighted";
    if (hasTrades) cls += " has-trades";

    const hasWin = dayTrades.some((t) => t.result === "Win");
    const hasLoss = dayTrades.some((t) => t.result === "Loss");
    const hasNoTrade = dayTrades.some((t) => t.result === "No Trade");

    let dotsHtml = null;
    if (hasTrades) {
      dotsHtml = (
        <div className="calendar-dots">
          {hasWin && <span className="calendar-dot trade-green"></span>}
          {hasLoss && <span className="calendar-dot red"></span>}
          {hasNoTrade && <span className="calendar-dot gray"></span>}
        </div>
      );
    }

    let cnt = 0,
      pnl = 0;
    if (hasTrades) {
      cnt = dayTrades.length;
      pnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
    }

    const pc = pnl >= 0 ? "tt-val-green" : "tt-val-red";

    cells.push(
      <div
        key={d}
        className={cls}
        data-date={dateStr}
        onClick={() => openDayModal(dateStr)}
      >
        <div className="day-num">{d}</div>
        {dotsHtml}
        {hasTrades && (
          <div className="calendar-cell-stats">
            <div className="cc-trade-count">
              {cnt} trade{cnt !== 1 ? "s" : ""}
            </div>
            <div className={`cc-pnl ${pnlClass(pnl)}`}>{fmtPnL(pnl)}</div>
          </div>
        )}
        {hasTrades && (
          <div className="calendar-tooltip">
            <div className="tt-line">
              <span className="tt-label">Trades:</span>
              <span>{cnt}</span>
            </div>
            <div className="tt-line">
              <span className="tt-label">P&amp;L:</span>
              <span className={pc}>{fmtPnL(pnl)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Remaining padding for last row
  const total = startDow + daysInMonth;
  const rem = (7 - (total % 7)) % 7;
  for (let i = 1; i <= rem; i++) {
    cells.push(
      <div
        key={"pad-end-" + i}
        className="calendar-cell calendar-cell-empty other-month"
      >
        <div className="day-num">{i}</div>
      </div>
    );
  }

  return (
    <>
      <div className="calendar-view">
        <div className="calendar-filter-bar">
          <div className="calendar-filter-header">
            <button className="filter-collapse-btn" onClick={() => setFilterCollapsed((p) => !p)} title={filterCollapsed ? "Show filters" : "Hide filters"}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: filterCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <span className="filter-title">Filters</span>
            {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
            <span className="filter-count">{filteredTrades.length} of {trades.length} trades</span>
            {activeCount > 0 && <button className="filter-clear" onClick={clearFilters}>Clear all</button>}
          </div>
          {!filterCollapsed && (
            <div className="calendar-filter-controls">
              <div className="filter-group">
                <label className="filter-label">From</label>
                <input type="date" className="filter-input" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div className="filter-group">
                <label className="filter-label">To</label>
                <input type="date" className="filter-input" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
              </div>
              <div className="filter-group">
                <label className="filter-label">Session</label>
                <select className="filter-select" value={filters.session} onChange={(e) => setFilters({ ...filters, session: e.target.value })}>
                  <option value="">All</option>
                  {Object.entries(SESSION_MAP).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Result</label>
                <select className="filter-select" value={filters.result} onChange={(e) => setFilters({ ...filters, result: e.target.value })}>
                  <option value="">All</option>
                  <option value="Win">Win</option>
                  <option value="Loss">Loss</option>
                  <option value="BE">BE</option>
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Direction</label>
                <select className="filter-select" value={filters.direction} onChange={(e) => setFilters({ ...filters, direction: e.target.value })}>
                  <option value="">All</option>
                  <option value="Buy">Buy</option>
                  <option value="Sell">Sell</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="calendar-header">
          <div className="calendar-title">
            {MONTHS[month]} {year}
          </div>
          <div className="calendar-nav">
            <button
              className="calendar-nav-btn"
              onClick={prevMonth}
              title="Previous month"
            >
              ‹
            </button>
            <button
              className="calendar-nav-btn"
              onClick={nextMonth}
              title="Next month"
            >
              ›
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {DAYS.map((d) => (
            <div key={d} className="calendar-weekday">
              {d}
            </div>
          ))}
          {cells}
        </div>
      </div>
      {dayModal && (
        <DayModal
          date={dayModal.date}
          trades={dayModal.trades}
          onClose={() => setDayModal(null)}
        />
      )}
    </>
  );
}

function DayModal({ date, trades, onClose }) {
  const displayDate = new Date(date + "T12:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>📊 Trades — {date}</h2>
        <div className="modal-date">
          {displayDate} · {trades.length} trade
          {trades.length !== 1 ? "s" : ""}
        </div>
        {trades.map((t, i) => {
          const dirCls =
            t.direction === "Long" || t.direction === "Buy"
              ? "direction-long"
              : t.direction === "Short"
                ? "direction-short"
                : "direction-na";
          return (
            <div className="modal-trade" key={i}>
              <div className="mt-row">
                <span className="mt-label">Direction</span>
                <span className={dirCls} style={{ fontWeight: 600 }}>
                  {t.direction}
                </span>
              </div>
              <div className="mt-row">
                <span className="mt-label">Result</span>
                <span
                  className={
                    t.result === "Win"
                      ? "result-win"
                      : t.result === "Loss"
                        ? "result-loss"
                        : "result-no"
                  }
                >
                  {t.result}
                </span>
              </div>
              <div className="mt-row">
                <span className="mt-label">P&amp;L</span>
                <span className={pnlClass(t.pnl)}>{fmtPnL(t.pnl)}</span>
              </div>
              <div className="mt-row">
                <span className="mt-label">Emotion</span>
                <span>{t.emotion}/10</span>
              </div>
              <div className="mt-row">
                <span className="mt-label">Discipline</span>
                <span>{t.discipline}/10</span>
              </div>
              {t.notes && (
                <div className="mt-row">
                  <span className="mt-label">Notes</span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      textAlign: "right",
                      maxWidth: "60%",
                    }}
                  >
                    {t.notes}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}