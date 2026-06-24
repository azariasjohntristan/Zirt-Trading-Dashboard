export default function BiasTracker({ data }) {
  const acc = data.overallStats.biasAccuracy;
  const bt = data.biasTracking || [];
  const correctCalls = bt.filter((b) => b.correct).length;
  const totalCalls = bt.length;

  const accColor =
    acc >= 66 ? "var(--accent)" : acc >= 33 ? "var(--gold)" : "var(--danger)";

  return (
    <div className="card" data-card-id="bias-tracker">
      <div className="card-title">Bias Tracker</div>
      <div className="accuracy-bar">
        <span className="acc-label">Accuracy</span>
        <span className="acc-val" style={{ color: accColor }}>
          {acc}%
        </span>
        <span className="acc-detail">
          <strong>{correctCalls}</strong>/{totalCalls} correct
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Call</th>
              <th>Actual</th>
              <th>Correct</th>
            </tr>
          </thead>
          <tbody>
            {bt.length > 0 ? (
              bt.map((b, i) => {
                const callCls =
                  b.call === "Bullish"
                    ? "tag-bullish"
                    : b.call === "Bearish"
                      ? "tag-bearish"
                      : "tag-neutral";
                const actualCls =
                  b.actual === "Bullish"
                    ? "tag-bullish"
                    : b.actual === "Bearish"
                      ? "tag-bearish"
                      : "tag-neutral";
                return (
                  <tr key={i}>
                    <td>{b.date}</td>
                    <td>
                      <span className={`tag ${callCls}`}>{b.call}</span>
                    </td>
                    <td>
                      <span className={`tag ${actualCls}`}>{b.actual}</span>
                    </td>
                    <td
                      style={{
                        color: b.correct
                          ? "var(--accent)"
                          : b.correct === false
                            ? "var(--danger)"
                            : "var(--text-dim)",
                        fontWeight: 600,
                      }}
                    >
                      {b.correct ? "✓" : b.correct === false ? "✗" : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="empty">
                  No bias entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}