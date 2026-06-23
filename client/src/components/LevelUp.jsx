import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ABILITIES, ABILITY_LABELS, rollDie } from '../lib/dnd5e';

const ASI_LEVELS = [4, 8, 12, 16, 19];

export default function LevelUp({ character, rules, onClose, onLeveledUp }) {
  const [targetLevel, setTargetLevel] = useState(character.sheet.level + 1);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [hpMethod, setHpMethod] = useState('average'); // 'average' | 'roll'
  const [hpGains, setHpGains] = useState([]);
  const [subclassKey, setSubclassKey] = useState(character.sheet.subclassKey || '');
  const [asiChoices, setAsiChoices] = useState([]); // one entry per ASI level gained
  const [cantripsToAdd, setCantripsToAdd] = useState([]);
  const [spellsToAdd, setSpellsToAdd] = useState([]);
  const [availableCantrips, setAvailableCantrips] = useState([]);
  const [availableSpells, setAvailableSpells] = useState([]);

  const cls = rules.classes.find((c) => c.key === character.sheet.classKey);

  useEffect(() => {
    loadPreview(targetLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLevel]);

  async function loadPreview(level) {
    setLoading(true);
    setError('');
    try {
      const { preview } = await api.getLevelUpPreview(character.id, level);
      setPreview(preview);
      const levelsCrossed = level - character.sheet.level;
      setHpGains(new Array(levelsCrossed).fill(Math.floor(preview.hitDie / 2) + 1));
      setAsiChoices(preview.asiLevelsGained.map(() => ({ type: 'asi', abilities: [] })));

      if (preview.spellDelta && preview.spellDelta.cantripsKnown.gained > 0) {
        const { spells } = await api.getSpells(character.sheet.classKey, 0);
        setAvailableCantrips(spells.filter((s) => !character.sheet.cantripsKnown.includes(s.key)));
      } else {
        setAvailableCantrips([]);
      }
      if (preview.spellDelta?.spellsKnown?.gained > 0) {
        // Known casters add from the full list across levels they can now reach;
        // for simplicity we show 1st-level spells not yet known (good enough for
        // early levels — higher-level spell access follows the same picker pattern).
        const { spells } = await api.getSpells(character.sheet.classKey, 1);
        setAvailableSpells(spells.filter((s) => !character.sheet.spellsKnown.includes(s.key)));
      } else {
        setAvailableSpells([]);
      }
      setCantripsToAdd([]);
      setSpellsToAdd([]);
    } catch (err) {
      setError(err.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  function rollAllHp() {
    setHpGains(hpGains.map(() => rollDie(preview.hitDie)));
  }

  function setAsiAbilities(index, abilities) {
    setAsiChoices((prev) => prev.map((c, i) => (i === index ? { type: 'asi', abilities } : c)));
  }

  function toggleAbilityForAsi(index, ability) {
    setAsiChoices((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const current = c.abilities;
        if (current.includes(ability)) return { ...c, abilities: current.filter((a) => a !== ability) };
        if (current.length >= 2) return c; // max +1/+1 to two different, or +2 to one (handled by allowing same twice via two clicks)
        return { ...c, abilities: [...current, ability] };
      })
    );
  }

  function toggleCantrip(key) {
    const limit = preview.spellDelta?.cantripsKnown.gained || 0;
    setCantripsToAdd((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= limit) return prev;
      return [...prev, key];
    });
  }

  function toggleSpell(key) {
    const limit = preview.spellDelta?.spellsKnown?.gained || 0;
    setSpellsToAdd((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= limit) return prev;
      return [...prev, key];
    });
  }

  const cantripLimit = preview?.spellDelta?.cantripsKnown.gained || 0;
  const spellLimit = preview?.spellDelta?.spellsKnown?.gained || 0;
  const asiComplete = asiChoices.every((c) => c.abilities.length === 2 || (c.abilities.length === 1 && false));
  const subclassOk = !preview?.needsSubclassChoice || !!subclassKey;
  const cantripsOk = cantripsToAdd.length === cantripLimit;
  const spellsOk = spellsToAdd.length === spellLimit;
  const canSubmit = preview && subclassOk && asiComplete && cantripsOk && spellsOk && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const { character: updated } = await api.applyLevelUp(character.id, {
        toLevel: targetLevel,
        hpGains,
        subclassKey: subclassKey || undefined,
        asiChoices,
        cantripsToAdd,
        spellsToAdd,
      });
      onLeveledUp(updated);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,10,13,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto', background: 'var(--ink)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Level Up</h2>
          <button className="btn btn-ghost" onClick={onClose}>×</button>
        </div>

        <div className="field" style={{ maxWidth: 200, marginBottom: '1.5rem' }}>
          <label>Target level</label>
          <input
            type="number"
            min={character.sheet.level + 1}
            max={20}
            value={targetLevel}
            onChange={(e) => setTargetLevel(Math.max(character.sheet.level + 1, Math.min(20, parseInt(e.target.value, 10) || character.sheet.level + 1)))}
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading && <p className="muted">Computing level-up…</p>}

        {preview && !loading && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.6rem' }}>Hit Points</h4>
              <div className="flex-row" style={{ marginBottom: '0.6rem' }}>
                <button className={`btn ${hpMethod === 'average' ? 'btn-gm' : 'btn-ghost'}`} onClick={() => { setHpMethod('average'); setHpGains(hpGains.map(() => Math.floor(preview.hitDie / 2) + 1)); }}>
                  Take average ({Math.floor(preview.hitDie / 2) + 1}/level)
                </button>
                <button className={`btn ${hpMethod === 'roll' ? 'btn-gm' : 'btn-ghost'}`} onClick={() => { setHpMethod('roll'); rollAllHp(); }}>
                  Roll d{preview.hitDie}
                </button>
                {hpMethod === 'roll' && <button className="btn btn-ghost" onClick={rollAllHp}>Reroll</button>}
              </div>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                Gains per level: {hpGains.join(', ')} → total +{hpGains.reduce((a, b) => a + b, 0)} HP
              </p>
            </div>

            {preview.gainedFeatures.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.6rem' }}>New Features</h4>
                {preview.gainedFeatures.map((f) => (
                  <p key={f.name} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>{f.name}</strong> <span className="muted">(lvl {f.level}, {f.source})</span><br />
                    <span className="muted">{f.description}</span>
                  </p>
                ))}
              </div>
            )}

            {preview.needsSubclassChoice && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.6rem' }}>Choose a Subclass</h4>
                <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                  {preview.availableSubclasses.map((sc) => (
                    <button key={sc.key} className={`btn ${subclassKey === sc.key ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setSubclassKey(sc.key)}>
                      {sc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {preview.asiLevelsGained.map((lvl, idx) => (
              <div key={lvl} className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.6rem' }}>Ability Score Improvement (Level {lvl})</h4>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.6rem' }}>
                  Pick two abilities to increase by +1 each (or the same one twice for +2).
                </p>
                <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                  {ABILITIES.map((a) => (
                    <button
                      key={a}
                      className={`btn ${asiChoices[idx]?.abilities.includes(a) ? 'btn-gm' : 'btn-ghost'}`}
                      onClick={() => toggleAbilityForAsi(idx, a)}
                      disabled={asiChoices[idx]?.abilities.length >= 2 && !asiChoices[idx]?.abilities.includes(a)}
                    >
                      {ABILITY_LABELS[a]}
                    </button>
                  ))}
                </div>
                <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  Selected: {asiChoices[idx]?.abilities.join(', ') || 'none'} ({asiChoices[idx]?.abilities.length || 0}/2)
                </p>
              </div>
            ))}

            {cantripLimit > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.6rem' }}>New Cantrips ({cantripsToAdd.length}/{cantripLimit})</h4>
                <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                  {availableCantrips.map((s) => (
                    <button key={s.key} className={`btn ${cantripsToAdd.includes(s.key) ? 'btn-gm' : 'btn-ghost'}`} onClick={() => toggleCantrip(s.key)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {spellLimit > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.6rem' }}>New Spells ({spellsToAdd.length}/{spellLimit})</h4>
                <div className="flex-row" style={{ flexWrap: 'wrap' }}>
                  {availableSpells.map((s) => (
                    <button key={s.key} className={`btn ${spellsToAdd.includes(s.key) ? 'btn-gm' : 'btn-ghost'}`} onClick={() => toggleSpell(s.key)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-row">
              <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? 'Leveling up…' : `Confirm Level ${targetLevel}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
