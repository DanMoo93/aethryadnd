function normalizeHp(hp) {
  if (hp == null) return null;
  if (typeof hp === 'number') {
    const value = Math.max(0, Math.floor(hp));
    return { current: value, max: value };
  }
  if (typeof hp === 'object') {
    const current = Math.max(0, Math.floor(Number(hp.current) || 0));
    const max = Math.max(current, Math.floor(Number(hp.max ?? hp.current) || current));
    return { current, max };
  }
  return null;
}

export function buildCombatantPayload({ token = null, character = null, name, initiative, hp, ac }) {
  const derivedCharacterId = character?.id || token?.characterId || null;
  const derivedTokenId = token?.id || null;
  const derivedName = name || character?.name || token?.name || 'Unknown';
  const derivedHp = normalizeHp(hp) || character?.sheet?.hp || { current: 10, max: 10 };
  const derivedAc = Number.isFinite(Number(ac)) ? Number(ac) : character?.sheet?.armorClass ?? 10;

  return {
    name: derivedName,
    tokenId: derivedTokenId,
    characterId: derivedCharacterId,
    initiative: Number.isFinite(Number(initiative)) ? Number(initiative) : 0,
    hp: derivedHp,
    ac: derivedAc,
  };
}
