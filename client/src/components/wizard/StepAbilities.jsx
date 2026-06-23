import { useState } from 'react';
import { ABILITIES, ABILITY_LABELS, abilityModifier, formatModifier, rollAbilityScoreSet } from '../../lib/dnd5e';

const METHOD_LABELS = {
  'standard-array': 'Standard Array',
  'point-buy': 'Point Buy',
  roll: 'Roll for Stats',
};

export default function StepAbilities({ rules, draft, updateDraft, onNext, onBack }) {
  const [method, setMethod] = useState(draft.abilityScoreMethod || 'standard-array');
  const [assignments, setAssignments] = useState(
    draft.baseAbilities && Object.values(draft.baseAbilities).some((v) => v !== 8) ? draft.baseAbilities : null
  );
  const [arrayPool, setArrayPool] = useState([...rules.abilityScoreMethods.standardArray]);
  const [pointBuyScores, setPointBuyScores] = useState({
    strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8,
  });
  const [rolledSet, setRolledSet] = useState(null);
  const [rollAssignments, setRollAssignments] = useState({});

  const race = rules.races.find((r) => r.key === draft.raceKey);
  const subrace = race?.subraces?.find((s) => s.key === draft.subraceKey);

  function racialBonus(ability) {
    let bonus = race?.abilityBonuses?.[ability] || 0;
    if (subrace?.abilityBonuses?.[ability]) bonus += subrace.abilityBonuses[ability];
    return bonus;
  }

  // --- Standard array assignment ---
  const [arrayAssignments, setArrayAssignments] = useState({});

  function assignArrayValue(ability, value) {
    setArrayAssignments((prev) => {
      const next = { ...prev };
      // If this value was already assigned elsewhere, free it first
      for (const key of Object.keys(next)) {
        if (next[key] === value && key !== ability) delete next[key];
      }
      if (value === null) delete next[ability];
      else next[ability] = value;
      return next;
    });
  }

  const usedArrayValues = Object.values(arrayAssignments);
  const availableArrayValues = rules.abilityScoreMethods.standardArray.filter(
    (v, i) => usedArrayValues.filter((u) => u === v).length <= rules.abilityScoreMethods.standardArray.filter((x) => x === v).length - 1 || true
  );

  // --- Point buy ---
  const POINT_COSTS = rules.abilityScoreMethods.pointBuy.costs;
  const TOTAL_POINTS = rules.abilityScoreMethods.pointBuy.totalPoints;
  const pointsSpent = ABILITIES.reduce((sum, a) => sum + (POINT_COSTS[pointBuyScores[a]] ?? 0), 0);
  const pointsRemaining = TOTAL_POINTS - pointsSpent;

  function adjustPointBuy(ability, delta) {
    setPointBuyScores((prev) => {
      const current = prev[ability];
      const next = current + delta;
      if (next < 8 || next > 15) return prev;
      const newCost = POINT_COSTS[next];
      const oldCost = POINT_COSTS[current];
      if (pointsSpent - oldCost + newCost > TOTAL_POINTS) return prev;
      return { ...prev, [ability]: next };
    });
  }

  // --- Dice rolling ---
  function handleRoll() {
    const set = rollAbilityScoreSet();
    setRolledSet(Object.values(set).sort((a, b) => b - a));
    setRollAssignments({});
  }

  function assignRolledValue(ability, value) {
    setRollAssignments((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === value && key !== ability) delete next[key];
      }
      if (value === null) delete next[ability];
      else next[ability] = value;
      return next;
    });
  }

  function getFinalScores() {
    if (method === 'standard-array') return arrayAssignments;
    if (method === 'point-buy') return pointBuyScores;
    if (method === 'roll') return rollAssignments;
    return {};
  }

  const finalScores = getFinalScores();
  const isComplete = ABILITIES.every((a) => finalScores[a] !== undefined);

  function handleContinue() {
    if (!isComplete) return;
    updateDraft({ abilityScoreMethod: method, baseAbilities: finalScores });
    onNext();
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Assign Ability Scores</h3>

      <div className="flex-row" style={{ marginBottom: '1.5rem' }}>
        {Object.keys(METHOD_LABELS).map((m) => (
          <button key={m} className={`btn ${method === m ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setMethod(m)}>
            {METHOD_LABELS[m]}
          </button>
        ))}
      </div>

      {method === 'standard-array' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Assign each value ({rules.abilityScoreMethods.standardArray.join(', ')}) to one ability score.
          </p>
          {ABILITIES.map((ability) => (
            <AbilityRow
              key={ability}
              ability={ability}
              racialBonus={racialBonus(ability)}
              value={arrayAssignments[ability]}
            >
              <select
                value={arrayAssignments[ability] ?? ''}
                onChange={(e) => assignArrayValue(ability, e.target.value ? parseInt(e.target.value, 10) : null)}
                style={selectStyle}
              >
                <option value="">—</option>
                {rules.abilityScoreMethods.standardArray.map((v) => (
                  <option
                    key={v}
                    value={v}
                    disabled={usedArrayValues.includes(v) && arrayAssignments[ability] !== v}
                  >
                    {v}
                  </option>
                ))}
              </select>
            </AbilityRow>
          ))}
        </div>
      )}

      {method === 'point-buy' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Points remaining: <strong style={{ color: pointsRemaining < 0 ? 'var(--oxblood-bright)' : 'var(--gold-bright)' }}>{pointsRemaining}</strong> / {TOTAL_POINTS}
          </p>
          {ABILITIES.map((ability) => (
            <AbilityRow key={ability} ability={ability} racialBonus={racialBonus(ability)} value={pointBuyScores[ability]}>
              <div className="flex-row">
                <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem' }} onClick={() => adjustPointBuy(ability, -1)}>−</button>
                <span style={{ width: 30, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{pointBuyScores[ability]}</span>
                <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem' }} onClick={() => adjustPointBuy(ability, 1)}>+</button>
              </div>
            </AbilityRow>
          ))}
        </div>
      )}

      {method === 'roll' && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleRoll} style={{ marginBottom: '1rem' }}>
            🎲 Roll 4d6 (drop lowest) × 6
          </button>
          {rolledSet && (
            <>
              <p className="muted" style={{ marginBottom: '1rem' }}>
                Rolled: <span style={{ fontFamily: 'var(--font-mono)' }}>{rolledSet.join(', ')}</span> — assign each to an ability.
              </p>
              {ABILITIES.map((ability) => (
                <AbilityRow key={ability} ability={ability} racialBonus={racialBonus(ability)} value={rollAssignments[ability]}>
                  <select
                    value={rollAssignments[ability] ?? ''}
                    onChange={(e) => assignRolledValue(ability, e.target.value ? parseInt(e.target.value, 10) : null)}
                    style={selectStyle}
                  >
                    <option value="">—</option>
                    {rolledSet.map((v, i) => (
                      <option key={i} value={v} disabled={Object.values(rollAssignments).includes(v) && rollAssignments[ability] !== v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </AbilityRow>
              ))}
            </>
          )}
        </div>
      )}

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleContinue} disabled={!isComplete}>
          Continue
        </button>
      </div>
    </div>
  );
}

const selectStyle = {
  background: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 4,
  color: 'var(--parchment)',
  padding: '0.4rem',
  width: 70,
};

function AbilityRow({ ability, racialBonus, value, children }) {
  const total = (value ?? 0) + racialBonus;
  const mod = abilityModifier(total);
  return (
    <div className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px dashed var(--line)' }}>
      <span>{ABILITY_LABELS[ability]}</span>
      <div className="flex-row">
        {children}
        {racialBonus > 0 && <span className="muted" style={{ fontSize: '0.8rem' }}>+{racialBonus} racial</span>}
        {value !== undefined && (
          <span className="muted" style={{ fontFamily: 'var(--font-mono)' }}>
            = {total} ({formatModifier(mod)})
          </span>
        )}
      </div>
    </div>
  );
}
