function parseTradeValue(str) {
  if (!str || str === "-") return 0;
  const num = parseFloat(str.replace(/[+\$,\s]/g, ""));
  return isNaN(num) ? 0 : num;
}

export function combinePhases(phases) {
  if (!phases || phases.length === 0) return null;
  if (phases.length === 1) return phases[0];

  const statsList = phases.map((p) => p.overallStats).filter(Boolean);

  const sum = (fn) => statsList.reduce((a, s) => a + (fn(s) || 0), 0);
  const avg = (fn) => {
    const vals = statsList.map(fn).filter((v) => v != null);
    return vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : 0;
  };

  const bestTrade = (() => {
    let best = null, bestVal = -Infinity;
    for (const s of statsList) {
      if (!s.bestTrade || s.bestTrade === "-") continue;
      const v = parseTradeValue(s.bestTrade);
      if (v > bestVal) { bestVal = v; best = s.bestTrade; }
    }
    return best || "-";
  })();

  const worstTrade = (() => {
    let worst = null, worstVal = Infinity;
    for (const s of statsList) {
      if (!s.worstTrade || s.worstTrade === "-") continue;
      const v = parseTradeValue(s.worstTrade);
      if (v < worstVal) { worstVal = v; worst = s.worstTrade; }
    }
    return worst || "-";
  })();

  const allTrades = phases
    .flatMap((p) => p.recentTrades || [])
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const allBiasTracking = phases
    .flatMap((p) => p.biasTracking || [])
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const allDisciplineTrend = phases.flatMap((p) => p.disciplineTrend || []);

  const allLessons = [
    ...new Set(phases.flatMap((p) => p.lessons || [])),
  ];

  const sortedByMacro = [...phases]
    .filter((p) => p.macroBias?.date && p.macroBias.date !== "-")
    .sort((a, b) => (a.macroBias.date < b.macroBias.date ? 1 : -1));

  const latestMacroBias = sortedByMacro[0]?.macroBias || phases[0].macroBias;

  const dates = phases.map((p) => p.startDate).filter(Boolean).sort();
  const updates = phases.map((p) => p.lastUpdated).filter(Boolean).sort();

  return {
    id: "combined",
    trader: "Combined",
    phase: 0,
    account: `Combined (${phases.length} phases)`,
    startDate: dates[0] || "-",
    lastUpdated: updates[updates.length - 1] || "-",
    startingCapital: phases.reduce((a, p) => a + (p.startingCapital || 0), 0),
    overallStats: {
      sessions: sum((s) => s.sessions),
      totalTrades: sum((s) => s.totalTrades),
      wins: sum((s) => s.wins),
      losses: sum((s) => s.losses),
      breakevens: sum((s) => s.breakevens),
      winRate: parseFloat(avg((s) => s.winRate).toFixed(1)),
      netPnL: parseFloat(sum((s) => s.netPnL).toFixed(2)),
      avgRR: parseFloat(avg((s) => s.avgRR).toFixed(1)),
      bestTrade,
      worstTrade,
      avgDiscipline: parseFloat(avg((s) => s.avgDiscipline).toFixed(1)),
      revengeSessions: sum((s) => s.revengeSessions),
      biasAccuracy: parseFloat(avg((s) => s.biasAccuracy).toFixed(0)),
      currentStreak:
        phases[phases.length - 1]?.overallStats?.currentStreak || "-",
    },
    macroBias: latestMacroBias,
    recentTrades: allTrades,
    biasTracking: allBiasTracking,
    disciplineTrend: allDisciplineTrend,
    lessons: allLessons,
  };
}
