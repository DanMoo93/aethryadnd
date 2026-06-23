import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { characterOptionLabel, describeCharacter, findCharacterById, findTokenForCharacter } from '../lib/characterLinks';

const COMMON_CONDITIONS = ['blinded', 'charmed', 'frightened', 'grappled', 'paralyzed', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'];

export default function CombatTracker({ sceneId, isGm, socket, characters = [], sceneTokens = [] }) {
  const [encounters, setEncounters] = useState([]);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showNewEncounter, setShowNewEncounter] = useState(false);
  const [newEncounterName, setNewEncounterName] = useState('');

  const [showAddCombatant, setShowAddCombatant] = useState(false);
  const [combatantName, setCombatantName] = useState('');
  const [combatantInit, setCombatantInit] = useState('');
  const [combatantHp, setCombatantHp] = useState('');
  const [combatantAc, setCombatantAc] = useState('');
  const [combatantCharacterId, setCombatantCharacterId] = useState('');

  useEffect(() => {
    loadEncounters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => {
    if (!combatantCharacterId) {
      setCombatantName('');
      setCombatantHp('');
      setCombatantAc('');
      return;
    }
    const character = findCharacterById(characters, combatantCharacterId);
    if (!character) return;
    const linkedToken = findTokenForCharacter(sceneTokens, character.id);
    const hp = character.sheet?.hp || {};
    setCombatantName(character.name || '');
    setCombatantHp(String(hp.current ?? ''));
    setCombatantAc(String(character.sheet?.armorClass ?? ''));
  }, [combatantCharacterId, characters, sceneTokens]);

  useEffect(() => {
    if (!activeEncounter || !socket) return;
    socket.emit('encounter:join', { encounterId: activeEncounter.id });
    function handleUpdate({ encounter }) {
      if (encounter.id === activeEncounter.id) setActiveEncounter(encounter);
      setEncounters((prev) => prev.map((e) => (e.id === encounter.id ? encounter : e)));
    }
    socket.on('encounter:updated', handleUpdate);
    return () => {
      socket.off('encounter:updated', handleUpdate);
      socket.emit('encounter:leave', { encounterId: activeEncounter.id });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEncounter?.id, socket]);

  async function loadEncounters() {
    setLoading(true);
    try {
      const { encounters } = await api.listEncounters(sceneId);
      setEncounters(encounters);
      // Prefer the active encounter if one exists, otherwise the most recent
      const active = encounters.find((e) => e.isActive) || encounters[encounters.length - 1] || null;
      setActiveEncounter(active);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEncounter(e) {
    e.preventDefault();
    try {
      const { encounter } = await api.createEncounter({ sceneId, name: newEncounterName });
      setEncounters((prev) => [...prev, encounter]);
      setActiveEncounter(encounter);
      setShowNewEncounter(false);
      setNewEncounterName('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCombatant(e) {
    e.preventDefault();
    try {
      const linkedCharacter = findCharacterById(characters, combatantCharacterId);
      const linkedToken = linkedCharacter ? findTokenForCharacter(sceneTokens, linkedCharacter.id) : null;
      const hpCurrent = parseInt(combatantHp, 10) || linkedCharacter?.sheet?.hp?.current || 10;
      const hpMax = linkedCharacter?.sheet?.hp?.max || hpCurrent;
      const acNum = parseInt(combatantAc, 10) || linkedCharacter?.sheet?.armorClass || 10;
      await api.addCombatant(activeEncounter.id, {
        name: combatantName || linkedCharacter?.name,
        tokenId: linkedToken?.id || null,
        characterId: linkedCharacter?.id || null,
        initiative: parseInt(combatantInit, 10) || 0,
        hp: { current: hpCurrent, max: hpMax },
        ac: acNum,
      });
      const { encounter } = await api.getEncounter(activeEncounter.id);
      setActiveEncounter(encounter);
      setShowAddCombatant(false);
      setCombatantName('');
      setCombatantInit('');
      setCombatantHp('');
      setCombatantAc('');
      setCombatantCharacterId('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveCombatant(combatantId) {
    try {
      await api.removeCombatant(activeEncounter.id, combatantId);
      const { encounter } = await api.getEncounter(activeEncounter.id);
      setActiveEncounter(encounter);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleHpChange(combatant, field, value) {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const hp = { ...combatant.hp, [field]: num };
    try {
      await api.updateCombatant(activeEncounter.id, combatant.id, { hp });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleCondition(combatant, condition) {
    const has = combatant.conditions.includes(condition);
    const conditions = has
      ? combatant.conditions.filter((c) => c !== condition)
      : [...combatant.conditions, condition];
    try {
      await api.updateCombatant(activeEncounter.id, combatant.id, { conditions });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSort() {
    try {
      const { encounter } = await api.sortEncounter(activeEncounter.id);
      setActiveEncounter(encounter);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStartCombat() {
    try {
      await handleSort();
      const { encounter } = await api.updateEncounter(activeEncounter.id, { isActive: true });
      setActiveEncounter(encounter);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleEndCombat() {
    try {
      const { encounter } = await api.updateEncounter(activeEncounter.id, { isActive: false });
      setActiveEncounter(encounter);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNextTurn() {
    try {
      const { encounter } = await api.nextTurn(activeEncounter.id);
      setActiveEncounter(encounter);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="card"><p className="muted" style={{ margin: 0 }}>Loading combat tracker…</p></div>;

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Combat Tracker</h3>
        {isGm && encounters.length > 0 && (
          <select
            value={activeEncounter?.id || ''}
            onChange={(e) => setActiveEncounter(encounters.find((enc) => enc.id === e.target.value))}
            style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.3rem' }}
          >
            {encounters.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}

      {isGm && (
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => setShowNewEncounter(!showNewEncounter)}>
            + New encounter
          </button>
          {showNewEncounter && (
            <form onSubmit={handleCreateEncounter} className="flex-row" style={{ marginTop: '0.5rem' }}>
              <input
                value={newEncounterName}
                onChange={(e) => setNewEncounterName(e.target.value)}
                placeholder="Goblin Ambush"
                required
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.5rem', flex: 1 }}
              />
              <button className="btn btn-primary" type="submit">Create</button>
            </form>
          )}
        </div>
      )}

      {!activeEncounter ? (
        <p className="muted" style={{ margin: 0 }}>
          {isGm ? 'No encounter yet. Create one to start tracking combat.' : 'No combat encounter has been started.'}
        </p>
      ) : (
        <>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div>
              <strong>{activeEncounter.name}</strong>
              <span className="muted" style={{ marginLeft: '0.6rem', fontSize: '0.85rem' }}>
                Round {activeEncounter.round}
              </span>
              {activeEncounter.isActive && <span className="pill pill-gm" style={{ marginLeft: '0.6rem' }}>Active</span>}
            </div>
            {isGm && (
              <div className="flex-row">
                <button className="btn btn-ghost" onClick={handleSort}>Sort by initiative</button>
                {activeEncounter.isActive ? (
                  <>
                    <button className="btn btn-gm" onClick={handleNextTurn}>Next turn →</button>
                    <button className="btn btn-ghost" onClick={handleEndCombat}>End combat</button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={handleStartCombat}>Start combat</button>
                )}
              </div>
            )}
          </div>

          {isGm && (
            <div style={{ marginBottom: '1rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowAddCombatant(!showAddCombatant)}>
                + Add combatant
              </button>
              {showAddCombatant && (
                <form onSubmit={handleAddCombatant} className="flex-row" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  <select
                    value={combatantCharacterId}
                    onChange={(e) => setCombatantCharacterId(e.target.value)}
                    style={{ ...inputStyle, minWidth: 220 }}
                  >
                    <option value="">Manual entry</option>
                    {characters.length > 0 && (
                      <optgroup label="Characters">
                        {characters.map((character) => {
                          const summary = describeCharacter(character);
                          return (
                            <option key={character.id} value={character.id}>
                              {characterOptionLabel(character)}
                              {summary?.hpCurrent != null ? ` · HP ${summary.hpCurrent}/${summary.hpMax}` : ''}
                              {summary?.ac != null ? ` · AC ${summary.ac}` : ''}
                            </option>
                          );
                        })}
                      </optgroup>
                    )}
                  </select>
                  <input value={combatantName} onChange={(e) => setCombatantName(e.target.value)} placeholder="Name" required style={inputStyle} />
                  <input type="number" value={combatantInit} onChange={(e) => setCombatantInit(e.target.value)} placeholder="Init" style={{ ...inputStyle, width: 70 }} />
                  <input type="number" value={combatantHp} onChange={(e) => setCombatantHp(e.target.value)} placeholder="HP" style={{ ...inputStyle, width: 70 }} />
                  <input type="number" value={combatantAc} onChange={(e) => setCombatantAc(e.target.value)} placeholder="AC" style={{ ...inputStyle, width: 70 }} />
                  <button className="btn btn-primary" type="submit">Add</button>
                </form>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activeEncounter.combatants.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>No combatants yet.</p>
            ) : (
              activeEncounter.combatants.map((c, idx) => (
                <CombatantRow
                  key={c.id}
                  combatant={c}
                  isCurrentTurn={activeEncounter.isActive && idx === activeEncounter.currentTurnIndex}
                  isGm={isGm}
                  characters={characters}
                  sceneTokens={sceneTokens}
                  onHpChange={handleHpChange}
                  onToggleCondition={handleToggleCondition}
                  onRemove={handleRemoveCombatant}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  background: 'var(--ink)',
  border: '1px solid var(--line)',
  borderRadius: 4,
  color: 'var(--parchment)',
  padding: '0.5rem',
};

function CombatantRow({ combatant, isCurrentTurn, isGm, characters, sceneTokens, onHpChange, onToggleCondition, onRemove }) {
  const [showConditions, setShowConditions] = useState(false);
  const hpRatio = combatant.hp.max > 0 ? combatant.hp.current / combatant.hp.max : 0;
  const hpColor = hpRatio > 0.5 ? 'var(--forest-bright)' : hpRatio > 0.2 ? 'var(--gold)' : 'var(--oxblood-bright)';
  const linkedCharacter = combatant.characterId ? findCharacterById(characters, combatant.characterId) : combatant.tokenId ? findCharacterById(characters, sceneTokens.find((token) => token.id === combatant.tokenId)?.characterId) : null;
  const linkedToken = combatant.tokenId ? sceneTokens.find((token) => token.id === combatant.tokenId) : linkedCharacter ? findTokenForCharacter(sceneTokens, linkedCharacter.id) : null;

  return (
    <div
      style={{
        padding: '0.6rem 0.8rem',
        borderRadius: 'var(--radius)',
        border: isCurrentTurn ? '1px solid var(--gold)' : '1px solid var(--line)',
        background: isCurrentTurn ? 'rgba(201,168,106,0.08)' : 'transparent',
      }}
    >
      <div className="flex-between">
        <div className="flex-row">
          {isCurrentTurn && <span style={{ color: 'var(--gold-bright)' }}>▶</span>}
          <strong>{combatant.name}</strong>
          <span className="muted" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            Init {combatant.initiative} · AC {combatant.ac}
          </span>
        </div>
        {isGm && (
          <button
            onClick={() => onRemove(combatant.id)}
            style={{ background: 'none', border: 'none', color: 'var(--oxblood-bright)', cursor: 'pointer' }}
            aria-label={`Remove ${combatant.name}`}
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-row" style={{ marginTop: '0.4rem' }}>
        <span style={{ fontSize: '0.85rem', color: hpColor, fontFamily: 'var(--font-mono)' }}>
          {isGm ? (
            <span className="flex-row" style={{ gap: '0.3rem' }}>
              <input
                type="number"
                defaultValue={combatant.hp.current}
                onBlur={(e) => onHpChange(combatant, 'current', e.target.value)}
                style={{ width: 50, background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: hpColor, padding: '0.2rem', textAlign: 'center' }}
              />
              / {combatant.hp.max}
            </span>
          ) : (
            `${combatant.hp.current} / ${combatant.hp.max} HP`
          )}
        </span>
        {isGm && (
          <button className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setShowConditions(!showConditions)}>
            Conditions
          </button>
        )}
        {combatant.conditions.length > 0 && (
          <span className="flex-row" style={{ flexWrap: 'wrap', gap: '0.3rem' }}>
            {combatant.conditions.map((cond) => (
              <span key={cond} className="pill pill-player" style={{ fontSize: '0.65rem' }}>{cond}</span>
            ))}
          </span>
        )}
      </div>

      {(linkedCharacter || linkedToken) && (
        <div className="muted" style={{ marginTop: '0.35rem', fontSize: '0.78rem' }}>
          Linked to {linkedCharacter ? linkedCharacter.name : linkedToken?.name}
          {linkedCharacter?.sheet?.class && ` · ${linkedCharacter.sheet.class} ${linkedCharacter.sheet.level || 1}`}
          {linkedCharacter?.sheet?.hp && ` · HP ${linkedCharacter.sheet.hp.current}/${linkedCharacter.sheet.hp.max}`}
          {linkedCharacter?.sheet?.armorClass != null && ` · AC ${linkedCharacter.sheet.armorClass}`}
        </div>
      )}

      {showConditions && isGm && (
        <div className="flex-row" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {COMMON_CONDITIONS.map((cond) => (
            <button
              key={cond}
              onClick={() => onToggleCondition(combatant, cond)}
              className={`btn ${combatant.conditions.includes(cond) ? 'btn-gm' : 'btn-ghost'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              {cond}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
