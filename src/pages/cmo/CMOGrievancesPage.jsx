import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import {
  StatusBadge, PriorityBadge, LoadingSpinner, EmptyState,
  PageHeader, Pagination, AlertBox, Breadcrumb,
} from '../../components/ui/index.jsx';
import { formatDate, truncate } from '../../lib/utils.js';

const STATUSES = [
  'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Reopened',
];
const PRIORITIES = ['Low', 'Medium', 'High'];

const SORT_FIELDS = {
  reference_id: 'Ref ID',
  createdAt: 'Date',
  status: 'Status',
  priority: 'Priority',
  district: 'District',
};

function SortableHeader({ field, label, currentField, currentOrder, onSort }) {
  const active = currentField === field;
  return (
    <th
      className="pb-3 pr-4 cursor-pointer select-none whitespace-nowrap group"
      onClick={() => onSort(field)}
    >
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-indigo-600 transition">
        {label}
        {active ? (
          <span className="text-indigo-600">{currentOrder === 'asc' ? '↑' : '↓'}</span>
        ) : (
          <span className="text-gray-300">↕</span>
        )}
      </span>
    </th>
  );
}

export default function CMOGrievancesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [grievances, setGrievances] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Filters state
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    district: '',
    category: '',
    priority: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    overdue: searchParams.get('overdue') === 'true',
    escalated: searchParams.get('escalated') === 'true',
    search: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Fetch reference data
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [dRes, depRes, catRes] = await Promise.all([
          api.get('/districts'),
          api.get('/departments'),
          api.get('/categories'),
        ]);
        setDistricts(dRes.data?.data || []);
        setDepartments(depRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      } catch {
        // non-critical
      }
    };
    fetchMeta();
  }, []);

  const fetchGrievances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.district) params.district = appliedFilters.district;
      if (appliedFilters.category) params.category = appliedFilters.category;
      if (appliedFilters.priority) params.priority = appliedFilters.priority;
      if (appliedFilters.department) params.department = appliedFilters.department;
      if (appliedFilters.dateFrom) params.startDate = appliedFilters.dateFrom;
      if (appliedFilters.dateTo) params.endDate = appliedFilters.dateTo;
      if (appliedFilters.overdue) params.overdue = true;
      if (appliedFilters.escalated) params.escalated = true;
      if (appliedFilters.search) params.search = appliedFilters.search;

      const res = await api.get('/cmo/grievances', { params });
      const payload = res.data?.data || res.data;
      setGrievances(payload?.grievances || []);
      setPagination({
        page: payload?.page || page,
        limit: payload?.limit || 20,
        total: payload?.total || 0,
        totalPages: payload?.totalPages || 1,
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch grievances';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const handleResetFilters = () => {
    const reset = {
      status: '', district: '', category: '', priority: '',
      department: '', dateFrom: '', dateTo: '',
      overdue: false, escalated: false, search: '',
    };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
    setSearchParams({});
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const selectClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition';
  const inputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition';

  return (
    <div className="p-4 md:p-6 space-y-5">
      <Breadcrumb
        items={[{ label: 'CMO', href: '/cmo' }, { label: 'Grievances' }]}
      />
      <PageHeader
        title="Grievance Management"
        subtitle="All grievances across Kerala — filter, sort, and act"
        action={
          <span className="text-sm text-gray-500">
            Total: <strong>{pagination.total}</strong>
          </span>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={selectClass}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className={selectClass}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id || d.name || d} value={d.name || d}>
                {d.name || d}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={selectClass}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className={selectClass}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            className={selectClass}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id || d.id || d.name} value={d._id || d.id || d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search reference, name, subject..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className={inputClass}
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-center">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.overdue}
              onChange={(e) => handleFilterChange('overdue', e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            🔴 Overdue Only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.escalated}
              onChange={(e) => handleFilterChange('escalated', e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            🚨 Escalated Only
          </label>
          <button
            onClick={handleApplyFilters}
            className="col-span-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Apply Filters
          </button>
          <button
            onClick={handleResetFilters}
            className="col-span-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <AlertBox type="error" message={error} onRetry={fetchGrievances} />}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : grievances.length === 0 ? (
          <EmptyState
            message="No grievances found"
            description="Try adjusting your filters"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <SortableHeader
                      field="reference_id"
                      label="Ref ID"
                      currentField={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="pb-3 pr-4 pt-3 pl-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                      Citizen
                    </th>
                    <SortableHeader
                      field="district"
                      label="District"
                      currentField={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                      Category
                    </th>
                    <SortableHeader
                      field="status"
                      label="Status"
                      currentField={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      field="priority"
                      label="Priority"
                      currentField={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                      Flags
                    </th>
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                      Department
                    </th>
                    <SortableHeader
                      field="createdAt"
                      label="Date"
                      currentField={sortBy}
                      currentOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th className="pb-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grievances.map((g) => {
                    const id = g._id || g.id;
                    const isOverdue = g.is_overdue ?? g.isOverdue ?? false;
                    const isEscalated = g.escalated ?? g.is_escalated ?? false;
                    const refId = g.reference_id || g.referenceId || id;
                    const citizenName =
                      g.citizen_id?.name ||
                      g.citizen?.name ||
                      '—';
                    return (
                      <tr key={id} className="hover:bg-indigo-50/40 transition">
                        <td className="py-3 pl-4 pr-4">
                          <Link
                            to={`/cmo/grievances/${id}`}
                            className="font-mono text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                          >
                            {refId}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {truncate(citizenName, 20)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 text-xs">
                          {g.district || '—'}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 text-xs">
                          {g.category || '—'}
                        </td>
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
                        <td className="py-3 pr-4 text-xs text-gray-600">
                          {g.assigned_department_id?.name || g.department?.name || '—'}
                        </td>
                        <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(g.created_at || g.createdAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <Link
                            to={`/cmo/grievances/${id}`}
                            className="inline-block px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition font-medium whitespace-nowrap"
                          >
                            View & Action
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100">
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
