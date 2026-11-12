import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api.js';
import {
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  Pagination,
  AlertBox,
  Breadcrumb,
} from '../../components/ui/index.jsx';
import { formatDate, truncate } from '../../lib/utils.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Reopened', label: 'Reopened' },
];

const PAGE_SIZE = 10;

function isOverdue(grievance) {
  if (grievance.is_overdue) return true;
  if (!grievance.due_date && !grievance.dueDate) return false;
  if (grievance.status === 'Resolved') return false;
  const due = new Date(grievance.due_date || grievance.dueDate);
  return due < new Date();
}

export default function CitizenGrievancesPage() {
  const [grievances, setGrievances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const fetchGrievances = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', PAGE_SIZE);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await api.get(`/grievances/mine?${params.toString()}`);
      const payload = res.data?.data || res.data;
      setGrievances(payload?.grievances || []);
      setTotal(payload?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/citizen/dashboard' },
          { label: 'My Grievances' },
        ]}
      />
      <PageHeader
        title="My Grievances"
        subtitle={`${total} grievance${total !== 1 ? 's' : ''} total`}
        actions={
          <Link
            to="/citizen/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Grievance
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 font-medium whitespace-nowrap">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by reference ID or subject…"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>

          {(statusFilter || search) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap self-center"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <AlertBox type="error" message={error} />}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : grievances.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="No grievances found"
              description={
                statusFilter || search
                  ? 'No grievances match your current filters. Try adjusting or clearing them.'
                  : "You haven't submitted any grievances yet."
              }
              action={
                !statusFilter && !search ? (
                  <Link
                    to="/citizen/submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Submit Your First Grievance
                  </Link>
                ) : (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">District</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {grievances.map((g) => {
                    const id = g._id || g.id;
                    const overdue = isOverdue(g);
                    return (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/citizen/grievances/${id}`}
                              className="font-mono text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                            >
                              {g.referenceId || g.reference_id || '—'}
                            </Link>
                            {overdue && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 max-w-xs">
                          <span title={g.subject}>{truncate(g.subject, 55)}</span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {g.district?.name || g.district || '—'}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {g.category?.name || g.category || '—'}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <StatusBadge status={g.status} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {g.priority ? <PriorityBadge priority={g.priority} /> : <span className="text-gray-400 text-xs">—</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(g.createdAt || g.created_at)}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <Link
                            to={`/citizen/grievances/${id}`}
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            View Details
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
