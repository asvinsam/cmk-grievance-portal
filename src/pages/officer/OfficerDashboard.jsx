import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  KPICard,
  PageHeader,
  EmptyState,
} from '../../components/ui/index.jsx';
import { formatDate } from '../../lib/utils.js';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingGrievances, setLoadingGrievances] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentGrievances();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/officer/stats');
      setStats(res.data?.data || res.data);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecentGrievances = async () => {
    try {
      setLoadingGrievances(true);
      const res = await api.get('/officer/grievances', { params: { limit: 5 } });
      setRecentGrievances(res.data?.data?.grievances || res.data?.grievances || []);
    } catch (err) {
      toast.error('Failed to load recent grievances.');
    } finally {
      setLoadingGrievances(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Assigned',
      value: stats?.total ?? stats?.totalAssigned ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'blue',
      description: 'All grievances assigned to your department',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      description: 'Grievances currently being worked on',
    },
    {
      title: 'Resolved',
      value: stats?.resolved ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      description: 'Successfully resolved grievances',
    },
    {
      title: 'Overdue',
      value: stats?.overdue ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'red',
      description: 'Grievances past their deadline',
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports ?? '—',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
      description: 'Action reports awaiting CMO review',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <PageHeader
          title={`Welcome, ${user?.name || 'Officer'}`}
          subtitle={
            user?.department?.name || user?.department
              ? `Department: ${user.department?.name || user.department}`
              : 'Department Officer Dashboard'
          }
        />

        {/* KPI Cards */}
        <section aria-label="Statistics" className="mt-6">
          {loadingStats ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {kpiCards.map((card) => (
                <KPICard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                  description={card.description}
                />
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section aria-label="Quick Actions" className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/officer/grievances"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All Grievances
              </Link>
              <Link
                to="/officer/grievances?status=overdue"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                View Overdue
              </Link>
              <Link
                to="/officer/grievances?status=pending"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-sm font-medium rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Pending
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Grievances Table */}
        <section aria-label="Recent Grievances" className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Recently Assigned Grievances</h2>
              <Link
                to="/officer/grievances"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>

            {loadingGrievances ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="md" />
              </div>
            ) : recentGrievances.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No grievances assigned"
                  description="You have no grievances assigned to your department yet."
                  icon={
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Reference ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date Assigned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentGrievances.map((g) => (
                      <tr
                        key={g._id || g.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => (window.location.href = `/officer/grievances/${g._id || g.id}`)}
                        tabIndex={0}
                        role="link"
                        aria-label={`View grievance ${g.referenceId}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                            window.location.href = `/officer/grievances/${g._id || g.id}`;
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-blue-700">
                            {g.reference_id || g.referenceId}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {g.subject?.length > 60 ? g.subject.slice(0, 60) + '…' : g.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PriorityBadge priority={g.priority} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(g.assignedAt || g.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          CM Kerala Grievance Portal — Department Officer View · Data refreshes on page load
        </p>
      </div>
    </div>
  );
}
