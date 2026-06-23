import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { ABILITIES } from '../../lib/dnd5e';
import StepRace from './StepRace';
import StepClass from './StepClass';
import StepAbilities from './StepAbilities';
import StepBackground from './StepBackground';
import StepEquipment from './StepEquipment';
import StepSpells from './StepSpells';
import StepReview from './StepReview';

const STEPS = ['Race', 'Class', 'Abilities', 'Background', 'Equipment', 'Spells', 'Review'];

function emptyDraft() {
  return {
    name: '',
    raceKey: '',
    subraceKey: '',
    classKey: '',
    subclassKey: '',
    abilityScoreMethod: 'standard-array',
    baseAbilities: { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 },
    backgroundKey: '',
    alignment: '',
    skillChoices: [],
    weaponChoiceIndices: [],
    armorKey: null,
    shield: false,
    cantripsKnown: [],
    spellsKnown: [],
  };
}

export default function CharacterWizard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(emptyDraft());
  const [submitting, setSubmitting] = useState(false);

  const [edition, setEdition] = useState('5e');

  useEffect(() => {
    setLoading(true);
    api
      .getRulesBundle(edition)
      .then((bundle) => {
        // attach edition to rules so child steps can read it
        setRules({ ...bundle, edition });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [edition]);

  function updateDraft(patch) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const selectedClass = rules?.classes?.find((c) => c.key === draft.classKey) || null;
  const isCaster = !!selectedClass?.spellcasting;

  // Skip the Spells step entirely for non-casters
  function nextStepAfterEquipment() {
    if (!isCaster) setStep(STEPS.indexOf('Review'));
    else setStep(STEPS.indexOf('Spells'));
  }

  async function handleFinish(finalSheetPatch) {
    setSubmitting(true);
    setError('');
    try {
      const { character } = await api.createCharacter({
        campaignId,
        name: draft.name,
        sheet: finalSheetPatch,
      });
      navigate(`/characters/${character.id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page">Loading the rulebook…</div>;
  if (error && !rules) return <div className="page"><p className="error-text">{error}</p></div>;

  const visibleSteps = isCaster ? STEPS : STEPS.filter((s) => s !== 'Spells');

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(`/campaigns/${campaignId}`)} style={{ marginBottom: '1rem' }}>
        ← Back to campaign
      </button>
      <h1 style={{ marginBottom: '0.3rem' }}>Create a Character</h1>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p className="muted" style={{ margin: 0 }}>Step {visibleSteps.indexOf(STEPS[step]) + 1} of {visibleSteps.length}: {STEPS[step]}</p>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label className="muted" style={{ fontSize: '0.85rem' }}>Ruleset</label>
          <select value={edition} onChange={(e) => setEdition(e.target.value)} style={{ background: 'var(--ink)', color: 'var(--parchment)', border: '1px solid var(--line)', padding: '0.3rem' }}>
            <option value="5e">D&D 5e (SRD)</option>
            <option value="5e+tasha">D&D 5e + Tasha</option>
            <option value="5e+faerun">D&D 5e + Faerûn (licensed)</option>
          </select>
        </div>
      </div>

      <div className="flex-row" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
        {visibleSteps.map((s) => {
          const realIndex = STEPS.indexOf(s);
          const isCurrent = realIndex === step;
          const isPast = realIndex < step;
          return (
            <span
              key={s}
              className="pill"
              style={{
                background: isCurrent ? 'var(--oxblood)' : isPast ? 'rgba(63,93,82,0.3)' : 'rgba(201,168,106,0.08)',
                color: isCurrent ? 'var(--parchment)' : isPast ? 'var(--forest-bright)' : 'var(--parchment-dim)',
              }}
            >
              {s}
            </span>
          );
        })}
      </div>

      {error && <p className="error-text">{error}</p>}

      {STEPS[step] === 'Race' && (
        <StepRace rules={rules} draft={draft} updateDraft={updateDraft} onNext={goNext} />
      )}
      {STEPS[step] === 'Class' && (
        <StepClass rules={rules} edition={edition} draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
      )}
      {STEPS[step] === 'Abilities' && (
        <StepAbilities rules={rules} draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
      )}
      {STEPS[step] === 'Background' && (
        <StepBackground rules={rules} draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
      )}
      {STEPS[step] === 'Equipment' && (
        <StepEquipment
          rules={rules}
          draft={draft}
          updateDraft={updateDraft}
          onNext={nextStepAfterEquipment}
          onBack={goBack}
        />
      )}
      {STEPS[step] === 'Spells' && isCaster && (
        <StepSpells rules={rules} draft={draft} updateDraft={updateDraft} onNext={goNext} onBack={goBack} />
      )}
      {STEPS[step] === 'Review' && (
        <StepReview
          rules={rules}
          draft={draft}
          onBack={() => setStep(isCaster ? STEPS.indexOf('Spells') : STEPS.indexOf('Equipment'))}
          onFinish={handleFinish}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export { ABILITIES };
