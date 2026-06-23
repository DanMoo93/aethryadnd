import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { connectSocket } from '../lib/socket';
import DiceTray from '../components/DiceTray';

export default function CampaignDetail() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  const [showNewChar, setShowNewChar] = useState(false);
  const [charName, setCharName] = useState('');
  const [charClass, setCharClass] = useState('');
  const [charRace, setCharRace] = useState('');
  const [creating, setCreating] = useState(false);

  const [showNewScene, setShowNewScene] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [creatingScene, setCreatingScene] = useState(false);

  useEffect(() => {
    load();
    const s = connectSocket();
    s.emit('campaign:join', { campaignId }, (res) => {
      if (res?.error) setError(res.error);
    });
    setSocket(s);
    return () => {
      s.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  async function load() {
    setLoading(true);
    try {
      const [campRes, charRes, sceneRes] = await Promise.all([
        api.getCampaign(campaignId),
        api.listCharacters(campaignId),
        api.listScenes(campaignId),
      ]);
      setCampaign(campRes.campaign);
      setMembership(campRes.membership);
      setMembers(campRes.members);
      setCharacters(charRes.characters);
      setScenes(sceneRes.scenes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateScene(e) {
    e.preventDefault();
    setCreatingScene(true);
    try {
      const { scene } = await api.createScene({ campaignId, name: sceneName });
      setScenes((prev) => [...prev, scene]);
      setShowNewScene(false);
      setSceneName('');
      navigate(`/scenes/${scene.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingScene(false);
    }
  }

  async function handleCreateCharacter(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const { character } = await api.createCharacter({
        campaignId,
        name: charName,
        sheet: { class: charClass, race: charRace },
      });
      setCharacters((prev) => [...prev, character]);
      setShowNewChar(false);
      setCharName('');
      setCharClass('');
      setCharRace('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="page">Loading campaign…</div>;
  if (error && !campaign) return <div className="page"><p className="error-text">{error}</p></div>;

  const isGm = membership?.role === 'gm';

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: '0.5rem', alignItems: 'flex-start' }}>
        <div>
          <h1>{campaign.name}</h1>
          {campaign.description && <p className="muted" style={{ maxWidth: 600 }}>{campaign.description}</p>}
        </div>
        <span className={isGm ? 'pill pill-gm' : 'pill pill-player'}>{isGm ? 'Game Master' : 'Player'}</span>
      </div>

      <p className="muted" style={{ fontFamily: 'var(--font-mono)', marginBottom: '2rem' }}>
        Invite code: {campaign.inviteCode}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Scenes</h2>
            {isGm && (
              <button className="btn btn-ghost" onClick={() => setShowNewScene(!showNewScene)}>
                + New scene
              </button>
            )}
          </div>

          {showNewScene && (
            <form onSubmit={handleCreateScene} className="card" style={{ marginBottom: '1rem' }}>
              <div className="field">
                <label htmlFor="sceneName">Scene name</label>
                <input
                  id="sceneName"
                  value={sceneName}
                  onChange={(e) => setSceneName(e.target.value)}
                  placeholder="The Tavern, Ravenloft Gates…"
                  required
                />
              </div>
              <button className="btn btn-gm" type="submit" disabled={creatingScene}>
                {creatingScene ? 'Creating…' : 'Create scene'}
              </button>
            </form>
          )}

          {scenes.length === 0 ? (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <p className="muted" style={{ margin: 0 }}>
                {isGm ? 'No scenes yet. Create one to start mapping out the table.' : 'The GM hasn\u2019t set up a scene yet.'}
              </p>
            </div>
          ) : (
            <div className="grid-cards" style={{ marginBottom: '2rem' }}>
              {scenes.map((s) => (
                <a
                  key={s.id}
                  className="card card-link"
                  href={`/scenes/${s.id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/scenes/${s.id}`); }}
                >
                  <h3 style={{ marginBottom: '0.3rem' }}>{s.name}</h3>
                  <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                    {s.gridWidth}×{s.gridHeight} grid · {s.tokens.length} token{s.tokens.length === 1 ? '' : 's'}
                  </p>
                </a>
              ))}
            </div>
          )}

          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Characters</h2>
            <button className="btn btn-ghost" onClick={() => navigate(`/campaigns/${campaignId}/new-character`)}>
              + New character
            </button>
          </div>

          {false && showNewChar && (
            <form onSubmit={handleCreateCharacter} className="card" style={{ marginBottom: '1rem' }}>
              <div className="field">
                <label htmlFor="charName">Character name</label>
                <input id="charName" value={charName} onChange={(e) => setCharName(e.target.value)} required />
              </div>
              <div className="flex-row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="charClass">Class</label>
                  <input id="charClass" value={charClass} onChange={(e) => setCharClass(e.target.value)} placeholder="Cleric" />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="charRace">Race</label>
                  <input id="charRace" value={charRace} onChange={(e) => setCharRace(e.target.value)} placeholder="Human" />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create character'}
              </button>
            </form>
          )}

          {characters.length === 0 ? (
            <div className="card"><p className="muted" style={{ margin: 0 }}>No characters yet.</p></div>
          ) : (
            <div className="grid-cards">
              {characters.map((c) => (
                <a
                  key={c.id}
                  className="card card-link"
                  href={`/characters/${c.id}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/characters/${c.id}`); }}
                >
                  <h3 style={{ marginBottom: '0.3rem' }}>{c.name}</h3>
                  <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                    {c.sheet.race || 'Unknown race'} {c.sheet.class || 'Unknown class'} · Level {c.sheet.level}
                  </p>
                  <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    HP {c.sheet.hp.current}/{c.sheet.hp.max}
                  </p>
                </a>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.2rem', margin: '2rem 0 1rem' }}>Members</h2>
          <div className="card">
            {members.map((m) => (
              <div key={m.userId} className="flex-between" style={{ padding: '0.4rem 0' }}>
                <span>{m.displayName}</span>
                <span className={m.role === 'gm' ? 'pill pill-gm' : 'pill pill-player'}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {socket && <DiceTray socket={socket} campaignId={campaignId} />}
        </div>
      </div>
    </div>
  );
}
