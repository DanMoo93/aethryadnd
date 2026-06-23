import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-narrow">
      <h1 style={{ marginBottom: '0.4rem' }}>Pull up a chair</h1>
      <p className="muted" style={{ marginBottom: '2rem' }}>
        Create an account to start or join a campaign.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="What your table calls you"
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <span className="muted" style={{ fontSize: '0.8rem' }}>At least 8 characters</span>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: '1.5rem' }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
