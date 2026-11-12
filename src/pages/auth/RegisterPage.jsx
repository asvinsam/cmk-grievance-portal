import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { AlertBox } from '../../components/ui/index.jsx';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '+91',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const rules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(form.password) },
    { label: 'Number', ok: /\d/.test(form.password) },
    { label: 'Special character (@$!%*?&)', ok: /[@$!%*?&]/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\+91[6-9]\d{9}$/.test(form.mobile)) {
      setError('Mobile must be a valid Indian number starting with +91 followed by 10 digits.');
      return;
    }
    if (!rules.every((r) => r.ok)) {
      setError('Password does not meet all strength requirements.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await register(form);
      toast.success('Registration successful!');
      navigate('/citizen/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.errors?.[0]?.message || 'Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900">Citizen Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Create an account to submit and track grievances</p>
        </div>

        {error && <AlertBox type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="form-input" required />
          </div>

          <div>
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" required />
          </div>

          <div>
            <label htmlFor="mobile" className="form-label">Mobile Number (+91 format) *</label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="+919876543210"
              className="form-input font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <ul className="mt-2 space-y-1 text-xs">
              {rules.map((r) => (
                <li key={r.label} className={r.ok ? 'text-green-700' : 'text-gray-400'}>
                  {r.ok ? '✓' : '○'} {r.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="text-navy-900 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
