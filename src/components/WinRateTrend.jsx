import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="recharts-tooltip-custom">
      <div className="rtt-date">{d.date}</div>
      <div className="rtt-row">
        <span>Win Rate:</span>
        <span className={d.winRate >= 50 ? "rtt-green" : "rtt-red"}>{d.winRate.toFixed(1)}%</span>
      </div>
      <div className="rtt-row">
        <span>Trades:</span>
        <span>{d.tradeCount}</span>
      </div>
    </div>
  );
}

export default function WinRateTrend({ trades }) {
  const chartData = useMemo(() => {
    const windowSize = 5;
    return trades.map((_, i) => {
      const start = Math.max(0, i - windowSize + 1);
      const windowTrades = trades.slice(start, i + 1);
      const wins = windowTrades.filter((t) => t.result === "Win").length;
      const winRate = (wins / windowTrades.length) * 100;
      return {
        date: trades[i].date,
        winRate: parseFloat(winRate.toFixed(1)),
        tradeCount: windowTrades.length,
      };
    });
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Win Rate Trend</div>
        <div className="empty">No trades to display.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Win Rate Trend (5-trade rolling)</div>
      <div className="recharts-container">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--glass-border)" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={50} stroke="var(--text-dim)" strokeDasharray="3 3" label={{ value: "50%", fill: "var(--text-dim)", fontSize: 10, position: "right" }} />
            <Line
              type="monotone"
              dataKey="winRate"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--accent)", stroke: "var(--bg)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
