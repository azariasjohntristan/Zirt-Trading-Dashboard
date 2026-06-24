export default function QuickStats({ data }) {
  const s = data.overallStats;

  const tiles = [
    {
      val: s.winRate + "%",
      label: "Win Rate",
      cls: s.winRate >= 50 ? "positive" : "negative",
    },
    {
      val: "$" + Math.abs(s.netPnL).toFixed(2),
      label: s.netPnL < 0 ? "Net Loss" : "Net P&L",
      cls: s.netPnL < 0 ? "negative" : "positive",
    },
    {
      val: s.totalTrades.toString(),
      label: "Total Trades",
      cls: "neutral-dim",
    },
    {
      val: s.avgDiscipline.toFixed(1) + "/10",
      label: "Avg Discipline",
      cls:
        s.avgDiscipline >= 7
          ? "positive"
          : s.avgDiscipline >= 4
            ? "neutral"
            : "negative",
    },
    {
      val: s.currentStreak,
      label: "Streak",
      cls: s.currentStreak.includes("loss") ? "negative" : "positive",
    },
    {
      val: s.sessions.toString(),
      label: "Sessions",
      cls: "neutral-dim",
    },
    {
      val: s.avgRR.toFixed(1),
      label: "Avg R:R",
      cls: s.avgRR >= 1 ? "positive" : s.avgRR >= 0.5 ? "neutral" : "negative",
    },
    {
      val: s.revengeSessions.toString(),
      label: "Revenge Sessions",
      cls: s.revengeSessions > 0 ? "negative" : "positive",
    },
  ];

  return (
    <div className="card" data-card-id="quick-stats">
      <div className="card-title">Quick Stats</div>
      <div className="stats-grid">
        {tiles.map((t, i) => (
          <div className="stat-tile" key={i}>
            <div className={`stat-value ${t.cls}`}>{t.val}</div>
            <div className="stat-label">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}