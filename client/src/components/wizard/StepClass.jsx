import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function StepClass({ rules, edition, draft, updateDraft, onNext, onBack }) {
  const [selected, setSelected] = useState(draft.classKey || null);
  const [subSelected, setSubSelected] = useState(draft.subclassKey || null);
  const [classDetail, setClassDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!selected) {
      setClassDetail(null);
      return;
    }
    setLoadingDetail(true);
    // fetch class detail with the selected edition via API helper
    api.getClass(selected, edition)
      .then((d) => setClassDetail(d.class))
      .catch(() => setClassDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selected, edition]);

  function handleSelectClass(key) {
    setSelected(key);
    setSubSelected(null);
  }

  function handleContinue() {
    if (!selected) return;
    // Subclass choice at level 1 only matters for classes that grant it at
    // level 1 (Cleric, Sorcerer, Warlock in the SRD); others choose later,
    // but we let the player pre-select here either way for simplicity.
    updateDraft({ classKey: selected, subclassKey: subSelected });
    onNext();
  }

  const needsSubclassNow = classDetail?.features.some((f) => f.isSubclassChoice && f.level === 1);

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Choose a Class</h3>
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        {rules.classes.map((c) => (
          <button
            key={c.key}
            onClick={() => handleSelectClass(c.key)}
            className="card"
            style={{ textAlign: 'left', cursor: 'pointer', border: selected === c.key ? '2px solid var(--gold)' : '1px solid var(--line)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h4 style={{ marginBottom: '0.4rem' }}>{c.name}</h4>
              {c.source && <span className="pill" style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}>{c.source}</span>}
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              d{c.hitDie} Hit Die · Saves: {c.savingThrows.map((s) => s.slice(0, 3).toUpperCase()).join('/')}
            </p>
            {c.spellcasting && <p className="muted" style={{ fontSize: '0.8rem', margin: '0.3rem 0 0' }}>Spellcaster ({c.spellcasting.type})</p>}
          </button>
        ))}
      </div>

      {loadingDetail && <p className="muted">Loading class details…</p>}

      {classDetail && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.6rem' }}>{classDetail.name} Features (Level 1)</h4>
          {classDetail.features.filter((f) => f.level === 1).map((f) => (
            <p key={f.name} style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <strong>{f.name}.</strong> <span className="muted">{f.description}</span>
            </p>
          ))}
        </div>
      )}

      {classDetail && needsSubclassNow && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Choose a Subclass</h3>
          <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
            {classDetail.subclasses.map((sc) => (
              <button
                key={sc.key}
                onClick={() => setSubSelected(sc.key)}
                className="card"
                style={{ textAlign: 'left', cursor: 'pointer', border: subSelected === sc.key ? '2px solid var(--gold)' : '1px solid var(--line)' }}
              >
                <h4 style={{ margin: 0 }}>{sc.name}</h4>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!selected || (needsSubclassNow && !subSelected)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
