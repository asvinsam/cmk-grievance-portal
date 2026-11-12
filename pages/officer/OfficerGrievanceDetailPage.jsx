import { useState, useEffect, useCallback, useRef } from 'react';
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

export default function OfficerGrievanceDetailPage() {
  const { id } = useParams();
  const fileRef = useRef(null);

  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [progressRemarks, setProgressRemarks] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/grievances/${id}`);
      setGrievance(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load grievance details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (progressRemarks.trim().length < 10) {
      return toast.error('Remarks must be at least 10 characters.');
    }
    setBusy(true);
    try {
      await api.patch(`/officer/grievances/${id}/status`, {
        status: 'In Progress',
        remarks: progressRemarks.trim(),
      });
      toast.success('Progress updated!');
      setProgressRemarks('');
      fetchDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update progress');
    } finally {
      setBusy(false);
    }
  };

  const handleActionReport = async (e) => {
    e.preventDefault();
    if (reportText.trim().length < 20) {
      return toast.error('Action report must be at least 20 characters.');
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('report_text', reportText.trim());
      if (reportFile) fd.append('attachment', reportFile);

      await api.post(`/officer/grievances/${id}/action-report`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Action report submitted to CMO for review!');
      setReportText('');
      setReportFile(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit action report');
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

  const report = grievance.action_report;
  const canSubmitReport =
    ['In Progress', 'Under Review'].includes(grievance.status) &&
    (!report || report.review_status === 'Returned');

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Officer Dashboard', href: '/officer/dashboard' },
          { label: 'Assigned Grievances', href: '/officer/grievances' },
          { label: grievance.reference_id },
        ]}
      />

      <PageHeader
        title={`Grievance ${grievance.reference_id}`}
        subtitle={grievance.subject}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={grievance.status} />
            <PriorityBadge priority={grievance.priority} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-bold text-navy-900 border-b border-gray-200 pb-2">Complaint Details</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{grievance.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg text-xs">
              <div><span className="text-gray-500 block">Citizen</span><strong>{grievance.citizen_id?.name || '—'}</strong></div>
              <div><span className="text-gray-500 block">District</span><strong>{grievance.district}</strong></div>
              <div><span className="text-gray-500 block">Category</span><strong>{grievance.category}</strong></div>
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

          <div className="card">
            <h2 className="text-lg font-bold text-navy-900 mb-4">History Timeline</h2>
            <GrievanceTimeline history={grievance.history} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {grievance.status !== 'Resolved' && (
            <form onSubmit={handleUpdateProgress} className="card space-y-3">
              <h3 className="font-bold text-navy-900 text-base">Update Investigation Progress</h3>
              <p className="text-xs text-gray-500">Sets status to In Progress and logs your investigation remarks.</p>
              <textarea
                rows={3}
                value={progressRemarks}
                onChange={(e) => setProgressRemarks(e.target.value)}
                placeholder="Enter investigation update (min 10 chars)…"
                className="form-input text-sm"
                required
              />
              <button type="submit" disabled={busy} className="btn-secondary w-full text-sm py-2">
                Save Progress Update
              </button>
            </form>
          )}

          {report && report.review_status === 'Pending Review' && (
            <div className="card space-y-3 border-l-4 border-l-amber-500">
              <h3 className="font-bold text-navy-900 text-base">Action Report Submitted</h3>
              <AlertBox type="info">Awaiting CMO Admin review. You cannot resolve directly.</AlertBox>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.report_text}</p>
              <p className="text-xs text-gray-400">Submitted on {formatDateTime(report.submitted_at)}</p>
            </div>
          )}

          {report && report.review_status === 'Returned' && (
            <AlertBox type="warning">
              <strong>Report Returned by CMO:</strong> {report.review_remarks || 'Please revise and resubmit.'}
            </AlertBox>
          )}

          {canSubmitReport && (
            <form onSubmit={handleActionReport} className="card space-y-3">
              <h3 className="font-bold text-navy-900 text-base">Submit Action-Taken Report</h3>
              <p className="text-xs text-gray-500">After submission, CMO will review your report and mark the grievance Resolved.</p>
              <textarea
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Detail the action taken (min 20 chars)…"
                className="form-input text-sm"
                required
              />
              <div>
                <label className="form-label text-xs">Supporting File (optional, JPG/PNG/PDF ≤5MB)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setReportFile(e.target.files[0] || null)}
                  className="text-xs w-full"
                />
              </div>
              <button type="submit" disabled={busy} className="btn-primary w-full text-sm py-2">
                Submit Report to CMO
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
