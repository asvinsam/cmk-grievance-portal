import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api.js';
import {
  Breadcrumb,
  StatusBadge,
  PriorityBadge,
  GrievanceTimeline,
  LoadingSpinner,
  AlertBox,
} from '../../components/ui/index.jsx';
import { formatDate } from '../../lib/utils.js';

export default function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [refInput, setRefInput] = useState(initialId);
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrack = useCallback(async (id) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) return;
    setLoading(true);
    setError('');
    setGrievance(null);
    try {
      const res = await api.get(`/grievances/track/${encodeURIComponent(cleanId)}`);
      setGrievance(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Grievance not found. Please check your Reference ID.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialId) {
      fetchTrack(initialId);
    }
  }, [initialId, fetchTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!refInput.trim()) {
      setError('Please enter a Reference ID.');
      return;
    }
    setSearchParams({ id: refInput.trim().toUpperCase() });
    fetchTrack(refInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Track Grievance' }]} />

      <h1 className="text-3xl font-bold text-navy-900 mb-2">Track Grievance Status</h1>
      <p className="text-gray-600 text-sm mb-6">
        Enter your unique Reference ID (e.g., <span className="font-mono font-semibold">CMK-2026-100001</span>) to view real-time status and action history. Personal details are hidden for privacy.
      </p>

      <form onSubmit={handleSubmit} className="card mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="Enter Reference ID (e.g. CMK-2026-100001)"
            className="form-input flex-1 font-mono uppercase"
            aria-label="Reference ID"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? 'Searching…' : 'Track Grievance'}
          </button>
        </div>
      </form>

      {loading && (
        <div className="py-12">
          <LoadingSpinner size="lg" label="Fetching grievance status…" />
        </div>
      )}

      {error && <AlertBox type="error" message={error} />}

      {grievance && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Reference ID</p>
                <p className="text-xl font-mono font-bold text-navy-900">{grievance.reference_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={grievance.status} />
                <PriorityBadge priority={grievance.priority} />
                {grievance.is_overdue && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Overdue
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">{grievance.subject}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-gray-500 block text-xs">District</span>
                <span className="font-semibold text-gray-900">{grievance.district}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Category</span>
                <span className="font-semibold text-gray-900">{grievance.category}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Assigned Department</span>
                <span className="font-semibold text-gray-900">
                  {grievance.assigned_department?.name || 'Pending Assignment'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Submitted On</span>
                <span className="font-semibold text-gray-900">{formatDate(grievance.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">SLA Due Date</span>
                <span className="font-semibold text-gray-900">{formatDate(grievance.due_date)}</span>
              </div>
              {grievance.resolved_at && (
                <div>
                  <span className="text-gray-500 block text-xs">Resolved On</span>
                  <span className="font-semibold text-green-700">{formatDate(grievance.resolved_at)}</span>
                </div>
              )}
            </div>

            {grievance.public_remarks && (
              <AlertBox type="info">
                <strong>Official Remarks:</strong> {grievance.public_remarks}
              </AlertBox>
            )}
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-navy-900 mb-4">Status History Timeline</h3>
            <GrievanceTimeline history={grievance.history} />
          </div>
        </div>
      )}
    </div>
  );
}
