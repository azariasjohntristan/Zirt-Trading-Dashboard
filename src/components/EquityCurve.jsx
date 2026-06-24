import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { fmtPnL } from "../data/constants";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="recharts-tooltip-custom">
      <div className="rtt-date">{d.date}</div>
      <div className="rtt-row">
        <span>Trade P&L:</span>
        <span className={d.pnl >= 0 ? "rtt-green" : "rtt-red"}>{fmtPnL(d.pnl)}</span>
      </div>
      <div className="rtt-row">
        <span>Cumulative:</span>
        <span className={d.cumulative >= 0 ? "rtt-green" : "rtt-red"}>{fmtPnL(d.cumulative)}</span>
      </div>
    </div>
  );
}

export default function EquityCurve({ trades, startingCapital = 0 }) {
  const chartData = useMemo(() => {
    let cumulative = startingCapital;
    return trades.map((t) => {
      cumulative += t.pnl;
      return {
        date: t.date,
        pnl: t.pnl,
        cumulative: parseFloat(cumulative.toFixed(2)),
      };
    });
  }, [trades, startingCapital]);

  if (trades.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Equity Curve</div>
        <div className="empty">No trades to display.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Equity Curve</div>
      <div className="recharts-container">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--success)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--glass-border)" }}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={startingCapital} stroke="var(--text-dim)" strokeDasharray="3 3" label={{ value: `Start: $${startingCapital.toLocaleString()}`, fill: "var(--text-dim)", fontSize: 10, position: "insideTopRight" }} />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--success)"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={{ r: 4, fill: "var(--success)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--success)", stroke: "var(--bg)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
