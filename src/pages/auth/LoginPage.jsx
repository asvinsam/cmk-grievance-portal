import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { AlertBox } from '../../components/ui/index.jsx';

const ROLE_REDIRECT = {
  CITIZEN: '/citizen/dashboard',
  CMO_ADMIN: '/cmo/dashboard',
  DEPT_OFFICER: '/officer/dashboard',
};

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROLE_REDIRECT[user.role] || '/');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@12345');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900">Portal Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in as Citizen, CMO Admin, or Department Officer</p>
        </div>

        {error && <AlertBox type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          New citizen?{' '}
          <Link to="/register" className="text-navy-900 font-semibold hover:underline">
            Register here
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 space-y-2">
          <p className="text-xs font-bold text-navy-900 uppercase tracking-wider">Demo Accounts (Password: Demo@12345)</p>
          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('citizen.demo@example.com')}
              className="w-full text-left px-2.5 py-1.5 bg-white rounded border border-gray-200 hover:border-navy-500 flex justify-between"
            >
              <span className="font-semibold text-navy-900">Citizen</span>
              <span className="font-mono text-gray-600">citizen.demo@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('cmo.demo@example.com')}
              className="w-full text-left px-2.5 py-1.5 bg-white rounded border border-gray-200 hover:border-navy-500 flex justify-between"
            >
              <span className="font-semibold text-navy-900">CMO Admin</span>
              <span className="font-mono text-gray-600">cmo.demo@example.com</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('officer.pwd@example.com')}
              className="w-full text-left px-2.5 py-1.5 bg-white rounded border border-gray-200 hover:border-navy-500 flex justify-between"
            >
              <span className="font-semibold text-navy-900">Dept. Officer (PWD)</span>
              <span className="font-mono text-gray-600">officer.pwd@example.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
