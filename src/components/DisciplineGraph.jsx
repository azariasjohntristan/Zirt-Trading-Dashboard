import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DISC_COLORS = [
  "#d32f2f", "#e53935", "#ff7043", "#ff9800", "#ffc107",
  "#ffca28", "#5e6ad2", "#3b82f6", "#10b981", "#00e676",
];

function getDiscColor(score) {
  return DISC_COLORS[Math.min(score, 10) - 1] || "#d32f2f";
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="recharts-tooltip-custom">
      <div className="rtt-date">{d.date}</div>
      <div className="rtt-row">
        <span>Discipline:</span>
        <span style={{ color: getDiscColor(d.score), fontWeight: 600 }}>{d.score}/10</span>
      </div>
      {d.emotion !== undefined && (
        <div className="rtt-row">
          <span>Avg Emotion:</span>
          <span>{d.emotion}/10</span>
        </div>
      )}
      {d.tradeCount !== undefined && (
        <div className="rtt-row">
          <span>Trades:</span>
          <span>{d.tradeCount}</span>
        </div>
      )}
    </div>
  );
}

export default function DisciplineGraph({ data }) {
  const trades = data.recentTrades || [];
  const trend = data.disciplineTrend || [];

  const chartData = trend.map((dt) => {
    const dtParts = dt.date.split(" ");
    let emotionAvg = 0;
    let tradeCount = 0;
    if (dtParts.length >= 2) {
      const monthAbbr = dtParts[0].slice(0, 3);
      const dayNum = parseInt(dtParts[1], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthNum = months.indexOf(monthAbbr) + 1;
      const dayTrades = trades.filter((t) => {
        const tradeMonth = parseInt(t.date.slice(5, 7), 10);
        const tradeDay = parseInt(t.date.slice(8, 10), 10);
        return tradeMonth === monthNum && tradeDay === dayNum;
      });
      tradeCount = dayTrades.length;
      emotionAvg = dayTrades.length > 0
        ? parseFloat((dayTrades.reduce((s, t) => s + t.emotion, 0) / dayTrades.length).toFixed(1))
        : 0;
    }
    return { ...dt, emotion: emotionAvg, tradeCount };
  });

  return (
    <div className="card" data-card-id="discipline">
      <div className="card-title">Discipline Trend</div>
      {chartData.length > 0 ? (
        <div className="recharts-container">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--glass-border)" }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={getDiscColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty">No data yet.</div>
      )}
    </div>
  );
}
