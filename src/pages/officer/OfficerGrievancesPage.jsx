import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import {
  StatusBadge,
  PriorityBadge,
  LoadingSpinner,
  EmptyState,
  PageHeader,
  Pagination,
  Breadcrumb,
} from '../../components/ui/index.jsx';
import { formatDate, truncate } from '../../lib/utils.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Reopened', label: 'Reopened' },
];

const PAGE_SIZE = 10;

export default function OfficerGrievancesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [grievances, setGrievances] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchGrievances = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: PAGE_SIZE,
      };
      if (status) params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get('/officer/grievances', { params });
      const payload = res.data?.data || res.data;
      setGrievances(payload?.grievances || []);
      setTotalCount(payload?.total || 0);
    } catch (err) {
      toast.error('Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Keep URL in sync
  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (debouncedSearch) params.search = debouncedSearch;
    if (page > 1) params.page = page;
    setSearchParams(params, { replace: true });
  }, [status, debouncedSearch, page, setSearchParams]);

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasFilters = search || status;

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/officer/dashboard' },
    { label: 'Assigned Grievances' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <PageHeader
          title="Assigned Grievances"
          subtitle={`Showing ${totalCount} grievance${totalCount !== 1 ? 's' : ''} assigned to your department`}
          className="mt-3"
        />

        {/* Filters Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by reference ID, subject, district…"
                className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="block w-full sm:w-48 py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : grievances.length === 0 ? (
            <div className="py-20">
              <EmptyState
                title="No grievances found"
                description={
                  hasFilters
                    ? 'Try adjusting your filters or search term.'
                    : 'No grievances have been assigned to your department yet.'
                }
                icon={
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                action={
                  hasFilters
                    ? { label: 'Clear Filters', onClick: handleClearFilters }
                    : null
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50">
                      {[
                        'Reference ID',
                        'Subject',
                        'District',
                        'Category',
                        'Status',
                        'Priority',
                        'Date Assigned',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {grievances.map((g) => {
                      const id = g._id || g.id;
                      const isOverdue =
                        g.is_overdue || g.isOverdue ||
                        (g.due_date && new Date(g.due_date) < new Date() && g.status !== 'Resolved');

                      return (
                        <tr
                          key={id}
                          className={`hover:bg-blue-50 transition-colors ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
                        >
                          {/* Reference ID */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-semibold text-blue-700">
                              {g.reference_id || g.referenceId}
                            </span>
                          </td>

                          {/* Subject */}
                          <td className="px-5 py-4 max-w-xs">
                            <span className="text-sm text-gray-900" title={g.subject}>
                              {truncate ? truncate(g.subject, 55) : (g.subject?.slice(0, 55) + (g.subject?.length > 55 ? '…' : ''))}
                            </span>
                          </td>

                          {/* District */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                            {g.district || '—'}
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                            {g.category || '—'}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <StatusBadge status={g.status} />
                              {isOverdue && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd" />
                                  </svg>
                                  OVERDUE
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <PriorityBadge priority={g.priority} />
                          </td>

                          {/* Date Assigned */}
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(g.assignedAt || g.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <Link
                              to={`/officer/grievances/${id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View &amp; Update
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span> &mdash; {totalCount} total
                  </p>
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
    </div>
  );
}
