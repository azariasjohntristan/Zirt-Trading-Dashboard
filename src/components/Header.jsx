import useClock from "../hooks/useClock";
import { PHASES, emptyPhase } from "../data/phases";
import { SELECTED_KEY, THEME_KEY } from "../data/constants";

export default function Header({
  currentPhaseId,
  onPhaseChange,
  theme,
  onToggleTheme,
}) {
  const { pht, et, countdown } = useClock();
  const phaseIds = Object.keys(PHASES).sort();

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "__new__") {
      const newId = prompt("Enter new Phase ID (numbers only):");
      if (!newId || !newId.trim()) return;
      const id = newId.trim();
      if (PHASES[id]) {
        alert('Phase ID "' + id + '" already exists.');
        return;
      }
      const accountName = prompt(
        "Enter account name (e.g. 'FundedNext $5K', 'FTMO $10K'):"
      );
      if (!accountName || !accountName.trim()) return;
      PHASES[id] = emptyPhase(id);
      PHASES[id].account = accountName.trim();
      PHASES[id].lessons = [...PHASES[currentPhaseId].lessons];
      onPhaseChange(id);
    } else {
      onPhaseChange(val);
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="logo">TrizT_mmxm</div>
        <div className="phase-selector-wrap">
          <label>Phase</label>
          <select
            className="phase-select"
            id="phase-select"
            value={currentPhaseId}
            onChange={handleChange}
          >
            {phaseIds.map((id) => {
              const p = PHASES[id];
              const label = "#" + id + " — Phase " + (p.phase || 0);
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
            <option disabled>──────────</option>
            <option value="__new__">+ New Phase</option>
          </select>
        </div>
      </div>
      <div className="header-right">
        <div className="clocks">
          <span className="clock">
            <span className="clock-dot pht"></span> PHT{" "}
            <strong id="pht-clock">{pht}</strong>
          </span>
          <span className="clock">
            <span className="clock-dot et"></span> ET{" "}
            <strong id="et-clock">{et}</strong>
          </span>
        </div>
        <span className="countdown">
          <span id="countdown-val">{countdown}</span> → 10:00 ET
        </span>
        <button
          className="theme-toggle"
          id="theme-toggle"
          title="Toggle theme"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </div>
  );
}