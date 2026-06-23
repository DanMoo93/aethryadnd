import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function GMApprovals() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await api.listPendingCharacters(campaignId);
      setPending(data.pending || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [campaignId]);

  async function handleApprove(id) {
    try {
      await api.approveCharacter(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Enter rejection reason (optional):', '');
    try {
      await api.rejectCharacter(id, reason || 'Rejected by GM');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="page">Loading pending characters…</div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <button className="btn btn-ghost" onClick={() => navigate(`/campaigns/${campaignId}`)} style={{ marginBottom: '1rem' }}>
        ← Back to campaign
      </button>
      <h1>Pending Character Approvals</h1>
      {pending.length === 0 && <p className="muted">No pending characters.</p>}
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {pending.map((c) => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              <small className="muted">Submitted by {c.userId}</small>
            </div>
            <p className="muted" style={{ fontSize: '0.9rem' }}>Class: {c.sheet.classKey || '—'} · Race: {c.sheet.raceKey || '—'} · Level: {c.sheet.level || 1}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-success" onClick={() => handleApprove(c.id)}>Approve</button>
              <button className="btn btn-danger" onClick={() => handleReject(c.id)}>Reject</button>
              <button className="btn btn-ghost" onClick={() => navigate(`/characters/${c.id}`)}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
