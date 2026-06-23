import { ABILITIES, ABILITY_LABELS, abilityModifier, formatModifier, proficiencyBonusForLevel } from '../../lib/dnd5e';

export default function StepReview({ rules, draft, onBack, onFinish, submitting }) {
  const race = rules.races.find((r) => r.key === draft.raceKey);
  const subrace = race?.subraces?.find((s) => s.key === draft.subraceKey);
  const cls = rules.classes.find((c) => c.key === draft.classKey);
  const subclass = cls?.subclasses.find((s) => s.key === draft.subclassKey);
  const background = rules.backgrounds.find((b) => b.key === draft.backgroundKey);
  const weapon = rules.weapons.find((w) => w.key === draft.weaponKey);
  const armor = rules.armor.find((a) => a.key === draft.armorKey);

  function finalAbilityScore(ability) {
    let total = draft.baseAbilities[ability] || 10;
    total += race?.abilityBonuses?.[ability] || 0;
    total += subrace?.abilityBonuses?.[ability] || 0;
    return total;
  }

  function computeArmorClass() {
    const dexMod = abilityModifier(finalAbilityScore('dexterity'));
    let ac = 10 + dexMod;
    if (armor) {
      if (armor.dexBonus === 'full') ac = armor.baseAC + dexMod;
      else if (armor.dexBonus === 'max2') ac = armor.baseAC + Math.min(dexMod, 2);
      else if (armor.dexBonus === 'none') ac = armor.baseAC;
    }
    if (draft.shield) ac += 2;
    return ac;
  }

  function computeHp() {
    const conMod = abilityModifier(finalAbilityScore('constitution'));
    return cls.hitDie + conMod; // level 1: max hit die + CON mod
  }

  function handleSubmit() {
    const abilities = ABILITIES.reduce((acc, a) => {
      acc[a] = finalAbilityScore(a);
      return acc;
    }, {});
    const maxHp = Math.max(1, computeHp());

    const sheet = {
      class: cls.name,
      classKey: cls.key,
      subclass: subclass?.name || '',
      subclassKey: draft.subclassKey || '',
      level: 1,
      race: subrace ? `${subrace.name} ${race.name}`.replace(race.name, '').trim() + ' ' + race.name : race.name,
      raceKey: race.key,
      subraceKey: draft.subraceKey || '',
      background: background.name,
      backgroundKey: background.key,
      alignment: draft.alignment,
      abilities,
      abilityScoreMethod: draft.abilityScoreMethod,
      proficientSkills: [...draft.skillChoices, ...background.skillProficiencies],
      proficiencyBonus: proficiencyBonusForLevel(1),
      savingThrowProficiencies: cls.savingThrows,
      hp: { current: maxHp, max: maxHp, temp: 0 },
      armorClass: computeArmorClass(),
      speed: race.speedOverride || race.speed,
      weapons: weapon ? [{ key: weapon.key, name: weapon.name }] : [],
      armorWorn: armor ? { key: armor.key, name: armor.name } : null,
      shield: draft.shield,
      spellcasting: cls.spellcasting || null,
      cantripsKnown: draft.cantripsKnown || [],
      spellsKnown: draft.spellsKnown || [],
      feats: [],
      features: [],
      notes: '',
    };
    onFinish(sheet);
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem' }}>Review Your Character</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h4 style={{ marginBottom: '0.6rem' }}>Identity</h4>
          <p style={{ margin: '0.2rem 0' }}><strong>Class:</strong> {cls.name} {subclass ? `(${subclass.name})` : ''}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Race:</strong> {subrace ? `${subrace.name} ` : ''}{race.name}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Background:</strong> {background.name}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Alignment:</strong> {draft.alignment}</p>
        </div>

        <div className="card">
          <h4 style={{ marginBottom: '0.6rem' }}>Combat</h4>
          <p style={{ margin: '0.2rem 0' }}><strong>HP:</strong> {Math.max(1, computeHp())}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>AC:</strong> {computeArmorClass()}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Speed:</strong> {race.speedOverride || race.speed} ft</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Weapon:</strong> {weapon?.name || 'None'}</p>
          <p style={{ margin: '0.2rem 0' }}><strong>Armor:</strong> {armor?.name || 'None'}{draft.shield ? ' + Shield' : ''}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '0.8rem' }}>Ability Scores</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
          {ABILITIES.map((a) => {
            const score = finalAbilityScore(a);
            return (
              <div key={a} style={{ textAlign: 'center' }}>
                <div className="muted" style={{ fontSize: '0.75rem' }}>{ABILITY_LABELS[a].slice(0, 3).toUpperCase()}</div>
                <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>{score}</div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>{formatModifier(abilityModifier(score))}</div>
              </div>
            );
          })}
        </div>
      </div>

      {(draft.cantripsKnown?.length > 0 || draft.spellsKnown?.length > 0) && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.6rem' }}>Spells</h4>
          {draft.cantripsKnown?.length > 0 && <p style={{ margin: '0.2rem 0' }}><strong>Cantrips:</strong> {draft.cantripsKnown.length} selected</p>}
          {draft.spellsKnown?.length > 0 && <p style={{ margin: '0.2rem 0' }}><strong>1st-level spells:</strong> {draft.spellsKnown.length} selected</p>}
        </div>
      )}

      <div className="flex-row">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Character'}
        </button>
      </div>
    </div>
  );
}
