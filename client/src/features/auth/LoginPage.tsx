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
    <div className="page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? 'Checking…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
