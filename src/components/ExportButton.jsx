import { useState } from "react";

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateJournalCSV(trades) {
  const headers = ["Date", "Session", "Direction", "Entry", "Exit", "R:R", "Result", "P&L", "Emotion", "Discipline", "Notes"];
  const rows = trades.map((t) => [
    t.date,
    t.session,
    t.direction,
    t.entry,
    t.exit,
    t.rr,
    t.result,
    t.pnl,
    t.emotion,
    t.discipline,
    `"${(t.notes || "").replace(/"/g, '""')}"`,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function generateStatsCSV(stats, biasTracking) {
  const lines = [
    "Overall Stats",
    `Win Rate,${stats.winRate}%`,
    `Net P&L,$${stats.netPnL.toFixed(2)}`,
    `Total Trades,${stats.totalTrades}`,
    `Wins,${stats.wins}`,
    `Losses,${stats.losses}`,
    `Avg Discipline,${stats.avgDiscipline}/10`,
    `Avg R:R,${stats.avgRR}`,
    `Revenge Sessions,${stats.revengeSessions}`,
    `Current Streak,${stats.currentStreak}`,
    "",
    "Bias Tracking",
    "Date,Call,Confidence,Actual,Correct",
    ...biasTracking.map((b) => `${b.date},${b.call},${b.confidence},${b.actual},${b.correct ? "Yes" : "No"}`),
  ];
  return lines.join("\n");
}

function generatePDFContent(data) {
  const stats = data.overallStats;
  const trades = data.recentTrades || [];
  const biasTracking = data.biasTracking || [];

  const lines = [
    "THE 1 TRADE PER DAY RULE — TRADE REPORT",
    `Phase: ${data.id} | Trader: ${data.trader} | Started: ${data.startDate}`,
    "",
    "=== OVERALL STATS ===",
    `Win Rate: ${stats.winRate}%`,
    `Net P&L: $${stats.netPnL.toFixed(2)}`,
    `Total Trades: ${stats.totalTrades}`,
    `Wins: ${stats.wins} | Losses: ${stats.losses} | Breakevens: ${stats.breakevens}`,
    `Avg Discipline: ${stats.avgDiscipline}/10`,
    `Avg R:R: ${stats.avgRR}`,
    `Current Streak: ${stats.currentStreak}`,
    "",
    "=== TRADE JOURNAL ===",
    "Date | Session | Direction | Entry | Exit | R:R | Result | P&L | Emotion | Discipline | Notes",
    ...trades.map((t) =>
      `${t.date} | ${t.session} | ${t.direction} | ${t.entry} | ${t.exit} | ${t.rr} | ${t.result} | $${t.pnl.toFixed(2)} | ${t.emotion}/10 | ${t.discipline}/10 | ${t.notes || ""}`
    ),
    "",
    "=== BIAS TRACKING ===",
    "Date | Call | Confidence | Actual | Correct",
    ...biasTracking.map((b) =>
      `${b.date} | ${b.call} | ${b.confidence} | ${b.actual} | ${b.correct ? "Yes" : "No"}`
    ),
  ];
  return lines.join("\n");
}

export default function ExportButton({ data }) {
  const [open, setOpen] = useState(false);

  const exportJournalCSV = () => {
    const csv = generateJournalCSV(data.recentTrades || []);
    downloadCSV(csv, `trade-journal-${data.id}.csv`);
    setOpen(false);
  };

  const exportStatsCSV = () => {
    const csv = generateStatsCSV(data.overallStats, data.biasTracking || []);
    downloadCSV(csv, `trade-stats-${data.id}.csv`);
    setOpen(false);
  };

  const exportPDF = () => {
    const content = generatePDFContent(data);
    downloadCSV(content, `trade-report-${data.id}.txt`);
    setOpen(false);
  };

  return (
    <div className="export-wrapper">
      <button className="export-btn" onClick={() => setOpen(!open)} title="Export data">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Export</span>
      </button>
      {open && (
        <>
          <div className="export-overlay" onClick={() => setOpen(false)} />
          <div className="export-menu">
            <button className="export-menu-item" onClick={exportJournalCSV}>
              <span className="emi-icon">📊</span>
              <div>
                <div className="emi-title">Journal CSV</div>
                <div className="emi-desc">All trades with details</div>
              </div>
            </button>
            <button className="export-menu-item" onClick={exportStatsCSV}>
              <span className="emi-icon">📈</span>
              <div>
                <div className="emi-title">Stats CSV</div>
                <div className="emi-desc">Overall stats + bias tracking</div>
              </div>
            </button>
            <button className="export-menu-item" onClick={exportPDF}>
              <span className="emi-icon">📄</span>
              <div>
                <div className="emi-title">Full Report</div>
                <div className="emi-desc">Complete trade report (TXT)</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
