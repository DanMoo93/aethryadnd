import { useState } from 'react';

export default function StepRace({ rules, draft, updateDraft, onNext }) {
  const [selected, setSelected] = useState(draft.raceKey || null);
  const [subSelected, setSubSelected] = useState(draft.subraceKey || null);
  const [name, setName] = useState(draft.name || '');

  const race = rules.races.find((r) => r.key === selected);

  function handleSelectRace(key) {
    setSelected(key);
    setSubSelected(null);
  }

  function handleContinue() {
    if (!selected || !name.trim()) return;
    updateDraft({ raceKey: selected, subraceKey: subSelected, name: name.trim() });
    onNext();
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: 400, marginBottom: '2rem' }}>
        <label htmlFor="charName">Character name</label>
        <input id="charName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Elowen Brightwood" />
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Choose a Race</h3>
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        {rules.races.map((r) => (
          <button
            key={r.key}
            onClick={() => handleSelectRace(r.key)}
            className="card"
            style={{
              textAlign: 'left',
              cursor: 'pointer',
              border: selected === r.key ? '2px solid var(--gold)' : '1px solid var(--line)',
            }}
          >
            <h4 style={{ marginBottom: '0.4rem' }}>{r.name}</h4>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              {Object.entries(r.abilityBonuses).map(([a, v]) => `${a.slice(0, 3).toUpperCase()} +${v}`).join(', ')}
            </p>
            <p className="muted" style={{ fontSize: '0.8rem', margin: '0.3rem 0 0' }}>Speed {r.speedOverride || r.speed} ft · {r.size}</p>
          </button>
        ))}
      </div>

      {race?.subraces && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Choose a Subrace</h3>
          <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
            {race.subraces.map((sr) => (
              <button
                key={sr.key}
                onClick={() => setSubSelected(sr.key)}
                className="card"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: subSelected === sr.key ? '2px solid var(--gold)' : '1px solid var(--line)',
                }}
              >
                <h4 style={{ marginBottom: '0.4rem' }}>{sr.name}</h4>
                <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                  {Object.entries(sr.abilityBonuses).map(([a, v]) => `${a.slice(0, 3).toUpperCase()} +${v}`).join(', ')}
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {race && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.6rem' }}>Traits</h4>
          {race.traits.map((t) => (
            <p key={t.name} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <strong>{t.name}.</strong> <span className="muted">{t.description}</span>
            </p>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleContinue}
        disabled={!selected || !name.trim() || (race?.subraces && !subSelected)}
      >
        Continue
      </button>
    </div>
  );
}
