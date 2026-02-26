import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/reports' : '/report', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await login(email.trim());
  };

  return (
    <div className="login-wrapper">
      <div className="page login-card">
        <div className="login-header">
          <span className="login-icon">🐛</span>
          <h1>Welcome to Bug Reporter</h1>
          <p className="login-subtitle">Sign in to submit and track bug reports</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              <span className="form-error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Checking…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
