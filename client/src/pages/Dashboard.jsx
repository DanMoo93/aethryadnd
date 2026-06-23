import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const { campaigns } = await api.listCampaigns();
      setCampaigns(campaigns);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const { campaign } = await api.createCampaign({ name: newName, description: newDesc });
      setShowCreate(false);
      setNewName('');
      setNewDesc('');
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    setJoining(true);
    setJoinError('');
    try {
      const { campaign } = await api.joinCampaign(inviteCode.trim());
      navigate(`/campaigns/${campaign.id}`);
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Your Campaigns</h1>
          <p className="muted">Tables you run or play at.</p>
        </div>
        <div className="flex-row">
          <button className="btn btn-ghost" onClick={() => setShowJoin(!showJoin)}>
            Join with code
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            New campaign
          </button>
        </div>
      </div>

      {showJoin && (
        <form onSubmit={handleJoin} className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="field">
            <label htmlFor="inviteCode">Invite code</label>
            <input
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. VY5MOW"
              required
              style={{ textTransform: 'uppercase', maxWidth: 200 }}
            />
          </div>
          {joinError && <p className="error-text">{joinError}</p>}
          <button className="btn btn-primary" type="submit" disabled={joining}>
            {joining ? 'Joining…' : 'Join campaign'}
          </button>
        </form>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="field">
            <label htmlFor="name">Campaign name</label>
            <input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Curse of Strahd"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="desc">Description (optional)</label>
            <textarea
              id="desc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
              placeholder="A gothic horror campaign set in Barovia…"
            />
          </div>
          <button className="btn btn-gm" type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create campaign'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            No campaigns yet. Create one to run a game, or join one with an invite code from your GM.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {campaigns.map((c) => (
            <a key={c.id} className="card card-link" href={`/campaigns/${c.id}`} onClick={(e) => { e.preventDefault(); navigate(`/campaigns/${c.id}`); }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{c.name}</h3>
              {c.description && (
                <p className="muted" style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  {c.description}
                </p>
              )}
              <span className="muted" style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                Invite: {c.inviteCode}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
