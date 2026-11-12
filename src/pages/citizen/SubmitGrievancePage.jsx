import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api.js';
import {
  PageHeader,
  LoadingSpinner,
  AlertBox,
  Breadcrumb,
} from '../../components/ui/index.jsx';

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const SUBJECT_MAX = 200;
const DESC_MIN = 30;

function ConfidencePill({ score }) {
  const pct = Math.round((score || 0) * 100);
  const color =
    pct >= 80 ? 'bg-green-100 text-green-800' : pct >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {pct}% confidence
    </span>
  );
}

export default function SubmitGrievancePage() {
  const fileRef = useRef(null);

  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    district: '',
    category: '',
    priority: 'Medium',
    subject: '',
    description: '',
  });
  const [attachment, setAttachment] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiAccepted, setAiAccepted] = useState(false);
  const [aiError, setAiError] = useState('');

  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [dRes, cRes] = await Promise.all([api.get('/districts'), api.get('/categories')]);
        setDistricts(dRes.data?.data || []);
        setCategories(cRes.data?.data || []);
      } catch {
        toast.error('Failed to load form options.');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return setAttachment(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only JPG, PNG, or PDF files are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setAttachment(file);
  };

  const handleAnalyze = async () => {
    if (!form.description || form.description.trim().length < 20) {
      setAiError('Please write at least 20 characters in the description before analysing.');
      return;
    }
    setAiError('');
    setAiResult(null);
    setAiAccepted(false);
    setAiLoading(true);
    try {
      const res = await api.post('/ai/analyze', {
        text: form.description.trim(),
        district: form.district || undefined,
      });
      setAiResult(res.data?.data || res.data);
    } catch (err) {
      setAiError(err?.response?.data?.message || 'AI analysis failed. Please fill in the details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestions = () => {
    if (!aiResult) return;
    setForm((prev) => ({
      ...prev,
      category: categories.includes(aiResult.suggested_category)
        ? aiResult.suggested_category
        : prev.category,
      priority: aiResult.priority || prev.priority,
    }));
    setAiAccepted(true);
    toast.success('AI suggestions applied. You can still edit any field.');
  };

  const validate = () => {
    if (!form.district) return 'Please select a district.';
    if (!form.category) return 'Please select a category.';
    if (!form.subject.trim()) return 'Subject is required.';
    if (form.subject.length > SUBJECT_MAX) return `Subject must be under ${SUBJECT_MAX} characters.`;
    if (form.description.trim().length < DESC_MIN) return `Description must be at least ${DESC_MIN} characters.`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('district', form.district);
      fd.append('category', form.category);
      fd.append('priority', form.priority);
      fd.append('subject', form.subject.trim());
      fd.append('description', form.description.trim());
      if (aiResult) {
        const aiPayload = {
          suggested_department: aiResult.suggested_department,
          suggested_category: aiResult.suggested_category,
          priority: aiResult.priority,
          priority_reason: aiResult.priority_reason,
          summary: aiResult.summary,
          confidence: aiResult.confidence,
          source: aiResult.source,
          ai_model: aiResult.ai_model,
          accepted_by_user: aiAccepted,
          overridden: aiAccepted && (form.category !== aiResult.suggested_category || form.priority !== aiResult.priority),
        };
        fd.append('ai_suggestion', JSON.stringify(aiPayload));
      }
      if (attachment) fd.append('attachment', attachment);

      const res = await api.post('/grievances', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmittedData(res.data?.data || res.data);
      toast.success('Grievance submitted successfully!');
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ district: '', category: '', priority: 'Medium', subject: '', description: '' });
    setAttachment(null);
    setAiResult(null);
    setAiAccepted(false);
    setAiError('');
    setFormError('');
    setSubmittedData(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (submittedData) {
    return (
      <div className="max-w-xl mx-auto mt-10 card space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-navy-900">Grievance Submitted!</h2>
          <p className="text-gray-600 text-sm">
            Your grievance has been registered and routed for CMO review.
          </p>
        </div>

        <div className="bg-navy-50 border border-navy-200 rounded-xl px-6 py-4 text-center">
          <p className="text-xs text-navy-700 font-semibold uppercase tracking-wider">Acknowledgement Reference ID</p>
          <p className="text-2xl font-mono font-bold text-navy-900 mt-1">{submittedData.reference_id}</p>
          <p className="text-xs text-gray-500 mt-1">Keep this ID to track your grievance anytime.</p>
        </div>

        <div className="border-t border-b border-gray-200 py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subject:</span>
            <span className="font-medium text-gray-900 text-right max-w-[65%]">{submittedData.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">District:</span>
            <span className="font-medium text-gray-900">{submittedData.district}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="font-medium text-gray-900">{submittedData.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Priority:</span>
            <span className="font-medium text-gray-900">{submittedData.priority}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className="font-semibold text-navy-900">{submittedData.status}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-outline text-sm py-2 px-4"
          >
            🖨️ Print Acknowledgement
          </button>
          <Link
            to={`/track?id=${submittedData.reference_id}`}
            className="btn-secondary text-sm py-2 px-4"
          >
            Track Status
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="btn-primary text-sm py-2 px-4"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  const isFallback = aiResult?.source === 'FALLBACK_RULE_BASED';
  const duplicates = aiResult?.possible_duplicates || [];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/citizen/dashboard' },
          { label: 'Submit Grievance' },
        ]}
      />
      <PageHeader
        title="Submit New Grievance"
        subtitle="Fill out the form below to submit your grievance. Use the AI Assistant for smart suggestions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {formError && <AlertBox type="error" message={formError} />}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="district" className="form-label">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    className="form-input bg-white"
                    required
                  >
                    <option value="">Select district…</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="form-input bg-white"
                    required
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="form-input bg-white sm:w-48"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="form-label">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={SUBJECT_MAX}
                  placeholder="Brief summary of your grievance…"
                  className="form-input"
                  required
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.subject.length}/{SUBJECT_MAX}
                </p>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe your grievance in detail (minimum 30 characters)…"
                  className="form-input resize-y"
                  required
                />
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${
                      form.description.trim().length < DESC_MIN ? 'text-red-500' : 'text-green-700'
                    }`}
                  >
                    {form.description.trim().length < DESC_MIN
                      ? `${DESC_MIN - form.description.trim().length} more characters needed`
                      : '✓ Minimum length met'}
                  </span>
                  <span className="text-xs text-gray-400">{form.description.length} chars</span>
                </div>
              </div>

              <div>
                <label className="form-label">
                  Supporting Document <span className="text-gray-400 font-normal">(optional: JPG, PNG, PDF up to 5MB)</span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-5 text-center hover:border-navy-500 transition-colors cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  <p className="text-sm text-gray-600">
                    {attachment ? (
                      <span className="text-navy-900 font-semibold">{attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)</span>
                    ) : (
                      <span>Click to select a file (JPG, PNG, or PDF, max 5MB)</span>
                    )}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFile}
                  className="hidden"
                />
                {fileError && <p className="form-error">{fileError}</p>}
                {attachment && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttachment(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Remove file
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting…' : 'Submit Grievance'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-6 space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="font-bold text-navy-900 text-base">AI Grievance Assistant</h3>
              <p className="text-xs text-gray-500">Analyses your description to suggest category, department & priority</p>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={aiLoading}
              className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {aiLoading ? 'Analysing…' : '⚡ Analyse with AI'}
            </button>

            {aiError && <AlertBox type="error" message={aiError} />}

            {aiResult && (
              <div className="space-y-3">
                {isFallback && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-800 font-medium">
                    ⚠️ Rule-based fallback (AI service unavailable)
                  </div>
                )}

                <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {aiResult.suggested_department && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Suggested Dept:</span>
                      <span className="font-semibold text-navy-900 text-right">{aiResult.suggested_department}</span>
                    </div>
                  )}
                  {aiResult.suggested_category && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-semibold text-navy-900">{aiResult.suggested_category}</span>
                    </div>
                  )}
                  {aiResult.priority && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Priority:</span>
                      <span className="font-semibold text-navy-900">{aiResult.priority}</span>
                    </div>
                  )}
                  {aiResult.confidence !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Confidence:</span>
                      <ConfidencePill score={aiResult.confidence} />
                    </div>
                  )}
                  {aiResult.priority_reason && (
                    <p className="text-gray-600 pt-1 border-t border-gray-200">{aiResult.priority_reason}</p>
                  )}
                  {aiResult.summary && (
                    <div className="pt-1 border-t border-gray-200">
                      <p className="text-gray-500 font-semibold mb-0.5">Summary:</p>
                      <p className="text-gray-700">{aiResult.summary}</p>
                    </div>
                  )}
                </div>

                {duplicates.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs font-semibold text-orange-800 mb-1">
                      ⚠️ Possible Similar Grievances ({duplicates.length})
                    </p>
                    {duplicates.map((d, i) => (
                      <p key={i} className="text-xs text-orange-700">
                        • {d.reference_id} ({Math.round(d.similarity_score * 100)}% match)
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAcceptSuggestions}
                  className="btn-outline w-full text-sm py-2"
                >
                  ✓ Accept Suggestions
                </button>
              </div>
            )}

            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
              Advisory only. PII (phone/email) is masked before AI analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
