import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import Sidebar from "./components/Sidebar";
import MacroBiasCard from "./components/MacroBiasCard";
import BiasTracker from "./components/BiasTracker";
import QuickStats from "./components/QuickStats";
import CalendarView from "./components/CalendarView";
import Checklist from "./components/Checklist";
import TradeJournal from "./components/TradeJournal";
import TradeFilters from "./components/TradeFilters";
import AnalyticsSection from "./components/AnalyticsSection";
import ExportButton from "./components/ExportButton";
import { PHASES, emptyPhase } from "./data/phases";
import { SELECTED_KEY, THEME_KEY, CUSTOM_PHASES_KEY } from "./data/constants";
import { useSoundAlerts } from "./hooks/useSoundAlerts";

function loadCustomPhases() {
  try {
    const data = localStorage.getItem(CUSTOM_PHASES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveCustomPhases(custom) {
  localStorage.setItem(CUSTOM_PHASES_KEY, JSON.stringify(custom));
}

const OVERRIDES_KEY = "tcc_phase_overrides";

function loadOverrides() {
  try {
    const data = localStorage.getItem(OVERRIDES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

const DELETED_KEY = "tcc_phase_deleted";

function loadDeleted() {
  try {
    const data = localStorage.getItem(DELETED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDeleted(list) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(list));
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function App() {
  const [customPhases, setCustomPhases] = useState(loadCustomPhases);
  const [overrides, setOverrides] = useState(loadOverrides);
  const [deletedPhases, setDeletedPhases] = useState(loadDeleted);
  const allPhases = Object.fromEntries(
    Object.entries({ ...PHASES, ...customPhases }).filter(([id]) => !deletedPhases.includes(id))
  );
  const phaseKeys = Object.keys(allPhases);

  const [currentPhaseId, setCurrentPhaseId] = useState(() => {
    const saved = localStorage.getItem(SELECTED_KEY);
    return saved && allPhases[saved] ? saved : phaseKeys[0];
  });

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem("tcc_sound") !== "off"; } catch { return true; }
  });

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    session: "",
    result: "",
    direction: "",
  });

  const { checkBiasUpdate, playValidationSound } = useSoundAlerts(soundEnabled);

  useEffect(() => {
    localStorage.setItem(SELECTED_KEY, currentPhaseId);
  }, [currentPhaseId]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("light-mode", theme === "light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("tcc_sound", soundEnabled ? "on" : "off");
  }, [soundEnabled]);

  const toggleTheme = useCallback(() => setTheme((p) => (p === "dark" ? "light" : "dark")), []);

  const handlePhaseChange = useCallback((id) => {
    if (allPhases[id]) setCurrentPhaseId(id);
  }, [allPhases]);

  const handleAddPhase = useCallback(() => {
    const newId = prompt("Enter Phase ID (e.g. 1001, my-funding):");
    if (!newId || !newId.trim()) return;
    const id = newId.trim();
    if (allPhases[id]) {
      alert('Phase ID "' + id + '" already exists.');
      return;
    }
    const capInput = prompt("Enter Starting Capital (e.g. 1000):", "0");
    if (capInput === null) return;
    const startingCapital = parseFloat(capInput) || 0;
    const newPhase = emptyPhase(id);
    newPhase.startingCapital = startingCapital;
    const updated = { ...customPhases, [id]: newPhase };
    setCustomPhases(updated);
    saveCustomPhases(updated);
    setCurrentPhaseId(id);
  }, [customPhases, allPhases]);

  const handleDeletePhase = useCallback((id) => {
    const name = allPhases[id]?.account || allPhases[id]?.label || id;
    if (!confirm('Delete phase "' + name + '"? This cannot be undone.')) return;
    const updated = [...deletedPhases, id];
    setDeletedPhases(updated);
    saveDeleted(updated);
    if (id === currentPhaseId) {
      const remaining = Object.keys(allPhases).filter((k) => k !== id);
      if (remaining.length > 0) setCurrentPhaseId(remaining[0]);
    }
  }, [allPhases, deletedPhases, currentPhaseId]);

  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [editForm, setEditForm] = useState({ id: "", name: "", capital: "" });

  const handleStartEdit = useCallback((id, currentName, currentCap) => {
    setEditingPhaseId(id);
    setEditForm({ id, name: currentName, capital: String(currentCap) });
  }, []);

  const handleSavePhase = useCallback(() => {
    const id = editingPhaseId;
    if (!id) return;
    const phase = allPhases[id];
    if (!phase) return;
    const newName = editForm.name.trim() || phase.account || id;
    const newCap = parseFloat(editForm.capital) || 0;
    const newId = editForm.id.trim() || id;
    const isBuiltIn = !!PHASES[id];
    if (newId !== id && !isBuiltIn && customPhases[id]) {
      const newPhase = { ...customPhases[id], id: newId, account: newName, startingCapital: newCap };
      const updatedCustom = { ...customPhases };
      delete updatedCustom[id];
      updatedCustom[newId] = newPhase;
      setCustomPhases(updatedCustom);
      saveCustomPhases(updatedCustom);
      setOverrides((prev) => { const o = { ...prev }; delete o[id]; return o; });
      saveOverrides(overrides);
      if (currentPhaseId === id) setCurrentPhaseId(newId);
    } else {
      handleSaveOverride(id, { account: newName, startingCapital: newCap });
    }
    setEditingPhaseId(null);
  }, [editingPhaseId, allPhases, customPhases, editForm, overrides, currentPhaseId]);

  const handleSaveOverride = useCallback((id, updates) => {
    const updated = { ...overrides, [id]: { ...overrides[id], ...updates } };
    setOverrides(updated);
    saveOverrides(updated);
  }, [overrides]);

  const data = allPhases[currentPhaseId];

  const mergedData = useMemo(() => {
    if (!data) return data;
    const phaseOverride = overrides[currentPhaseId] || {};
    return { ...data, ...phaseOverride };
  }, [data, currentPhaseId, overrides]);

  const [editingCapital, setEditingCapital] = useState(false);

  const handleCapitalChange = useCallback((value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    const updated = { ...overrides, [currentPhaseId]: { ...overrides[currentPhaseId], startingCapital: num } };
    setOverrides(updated);
    saveOverrides(updated);
  }, [currentPhaseId, overrides]);

  useEffect(() => {
    if (mergedData?.macroBias?.date) {
      checkBiasUpdate(mergedData.macroBias.date);
    }
  }, [mergedData?.macroBias?.date, checkBiasUpdate]);

  const filteredTrades = useMemo(() => {
    let trades = mergedData.recentTrades || [];
    if (filters.dateFrom) {
      trades = trades.filter((t) => t.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      trades = trades.filter((t) => t.date <= filters.dateTo);
    }
    if (filters.session) {
      trades = trades.filter((t) => String(t.session) === filters.session);
    }
    if (filters.result) {
      trades = trades.filter((t) => t.result === filters.result);
    }
    if (filters.direction) {
      trades = trades.filter((t) => t.direction === filters.direction);
    }
    return trades;
  }, [mergedData.recentTrades, filters]);

  return (
    <div className="app-layout">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
      />

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <h1 className="logo">Trading Dashboard</h1>
          </div>
          <div className="header-right">
            <ExportButton data={mergedData} />
            <button
              className={`sound-toggle ${soundEnabled ? "sound-on" : "sound-off"}`}
              onClick={() => setSoundEnabled((p) => !p)}
              title={soundEnabled ? "Mute alerts" : "Enable alert sounds"}
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>
            <select
              className="phase-select"
              value={currentPhaseId}
              onChange={(e) => handlePhaseChange(e.target.value)}
            >
              {phaseKeys.map((id) => (
                <option key={id} value={id}>
                  {overrides[id]?.account || allPhases[id].account || allPhases[id].label || id}
                </option>
              ))}
            </select>
            <button className="theme-toggle" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
          </div>
        </header>

        <div className="meta-row">
          <span>Phase ID: <strong style={{ color: "var(--accent)" }}>#{data.id}</strong></span>
          <span>Trader: <strong style={{ color: "var(--accent)" }}>{data.trader}</strong></span>
          <span>Started: {data.startDate}</span>
          <span>Last updated: {data.lastUpdated}</span>
          <span className="capital-display">
            Starting Capital:{" "}
            {editingCapital ? (
              <input
                type="number"
                className="capital-input"
                defaultValue={mergedData.startingCapital ?? 0}
                min={0}
                step={100}
                onBlur={(e) => { handleCapitalChange(e.target.value); setEditingCapital(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                autoFocus
              />
            ) : (
              <strong
                className="capital-value"
                onClick={() => setEditingCapital(true)}
                title="Click to edit"
              >
                ${(mergedData.startingCapital ?? 0).toLocaleString()}
              </strong>
            )}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {activeSection === "overview" && (
            <motion.div key="overview" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-section">
              <div className="overview-grid">
                <div className="overview-col-main">
                  <MacroBiasCard data={mergedData} />
                  <CalendarView trades={mergedData.recentTrades || []} />
                </div>
                <div className="overview-col-side">
                  <QuickStats data={mergedData} />
                  <BiasTracker data={mergedData} />
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "journal" && (
            <motion.div key="journal" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-section">
              <TradeFilters filters={filters} onFilterChange={setFilters} tradeCount={filteredTrades.length} totalCount={(mergedData.recentTrades || []).length} />
              <TradeJournal data={{ ...mergedData, recentTrades: filteredTrades }} />
            </motion.div>
          )}

          {activeSection === "analytics" && (
            <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-section">
              <AnalyticsSection data={mergedData} filteredTrades={filteredTrades} />
            </motion.div>
          )}

          {activeSection === "checklist" && (
            <motion.div key="checklist" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-section">
              <Checklist currentPhaseId={currentPhaseId} />
            </motion.div>
          )}

          {activeSection === "settings" && (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-section">
              <div className="settings-page">
                <div className="card settings-card">
                  <div className="card-title">Manage Phases</div>
                  <p className="settings-hint">Add, edit, or delete phases.</p>
                  <button className="settings-add-btn" onClick={handleAddPhase}>+ Add Phase</button>
                  <div className="settings-list" style={{ marginTop: 16 }}>
                    {Object.entries(allPhases).map(([id, phase]) => {
                      const isBuiltIn = !!PHASES[id];
                      const isEditing = editingPhaseId === id;
                      const override = overrides[id] || {};
                      const cap = override.startingCapital ?? phase.startingCapital ?? 0;
                      const name = override.account ?? phase.account ?? id;
                      return (
                        <div key={id} className={`phase-manage-row ${isEditing ? "pm-editing" : ""}`}>
                          {isEditing ? (
                            <>
                              <div className="pm-edit-fields">
                                <label className="pm-edit-group">
                                  <span className="pm-edit-label">ID</span>
                                  <input className="pm-edit-input" value={editForm.id}
                                    disabled={isBuiltIn}
                                    onChange={(e) => setEditForm((p) => ({ ...p, id: e.target.value }))}
                                  />
                                </label>
                                <label className="pm-edit-group">
                                  <span className="pm-edit-label">Name</span>
                                  <input className="pm-edit-input" value={editForm.name}
                                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                  />
                                </label>
                                <label className="pm-edit-group">
                                  <span className="pm-edit-label">Capital</span>
                                  <input className="pm-edit-input" type="number" value={editForm.capital} min={0} step={100}
                                    onChange={(e) => setEditForm((p) => ({ ...p, capital: e.target.value }))}
                                  />
                                </label>
                              </div>
                              <button className="pm-save-btn" onClick={handleSavePhase}>Save</button>
                              <button className="pm-cancel-btn" onClick={() => setEditingPhaseId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <span className="pm-id">#{id}</span>
                              <span className="pm-name">{name}</span>
                              <span className="pm-capital">${cap.toLocaleString()}</span>
                              <span className="pm-badge">{isBuiltIn ? "built-in" : "custom"}</span>
                              <button className="pm-edit-btn" onClick={() => handleStartEdit(id, name, cap)}>Edit</button>
                              <button className="pm-delete-btn" onClick={() => handleDeletePhase(id)}>Delete</button>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {Object.keys(allPhases).length === 0 && (
                      <div className="empty">No phases available.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
