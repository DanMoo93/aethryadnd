import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { abilityModifier } from '../../lib/dnd5e';

export default function StepSpells({ rules, draft, updateDraft, onNext, onBack }) {
  const [profile, setProfile] = useState(null);
  const [cantrips, setCantrips] = useState([]);
  const [levelOneSpells, setLevelOneSpells] = useState([]);
  const [selectedCantrips, setSelectedCantrips] = useState(draft.cantripsKnown || []);
  const [selectedSpells, setSelectedSpells] = useState(draft.spellsKnown || []);
  const [loading, setLoading] = useState(true);

  const cls = rules.classes.find((c) => c.key === draft.classKey);
  const abilityScore = draft.baseAbilities[cls.spellcasting.ability] || 10;
  const abilityMod = abilityModifier(abilityScore);

  useEffect(() => {
    Promise.all([
      api.getClassSpellcasting(draft.classKey, 1, abilityMod),
      api.getSpells(draft.classKey, 0),
      api.getSpells(draft.classKey, 1),
    ])
      .then(([profileRes, cantripsRes, spellsRes]) => {
        setProfile(profileRes);
        setCantrips(cantripsRes.spells);
        setLevelOneSpells(spellsRes.spells);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.classKey]);

  if (loading || !profile) return <p className="muted">Loading spell list…</p>;

  const cantripLimit = profile.cantripsKnown || 0;
  // For known casters, spellsKnown caps total 1st-level spells known. For
  // prepared casters, preparedCount caps spells prepared from the full list
  // (which includes higher levels at higher character levels, but at level 1
  // it's effectively the 1st-level list plus cantrips handled separately).
  const spellLimit = profile.knownOrPrepared === 'known' ? profile.spellsKnown : profile.preparedCount;

  function toggleCantrip(key) {
    setSelectedCantrips((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= cantripLimit) return prev;
      return [...prev, key];
    });
  }

  function toggleSpell(key) {
    setSelectedSpells((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= spellLimit) return prev;
      return [...prev, key];
    });
  }

  function handleContinue() {
    updateDraft({ cantripsKnown: selectedCantrips, spellsKnown: selectedSpells });
    onNext();
  }

  const canContinue = selectedCantrips.length === cantripLimit && selectedSpells.length === spellLimit;

  return (
    <div>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {cls.name}s cast using <strong>{profile.ability}</strong>. At level 1 you {profile.knownOrPrepared === 'prepared' ? 'can prepare' : 'know'}{' '}
        {spellLimit} spell{spellLimit === 1 ? '' : 's'} and {cantripLimit} cantrip{cantripLimit === 1 ? '' : 's'}.
      </p>

      {cantripLimit > 0 && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Cantrips ({selectedCantrips.length}/{cantripLimit})</h3>
          <div className="grid-cards" style={{ marginBottom: '2rem' }}>
            {cantrips.map((s) => (
              <SpellCard key={s.key} spell={s} selected={selectedCantrips.includes(s.key)} onClick={() => toggleCantrip(s.key)} disabled={!selectedCantrips.includes(s.key) && selectedCantrips.length >= cantripLimit} />
            ))}
          </div>
        </>
      )}

      <h3 style={{ marginBottom: '1rem' }}>1st-Level Spells ({selectedSpells.length}/{spellLimit})</h3>
      <div className="grid-cards" style={{ marginBottom: '2rem' }}>
        {levelOneSpells.map((s) => (
          <SpellCard key={s.key} spell={s} selected={selectedSpells.includes(s.key)} onClick={() => toggleSpell(s.key)} disabled={!selectedSpells.includes(s.key) && selectedSpells.length >= spellLimit} />
        ))}
      </div>

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleContinue} disabled={!canContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

function SpellCard({ spell, selected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="card"
      style={{
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        border: selected ? '2px solid var(--gold)' : '1px solid var(--line)',
      }}
    >
      <h4 style={{ marginBottom: '0.3rem', fontSize: '1rem' }}>{spell.name}</h4>
      <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>{spell.school} · {spell.castingTime}</p>
      <p className="muted" style={{ fontSize: '0.8rem', margin: '0.4rem 0 0' }}>{spell.description.slice(0, 90)}…</p>
    </button>
  );
}
