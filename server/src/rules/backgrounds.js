// SRD 5.1 backgrounds. Each grants skill proficiencies, tool/language
// proficiencies, starting equipment, and a roleplay feature.

export const BACKGROUNDS = [
  {
    key: 'acolyte',
    name: 'Acolyte',
    skillProficiencies: ['insight', 'religion'],
    toolProficiencies: [],
    languages: ['Two of your choice'],
    equipment: ['A holy symbol', 'A prayer book or prayer wheel', '5 sticks of incense', 'Vestments', 'A set of common clothes', '15 gp'],
    feature: {
      name: 'Shelter of the Faithful',
      description: 'You and your companions can expect free healing and care at a temple, shrine, or other established presence of your faith, and you can perform religious ceremonies of your deity.',
    },
  },
  {
    key: 'criminal',
    name: 'Criminal',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiencies: ['One type of gaming set', "Thieves' tools"],
    languages: [],
    equipment: ['A crowbar', 'A set of dark common clothes including a hood', '15 gp'],
    feature: {
      name: 'Criminal Contact',
      description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of other criminals.',
    },
  },
  {
    key: 'folk-hero',
    name: 'Folk Hero',
    skillProficiencies: ['animalHandling', 'survival'],
    toolProficiencies: ["One type of artisan's tools", 'Vehicles (land)'],
    languages: [],
    equipment: ["A set of artisan's tools", 'A shovel', 'An iron pot', 'A set of common clothes', '10 gp'],
    feature: {
      name: 'Rustic Hospitality',
      description: 'Common folk will shelter and provide modest aid to you, even if you are a wanted criminal, as long as your wanted notoriety is not widely known.',
    },
  },
  {
    key: 'noble',
    name: 'Noble',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiencies: ['One type of gaming set'],
    languages: ['One of your choice'],
    equipment: ['A set of fine clothes', 'A signet ring', 'A scroll of pedigree', '25 gp'],
    feature: {
      name: 'Position of Privilege',
      description: 'People are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are.',
    },
  },
  {
    key: 'sage',
    name: 'Sage',
    skillProficiencies: ['arcana', 'history'],
    toolProficiencies: [],
    languages: ['Two of your choice'],
    equipment: ['A bottle of black ink', 'A quill', 'A small knife', 'A letter from a dead colleague posing a question', 'A set of common clothes', '10 gp'],
    feature: {
      name: 'Researcher',
      description: 'When you attempt to learn or recall a piece of lore, if you do not know that information, you often know where and from whom you can obtain it.',
    },
  },
  {
    key: 'soldier',
    name: 'Soldier',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiencies: ['One type of gaming set', 'Vehicles (land)'],
    languages: [],
    equipment: ['An insignia of rank', 'A trophy taken from a fallen enemy', 'A set of bone dice or deck of cards', 'A set of common clothes', '10 gp'],
    feature: {
      name: 'Military Rank',
      description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority and influence.',
    },
  },
];

export function getBackground(key) {
  return BACKGROUNDS.find((b) => b.key === key) || null;
}
