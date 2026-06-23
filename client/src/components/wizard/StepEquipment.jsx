import { useEffect, useState } from 'react';

export default function StepEquipment({ rules, draft, updateDraft, onNext, onBack }) {
  const [classDetail, setClassDetail] = useState(null);
  const [skillChoices, setSkillChoices] = useState(draft.skillChoices || []);
  const [weaponKey, setWeaponKey] = useState(draft.weaponKey || '');
  const [armorKey, setArmorKey] = useState(draft.armorKey || '');
  const [shield, setShield] = useState(draft.shield || false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/rules/classes/${draft.classKey}`)
      .then((r) => r.json())
      .then((d) => setClassDetail(d.class));
  }, [draft.classKey]);

  if (!classDetail) return <p className="muted">Loading class equipment options…</p>;

  const skillCount = classDetail.skillChoices.count;

  function toggleSkill(skillKey) {
    setSkillChoices((prev) => {
      if (prev.includes(skillKey)) return prev.filter((s) => s !== skillKey);
      if (prev.length >= skillCount) return prev;
      return [...prev, skillKey];
    });
  }

  const armorOptions = rules.armor.filter((a) => a.category !== 'shield');
  const martialOrSimple = rules.weapons; // show full catalog; SRD "any simple/martial weapon" choices are abstracted here for simplicity

  function handleContinue() {
    updateDraft({ skillChoices, weaponKey, armorKey: armorKey || null, shield });
    onNext();
  }

  const skillLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Skill Proficiencies</h3>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        Choose {skillCount} from your class list ({skillChoices.length}/{skillCount} selected).
      </p>
      <div className="flex-row" style={{ flexWrap: 'wrap', marginBottom: '2rem' }}>
        {classDetail.skillChoices.options.map((s) => (
          <button
            key={s}
            className={`btn ${skillChoices.includes(s) ? 'btn-gm' : 'btn-ghost'}`}
            onClick={() => toggleSkill(s)}
            disabled={!skillChoices.includes(s) && skillChoices.length >= skillCount}
          >
            {skillLabel(s)}
          </button>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Starting Weapon</h3>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        Suggested for {classDetail.name}: see class equipment notes. Pick a weapon to start with — you can add more later.
      </p>
      <select
        value={weaponKey}
        onChange={(e) => setWeaponKey(e.target.value)}
        style={{ background: 'var(--ink-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', color: 'var(--parchment)', padding: '0.6rem', marginBottom: '2rem', maxWidth: 300, display: 'block' }}
      >
        <option value="">Select a weapon…</option>
        {martialOrSimple.map((w) => (
          <option key={w.key} value={w.key}>{w.name} ({w.damage} {w.damageType})</option>
        ))}
      </select>

      <h3 style={{ marginBottom: '1rem' }}>Armor</h3>
      <div className="flex-row" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className={`btn ${!armorKey ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setArmorKey('')}>No armor</button>
        {armorOptions.map((a) => (
          <button key={a.key} className={`btn ${armorKey === a.key ? 'btn-gm' : 'btn-ghost'}`} onClick={() => setArmorKey(a.key)}>
            {a.name} (AC {a.baseAC})
          </button>
        ))}
      </div>
      <label className="flex-row" style={{ marginBottom: '2rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={shield} onChange={(e) => setShield(e.target.checked)} />
        <span>Carry a shield (+2 AC)</span>
      </label>

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleContinue} disabled={skillChoices.length !== skillCount}>
          Continue
        </button>
      </div>
    </div>
  );
}
