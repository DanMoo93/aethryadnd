import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../lib/socket';
import MapCanvas from '../components/MapCanvas';
import CombatTracker from '../components/CombatTracker';
import { characterOptionLabel, findCharacterById } from '../lib/characterLinks';

export default function ScenePage() {
  const { sceneId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scene, setScene] = useState(null);
  const [isGm, setIsGm] = useState(false);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [campaignCharacters, setCampaignCharacters] = useState([]);
  const fileInputRef = useRef(null);

  const [showAddToken, setShowAddToken] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenColor, setTokenColor] = useState('#8b2e2e');
  const [tokenCharacterId, setTokenCharacterId] = useState('');

  useEffect(() => {
    const s = connectSocket();
    s.emit('scene:join', { sceneId }, (res) => {
      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setScene(res.scene);
      setIsGm(res.isGm);
      setLoading(false);
    });
    setSocket(s);
    return () => {
      s.emit('scene:leave', { sceneId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => {
    if (!scene?.campaignId) return;
    api.listCharacters(scene.campaignId)
      .then(({ characters }) => setCampaignCharacters(characters))
      .catch((err) => setError(err.message));
  }, [scene?.campaignId]);

  async function handleMapUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !scene) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await api.uploadMap(scene.campaignId, file);
      const { scene: updated } = await api.updateScene(scene.id, { mapUrl: url });
      setScene(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAddToken(e) {
    e.preventDefault();
    try {
      const linkedCharacter = findCharacterById(campaignCharacters, tokenCharacterId);
      const { token } = await api.addToken(scene.id, {
        name: tokenName || linkedCharacter?.name || 'Token',
        x: scene.cellSize * 2,
        y: scene.cellSize * 2,
        color: tokenColor,
        ownerUserId: linkedCharacter?.userId || undefined,
        characterId: linkedCharacter?.id || null,
      });
      setScene((prev) => ({ ...prev, tokens: [...prev.tokens, token] }));
      setShowAddToken(false);
      setTokenName('');
      setTokenCharacterId('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveToken(tokenId) {
    try {
      await api.removeToken(scene.id, tokenId);
      setScene((prev) => ({ ...prev, tokens: prev.tokens.filter((t) => t.id !== tokenId) }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGridChange(field, value) {
    const num = Math.max(5, parseInt(value, 10) || scene[field]);
    try {
      const { scene: updated } = await api.updateScene(scene.id, { [field]: num });
      setScene(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page">Loading scene…</div>;
  if (error && !scene) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(`/campaigns/${scene.campaignId}`)} style={{ marginBottom: '1rem' }}>
        ← Back to campaign
      </button>

      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1>{scene.name}</h1>
        {isGm && <span className="pill pill-gm">Game Master view</span>}
      </div>

      {isGm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Scene setup</h3>
          <div className="flex-row" style={{ flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div>
              <label className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                Map image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleMapUpload}
                disabled={uploading}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                Grid width (cells)
              </label>
              <input
                type="number"
                defaultValue={scene.gridWidth}
                onBlur={(e) => handleGridChange('gridWidth', e.target.value)}
                style={{ width: 80, background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.4rem' }}
              />
            </div>
            <div>
              <label className="muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.3rem' }}>
                Grid height (cells)
              </label>
              <input
                type="number"
                defaultValue={scene.gridHeight}
                onBlur={(e) => handleGridChange('gridHeight', e.target.value)}
                style={{ width: 80, background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.4rem' }}
              />
            </div>
            <div>
              <button className="btn btn-ghost" onClick={() => setShowAddToken(!showAddToken)}>
                + Add token
              </button>
            </div>
          </div>

          {showAddToken && (
            <form onSubmit={handleAddToken} className="flex-row" style={{ flexWrap: 'wrap' }}>
              <select
                value={tokenCharacterId}
                onChange={(e) => {
                  const nextCharacterId = e.target.value;
                  setTokenCharacterId(nextCharacterId);
                  const linkedCharacter = findCharacterById(campaignCharacters, nextCharacterId);
                  if (linkedCharacter) setTokenName(linkedCharacter.name);
                }}
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.5rem', minWidth: 220 }}
              >
                <option value="">Token only</option>
                {campaignCharacters.length > 0 && (
                  <optgroup label="Characters">
                    {campaignCharacters.map((character) => (
                      <option key={character.id} value={character.id}>
                        {characterOptionLabel(character)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <input
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="Token name"
                required
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, color: 'var(--parchment)', padding: '0.5rem' }}
              />
              <input type="color" value={tokenColor} onChange={(e) => setTokenColor(e.target.value)} />
              <button className="btn btn-primary" type="submit">Add</button>
            </form>
          )}

          {scene.tokens.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <span className="muted" style={{ fontSize: '0.85rem' }}>Tokens on map:</span>
              <div className="flex-row" style={{ flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {scene.tokens.map((t) => (
                  <span key={t.id} className="pill pill-player" style={{ gap: '0.4rem' }}>
                    {t.name}
                    {t.characterId && (
                      <span className="muted" style={{ fontSize: '0.72rem' }}>
                        linked{findCharacterById(campaignCharacters, t.characterId)?.name ? ` to ${findCharacterById(campaignCharacters, t.characterId).name}` : ''}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveToken(t.id)}
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: '0.3rem' }}
                      aria-label={`Remove ${t.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {socket && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <MapCanvas scene={scene} isGm={isGm} socket={socket} userId={user?.id} characters={campaignCharacters} />
          <CombatTracker sceneId={scene.id} isGm={isGm} socket={socket} characters={campaignCharacters} sceneTokens={scene.tokens || []} />
        </div>
      )}
    </div>
  );
}
