import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import api from '../../lib/api.js';
import { PageHeader, KPICard, LoadingSpinner, AlertBox, Breadcrumb } from '../../components/ui/index.jsx';

const COLORS = ['#0B2A4A', '#E08A00', '#1E7B34', '#3B82F6', '#DC2626', '#6B7280'];

export default function CMOStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cmo/stats')
      .then((res) => setStats(res.data?.data))
      .catch((err) => setError(err?.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return <AlertBox type="error" message={error || 'No analytics data'} />;
  }

  const s = stats.summary || {};
  const districtData = (stats.districtWise || []).slice(0, 10).map((d) => ({ name: d._id, count: d.count }));
  const deptData = (stats.deptWise || []).map((d) => ({ name: d.name, count: d.count }));
  const statusData = (stats.statusDist || []).map((d) => ({ name: d._id, value: d.count }));
  const trendData = (stats.monthlyTrend || []).map((m) => ({
    month: m.label,
    Submitted: m.submitted,
    Resolved: m.resolved,
  }));
  const resolutionData = (stats.deptResolution || []).map((d) => ({ name: d.name, avgDays: d.avgDays }));
  const priorityData = (stats.priorityDist || []).map((d) => ({ name: d._id, value: d.count }));

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'CMO Dashboard', href: '/cmo/dashboard' }, { label: 'Statistics' }]} />
      <PageHeader title="Grievance Analytics & Reports" subtitle="Computed live from stored grievance data" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total" value={s.total} color="navy" />
        <KPICard title="Resolved" value={s.resolved} color="green" />
        <KPICard title="Overdue" value={s.overdue} color="red" />
        <KPICard title="Escalated" value={s.escalated} color="saffron" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">District-wise Grievances (Top 10)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0B2A4A" name="Grievances" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">Department-wise Grievances</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={65} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#E08A00" name="Grievances" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">Monthly Trend (Submitted vs Resolved)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Submitted" stroke="#0B2A4A" strokeWidth={2} />
              <Line type="monotone" dataKey="Resolved" stroke="#1E7B34" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">Department Avg Resolution Time (Days)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={65} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDays" fill="#1E7B34" name="Avg Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-base font-bold text-navy-900 mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
