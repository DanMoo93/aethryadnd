const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('dnd_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  listCampaigns: () => request('/campaigns'),
  createCampaign: (payload) => request('/campaigns', { method: 'POST', body: payload }),
  getCampaign: (id) => request(`/campaigns/${id}`),
  joinCampaign: (inviteCode) => request('/campaigns/join', { method: 'POST', body: { inviteCode } }),

  listCharacters: (campaignId) => request(`/characters/campaign/${campaignId}`),
  createCharacter: (payload) => request('/characters', { method: 'POST', body: payload }),
  getCharacter: (id) => request(`/characters/${id}`),
  updateCharacter: (id, sheet) => request(`/characters/${id}`, { method: 'PATCH', body: { sheet } }),
  deleteCharacter: (id) => request(`/characters/${id}`, { method: 'DELETE' }),

  // Character approval endpoints (GM workflows)
  listPendingCharacters: (campaignId) => request(`/characters/campaign/${campaignId}/pending`),
  approveCharacter: (id) => request(`/characters/${id}/approve`, { method: 'POST' }),
  rejectCharacter: (id, reason) => request(`/characters/${id}/reject`, { method: 'POST', body: { reason } }),

  listScenes: (campaignId) => request(`/scenes/campaign/${campaignId}`),
  createScene: (payload) => request('/scenes', { method: 'POST', body: payload }),
  getScene: (id) => request(`/scenes/${id}`),
  updateScene: (id, patch) => request(`/scenes/${id}`, { method: 'PATCH', body: patch }),
  deleteScene: (id) => request(`/scenes/${id}`, { method: 'DELETE' }),
  addToken: (sceneId, payload) => request(`/scenes/${sceneId}/tokens`, { method: 'POST', body: payload }),
  removeToken: (sceneId, tokenId) => request(`/scenes/${sceneId}/tokens/${tokenId}`, { method: 'DELETE' }),

  listEncounters: (sceneId) => request(`/encounters/scene/${sceneId}`),
  createEncounter: (payload) => request('/encounters', { method: 'POST', body: payload }),
  getEncounter: (id) => request(`/encounters/${id}`),
  updateEncounter: (id, patch) => request(`/encounters/${id}`, { method: 'PATCH', body: patch }),
  deleteEncounter: (id) => request(`/encounters/${id}`, { method: 'DELETE' }),
  addCombatant: (encounterId, payload) => request(`/encounters/${encounterId}/combatants`, { method: 'POST', body: payload }),
  updateCombatant: (encounterId, combatantId, patch) =>
    request(`/encounters/${encounterId}/combatants/${combatantId}`, { method: 'PATCH', body: patch }),
  removeCombatant: (encounterId, combatantId) =>
    request(`/encounters/${encounterId}/combatants/${combatantId}`, { method: 'DELETE' }),
  sortEncounter: (encounterId) => request(`/encounters/${encounterId}/sort`, { method: 'POST' }),
  nextTurn: (encounterId) => request(`/encounters/${encounterId}/next-turn`, { method: 'POST' }),

  getLevelUpPreview: (characterId, toLevel) => request(`/characters/${characterId}/level-up-preview/${toLevel}`),
  applyLevelUp: (characterId, payload) => request(`/characters/${characterId}/level-up`, { method: 'POST', body: payload }),

  getRulesBundle: (edition) => request(`/rules${edition ? '?edition=' + encodeURIComponent(edition) : ''}`, { auth: false }),
  getClass: (key, edition) => request(`/rules/classes/${key}${edition ? '?edition=' + encodeURIComponent(edition) : ''}`, { auth: false }),
  getClassSpellcasting: (classKey, level, abilityModifier) =>
    request(`/rules/classes/${classKey}/spellcasting/${level}?abilityModifier=${abilityModifier}`, { auth: false }),
  getSpells: (classKey, level) => {
    const params = new URLSearchParams();
    if (classKey) params.set('class', classKey);
    if (level !== undefined) params.set('level', level);
    return request(`/rules/spells?${params.toString()}`, { auth: false });
  },
  getSpellsByKeys: (keys) => {
    if (!keys || keys.length === 0) return Promise.resolve({ spells: [] });
    return request(`/rules/spells-by-keys?keys=${keys.join(',')}`, { auth: false });
  },

  async uploadMap(campaignId, file) {
    const formData = new FormData();
    formData.append('campaignId', campaignId);
    formData.append('map', file);
    const token = getToken();
    const res = await fetch(`${API_BASE}/scenes/upload-map`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Upload failed with status ${res.status}`);
    return data;
  },
};

export { getToken };
