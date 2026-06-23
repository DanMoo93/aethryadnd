export function extendWithTasha(bundle) {
  const classes = (bundle.classes || []).map((c) => ({ ...c }));

  // Add Order of the Scribes to Wizards
  const wizard = classes.find((c) => c.key === 'wizard');
  if (wizard) {
    wizard.subclasses = (wizard.subclasses || []).concat([
      {
        key: 'order-of-scribes',
        name: 'Order of Scribes',
        source: 'Tasha',
        features: [
          { level: 1, name: 'Wizardly Quill', description: 'You gain a mystical quill that helps you inscribe and cast spells from your spellbook.' },
          { level: 2, name: 'Awakened Spellbook', description: 'Your spellbook can store and cast certain spells, and you can replace spells more flexibly.' },
          { level: 6, name: 'Manifest Mind', description: 'Create a spectral mind that can deliver spells and perform minor tasks.' },
        ],
      },
    ]);
  }

  // Small Tasha additions: tag artificer armorer subclass as Tasha
  const artificer = classes.find((c) => c.key === 'artificer');
  if (artificer) {
    artificer.subclasses = (artificer.subclasses || []).map((s) => ({ ...s, source: s.source || 'Tasha' }));
  }

  return { ...bundle, classes };
}
