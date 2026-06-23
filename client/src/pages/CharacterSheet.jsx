import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import LevelUp from '../components/LevelUp';

const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

const SKILLS = [
  { key: 'acrobatics', name: 'Acrobatics', ability: 'dexterity' },
  { key: 'animalHandling', name: 'Animal Handling', ability: 'wisdom' },
  { key: 'arcana', name: 'Arcana', ability: 'intelligence' },
  { key: 'athletics', name: 'Athletics', ability: 'strength' },
  { key: 'deception', name: 'Deception', ability: 'charisma' },
  { key: 'history', name: 'History', ability: 'intelligence' },
  { key: 'insight', name: 'Insight', ability: 'wisdom' },
  { key: 'intimidation', name: 'Intimidation', ability: 'charisma' },
  { key: 'investigation', name: 'Investigation', ability: 'intelligence' },
  { key: 'medicine', name: 'Medicine', ability: 'wisdom' },
  { key: 'nature', name: 'Nature', ability: 'intelligence' },
  { key: 'perception', name: 'Perception', ability: 'wisdom' },
  { key: 'performance', name: 'Performance', ability: 'charisma' },
  { key: 'persuasion', name: 'Persuasion', ability: 'charisma' },
  { key: 'religion', name: 'Religion', ability: 'intelligence' },
  { key: 'sleightOfHand', name: 'Sleight of Hand', ability: 'dexterity' },
  { key: 'stealth', name: 'Stealth', ability: 'dexterity' },
  { key: 'survival', name: 'Survival', ability: 'wisdom' },
];

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export default function CharacterSheet() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cantripDetails, setCantripDetails] = useState([]);
  const [spellDetails, setSpellDetails] = useState([]);
  const [rules, setRules] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    api.getRulesBundle().then(setRules).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  useEffect(() => {
    if (!character) return;
    const sheet = character.sheet;
    const allKeys = [...(sheet.cantripsKnown || []), ...(sheet.spellsKnown || [])];
    if (allKeys.length === 0) {
      setCantripDetails([]);
      setSpellDetails([]);
      return;
    }
    api.getSpellsByKeys(allKeys).then(({ spells }) => {
      setCantripDetails(spells.filter((s) => s.level === 0));
      setSpellDetails(spells.filter((s) => s.level > 0));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.sheet.cantripsKnown, character?.sheet.spellsKnown]);

  async function load() {
    setLoading(true);
    try {
      const { character } = await api.getCharacter(characterId);
      setCharacter(character);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function persist(patch) {
    setSaving(true);
    try {
      const { character: updated } = await api.updateCharacter(characterId, patch);
      setCharacter(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function updateLocal(patch) {
    setCharacter((prev) => ({ ...prev, sheet: { ...prev.sheet, ...patch } }));
  }

  function handleAbilityBlur(ability, value) {
    const score = Math.max(1, Math.min(30, parseInt(value, 10) || 10));
    persist({ abilities: { ...character.sheet.abilities, [ability]: score } });
  }

  function handleHpChange(field, value) {
    const num = Math.max(0, parseInt(value, 10) || 0);
    const hp = { ...character.sheet.hp, [field]: num };
    updateLocal({ hp });
  }

  function handleHpBlur() {
    persist({ hp: character.sheet.hp });
  }

  function toggleSkillProficiency(skillKey) {
    const current = character.sheet.proficientSkills || [];
    const next = current.includes(skillKey) ? current.filter((s) => s !== skillKey) : [...current, skillKey];
    persist({ proficientSkills: next });
  }

  if (loading) return <div className="page">Loading character…</div>;
  if (error && !character) return <div className="page"><p className="error-text">{error}</p></div>;

  const { sheet } = character;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>{character.name}</h1>
          <p className="muted">
            {sheet.race || 'Unknown race'} {sheet.class || 'Unknown class'}
            {sheet.subclass ? ` (${sheet.subclass})` : ''} · Level {sheet.level}
            {sheet.background ? ` · ${sheet.background}` : ''}
          </p>
        </div>
        <div className="flex-row">
          {saving && <span className="muted">Saving…</span>}
          {rules && sheet.level < 20 && (
            <button className="btn btn-gm" onClick={() => setShowLevelUp(true)}>
              Level Up
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {/* Abilities */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Ability Scores</h3>
          {ABILITIES.map((ability) => (
            <div key={ability} className="flex-between" style={{ padding: '0.4rem 0' }}>
              <span style={{ textTransform: 'capitalize' }}>{ability}</span>
              <div className="flex-row">
                <input
                  type="number"
                  defaultValue={sheet.abilities[ability]}
                  onBlur={(e) => handleAbilityBlur(ability, e.target.value)}
                  style={{
                    width: 56,
                    background: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 4,
                    color: 'var(--parchment)',
                    padding: '0.3rem',
                    textAlign: 'center',
                  }}
                />
                <span className="muted" style={{ fontFamily: 'var(--font-mono)', width: 32 }}>
                  {formatModifier(abilityModifier(sheet.abilities[ability]))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Combat stats */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Combat</h3>
          <div className="field">
            <label>Hit Points</label>
            <div className="flex-row">
              <input
                type="number"
                value={sheet.hp.current}
                onChange={(e) => handleHpChange('current', e.target.value)}
                onBlur={handleHpBlur}
                style={{ width: 60 }}
              />
              <span>/</span>
              <input
                type="number"
                value={sheet.hp.max}
                onChange={(e) => handleHpChange('max', e.target.value)}
                onBlur={handleHpBlur}
                style={{ width: 60 }}
              />
              <span className="muted" style={{ fontSize: '0.85rem' }}>current / max</span>
            </div>
          </div>
          <div className="field">
            <label>Temporary HP</label>
            <input
              type="number"
              value={sheet.hp.temp}
              onChange={(e) => handleHpChange('temp', e.target.value)}
              onBlur={handleHpBlur}
              style={{ width: 80 }}
            />
          </div>
          <div className="field">
            <label>Armor Class</label>
            <input
              type="number"
              defaultValue={sheet.armorClass}
              onBlur={(e) => persist({ armorClass: parseInt(e.target.value, 10) || 10 })}
              style={{ width: 80 }}
            />
          </div>
          <div className="field">
            <label>Speed (ft)</label>
            <input
              type="number"
              defaultValue={sheet.speed}
              onBlur={(e) => persist({ speed: parseInt(e.target.value, 10) || 30 })}
              style={{ width: 80 }}
            />
          </div>
        </div>

        {/* Identity */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Identity</h3>
          <div className="field">
            <label>Class</label>
            <input defaultValue={sheet.class} onBlur={(e) => persist({ class: e.target.value })} />
          </div>
          <div className="field">
            <label>Race</label>
            <input defaultValue={sheet.race} onBlur={(e) => persist({ race: e.target.value })} />
          </div>
          <div className="field">
            <label>Level</label>
            <input
              type="number"
              min={1}
              max={20}
              defaultValue={sheet.level}
              onBlur={(e) => persist({ level: parseInt(e.target.value, 10) || 1 })}
              style={{ width: 70 }}
            />
          </div>
          <div className="field">
            <label>Background</label>
            <input defaultValue={sheet.background} onBlur={(e) => persist({ background: e.target.value })} />
          </div>
          <div className="field">
            <label>Alignment</label>
            <input defaultValue={sheet.alignment} onBlur={(e) => persist({ alignment: e.target.value })} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Saving throws */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Saving Throws</h3>
          {ABILITIES.map((ability) => {
            const isProficient = (sheet.savingThrowProficiencies || []).includes(ability);
            const bonus = abilityModifier(sheet.abilities[ability]) + (isProficient ? sheet.proficiencyBonus : 0);
            return (
              <div key={ability} className="flex-between" style={{ padding: '0.3rem 0' }}>
                <span style={{ textTransform: 'capitalize' }}>
                  {isProficient && <span style={{ color: 'var(--gold-bright)' }}>● </span>}
                  {ability}
                </span>
                <span className="muted" style={{ fontFamily: 'var(--font-mono)' }}>{formatModifier(bonus)}</span>
              </div>
            );
          })}
        </div>

        {/* Skills */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Skills</h3>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: '0.6rem' }}>
            Click a skill to toggle proficiency (dot = proficient).
          </p>
          {SKILLS.map((skill) => {
            const isProficient = (sheet.proficientSkills || []).includes(skill.key);
            const bonus = abilityModifier(sheet.abilities[skill.ability]) + (isProficient ? sheet.proficiencyBonus : 0);
            return (
              <button
                key={skill.key}
                onClick={() => toggleSkillProficiency(skill.key)}
                className="flex-between"
                style={{
                  width: '100%',
                  padding: '0.3rem 0',
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>
                  {isProficient && <span style={{ color: 'var(--gold-bright)' }}>● </span>}
                  {skill.name} <span className="muted" style={{ fontSize: '0.75rem' }}>({skill.ability.slice(0, 3).toUpperCase()})</span>
                </span>
                <span className="muted" style={{ fontFamily: 'var(--font-mono)' }}>{formatModifier(bonus)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Equipment</h3>
        <div className="flex-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          {sheet.weapons && sheet.weapons.length > 0 ? (
            sheet.weapons.map((w) => <span key={w.key} className="pill pill-player">{w.name}</span>)
          ) : (
            <span className="muted" style={{ fontSize: '0.9rem' }}>No weapons equipped.</span>
          )}
          {sheet.armorWorn && <span className="pill pill-gm">{sheet.armorWorn.name}</span>}
          {sheet.shield && <span className="pill pill-gm">Shield</span>}
        </div>
      </div>

      {/* Spells */}
      {sheet.spellcasting && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.3rem' }}>Spellcasting</h3>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Casting ability: {sheet.spellcasting.ability} · {sheet.spellcasting.knownOrPrepared === 'prepared' ? 'Prepared caster' : 'Known caster'}
          </p>

          {cantripDetails.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>Cantrips</h4>
              <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
                {cantripDetails.map((s) => <SpellSummary key={s.key} spell={s} />)}
              </div>
            </>
          )}

          {spellDetails.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                {sheet.spellcasting.knownOrPrepared === 'prepared' ? 'Prepared Spells' : 'Known Spells'}
              </h4>
              <div className="grid-cards">
                {spellDetails.map((s) => <SpellSummary key={s.key} spell={s} />)}
              </div>
            </>
          )}

          {cantripDetails.length === 0 && spellDetails.length === 0 && (
            <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>No spells recorded yet.</p>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Notes</h3>
        <textarea
          defaultValue={sheet.notes}
          onBlur={(e) => persist({ notes: e.target.value })}
          rows={5}
          style={{
            width: '100%',
            background: 'var(--ink)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            color: 'var(--parchment)',
            padding: '0.7rem',
          }}
        />
      </div>

      {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}

      {showLevelUp && rules && (
        <LevelUp
          character={character}
          rules={rules}
          onClose={() => setShowLevelUp(false)}
          onLeveledUp={(updated) => {
            setCharacter(updated);
            setShowLevelUp(false);
          }}
        />
      )}
    </div>
  );
}

function SpellSummary({ spell }) {
  return (
    <div className="card" style={{ padding: '0.8rem' }}>
      <div className="flex-between" style={{ marginBottom: '0.3rem' }}>
        <strong style={{ fontSize: '0.95rem' }}>{spell.name}</strong>
        <span className="muted" style={{ fontSize: '0.75rem' }}>{spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}</span>
      </div>
      <p className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.4rem' }}>
        {spell.school} · {spell.castingTime} · {spell.range}
        {spell.concentration ? ' · Concentration' : ''}
      </p>
      <p style={{ fontSize: '0.82rem', margin: 0 }}>{spell.description}</p>
    </div>
  );
}
