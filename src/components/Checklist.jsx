import { useState, useEffect, useCallback } from "react";
import { CHECKLIST_ITEMS, PHASES } from "../data/phases";
import { CHECK_KEY_PREFIX, LOCKIN_KEY_PREFIX, CHECK_TIME_KEY_PREFIX, fmtDT } from "../data/constants";

function getCheckStorageKey(phaseId) {
  return CHECK_KEY_PREFIX + phaseId;
}
function getLockStorageKey(phaseId) {
  return LOCKIN_KEY_PREFIX + phaseId;
}
function getCheckTimeKey(phaseId) {
  return CHECK_TIME_KEY_PREFIX + phaseId;
}

function loadChecks(phaseId) {
  try {
    return (
      JSON.parse(localStorage.getItem(getCheckStorageKey(phaseId))) || {}
    );
  } catch {
    return {};
  }
}
function saveChecks(phaseId, s) {
  localStorage.setItem(getCheckStorageKey(phaseId), JSON.stringify(s));
}
function loadLock(phaseId) {
  return localStorage.getItem(getLockStorageKey(phaseId)) || "";
}
function saveLock(phaseId, v) {
  localStorage.setItem(getLockStorageKey(phaseId), v);
}
function loadCheckTimes(phaseId) {
  try {
    return (
      JSON.parse(localStorage.getItem(getCheckTimeKey(phaseId))) || {}
    );
  } catch {
    return {};
  }
}
function saveCheckTimes(phaseId, t) {
  localStorage.setItem(getCheckTimeKey(phaseId), JSON.stringify(t));
}

export default function Checklist({ currentPhaseId }) {
  const [checks, setChecks] = useState(() => loadChecks(currentPhaseId));
  const [lockVal, setLockVal] = useState(() => loadLock(currentPhaseId));
  const [checkTimes, setCheckTimes] = useState(() =>
    loadCheckTimes(currentPhaseId)
  );

  useEffect(() => {
    setChecks(loadChecks(currentPhaseId));
    setLockVal(loadLock(currentPhaseId));
    setCheckTimes(loadCheckTimes(currentPhaseId));
  }, [currentPhaseId]);

  const toggleCheck = useCallback(
    (id) => {
      const newChecks = { ...checks, [id]: !checks[id] };
      const newTimes = { ...checkTimes };
      if (newChecks[id]) {
        newTimes[id] = fmtDT(new Date()) + " PHT";
      } else {
        delete newTimes[id];
      }
      setChecks(newChecks);
      setCheckTimes(newTimes);
      saveChecks(currentPhaseId, newChecks);
      saveCheckTimes(currentPhaseId, newTimes);
    },
    [checks, checkTimes, currentPhaseId]
  );

  const handleLockin = useCallback(() => {
    const now = fmtDT(new Date()) + " PHT";
    setLockVal(now);
    saveLock(currentPhaseId, now);
  }, [currentPhaseId]);

  // Group by category
  const cats = {};
  CHECKLIST_ITEMS.forEach((item) => {
    if (!cats[item.cat]) cats[item.cat] = [];
    cats[item.cat].push(item);
  });

  return (
    <div className="card card-half-width" data-card-id="checklist">
      <div className="card-title">Pre-Trade Checklist</div>
      <div className="checklist-grid">
        {Object.keys(cats).map((cat) => (
          <div key={cat}>
            <div className="checklist-category">{cat}</div>
            {cats[cat].map((item) => {
              const ch = checks[item.id] || false;
              const ts = checkTimes[item.id];
              return (
                <div
                  key={item.id}
                  className={`checklist-item ${ch ? "checked" : ""}`}
                  data-id={item.id}
                  onClick={() => toggleCheck(item.id)}
                >
                  <div className="checklist-checkbox"></div>
                  <span className="checklist-text">{item.text}</span>
                  <div className="cl-tooltip">
                    {ts ? "✓ Locked: " + ts : "Not yet checked"}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="checklist-lockin">
        <div>
          <div className="lockin-label">Last Lock-in</div>
          <div className="lockin-val">
            {lockVal || "Not yet locked in"}
          </div>
        </div>
        <button className="lockin-btn" onClick={handleLockin}>
          🔒 Lock In
        </button>
      </div>
    </div>
  );
}