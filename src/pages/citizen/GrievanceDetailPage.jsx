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

export default function GrievanceDetailPage() {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [showReopen, setShowReopen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [submittingReopen, setSubmittingReopen] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/grievances/${id}`);
      setGrievance(res.data?.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load grievance details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      await api.post(`/grievances/${id}/feedback`, { rating: Number(rating), comment });
      toast.success('Thank you for your feedback!');
      fetchDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (reopenReason.trim().length < 10) {
      toast.error('Please provide a reason (at least 10 characters).');
      return;
    }
    setSubmittingReopen(true);
    try {
      await api.post(`/grievances/${id}/reopen`, { reason: reopenReason.trim() });
      toast.success('Grievance reopened.');
      setShowReopen(false);
      setReopenReason('');
      fetchDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reopen grievance.');
    } finally {
      setSubmittingReopen(false);
    }
  };

  const handleDownloadAttachment = async (att) => {
    try {
      const res = await api.get(`/attachments/${att._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: att.mime_type }));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open attachment.');
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

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/citizen/dashboard' },
          { label: 'My Grievances', href: '/citizen/grievances' },
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
            <h2 className="text-lg font-bold text-navy-900 border-b border-gray-200 pb-2">Grievance Details</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{grievance.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <span className="text-xs text-gray-500 block">District</span>
                <span className="font-semibold">{grievance.district}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Category</span>
                <span className="font-semibold">{grievance.category}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Department</span>
                <span className="font-semibold">{grievance.assigned_department_id?.name || 'Pending'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Submitted</span>
                <span className="font-semibold">{formatDate(grievance.createdAt)}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">SLA Due Date</span>
                <span className="font-semibold">{formatDate(grievance.due_date)}</span>
              </div>
              {grievance.resolved_at && (
                <div>
                  <span className="text-xs text-gray-500 block">Resolved On</span>
                  <span className="font-semibold text-green-700">{formatDate(grievance.resolved_at)}</span>
                </div>
              )}
            </div>

            {grievance.attachments?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h3>
                <div className="flex flex-wrap gap-2">
                  {grievance.attachments.map((att) => (
                    <button
                      key={att._id}
                      type="button"
                      onClick={() => handleDownloadAttachment(att)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 text-navy-900 border border-navy-200 rounded text-xs font-medium hover:bg-navy-100"
                    >
                      📎 {att.original_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {grievance.public_remarks && (
              <AlertBox type="info">
                <strong>Official Remarks:</strong> {grievance.public_remarks}
              </AlertBox>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Status History Timeline</h2>
            <GrievanceTimeline history={grievance.history} />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {grievance.status === 'Resolved' && (
            <>
              <div className="card space-y-4">
                <h3 className="text-base font-bold text-navy-900">Citizen Feedback</h3>
                {grievance.feedback ? (
                  <div className="space-y-2 text-sm bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">
                      Rating: {'★'.repeat(grievance.feedback.rating)}{'☆'.repeat(5 - grievance.feedback.rating)} ({grievance.feedback.rating}/5)
                    </p>
                    {grievance.feedback.comment && (
                      <p className="text-gray-700">{grievance.feedback.comment}</p>
                    )}
                    <p className="text-xs text-gray-500">Submitted on {formatDateTime(grievance.feedback.submitted_at)}</p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedback} className="space-y-3">
                    <div>
                      <label htmlFor="rating" className="form-label">Satisfaction Rating (1–5)</label>
                      <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="form-input bg-white"
                      >
                        <option value={5}>5 — Very Satisfied</option>
                        <option value={4}>4 — Satisfied</option>
                        <option value={3}>3 — Neutral</option>
                        <option value={2}>2 — Dissatisfied</option>
                        <option value={1}>1 — Very Dissatisfied</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="comment" className="form-label">Comment (optional)</label>
                      <textarea
                        id="comment"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="form-input"
                        placeholder="Share your experience…"
                      />
                    </div>
                    <button type="submit" disabled={submittingFeedback} className="btn-primary w-full text-sm">
                      {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                    </button>
                  </form>
                )}
              </div>

              <div className="card space-y-3">
                <h3 className="text-base font-bold text-navy-900">Not Satisfied?</h3>
                <p className="text-xs text-gray-600">
                  If the underlying issue is not resolved, you can reopen this grievance for further review.
                </p>
                {!showReopen ? (
                  <button
                    type="button"
                    onClick={() => setShowReopen(true)}
                    className="btn-danger w-full text-sm"
                  >
                    Reopen Grievance
                  </button>
                ) : (
                  <form onSubmit={handleReopen} className="space-y-3">
                    <textarea
                      rows={3}
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      placeholder="Explain why you are reopening (min 10 chars)…"
                      className="form-input"
                      required
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={submittingReopen} className="btn-danger flex-1 text-sm py-2">
                        {submittingReopen ? 'Reopening…' : 'Confirm Reopen'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReopen(false)}
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
