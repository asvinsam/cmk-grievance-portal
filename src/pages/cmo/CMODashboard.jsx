import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../../lib/api.js';
import {
  StatusBadge, PriorityBadge, LoadingSpinner, EmptyState,
  KPICard, PageHeader, Pagination, AlertBox, Breadcrumb,
} from '../../components/ui/index.jsx';
import { formatDate, truncate } from '../../lib/utils.js';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#22c55e', '#f97316'];

const STATUS_LABELS = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Reopened'];

export default function CMODashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, grievancesRes] = await Promise.all([
        api.get('/cmo/stats'),
        api.get('/cmo/grievances', {
          params: { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' },
        }),
      ]);
      setStats(statsRes.data?.data || statsRes.data);
      const grievancesData = grievancesRes.data?.data || grievancesRes.data;
      setRecentGrievances(
        Array.isArray(grievancesData)
          ? grievancesData
          : grievancesData?.grievances || []
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Build pie data from stats
  const buildPieData = () => {
    if (!stats?.statusDist) return [];
    return stats.statusDist.map((item) => ({
      name: item._id,
      value: item.count,
    })).filter((d) => d.value > 0);
  };

  // Build monthly trend data
  const buildTrendData = () => {
    if (!stats?.monthlyTrend) return [];
    return stats.monthlyTrend.map((m) => ({
      month: m.label || `${m.month}/${m.year}`,
      Submitted: m.submitted ?? 0,
      Resolved: m.resolved ?? 0,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <AlertBox type="error" message={error} onRetry={fetchData} />
      </div>
    );
  }

  const summary = stats?.summary || {};
  const total = summary.total ?? 0;
  const pending = (summary.submitted ?? 0) + (summary.underReview ?? 0) + (summary.inProgress ?? 0) + (summary.reopened ?? 0);
  const resolved = summary.resolved ?? 0;
  const overdue = summary.overdue ?? 0;
  const escalated = summary.escalated ?? 0;
  const pieData = buildPieData();
  const trendData = buildTrendData();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Breadcrumb items={[{ label: 'CMO', href: '/cmo' }, { label: 'Dashboard' }]} />
      <PageHeader
        title="CMO Admin Dashboard"
        subtitle="Overview of all grievances across Kerala"
        action={
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            ↻ Refresh
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard
          label="Total Grievances"
          value={total}
          icon="📋"
          color="blue"
          onClick={() => navigate('/cmo/grievances')}
        />
        <KPICard
          label="Pending"
          value={pending}
          icon="⏳"
          color="yellow"
          onClick={() => navigate('/cmo/grievances?status=Submitted')}
        />
        <KPICard
          label="Resolved"
          value={resolved}
          icon="✅"
          color="green"
          onClick={() => navigate('/cmo/grievances?status=Resolved')}
        />
        <KPICard
          label="Overdue"
          value={overdue}
          icon="🔴"
          color="red"
          onClick={() => navigate('/cmo/grievances?overdue=true')}
        />
        <KPICard
          label="Escalated"
          value={escalated}
          icon="🚨"
          color="orange"
          onClick={() => navigate('/cmo/grievances?escalated=true')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Status Distribution</h3>
          {pieData.length === 0 ? (
            <EmptyState message="No data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Monthly Trend (Last 12 Months)</h3>
          {trendData.length === 0 ? (
            <EmptyState message="No trend data available" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Submitted"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Resolved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Grievances Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">Recent Grievances</h3>
          <Link
            to="/cmo/grievances"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentGrievances.length === 0 ? (
          <EmptyState message="No grievances found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Ref ID</th>
                  <th className="pb-3 pr-4">Subject</th>
                  <th className="pb-3 pr-4">District</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Priority</th>
                  <th className="pb-3 pr-4">Flags</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentGrievances.map((g) => {
                  const isOverdue =
                    g.is_overdue ?? g.isOverdue ?? false;
                  const isEscalated =
                    g.escalated ?? g.is_escalated ?? false;
                  return (
                    <tr key={g.id || g._id} className="hover:bg-gray-50 transition">
                      <td className="py-3 pr-4">
                        <Link
                          to={`/cmo/grievances/${g.id || g._id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-mono text-xs font-semibold"
                        >
                          {g.reference_id || g.referenceId || g.id || g._id}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 max-w-[200px]">
                        {truncate(g.subject || g.title || '—', 50)}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{g.district || '—'}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="py-3 pr-4">
                        <PriorityBadge priority={g.priority} />
                      </td>
                      <td className="py-3 pr-4 text-base space-x-1">
                        {isOverdue && <span title="Overdue">🔴</span>}
                        {isEscalated && <span title="Escalated">🚨</span>}
                      </td>
                      <td className="py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(g.created_at || g.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '📊 Statistics', href: '/cmo/stats' },
            { label: '📋 All Grievances', href: '/cmo/grievances' },
            { label: '🔴 Overdue', href: '/cmo/grievances?overdue=true' },
            { label: '🚨 Escalated', href: '/cmo/grievances?escalated=true' },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center justify-center px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition text-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
