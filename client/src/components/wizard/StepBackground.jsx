import { useState } from 'react';

export default function StepBackground({ rules, draft, updateDraft, onNext, onBack }) {
  const [selected, setSelected] = useState(draft.backgroundKey || null);
  const [alignment, setAlignment] = useState(draft.alignment || '');

  const background = rules.backgrounds.find((b) => b.key === selected);

  function handleContinue() {
    if (!selected || !alignment) return;
    updateDraft({ backgroundKey: selected, alignment });
    onNext();
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Choose a Background</h3>
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        {rules.backgrounds.map((b) => (
          <button
            key={b.key}
            onClick={() => setSelected(b.key)}
            className="card"
            style={{ textAlign: 'left', cursor: 'pointer', border: selected === b.key ? '2px solid var(--gold)' : '1px solid var(--line)' }}
          >
            <h4 style={{ marginBottom: '0.4rem' }}>{b.name}</h4>
            <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
              Skills: {b.skillProficiencies.join(', ')}
            </p>
          </button>
        ))}
      </div>

      {background && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>{background.feature.name}</h4>
          <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '0.8rem' }}>{background.feature.description}</p>
          <p style={{ fontSize: '0.85rem' }}><strong>Starting equipment:</strong> <span className="muted">{background.equipment.join(', ')}</span></p>
        </div>
      )}

      <div className="field" style={{ maxWidth: 300, marginBottom: '1.5rem' }}>
        <label htmlFor="alignment">Alignment</label>
        <select id="alignment" value={alignment} onChange={(e) => setAlignment(e.target.value)} style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', color: 'var(--parchment)', padding: '0.6rem' }}>
          <option value="">Select alignment…</option>
          {rules.alignments.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleContinue} disabled={!selected || !alignment}>
          Continue
        </button>
      </div>
    </div>
  );
}
