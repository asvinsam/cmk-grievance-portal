import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import {
  Breadcrumb,
  PageHeader,
  StatusBadge,
  PriorityBadge,
  GrievanceTimeline,
  LoadingSpinner,
  AlertBox,
} from '../../components/ui/index.jsx';
import { formatDate, formatDateTime } from '../../lib/utils.js';

const VALID_TRANSITIONS = {
  'Submitted': ['Under Review'],
  'Under Review': ['In Progress'],
  'In Progress': ['Resolved'],
  'Resolved': ['Reopened'],
  'Reopened': ['Under Review', 'In Progress'],
};

export default function CMOGrievanceDetailPage() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [isInternalRemark, setIsInternalRemark] = useState(true);
  const [escalateNote, setEscalateNote] = useState('');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [gRes, dRes] = await Promise.all([
        api.get(`/grievances/${id}`),
        api.get('/departments'),
      ]);
      const g = gRes.data?.data;
      setGrievance(g);
      setDepartments(dRes.data?.data || []);
      if (g?.assigned_department_id?._id) {
        setAssignDept(g.assigned_department_id._id);
      }
      const nexts = VALID_TRANSITIONS[g?.status] || [];
      setNewStatus(nexts[0] || '');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load grievance');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!assignDept) {
      setOfficers([]);
      return;
    }
    api.get(`/cmo/officers?department_id=${assignDept}`)
      .then((res) => setOfficers(res.data?.data || []))
      .catch(() => setOfficers([]));
  }, [assignDept]);

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;
    setBusy(true);
    try {
      await api.patch(`/cmo/grievances/${id}/status`, { status: newStatus, remarks: statusRemarks });
      toast.success(`Status updated to ${newStatus}`);
      setStatusRemarks('');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Status update failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignDept) return toast.error('Please select a department');
    setBusy(true);
    try {
      await api.post(`/cmo/grievances/${id}/assign`, {
        department_id: assignDept,
        officer_id: assignOfficer || undefined,
        remarks: assignRemarks || undefined,
      });
      toast.success('Grievance assigned to department');
      setAssignRemarks('');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setBusy(false);
    }
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    setBusy(true);
    try {
      await api.post(`/cmo/grievances/${id}/remarks`, {
        remark: remarkText.trim(),
        is_internal: isInternalRemark,
      });
      toast.success(isInternalRemark ? 'Internal remark added' : 'Public remark added');
      setRemarkText('');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add remark');
    } finally {
      setBusy(false);
    }
  };

  const handleEscalate = async () => {
    setBusy(true);
    try {
      await api.post(`/cmo/grievances/${id}/escalate`, { note: escalateNote || 'Escalated by CMO Admin' });
      toast.success('Grievance escalated');
      setEscalateNote('');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Escalation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleReviewReport = async (decision) => {
    setBusy(true);
    try {
      await api.post(`/cmo/grievances/${id}/review-report`, {
        decision,
        remarks: reviewRemarks || undefined,
      });
      toast.success(decision === 'accept' ? 'Report accepted & grievance resolved!' : 'Report returned for revision.');
      setReviewRemarks('');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Review failed');
    } finally {
      setBusy(false);
    }
  };

  const handleOpenAttachment = async (att) => {
    try {
      const res = await api.get(`/attachments/${att._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: att.mime_type }));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open attachment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !grievance) {
    return <AlertBox type="error" message={error || 'Grievance not found'} />;
  }

  const allowedNext = VALID_TRANSITIONS[grievance.status] || [];
  const ai = grievance.ai_suggestion;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'CMO Dashboard', href: '/cmo/dashboard' },
          { label: 'All Grievances', href: '/cmo/grievances' },
          { label: grievance.reference_id },
        ]}
      />

      <PageHeader
        title={`Grievance ${grievance.reference_id}`}
        subtitle={grievance.subject}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={grievance.status} />
            <PriorityBadge priority={grievance.priority} />
            {grievance.is_overdue && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">OVERDUE</span>
            )}
            {grievance.escalated && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">ESCALATED</span>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citizen & Complaint Info */}
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-navy-900 border-b border-gray-200 pb-2">Citizen & Complaint Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-navy-50 p-4 rounded-lg text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Citizen Name</span>
                <span className="font-semibold">{grievance.citizen_id?.name || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Email</span>
                <span className="font-mono text-xs">{grievance.citizen_id?.email || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Mobile</span>
                <span className="font-mono text-xs">{grievance.citizen_id?.mobile || '—'}</span>
              </div>
            </div>

            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{grievance.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg text-xs">
              <div><span className="text-gray-500 block">District</span><strong>{grievance.district}</strong></div>
              <div><span className="text-gray-500 block">Category</span><strong>{grievance.category}</strong></div>
              <div><span className="text-gray-500 block">Department</span><strong>{grievance.assigned_department_id?.name || 'Unassigned'}</strong></div>
              <div><span className="text-gray-500 block">Due Date</span><strong>{formatDate(grievance.due_date)}</strong></div>
            </div>

            {grievance.attachments?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {grievance.attachments.map((att) => (
                    <button
                      key={att._id}
                      type="button"
                      onClick={() => handleOpenAttachment(att)}
                      className="px-3 py-1.5 bg-navy-50 text-navy-900 border border-navy-200 rounded text-xs font-medium hover:bg-navy-100"
                    >
                      📎 {att.original_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Suggestion Block */}
          {ai && (
            <div className="card space-y-3 border-l-4 border-l-purple-600">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-navy-900">AI Analysis Suggestion (Advisory)</h2>
                <span className="text-xs font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded">
                  {ai.source} ({ai.ai_model})
                </span>
              </div>
              {ai.source === 'FALLBACK_RULE_BASED' && (
                <AlertBox type="warning">Rule-based fallback was used when this grievance was analysed.</AlertBox>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded">
                <div><span className="text-gray-500 block">Suggested Dept</span><strong>{ai.suggested_department}</strong></div>
                <div><span className="text-gray-500 block">Category</span><strong>{ai.suggested_category}</strong></div>
                <div><span className="text-gray-500 block">Priority</span><strong>{ai.priority}</strong></div>
                <div><span className="text-gray-500 block">Confidence</span><strong>{Math.round((ai.confidence || 0) * 100)}%</strong></div>
              </div>
              {ai.summary && <p className="text-sm text-gray-700"><strong>Summary:</strong> {ai.summary}</p>}
            </div>
          )}

          {/* Action Report Review */}
          {grievance.action_report && (
            <div className="card space-y-4 border-l-4 border-l-saffron-500">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-navy-900">Department Action-Taken Report</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {grievance.action_report.review_status}
                </span>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{grievance.action_report.report_text}</p>
              <p className="text-xs text-gray-500">
                Submitted by {grievance.action_report.officer_id?.name || 'Officer'} on {formatDateTime(grievance.action_report.submitted_at)}
              </p>

              {grievance.action_report.review_status === 'Pending Review' && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <textarea
                    rows={2}
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Review remarks for citizen / officer…"
                    className="form-input text-sm"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReviewReport('accept')}
                      className="btn-primary flex-1 text-sm py-2 bg-green-700 hover:bg-green-800"
                    >
                      ✓ Accept & Resolve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReviewReport('return')}
                      className="btn-outline flex-1 text-sm py-2"
                    >
                      ↩ Return to Officer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Internal Remarks */}
          {grievance.internal_remarks?.length > 0 && (
            <div className="card space-y-3">
              <h2 className="text-base font-bold text-navy-900">Internal Remarks (Admin/Officer Only)</h2>
              <div className="space-y-2">
                {grievance.internal_remarks.map((r) => (
                  <div key={r._id} className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold">{r.author_id?.name} ({r.author_role})</span>
                      <span>{formatDateTime(r.createdAt)}</span>
                    </div>
                    <p className="text-gray-800">{r.remark}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Full History Timeline</h2>
            <GrievanceTimeline history={grievance.history} />
          </div>
        </div>

        {/* Right Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Assign to Department */}
          <form onSubmit={handleAssign} className="card space-y-3">
            <h3 className="font-bold text-navy-900 text-base">Assign to Department</h3>
            <div>
              <label className="form-label">Department</label>
              <select
                value={assignDept}
                onChange={(e) => { setAssignDept(e.target.value); setAssignOfficer(''); }}
                className="form-input bg-white text-sm"
                required
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Officer (optional)</label>
              <select
                value={assignOfficer}
                onChange={(e) => setAssignOfficer(e.target.value)}
                className="form-input bg-white text-sm"
              >
                <option value="">Any department officer</option>
                {officers.map((o) => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>
            <textarea
              rows={2}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="Assignment instructions…"
              className="form-input text-sm"
            />
            <button type="submit" disabled={busy} className="btn-secondary w-full text-sm py-2">
              Assign & Forward
            </button>
          </form>

          {/* Change Status */}
          {allowedNext.length > 0 && (
            <form onSubmit={handleStatusChange} className="card space-y-3">
              <h3 className="font-bold text-navy-900 text-base">Update Status</h3>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-input bg-white text-sm"
              >
                {allowedNext.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <textarea
                rows={2}
                value={statusRemarks}
                onChange={(e) => setStatusRemarks(e.target.value)}
                placeholder="Public remarks for status update…"
                className="form-input text-sm"
              />
              <button type="submit" disabled={busy} className="btn-primary w-full text-sm py-2">
                Update Status
              </button>
            </form>
          )}

          {/* Add Remark */}
          <form onSubmit={handleAddRemark} className="card space-y-3">
            <h3 className="font-bold text-navy-900 text-base">Add Remark</h3>
            <textarea
              rows={3}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Enter remark…"
              className="form-input text-sm"
              required
            />
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={isInternalRemark}
                onChange={(e) => setIsInternalRemark(e.target.checked)}
              />
              Internal only (hidden from citizen)
            </label>
            <button type="submit" disabled={busy} className="btn-outline w-full text-sm py-2">
              Save Remark
            </button>
          </form>

          {/* Escalate */}
          {grievance.status !== 'Resolved' && (
            <div className="card space-y-3">
              <h3 className="font-bold text-red-700 text-base">Escalate Grievance</h3>
              <textarea
                rows={2}
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                placeholder="Escalation note / reminder…"
                className="form-input text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleEscalate}
                className="btn-danger w-full text-sm py-2"
              >
                🚨 Escalate Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
