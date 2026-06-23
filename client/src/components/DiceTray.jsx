import { useEffect, useRef, useState } from 'react';

const QUICK_ROLLS = ['1d20', '1d20+5', '2d6', '1d8', '1d4', '1d100'];

export default function DiceTray({ socket, campaignId }) {
  const [notation, setNotation] = useState('1d20');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const ledgerRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    function handleResult(entry) {
      setHistory((prev) => [...prev, entry]);
    }
    socket.on('dice:result', handleResult);
    return () => socket.off('dice:result', handleResult);
  }, [socket]);

  useEffect(() => {
    if (ledgerRef.current) {
      ledgerRef.current.scrollTop = ledgerRef.current.scrollHeight;
    }
  }, [history]);

  function roll(diceNotation) {
    setError('');
    socket.emit('dice:roll', { campaignId, notation: diceNotation }, (res) => {
      if (res?.error) setError(res.error);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    roll(notation);
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Dice Tray</h3>

      <div className="flex-row" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
        {QUICK_ROLLS.map((n) => (
          <button key={n} className="btn btn-ghost" onClick={() => roll(n)} style={{ fontFamily: 'var(--font-mono)', padding: '0.4rem 0.8rem' }}>
            {n}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex-row" style={{ marginBottom: '1rem' }}>
        <input
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          placeholder="e.g. 2d6+3"
          style={{
            flex: 1,
            background: 'var(--ink-soft)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius)',
            padding: '0.6rem 0.8rem',
            color: 'var(--parchment)',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <button className="btn btn-primary" type="submit">
          Roll
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}

      <div className="ledger" ref={ledgerRef}>
        {history.length === 0 ? (
          <p style={{ color: 'rgba(22,21,26,0.5)', fontStyle: 'italic', margin: 0 }}>
            No rolls yet. The ledger is empty.
          </p>
        ) : (
          history.map((entry) => (
            <div className="ledger-entry" key={entry.id}>
              <span className="ledger-die">{entry.notation.split('d')[1]?.split(/[+-]/)[0] || '?'}</span>
              <span>
                <strong>{entry.displayName}</strong> rolled {entry.notation}
                {entry.label ? ` (${entry.label})` : ''} — [{entry.rolls.join(', ')}]
                {entry.modifier ? (entry.modifier > 0 ? ` +${entry.modifier}` : ` ${entry.modifier}`) : ''}
              </span>
              <span className="ledger-total">{entry.total}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
