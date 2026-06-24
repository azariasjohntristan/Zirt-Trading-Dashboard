import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="recharts-tooltip-custom">
      <div className="rtt-date">{d.date}</div>
      <div className="rtt-row">
        <span>Accuracy:</span>
        <span className={d.accuracy >= 50 ? "rtt-green" : "rtt-red"}>{d.accuracy.toFixed(1)}%</span>
      </div>
      <div className="rtt-row">
        <span>Correct:</span>
        <span>{d.correct}/{d.total}</span>
      </div>
    </div>
  );
}

export default function BiasAccuracyChart({ biasTracking }) {
  const chartData = useMemo(() => {
    if (!biasTracking || biasTracking.length === 0) return [];
    let correct = 0;
    return biasTracking.map((b, i) => {
      if (b.correct) correct++;
      return {
        date: b.date,
        accuracy: ((correct / (i + 1)) * 100),
        correct,
        total: i + 1,
      };
    });
  }, [biasTracking]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="card" data-card-id="bias-accuracy">
      <div className="card-title">Bias Accuracy Trend</div>
      <div className="recharts-container">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              dataKey="accuracy"
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
