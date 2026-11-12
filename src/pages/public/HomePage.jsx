import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import { LoadingSkeleton } from '../../components/ui/index.jsx';

const DISCLAIMER =
  "Recruitment Prototype. Not an official Government of Kerala / Chief Minister's Office website. All data is fictional.";

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-saffron-500" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" />
  </svg>
);

const steps = [
  { icon: '📝', label: 'Submit', desc: 'Log in and file your grievance online' },
  { icon: '🔖', label: 'Get ID', desc: 'Receive a unique reference ID instantly' },
  { icon: '🔍', label: 'Review', desc: 'CMO reviews and assigns to department' },
  { icon: '✅', label: 'Resolve', desc: 'Officer investigates and resolves' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [depsLoading, setDepsLoading] = useState(true);

  useEffect(() => {
    api.get('/public/stats')
      .then(r => setStats(r.data?.data || r.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));

    api.get('/departments')
      .then(r => {
        const list = r.data?.data || r.data?.departments || (Array.isArray(r.data) ? r.data : []);
        setDepartments(list.slice(0, 8));
      })
      .catch(() => setDepartments([]))
      .finally(() => setDepsLoading(false));
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    const id = trackId.trim();
    if (id) navigate(`/track?id=${encodeURIComponent(id)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-300 text-amber-800 text-xs text-center py-2 px-4 font-medium">
        ⚠️ {DISCLAIMER}
      </div>

      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-5">
            <ShieldIcon />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
            CM Kerala Grievance Portal
          </h1>
          <p className="text-saffron-400 text-xl font-semibold tracking-wide mb-4">
            Transparent. Accountable. Responsive.
          </p>
          <p className="text-gray-300 max-w-2xl mx-auto mb-10 text-base leading-relaxed">
            A direct channel between citizens and the Chief Minister's Office. File, track, and resolve
            grievances with full transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/citizen/submit"
              className="inline-flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg text-base"
            >
              📝 Submit Grievance
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-navy-900 font-semibold px-8 py-3.5 rounded-lg transition-colors text-base"
            >
              🔍 Track Grievance
            </Link>
          </div>

          {/* Quick Track Search */}
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              value={trackId}
              onChange={e => setTrackId(e.target.value)}
              placeholder="Enter Reference ID (e.g. CMK-2026-000123)"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-400 text-sm"
              aria-label="Grievance Reference ID"
            />
            <button
              type="submit"
              className="bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors whitespace-nowrap"
            >
              Track →
            </button>
          </form>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-6">
            Live Portal Statistics
          </h2>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-24 skeleton rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Received"
                value={stats?.total ?? stats?.total_received ?? '—'}
                icon="📬"
                color="border-navy-900"
                bg="bg-navy-50"
              />
              <StatCard
                label="Resolved"
                value={stats?.resolved ?? stats?.totalResolved ?? '—'}
                icon="✅"
                color="border-green-600"
                bg="bg-green-50"
              />
              <StatCard
                label="In Progress"
                value={stats?.inProgress ?? stats?.in_progress ?? '—'}
                icon="⏳"
                color="border-saffron-500"
                bg="bg-amber-50"
              />
              <StatCard
                label="Avg Resolution Days"
                value={stats?.avgResolutionDays != null
                  ? Number(stats.avgResolutionDays).toFixed(1)
                  : '—'}
                icon="📅"
                color="border-blue-500"
                bg="bg-blue-50"
              />
            </div>
          )}
        </div>
      </section>

      {/* How It Works Teaser */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-navy-900 text-center mb-2">How It Works</h2>
          <p className="text-gray-500 text-center mb-10 text-sm">
            Your grievance, resolved in four clear steps.{' '}
            <Link to="/how-it-works" className="text-saffron-600 hover:underline font-medium">
              See full process →
            </Link>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="w-7 h-7 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-navy-900 text-sm mb-1">{step.label}</h3>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Departments */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Featured Departments</h2>
              <p className="text-gray-500 text-sm mt-1">Grievances are handled by these departments</p>
            </div>
            <Link to="/departments" className="text-sm text-saffron-600 hover:underline font-medium">
              View All →
            </Link>
          </div>

          {depsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
            </div>
          ) : departments.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No departments available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept._id || dept.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-navy-300 transition-all"
                >
                  <div className="text-2xl mb-2">🏛️</div>
                  <h3 className="font-semibold text-navy-900 text-sm mb-1 leading-snug">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{dept.description || 'Government department'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-navy-900 text-white py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-3">Have a Grievance? We're Here to Help.</h2>
          <p className="text-gray-300 mb-8 text-sm">
            Register or log in to submit your grievance and get a unique tracking ID.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-saffron-500 hover:bg-saffron-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Register Now
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-navy-900 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className={`rounded-xl border-l-4 ${color} ${bg} p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
        </div>
        <span className="text-2xl" aria-hidden="true">{icon}</span>
      </div>
    </div>
  );
}
